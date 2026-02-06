import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Manually define `__dirname`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateInvoice = (res) => {
  const doc = new PDFDocument({ size: "A4", margin: 10 });
  let pageCount = 1; // Start page number tracking

  // Set headers for download
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="invoice.pdf"');

  const logoPath = path.join(__dirname, "assets", "logo.png");
  doc.pipe(res); // Stream PDF to response

  const x = 20; // left
  const y = 70; // top
  const boxWidth = 550;
  const boxHeight = 150;

  doc.rect(x, y, boxWidth, boxHeight).stroke();

  const columnWidth = boxWidth / 3;

  // Line between column 1 & 2
  doc
    .moveTo(x + columnWidth, y)
    .lineTo(x + columnWidth, y + boxHeight)
    .stroke();

  // Line between column 2 & 3
  doc
    .moveTo(x + columnWidth * 2, y)
    .lineTo(x + columnWidth * 2, y + boxHeight)
    .stroke();

  // Column text
  doc.fontSize(9);

  let leftY = y + 5;

  // -------- COLUMN 1 (FROM) --------
  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("FROM", x + 5, leftY);

  leftY += 12;

  doc
    .font("Helvetica")
    .text("RATNASHIL ONLINE SERVICES PRIVATE LIMITED", x + 5, leftY);

  leftY += 12;
  doc.text(
    "Address: Plot no.967 Bypass Road, Sector-9, Faridabad Haryana-121006",
    x + 5,
    leftY,
    { width: columnWidth - 10 }
  );

  leftY += 25;
  doc.text("Contact: 9027914004", x + 5, leftY);

  let midX = x + columnWidth + 5;
  let midY = y + 5;

  doc.font("Helvetica-Bold").text("BUYER (Bill To)", midX, midY);

  midY += 12;
  doc.font("Helvetica").text("Chainstar Autopart", midX, midY);

  midY += 12;
  doc.text("Address: CUSTOMER NAME", midX, midY, {
    width: columnWidth - 10,
  });

  midY += 25;
  doc.text("Contact: 8250794411", midX, midY);

  let rightX = x + columnWidth * 2 + 5;
  let rightY = y + 5;

  doc.font("Helvetica-Bold").text("CONSIGNEE (Ship To)", rightX, rightY);

  rightY += 12;
  doc.font("Helvetica").text("Chainstar Autopart", rightX, rightY);

  rightY += 12;
  doc.text(
    "Address: JAGUNPURA VTC: Raghunathganj-II, Murshidabad, West Bengal - 742213",
    rightX,
    rightY,
    { width: columnWidth - 10 }
  );

  rightY += 25;
  doc.text("Contact: 8250794411", rightX, rightY);

  const footerText = "RATNASHIL ONLINE SERVICES PVT. LTD.";
  const footerColor = "#f96500";
  const footerHeight = 20; // Adjust footer height if needed
  const footerMargin = 10; // Bottom margin from page edge

  function addFooter(doc) {
    const footerY = doc.page.height - footerHeight - footerMargin;

    // Draw footer background (orange rectangle)
    doc.rect(0, footerY, doc.page.width, footerHeight).fill(footerColor);

    // Add centered text in the footer
    doc
      .fillColor("#fff") // White text
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(footerText, 0, footerY + 5, {
        width: doc.page.width,
        align: "center",
      });

    doc.fillColor("#000"); // Reset fill color for other content
  }
  function addPageNumber(doc) {
    const yPosition = doc.page.height - footerHeight - footerMargin - 15; // Adjust position above footer

    doc.fontSize(7).text(`${pageCount}.`, doc.page.width - 50, yPosition, {
      align: "right",
    });
  }
  // Ensure footer is added on every new page
  doc.on("pageAdded", () => {
    pageCount++;
    addFooter(doc);
    addPageNumber(doc);
  });
  // addFooter(doc);
  addFooter(doc);
  addPageNumber(doc);
  doc.fontSize(10);
  generateHeader(doc, logoPath);
  doc.moveDown();
  generateCustomerInfo(doc);
  doc.moveDown();
  generateInvoiceTable(doc);
  doc.moveDown();

  let lastY = generateProductsTable(doc);
  doc.moveDown();
  generateSpareTotal(doc, lastY);

  // Ensure service table does not overlap with products table
  if (lastY > 750) {
    doc.addPage();
    addFooter(doc);
    lastY = 50;
  }

  let lastServiceY = generateServiceTable(doc, lastY);
  doc.moveDown();
  generateServiceTotal(doc, lastServiceY);
  doc.moveDown();
  generateAmountAndTotal(doc, lastServiceY);
  doc.moveDown();

  generateTaxTable(doc, lastServiceY);
  generateSummaryTable(doc, lastServiceY);
  doc.moveDown();
  generateTermsNBankNAuth(doc, lastServiceY);

  // Add footer to the last page before finishing the document
  // addFooter(doc);

  doc.end();
};
function generateProductsTable(doc) {
  const startX = 10;
  let startY = 320; // Initial Y position
  const colWidths = [35, 100, 50, 35, 50, 50, 50, 50, 50, 50, 50]; // Column widths
  const padding = 5;
  const rowHeight = 25;
  const pageHeight = 750; // Approx. usable height before adding new page

  function drawHeaders() {
    const totalWidth = colWidths.reduce((acc, width) => acc + width, 0);
    doc.rect(startX, startY, totalWidth, rowHeight).fill("#666").stroke();

    doc
      .fillColor("#FFF")
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Products", startX, startY + padding, {
        width: totalWidth,
        align: "center",
      });

    startY += rowHeight;
    // Example service rows

    const headers = [
      "S.No",
      "Product Description",
      "HSN/SAC",
      "MRP",
      "Gst %",
      "Unit Price",
      "Disc. Rate",
      "Unit Price (AfterDisc.)",
      "Quantity",
      "Taxable Value",
      "Value",
    ];

    doc.fillColor("#000").font("Helvetica-Bold").fontSize(7);
    let x = startX;
    headers.forEach((header, index) => {
      doc.lineWidth(0.4);
      doc.rect(x, startY, colWidths[index], rowHeight).stroke();
      doc.text(header, x + padding, startY + padding, {
        width: colWidths[index] - 2 * padding,
        align: "center",
      });
      x += colWidths[index];
    });

    startY += rowHeight;
  }

  drawHeaders();

  doc.font("Helvetica").fontSize(7);
  const rows = [
    [
      "1",
      "AIR FILTER",
      "84213100",
      "100",
      "18",
      "84.75",
      "0",
      "84.75",
      "1",
      "84.75",
      "100.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "1",
      "AIR FILTER",
      "84213100",
      "100",
      "18",
      "84.75",
      "0",
      "84.75",
      "1",
      "84.75",
      "100.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
  ];
  rows.forEach((row) => {
    let x = startX;
    const rowHeights = row.map((text, index) =>
      doc.heightOfString(text, {
        width: colWidths[index] - 2 * padding,
        align: "center",
      })
    );
    const maxHeight = Math.max(...rowHeights) + 10;

    if (startY + maxHeight > pageHeight) {
      doc.addPage();
      startY = 50;
      drawHeaders();
      doc.font("Helvetica").fontSize(7);
      doc.lineWidth(0.4);
    }

    row.forEach((text, index) => {
      doc.rect(x, startY, colWidths[index], maxHeight).stroke();
      doc.text(text, x + padding, startY + padding, {
        width: colWidths[index] - 2 * padding,
        align: "center",
      });
      x += colWidths[index];
    });

    startY += maxHeight;
  });

  return startY; // Return the final position
}

function generateServiceTable(doc, lastY) {
  const startX = 10;
  let startY = lastY + 10; // Start below the last printed product row
  const colWidths = [35, 100, 50, 35, 50, 50, 50, 50, 50, 50, 50];
  const padding = 5;
  const rowHeight = 25;
  const pageHeight = 750; // Usable height before adding a new page

  function drawHeaders() {
    const totalWidth = colWidths.reduce((acc, width) => acc + width, 0);
    doc.rect(startX, startY, totalWidth, rowHeight).fill("#666").stroke();
    doc
      .fillColor("#FFF")
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Services & Packages", startX, startY + padding, {
        width: totalWidth,
        align: "center",
      });

    startY += rowHeight;

    const headers = [
      "S.No",
      "Product Description",
      "HSN/SAC",
      "MRP",
      "Gst %",
      "Unit Price",
      "Disc. Rate",
      "Unit Price (AfterDisc.)",
      "Quantity",
      "Taxable Value",
      "Value",
    ];

    doc.fillColor("#000").font("Helvetica-Bold").fontSize(7);
    let x = startX;
    headers.forEach((header, index) => {
      doc.lineWidth(0.4);
      doc.rect(x, startY, colWidths[index], rowHeight).stroke();
      doc.text(header, x + padding, startY + padding, {
        width: colWidths[index] - 2 * padding,
        align: "center",
      });
      x += colWidths[index];
    });

    startY += rowHeight;
  }

  drawHeaders();

  // Example service rows
  const rows = [
    [
      "1",
      "AIR FILTER",
      "84213100",
      "100",
      "18",
      "84.75",
      "0",
      "84.75",
      "1",
      "84.75",
      "100.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "1",
      "AIR FILTER",
      "84213100",
      "100",
      "18",
      "84.75",
      "0",
      "84.75",
      "1",
      "84.75",
      "100.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
    [
      "2",
      "OIL FILTER",
      "84213100",
      "200",
      "18",
      "170.50",
      "10",
      "160.50",
      "1",
      "160.50",
      "200.00",
    ],
  ];
  // const rows = [];
  doc.font("Helvetica").fontSize(7);

  rows.forEach((row) => {
    let x = startX;

    // Calculate max height required for this row
    const rowHeights = row.map((text, index) =>
      doc.heightOfString(text, {
        width: colWidths[index] - 2 * padding,
        align: "center",
      })
    );
    const maxHeight = Math.max(...rowHeights) + 10;

    // If row doesn't fit on the page, create a new one
    if (startY > pageHeight) {
      doc.addPage();
      startY = 50;
      drawHeaders();
      doc.font("Helvetica").fontSize(7);
      doc.lineWidth(0.4);
    }

    row.forEach((text, index) => {
      doc.rect(x, startY, colWidths[index], maxHeight).stroke();
      doc.text(text, x + padding, startY + padding, {
        width: colWidths[index] - 2 * padding,
        align: "center",
      });
      x += colWidths[index];
    });

    startY += maxHeight;
  });

  return startY; // Return last Y position after table rendering
}

// Function to generate the header
function generateHeader(doc, logo) {
  doc
    .image(logo, 10, 10, { width: 50 })
    .fontSize(20)
    .text("Tax Invoice", 100, 25, { align: "right" })
    .moveDown();
}

// Function to generate customer information
function generateCustomerInfo(doc) {
  doc
    .fontSize(10)
    .text("A Unit Of Ratnashil Online Services Pvt. Ltd.", 15)
    .text("Name: Kar98", 15)
    .text("Address: Plot no 987 Near BK", 15)
    .text("State Name: Haryana", 15);

  doc
    .fontSize(10)
    .text("Contact: 9953604305", 420, 100)
    .text("Email: kar98service@gmail.com", 420)
    .text("GSTIN/UIN: 06CAAPD8983P1Z3", 420);
}
function generateSpareTotal(doc, lastY) {
  const padding = 2;
  const spareTotalY = lastY + padding;
  const text = "Spare Total: 98";

  // Measure text width
  const textWidth = doc.widthOfString(text);

  // Set max allowed x-position (keeping some margin)
  const maxX = doc.page.width - 10;

  // Calculate x-position dynamically (ensuring it stays within bounds)
  let xPosition = Math.max(10, maxX - textWidth);

  doc.fontSize(10).text(text, xPosition - 44, spareTotalY);
}

function generateServiceTotal(doc, lastY) {
  const padding = 2;
  const spareTotalY = lastY + padding;
  const text = "Labour Total: 98";

  // Measure text width
  const textWidth = doc.widthOfString(text);

  // Set max allowed x-position (keeping some margin)
  const maxX = doc.page.width - 10;

  // Calculate x-position dynamically (ensuring it stays within bounds)
  let xPosition = Math.max(10, maxX - textWidth);

  doc.fontSize(10).text(text, xPosition - 44, spareTotalY);
}
//Mid
function generateInvoiceTable(doc) {
  const startY = 180;
  const colWidths = [190, 190, 190]; // Column widths
  const tableHeight = 18; // Header height
  const padding = 2; // Padding for text inside cells

  // Draw header background (dark grey like in your image)
  doc.rect(10, startY, colWidths[0], tableHeight).fill("#444").stroke();
  doc
    .rect(10 + colWidths[0], startY, colWidths[1], tableHeight)
    .fill("#444")
    .stroke();
  doc
    .rect(10 + colWidths[0] + colWidths[1], startY, colWidths[2], tableHeight)
    .fill("#444")
    .stroke();

  // Table Header Text (White & Bold)
  doc
    .fillColor("#FFF")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Customer Information", 10 + padding, startY + 5, {
      width: colWidths[0] - 2 * padding,
      align: "center",
    })
    .text("Vehicle Information", 10 + colWidths[0] + padding, startY + 5, {
      width: colWidths[1] - 2 * padding,
      align: "center",
    })
    .text(
      "Service Information",
      10 + colWidths[0] + colWidths[1] + padding,
      startY + 5,
      { width: colWidths[2] - 2 * padding, align: "center" }
    );

  // Reset fill color for content
  doc.fillColor("#000");

  // Table Content
  const contentStartY = startY + tableHeight; // Position after header
  const rows = [
    ["Name: Magma hdi", "Vehicle Type: 4W", "Generated On: 12th Feb 2025"],
    [
      "Address: Faridabad Odisha 121006",
      "Vehicle No: HR3AA1122",
      "Invoice Number: 2025-114",
    ],
    [
      "GSTIN/UIN: Asfgdfvz",
      "Brand/Model: MAHINDRA/KUV 100",
      "Next Service Date:",
    ],
    ["Business Name:", "Fuel Type: Petrol", "Supervisor:"],
    [
      "GST Address: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Donec id orci et nisl suscipit interdum.",
      "Odometer: Kms",
      "Jobcard No.:",
    ], // Example of long content
  ];

  let y = contentStartY;

  rows.forEach((row) => {
    const rowHeight = calculateRowHeight(doc, row, colWidths, padding); // Dynamically calculate row height
    generateTableRow(doc, y, colWidths, row, rowHeight, padding);
    y += rowHeight;
  });

  // Draw Table Borders
  drawTableBorders(doc, startY, y, colWidths);
}
function generateAmountAndTotal(doc, lastServiceY) {
  const padding = 2;
  const yAxisPos = lastServiceY + padding;
  const amountInWords =
    "Amount In Words: Twenty Seven Lakh Sixty Six Thousand Three Hundered Ninety Seven Rupees Only";
  const taxableTotal = "Total: 98765213.00";
  const totalValue = "9876543213.00";
  const taxableTotalWidth = doc.widthOfString(taxableTotal);
  const totalValueWidth = doc.widthOfString(totalValue);
  const maxTaxableTotalWidth = doc.page.width - 10;
  const maxTotalValueWidth = doc.page.width - 10;
  const xPositionTaxableTotal = Math.max(
    10,
    maxTaxableTotalWidth - taxableTotalWidth
  );
  const xPositionTotalValue = Math.max(
    10,
    maxTotalValueWidth - totalValueWidth
  );
  doc
    .fontSize(10)
    .text(amountInWords, 10, yAxisPos + 20, { width: 330, align: "left" });
  doc
    .fontSize(10)
    .text(taxableTotal, xPositionTaxableTotal - 100, yAxisPos + 20);
  doc.fontSize(10).text(totalValue, xPositionTotalValue - 10, yAxisPos + 20);
}
function generateTaxTable(doc, lastServiceY) {
  const startX = 10;
  let startY = lastServiceY + 50; // Start below the last printed product row
  const colWidths = [40, 40, 40, 40, 40, 40, 40, 40];
  const padding = 5;
  const rowHeight = 25;
  const pageHeight = 750; // Usable height before adding a new page
  function drawHeaders() {
    const totalWidth = colWidths.reduce((acc, width) => acc + width, 0);
    startY += rowHeight;

    const headers = [
      "Tax (Head)",
      "Taxable Value",
      "2.5%",
      "5%",
      "9%",
      "14%",
      "18%",
      "28%",
    ];

    doc.fillColor("#000").font("Helvetica-Bold").fontSize(7);
    let x = startX;
    headers.forEach((header, index) => {
      doc.rect(x, startY, colWidths[index], rowHeight).stroke();
      doc.text(header, x + padding, startY + padding, {
        width: colWidths[index] - 2 * padding,
        align: "center",
      });
      x += colWidths[index];
    });

    startY += rowHeight;
  }
  drawHeaders();
  const rows = [
    ["CGST", "98021.10", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00"],
    ["SGST", "98021.10", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00"],
    ["IGST", "98021.10", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00"],
  ];
  doc.font("Helvetica").fontSize(7);

  rows.forEach((row) => {
    let x = startX;

    // Calculate max height required for this row
    const rowHeights = row.map((text, index) =>
      doc.heightOfString(text, {
        width: colWidths[index] - 2 * padding,
        align: "center",
      })
    );
    const maxHeight = Math.max(...rowHeights) + 10;

    // If row doesn't fit on the page, create a new one
    if (startY > pageHeight) {
      doc.addPage();
      startY = 50;
      drawHeaders();
      doc.font("Helvetica").fontSize(7);
    }

    row.forEach((text, index) => {
      doc.rect(x, startY, colWidths[index], maxHeight).stroke();
      doc.text(text, x + padding, startY + padding, {
        width: colWidths[index] - 2 * padding,
        align: "center",
      });
      x += colWidths[index];
    });

    startY += maxHeight;
  });
}
function generateSummaryTable(doc, lastServiceY) {
  const startX = 450;
  let startY = lastServiceY + 17; // Start below the last printed product row
  const colWidths = [60, 60];
  const padding = 5;
  const rowHeight = 25;
  const pageHeight = 750; // Usable height before adding a new page
  function drawHeaders() {
    const totalWidth = colWidths.reduce((acc, width) => acc + width, 0);
    startY += rowHeight;

    const headers = ["Details", "Amount"];

    doc.fillColor("#000").font("Helvetica-Bold").fontSize(7);
    let x = startX;
    headers.forEach((header, index) => {
      doc.rect(x, startY, colWidths[index], rowHeight).stroke();
      doc.text(header, x + padding, startY + padding, {
        width: colWidths[index] - 2 * padding,
        align: "center",
      });
      x += colWidths[index];
    });

    startY += rowHeight;
  }
  drawHeaders();
  const rows = [
    ["CGST 18%", "98021.10"],
    ["SGST 18%", "98021.10"],
    ["Net Total", "98021.10"],
    ["Paid Total", "98021.10"],
    ["Balance Total", "0.00"],
  ];
  doc.font("Helvetica").fontSize(7);

  rows.forEach((row) => {
    let x = startX;

    // Calculate max height required for this row
    const rowHeights = row.map((text, index) =>
      doc.heightOfString(text, {
        width: colWidths[index] - 2 * padding,
        align: "center",
      })
    );
    const maxHeight = Math.max(...rowHeights) + 10;

    // If row doesn't fit on the page, create a new one
    if (startY > pageHeight) {
      doc.addPage();
      startY = 50;
      drawHeaders();
      doc.font("Helvetica").fontSize(7);
    }

    row.forEach((text, index) => {
      doc.rect(x, startY, colWidths[index], maxHeight).stroke();
      doc.text(text, x + padding, startY + padding, {
        width: colWidths[index] - 2 * padding,
        align: "center",
      });
      x += colWidths[index];
    });

    startY += maxHeight;
  });
}
function generateTermsNBankNAuth(doc, lastServiceY) {
  const pageHeight = doc.page.height; // Account for bottom margin
  const minSpacing = 10; // Space to avoid collision
  const estimatedSectionHeight = 150; // Approximate height of this section

  // Ensure we have enough space below the last element
  let startY = lastServiceY + 170;

  // If it doesn't fit on the current page, move to a new page
  if (startY + estimatedSectionHeight > pageHeight) {
    doc.addPage();
    startY = 50; // Reset Y position for new page
  }

  const colWidths = [190, 190, 190]; // Column widths
  const tableHeight = 5; // Header height
  const padding = 5; // Padding inside cells

  // Table Header
  doc
    .fillColor("#000")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Terms & Conditions", 10, startY + 5, {
      width: colWidths[0],
      align: "center",
    })
    .text("Bank Account Detail:", 10 + colWidths[0], startY + 5, {
      width: colWidths[1],
      align: "center",
    })
    .text("KAR98", 10 + colWidths[0] + colWidths[1], startY + 5, {
      width: colWidths[2],
      align: "center",
    });

  doc
    .fontSize(8)
    .text(
      "(A Unit Of Ratnashil Online Services Pvt. Ltd.)",
      10 + colWidths[0] + colWidths[1],
      startY + 18,
      {
        width: colWidths[2],
        align: "center",
      }
    );

  // Reset font for content
  doc.font("Helvetica").fontSize(10).fillColor("#000");

  // Table Content
  const contentStartY = startY + tableHeight + 15;
  const rows = [
    [
      "1) Subject to Faridabad Jurisdiction.",
      "Account Holder Name: Pratap Singh",
      "",
    ],
    [
      "2) Our Responsibility ceases as soon as goods leave our premises.",
      "Account Number: 732305000160",
      "",
    ],
    ["3) Goods once Sold will not be taken back.", "Bank Name: ICICI Bank", ""],
    ["", "Branch Name: Sector 79, Faridabad, Haryana", ""],
    ["", "IFSC Code: ICIC0007323", ""],
    ["Declaration:", "", ""], // Bold declaration title
    [
      "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
      "",
      "",
    ],
  ];

  let y = contentStartY;

  rows.forEach((row, index) => {
    const rowHeight = calculateRowHeight(doc, row, colWidths, padding) - 8;

    // Make "Declaration:" bold
    if (index === 5) {
      doc.font("Helvetica-Bold");
    } else {
      doc.font("Helvetica");
    }

    generateTableRow(doc, y, colWidths, row, rowHeight, padding);
    y += rowHeight;

    // Add horizontal separators in the Bank Account Detail column (for rows 1-5)
    if (index >= 0 && index <= 4) {
      doc
        .moveTo(10 + colWidths[0], y)
        .lineTo(10 + colWidths[0] + colWidths[1], y)
        .stroke();
    }
  });

  // Add "Authorised Signatory" in the last column, **centered vertically & horizontally**
  const signatoryY = y + 10; // Adjust for better centering
  doc
    .font("Helvetica-Bold")
    .text(
      "Authorised Signatory",
      10 + colWidths[0] + colWidths[1],
      signatoryY,
      {
        width: colWidths[2],
        align: "center",
      }
    );

  y += 30; // Add some spacing below "Authorised Signatory"

  // **Add bottom border for the entire Bank Account Detail section**
  doc
    .moveTo(10 + colWidths[0], y)
    .lineTo(10 + colWidths[0] + colWidths[1], y)
    .stroke();

  // Draw table borders
  drawTableBorders(doc, startY, y, colWidths);
}
/**
 * Dynamically calculates row height based on the longest wrapped text in any column.
 */
function calculateRowHeight(doc, row, colWidths, padding) {
  let maxHeight = 0;
  row.forEach((text, index) => {
    const height = doc.heightOfString(text, {
      width: colWidths[index] - 2 * padding,
      align: "left",
    });
    if (height > maxHeight) {
      maxHeight = height;
    }
  });
  return maxHeight + 2 * padding; // Adding padding for proper spacing
}
// Function to generate a single table row
function generateTableRow(doc, y, colWidths, columns) {
  let x = 10;
  columns.forEach((column, index) => {
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(column, x + 5, y + 5, {
        width: colWidths[index] - 10,
        align: "left",
      });
    x += colWidths[index];
  });
}

function drawTableBorders(doc, startY, endY, colWidths) {
  const xStart = 10;
  const xEnd = xStart + colWidths.reduce((acc, width) => acc + width, 0);

  // Set line width and color
  doc.lineWidth(0.5).strokeColor("#000");

  // Draw top horizontal border
  doc.moveTo(xStart, startY).lineTo(xEnd, startY).stroke();

  // Draw vertical lines for each column
  let x = xStart;
  colWidths.forEach((width) => {
    doc.moveTo(x, startY).lineTo(x, endY).stroke();
    x += width;
  });

  // Draw the rightmost vertical border
  doc.moveTo(xEnd, startY).lineTo(xEnd, endY).stroke();

  // ✅ Draw only **one bottom border** at `endY`
  doc.moveTo(xStart, endY).lineTo(xEnd, endY).stroke();
}

export default generateInvoice;
