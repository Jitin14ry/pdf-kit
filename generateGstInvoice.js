/**
 * generateInvoice.js
 *
 * Usage:
 *   const generateInvoice = require('./generateInvoice');
 *   await generateInvoice(invoiceData, '/path/to/out.pdf');
 *
 * Or run from CLI (example at bottom).
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const QRCode = require('qrcode');

/* -----------------------
   Helper utilities
   ----------------------- */

const ensureDirExists = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const formatCurrency = (amount, currencySymbol = '₹') => {
  const n = Number(amount || 0);
  // show two decimals
  return `${currencySymbol}${n.toFixed(2)}`;
};

const isUrl = (s) => {
  return typeof s === 'string' && (s.startsWith('http://') || s.startsWith('https://'));
};

const fetchImageBuffer = (urlOrPath) => {
  return new Promise((resolve, reject) => {
    if (!urlOrPath) return resolve(null);

    if (isUrl(urlOrPath)) {
      const client = urlOrPath.startsWith('https') ? https : http;
      client
        .get(urlOrPath, (res) => {
          if (res.statusCode !== 200) {
            // consume data to free socket
            res.resume();
            return resolve(null);
          }
          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
        })
        .on('error', (err) => resolve(null));
    } else {
      // local file
      fs.readFile(urlOrPath, (err, data) => {
        if (err) return resolve(null);
        resolve(data);
      });
    }
  });
};

const generateUPIQrBuffer = async (upiString) => {
  if (!upiString) return null;
  try {
    const dataUrl = await QRCode.toDataURL(upiString, { errorCorrectionLevel: 'M', margin: 1 });
    const base64 = dataUrl.split(',')[1];
    return Buffer.from(base64, 'base64');
  } catch (e) {
    return null;
  }
};

/* -----------------------
   GST computation
   ----------------------- */
const computeTaxes = (taxableAmount, taxRateDecimal, companyState, customerState) => {
  const company = (companyState || '').toString().trim().toLowerCase();
  const customer = (customerState || '').toString().trim().toLowerCase();
  const intraState = company && customer && company === customer;
  const taxRate = Number(taxRateDecimal || 0);

  if (intraState) {
    const cgst = taxableAmount * (taxRate / 2);
    const sgst = taxableAmount * (taxRate / 2);
    return { type: 'intra', cgst, sgst, igst: 0, totalTax: cgst + sgst };
  } else {
    const igst = taxableAmount * taxRate;
    return { type: 'inter', cgst: 0, sgst: 0, igst, totalTax: igst };
  }
};

/* -----------------------
   Main generator
   ----------------------- */

async function generateInvoice(data, outputPath, opts = {}) {
  if (!data) throw new Error('Missing invoice data');

  ensureDirExists(outputPath);

  // Prepare images (logo, stamp, QR)
  const logoBuffer = await fetchImageBuffer(data.company && data.company.logoPath);
  const stampBuffer = await fetchImageBuffer(data.stampPath);
  const upiString = data.upi || data.paymentUrl || null;
  const qrBuffer = upiString ? await generateUPIQrBuffer(upiString) : null;

  // Create PDF
  const doc = new PDFDocument({ size: 'A4', margin: 30, bufferPages: true });
  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  // Use built-in fonts
  const FONT_BOLD = 'Helvetica-Bold';
  const FONT_REGULAR = 'Helvetica';

  // Layout constants
  const PAGE_WIDTH = doc.page.width; // 595 for A4
  const PAGE_HEIGHT = doc.page.height;
  const MARGIN_LEFT = 30;
  const MARGIN_RIGHT = 30;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

  // Header renderer (used on each page)
  const renderHeader = (docInstance, pageNumberMeta = {}) => {
    const topY = 30;
    const logoW = 90;
    const logoH = 40;

    // Logo (left)
    if (logoBuffer) {
      try {
        docInstance.image(logoBuffer, MARGIN_LEFT, topY, { width: logoW, height: logoH, align: 'left' });
      } catch (e) { /* ignore */ }
    } else if (data.company && data.company.name) {
      // fallback: company name as text
      docInstance.font(FONT_BOLD).fontSize(14).text(data.company.name, MARGIN_LEFT, topY);
    }

    // Title (right)
    docInstance.font(FONT_BOLD).fontSize(16).text('TAX INVOICE', MARGIN_LEFT, topY, { align: 'right', width: CONTENT_WIDTH });

    // small company details under logo
    const infoY = topY + 50;
    docInstance.font(FONT_REGULAR).fontSize(9);
    const companyLines = [
      data.company && data.company.address,
      data.company && data.company.phone ? `Phone: ${data.company.phone}` : null,
      data.company && data.company.email ? `Email: ${data.company.email}` : null,
    ].filter(Boolean);

    docInstance.text(companyLines.join(' | '), MARGIN_LEFT, infoY, { width: CONTENT_WIDTH, align: 'left' });

    // draw a divider
    docInstance.moveTo(MARGIN_LEFT, infoY + 26).lineTo(PAGE_WIDTH - MARGIN_RIGHT, infoY + 26).stroke();

    return infoY + 30;
  };

  // Biller/Seller and Invoice meta (two-row columns)
  const renderPartyAndMeta = (startY) => {
    const half = Math.floor((CONTENT_WIDTH) / 2);
    const leftX = MARGIN_LEFT;
    const rightX = MARGIN_LEFT + half + 10;

    // LEFT: Seller/Biller (company)
    doc.font(FONT_BOLD).fontSize(11).text('Seller / Biller', leftX, startY);
    doc.font(FONT_REGULAR).fontSize(9);
    const sellerLines = [
      data.company && data.company.name,
      data.company && data.company.address,
      data.company && data.company.state ? `State: ${data.company.state}` : null,
      data.company && data.company.phone ? `Phone: ${data.company.phone}` : null,
      data.company && data.company.email ? `Email: ${data.company.email}` : null,
    ].filter(Boolean);
    doc.text(sellerLines.join('\n'), leftX, startY + 16, { width: half - 20 });

    // RIGHT: Invoice meta & QR
    doc.font(FONT_BOLD).fontSize(11).text('Invoice', rightX, startY);
    doc.font(FONT_REGULAR).fontSize(9);

    const invoiceMetaY = startY + 16;
    const meta = [
      ['Invoice No:', data.invoice && data.invoice.number || '-'],
      ['Invoice Date:', data.invoice && data.invoice.date ? new Date(data.invoice.date).toDateString() : '-'],
      ['Due Date:', data.invoice && data.invoice.dueDate ? new Date(data.invoice.dueDate).toDateString() : '-'],
    ];
    let curY = invoiceMetaY;
    meta.forEach(([label, val]) => {
      doc.font(FONT_BOLD).fontSize(9).text(label, rightX, curY, { continued: true });
      doc.font(FONT_REGULAR).text(` ${val}`, { align: 'left' });
      curY += 14;
    });

    // Invoice To (below seller)
    const invToY = startY + 80;
    doc.font(FONT_BOLD).fontSize(11).text('Invoice To:', leftX, invToY);
    doc.font(FONT_REGULAR).fontSize(9);
    const customerLines = [
      data.customer && data.customer.name,
      data.customer && data.customer.address,
      data.customer && data.customer.state ? `State: ${data.customer.state}` : null,
      data.customer && data.customer.phone ? `Phone: ${data.customer.phone}` : null,
      data.customer && data.customer.email ? `Email: ${data.customer.email}` : null,
    ].filter(Boolean);
    doc.text(customerLines.join('\n'), leftX, invToY + 16, { width: half - 20 });

    // UPI QR in right column if available
    if (qrBuffer) {
      try {
        const qrW = 100;
        const qrX = rightX + half - qrW - 10;
        doc.image(qrBuffer, qrX, invToY, { width: qrW, height: qrW });
        doc.font(FONT_REGULAR).fontSize(8).text('Scan to Pay (UPI)', qrX, invToY + 105, { width: qrW, align: 'center' });
      } catch (e) { /* ignore */ }
    }

    const bottomY = Math.max(invToY + 120, curY + 20);
    // horizontal rule
    doc.moveTo(MARGIN_LEFT, bottomY).lineTo(PAGE_WIDTH - MARGIN_RIGHT, bottomY).stroke();

    return bottomY + 12;
  };

  // Table header
  const renderTableHeader = (y) => {
    doc.font(FONT_BOLD).fontSize(10);
    doc.text('S.No', MARGIN_LEFT, y);
    doc.text('Description', MARGIN_LEFT + 40, y);
    doc.text('HSN/SAC', 320, y);
    doc.text('Qty', 370, y, { width: 40, align: 'right' });
    doc.text('Unit Price', 420, y, { width: 70, align: 'right' });
    doc.text('Amount', 500, y, { width: 70, align: 'right' });
    doc.moveTo(MARGIN_LEFT, y + 14).lineTo(PAGE_WIDTH - MARGIN_RIGHT, y + 14).stroke();
  };

  // Start first page
  renderHeader(doc, data);
  let y = renderPartyAndMeta(120);

  // Items table
  let tableStartY = y + 8;
  renderTableHeader(tableStartY);
  let positionY = tableStartY + 24;

  const items = Array.isArray(data.items) ? data.items : [];
  let serial = 1;

  // Function to add new page and re-render header/meta/table header
  const addNewPageAndResume = () => {
    doc.addPage();
    renderHeader(doc, data);
    // On new pages we don't render whole party/meta again to save space, but let's render a compact meta
    const compactY = 120;
    doc.font(FONT_BOLD).fontSize(10).text('Invoice No: ', MARGIN_LEFT, compactY, { continued: true });
    doc.font(FONT_REGULAR).text(data.invoice && data.invoice.number || '-', { continued: false });
    renderTableHeader(compactY + 30);
    positionY = compactY + 30 + 24;
  };

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const itemHeight = 18;

    // page break if required (leave room for totals later)
    if (positionY + itemHeight > PAGE_HEIGHT - 140) {
      addNewPageAndResume();
    }

    doc.font(FONT_REGULAR).fontSize(9);

    const descX = MARGIN_LEFT + 40;

    // columns
    doc.text(String(serial), MARGIN_LEFT, positionY);
    doc.text(it.description || '-', descX, positionY, { width: 260 });
    doc.text(it.hsn || '-', 320, positionY);
    doc.text(String(it.quantity || 0), 370, positionY, { width: 40, align: 'right' });
    doc.text(formatCurrency(it.price || 0, data.currencySymbol || '₹'), 420, positionY, { width: 70, align: 'right' });
    const lineAmount = (Number(it.quantity || 0) * Number(it.price || 0)) || 0;
    doc.text(formatCurrency(lineAmount, data.currencySymbol || '₹'), 500, positionY, { width: 70, align: 'right' });

    // strikethrough for deleted items (optional)
    if (it.deleted) {
      const textWidth = doc.widthOfString(it.description || '-', { width: 260 });
      const textHeight = doc.currentLineHeight();
      doc.save();
      doc.moveTo(descX, positionY + textHeight / 2).lineTo(descX + textWidth, positionY + textHeight / 2).lineWidth(1.2).strokeColor('#000').stroke();
      doc.restore();
    }

    positionY += itemHeight;
    serial += 1;
  }

  // Ensure totals appear on last page and there's space
  if (positionY + 180 > PAGE_HEIGHT - 40) {
    doc.addPage();
    renderHeader(doc, data);
    // put totals at around y = 220
    positionY = 240;
  }

  // Compute totals
  const subtotal = items.reduce((acc, it) => acc + (Number(it.quantity || 0) * Number(it.price || 0)), 0);
  const discountAmount = Number(data.invoice && data.invoice.discount ? data.invoice.discount : 0);
  const taxableValue = Math.max(0, subtotal - discountAmount);
  const taxes = computeTaxes(taxableValue, data.taxRate || 0, data.company && data.company.state, data.customer && data.customer.state);
  const totalTax = taxes.totalTax || 0;
  const grandTotal = taxableValue + totalTax;

  // Totals block (right side)
  const totalsX = 360;
  doc.moveTo(MARGIN_LEFT, positionY + 10).lineTo(PAGE_WIDTH - MARGIN_RIGHT, positionY + 10).stroke();

  let ty = positionY + 20;
  doc.font(FONT_BOLD).fontSize(11).text('Summary', MARGIN_LEFT, ty);
  ty += 18;
  doc.font(FONT_REGULAR).fontSize(10);
  doc.text('Subtotal:', totalsX, ty, { width: 130, align: 'left' });
  doc.text(formatCurrency(subtotal, data.currencySymbol || '₹'), totalsX + 110, ty, { width: 100, align: 'right' });
  ty += 14;

  doc.text('Discount:', totalsX, ty, { width: 130, align: 'left' });
  doc.text(formatCurrency(discountAmount, data.currencySymbol || '₹'), totalsX + 110, ty, { width: 100, align: 'right' });
  ty += 14;

  doc.text('Taxable Value:', totalsX, ty, { width: 130, align: 'left' });
  doc.text(formatCurrency(taxableValue, data.currencySymbol || '₹'), totalsX + 110, ty, { width: 100, align: 'right' });
  ty += 14;

  if (taxes.type === 'intra') {
    doc.text('CGST:', totalsX, ty, { width: 130, align: 'left' });
    doc.text(formatCurrency(taxes.cgst || 0, data.currencySymbol || '₹'), totalsX + 110, ty, { width: 100, align: 'right' });
    ty += 14;
    doc.text('SGST:', totalsX, ty, { width: 130, align: 'left' });
    doc.text(formatCurrency(taxes.sgst || 0, data.currencySymbol || '₹'), totalsX + 110, ty, { width: 100, align: 'right' });
    ty += 14;
  } else {
    doc.text('IGST:', totalsX, ty, { width: 130, align: 'left' });
    doc.text(formatCurrency(taxes.igst || 0, data.currencySymbol || '₹'), totalsX + 110, ty, { width: 100, align: 'right' });
    ty += 14;
  }

  doc.font(FONT_BOLD).text('Total:', totalsX, ty, { width: 130, align: 'left' });
  doc.text(formatCurrency(grandTotal, data.currencySymbol || '₹'), totalsX + 110, ty, { width: 100, align: 'right' });
  ty += 22;

  // Stamp if present
  if (stampBuffer) {
    try {
      doc.image(stampBuffer, MARGIN_LEFT + 10, ty - 10, { width: 120 });
    } catch (e) { /* ignore */ }
  }

  // Payment terms and bank details (bottom left/right)
  const bottomLeftY = ty + 40;
  doc.font(FONT_BOLD).fontSize(10).text('Payment Terms:', MARGIN_LEFT, bottomLeftY);
  doc.font(FONT_REGULAR).fontSize(9).text(data.paymentTerms || '-', MARGIN_LEFT, bottomLeftY + 14, { width: 260 });

  const bankX = totalsX;
  doc.font(FONT_BOLD).fontSize(10).text('Bank Details:', bankX, bottomLeftY);
  doc.font(FONT_REGULAR).fontSize(9);
  if (data.bank) {
    doc.text(`Bank: ${data.bank.bankName || '-'}`, bankX, bottomLeftY + 14);
    doc.text(`A/C No: ${data.bank.accountNumber || '-'}`, bankX, bottomLeftY + 28);
    doc.text(`IFSC: ${data.bank.ifsc || '-'}`, bankX, bottomLeftY + 42);
    if (data.bank.upiId) doc.text(`UPI: ${data.bank.upiId}`, bankX, bottomLeftY + 56);
  }

  // Authorized sign
  doc.font(FONT_REGULAR).fontSize(9);
  const signatureY = PAGE_HEIGHT - 120;
  doc.text(`For ${data.company && data.company.name || ''}`, MARGIN_LEFT, signatureY);
  doc.text('Authorized Signatory', totalsX + 30, signatureY + 40, { align: 'right' });

  // Footer: tagline + website + page numbers
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    const showY = PAGE_HEIGHT - 30;
    doc.font(FONT_REGULAR).fontSize(8);
    if (data.company && data.company.tagline) {
      doc.text(data.company.tagline, MARGIN_LEFT, showY - 8, { align: 'center', width: CONTENT_WIDTH });
    }
    if (data.company && data.company.website) {
      doc.text(data.company.website, MARGIN_LEFT, showY + 2, { align: 'center', width: CONTENT_WIDTH });
    }
    doc.text(`Page ${i + 1} of ${range.count}`, MARGIN_LEFT, showY + 18, { align: 'center', width: CONTENT_WIDTH });
  }

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(outputPath));
    writeStream.on('error', (err) => reject(err));
  });
}

/* -----------------------
   Export + CLI sample
   ----------------------- */

module.exports = generateInvoice;

/* If run directly, demo with sample data (like you provided) */
if (require.main === module) {
  // Minimal demo data (you can replace this with your own)
  const invoiceData = {
    company: {
      name: "Ratnashil Online Services Pvt Ltd",
      address: "Plot no.-967, Bypass Road, near Badoli Check Post, Sector 9, Faridabad, Haryana 121004",
      phone: "+91 90279 14004",
      email: "info@pikpart.com",
      logoPath: "https://pikpart.s3.ap-south-1.amazonaws.com/pikpart_logos/pikpart+logo+png.png",
      state: 'Haryana',
      tagline: 'Quality since 1990',
      website: 'https://acme.example'
    },
    customer: {
      name: "Deepak Baranwal",
      address: "Plot no.-967, Bypass Road, near Badoli Check Post, Sector 9, Faridabad, Haryana 121004",
      phone: "+91 7827760980",
      email: "bdeepak@pikpart.com",
      state: 'Haryana'
    },
    invoice: {
      number: 'INV-2025-001',
      date: new Date(),
      dueDate: new Date(Date.now() + 15 * 24 * 3600 * 1000),
      discount: 50 // flat discount amount
    },
    items: [
      { description: 'Widget A1', hsn: '12345', quantity: 2, price: 500 },
      { description: 'Widget A2', hsn: '12345', quantity: 2, price: 500 },
      { description: 'Widget A3', hsn: '12345', quantity: 2, price: 500 },
      { description: 'Widget A4', hsn: '12345', quantity: 2, price: 500 },
      { description: 'Widget A5', hsn: '12345', quantity: 2, price: 500 },
      { description: 'Widget A6', hsn: '12345', quantity: 2, price: 500 },
      { description: 'Widget A7', hsn: '12345', quantity: 2, price: 500 },
      { description: 'Widget A8', hsn: '12345', quantity: 2, price: 500 },
      { description: 'Widget A9', hsn: '12345', quantity: 2, price: 500 },
      { description: 'Widget A10', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A11', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A12', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A13', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A14', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A15', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A16', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A17', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A18', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A19', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A20', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A21', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A22', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A23', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A24', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A25', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A26', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A27', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A28', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A29', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A30', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A31', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A32', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A33', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A34', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A35', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A36', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A37', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A38', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A39', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A40', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A41', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A42', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A43', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A44', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A45', hsn: '1234', quantity: 2, price: 500 },
      { description: 'Widget A46', hsn: '1234', quantity: 2, price: 500 }
      // ... add more rows to test pagination
    ],
    taxRate: 0.18,
    paymentTerms: 'Payable within 15 days. Late fee 2% per month.',
    bank: {
      bankName: 'Axis Bank',
      accountNumber: '1234567890',
      ifsc: 'UTIB0000123',
      branch: 'Mumbai',
      upiId: 'acme@upi'
    },
    upi: 'upi://pay?pa=acme@upi&pn=Acme%20Pvt%20Ltd&am=1750',
    stampPath: null, // local path or URL if needed
    currencySymbol: '₹'
  };

  const outName = `invoice_${(invoiceData.invoice && invoiceData.invoice.number) || Date.now()}.pdf`;
  const outputPath = path.join(__dirname, outName);

  generateInvoice(invoiceData, outputPath)
    .then((p) => console.log('Generated:', p))
    .catch((err) => console.error('Error generating invoice:', err));
}
