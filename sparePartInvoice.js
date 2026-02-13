import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";

// Manually define `__dirname`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------- CONSTANTS ---------- */
const LABEL_COLOR = "#333333";
const VALUE_COLOR = "#666666";
const BORDER_COLOR = "#C7CED5";

const FONT_REGULAR = "Inter_24pt-Regular";
const FONT_SEMIBOLD = "Inter_24pt-SemiBold";
const FONT_BOLD = "Inter_28pt-Bold";

/* ---------- COLUMN DATA ---------- */

const repeatFromData = [
  { label: "From : ", value: "RATNASHIL ONLINE SERVICES PRIVATE LIMITED" },
  {
    label: "Address : ",
    value: "Plot no.967 Bypass Road, Sector-9, Faridabad Haryana - 121006",
  },
  { label: "Contact : ", value: "9027914004" },
];

const fromData = [
  { label: "From : ", value: "RATNASHIL ONLINE SERVICES PRIVATE LIMITED" },
  {
    label: "Address : ",
    value: "Plot no.967 Bypass Road, Sector-9, Faridabad Haryana - 121006",
  },
  { label: "Contact : ", value: "9027914004" },
  { label: "State Name : ", value: "Haryana" },
  { label: "State Code : ", value: "06" },
  { label: "GSTIN : ", value: "06AAICR7704D1ZI" },
  { label: "PAN No : ", value: "AAICR7704D" },
  { label: "Email ID : ", value: "account@pikpart.com" },
];

const repeatBuyerData = [
  { label: "Buyer : ", value: "9027914004" },
  {
    label: "Address : ",
    value: "Raghunathganj-II, Murshidabad, West Bengal - 742213",
  },
  { label: "Contact : ", value: "8250794411" },
];

const buyerData = [
  { label: "Buyer : ", value: "9027914004" },
  {
    label: "Address : ",
    value: "Raghunathganj-II, Murshidabad, West Bengal - 742213",
  },
  { label: "Contact : ", value: "8250794411" },
  { label: "State Name : ", value: "West Bengal" },
  { label: "State Code : ", value: "19" },
  {
    label: "GSTIN Status : ",
    value: "Registered / Unregistered",
    //   labelWidth: 80,
  },
  { label: "GSTIN/ARN : ", value: "NA" },
  { label: "PAN No : ", value: "AAICR7704D" },
];

const repeatConsigneeData = [
  { label: "Consignee : ", value: "Chainstart Autopart" },
  {
    label: "Address : ",
    value: "Raghunathganj-II, Murshidabad, West Bengal - 742213",
  },
  { label: "Contact : ", value: "8250794411" },
];

const consigneeData = [
  { label: "Consignee : ", value: "Chainstart Autopart" },
  {
    label: "Address : ",
    value: "Raghunathganj-II, Murshidabad, West Bengal - 742213",
  },
  { label: "Contact : ", value: "8250794411" },
  { label: "State Name : ", value: "West Bengal" },
  { label: "State Code : ", value: "19" },
  {
    label: "GSTIN Status : ",
    value: "Registered / Unregistered",
    //   labelWidth: 80,
  },
  { label: "GSTIN/ARN : ", value: "NA" },
  { label: "PAN No : ", value: "AAICR7704D" },
];

/* ---------- HELPER FUNCTIONS ---------- */

// Draw single label-value row
const drawRow = ({
  doc,
  label,
  value,
  x,
  labelWidth = 50,
  valueWidth = 120,
}) => {
  doc.fillColor(LABEL_COLOR).font(FONT_SEMIBOLD).text(label, x);

  doc
    .fillColor(VALUE_COLOR)
    .font(FONT_REGULAR)
    .text(value, x + labelWidth, doc.y - doc.currentLineHeight(), {
      width: valueWidth,
    });

  doc.moveDown(0.4);
};

// Draw a complete column from config
const drawColumn = ({ doc, x, y, rows, labelWidth }) => {
  doc.y = y;
  rows.forEach((row) => drawRow({ doc, x, labelWidth, ...row }));
  return doc.y;
};

const drawHeaderColumns = (doc, fromData, buyerData, consigneeData) => {
  const x = 20;
  const y = 75;
  const boxWidth = 550;
  const columnWidth = boxWidth / 3;
  const pageWidth = doc.page.width;

  /* ---------- HEADER IMAGES ---------- */
  doc.image(path.join(__dirname, "assets/taxInvoiceImg.png"), 0, 20, {
    width: 150,
  });

  doc.image(
    path.join(__dirname, "assets/invoiceLogo.png"),
    pageWidth - 165,
    25,
    { width: 150 },
  );

  doc
    .moveTo(pageWidth - 143, 50)
    .lineTo(pageWidth - 5, 50)
    .strokeColor("#CA2A01")
    .lineWidth(1)
    .stroke();

  doc.fontSize(7);

  const section1Col1 = drawColumn({
    doc,
    x,
    y,
    rows: fromData,
  });

  const section1Col2 = drawColumn({
    doc,
    x: x + columnWidth + 5,
    y,
    rows: buyerData,
  });

  const section1Col3 = drawColumn({
    doc,
    x: x + columnWidth * 2 + 5,
    y,
    rows: consigneeData,
  });

  const height = Math.max(section1Col1, section1Col2, section1Col3); // 🔹 header section height

  /* ---------- BOTTOM BORDER ---------- */

  doc
    .strokeColor(BORDER_COLOR)
    .lineWidth(0.6)
    .moveTo(x, height + 2)
    .lineTo(x + boxWidth, height + 2)
    .stroke();

  return height;
};

// products table data

const sparePartsHeaders = [
  "SN.",
  "Name/Code",
  "Model",
  "HSN",
  "MRP",
  "GST%",
  "Unit Price\n(Before Disc.)",
  "Discount",
  "Unit Price\n(After Disc.)",
  "Qty.",
  "Taxable\nValue",
  "Net Total",
];

const sparePartsColumnWidths = [
  20, // SN
  120, // Spare Parts  // Code
  44, // Model
  44, // HSN
  34, // MRP
  29, // GST
  54, // Unit Price Before
  36, // Discount
  59, // Unit Price After
  21, // Qty
  44, // Taxable Value
  46, // Net Total
];

const sparePartsRows = [
  {
    sn: 1,
    part: "Air Filter",
    code: "3480235",
    model: "Splendor",
    hsn: "3480235",
    mrp: "5678",
    gst: "18",
    before: "230.00",
    disc: "0",
    after: "210.00",
    qty: "2",
    taxable: "360.00",
    total: "330.00",
  },
  {
    sn: 2,
    part: "Front Bumper WAGONR 5DR 1.0L LXI 2ND GEN F/L",
    code: "3488935",
    model: "Apache",
    hsn: "3488935",
    mrp: "4823",
    gst: "18",
    before: "125.00",
    disc: "0",
    after: "160.00",
    qty: "2",
    taxable: "250.00",
    total: "210.00",
  },
  {
    sn: 3,
    part: "Engine Oil",
    code: "3484567",
    model: "Splendor",
    hsn: "3484567",
    mrp: "3784",
    gst: "20",
    before: "150.00",
    disc: "0",
    after: "180.00",
    qty: "2",
    taxable: "300.00",
    total: "280.00",
  },
  {
    sn: 4,
    part: "Brake Pad",
    code: "3481111",
    model: "Pulsar",
    hsn: "3481111",
    mrp: "2890",
    gst: "18",
    before: "320.00",
    disc: "10",
    after: "288.00",
    qty: "1",
    taxable: "288.00",
    total: "340.00",
  },
  {
    sn: 5,
    part: "Clutch Plate",
    code: "3482222",
    model: "Apache",
    hsn: "3482222",
    mrp: "6500",
    gst: "18",
    before: "950.00",
    disc: "5",
    after: "902.50",
    qty: "1",
    taxable: "902.50",
    total: "1065.00",
  },
  // {
  //   sn: 6,
  //   part: "Spark Plug",
  //   code: "3483333",
  //   model: "Splendor",
  //   hsn: "3483333",
  //   mrp: "890",
  //   gst: "18",
  //   before: "120.00",
  //   disc: "0",
  //   after: "120.00",
  //   qty: "3",
  //   taxable: "360.00",
  //   total: "425.00",
  // },
  // {
  //   sn: 7,
  //   part: "Chain Sprocket",
  //   code: "3484444",
  //   model: "Pulsar",
  //   hsn: "3484444",
  //   mrp: "7200",
  //   gst: "18",
  //   before: "1150.00",
  //   disc: "5",
  //   after: "1092.50",
  //   qty: "1",
  //   taxable: "1092.50",
  //   total: "1288.00",
  // },
  // {
  //   sn: 8,
  //   part: "Side Mirror",
  //   code: "3485555",
  //   model: "Apache",
  //   hsn: "3485555",
  //   mrp: "1500",
  //   gst: "18",
  //   before: "280.00",
  //   disc: "0",
  //   after: "280.00",
  //   qty: "2",
  //   taxable: "560.00",
  //   total: "660.00",
  // },
  // {
  //   sn: 9,
  //   part: "Indicator Set",
  //   code: "3486666",
  //   model: "Splendor",
  //   hsn: "3486666",
  //   mrp: "2200",
  //   gst: "18",
  //   before: "350.00",
  //   disc: "0",
  //   after: "350.00",
  //   qty: "1",
  //   taxable: "350.00",
  //   total: "413.00",
  // },
  // {
  //   sn: 10,
  //   part: "Battery",
  //   code: "3487777",
  //   model: "Pulsar",
  //   hsn: "3487777",
  //   mrp: "9500",
  //   gst: "18",
  //   before: "2200.00",
  //   disc: "5",
  //   after: "2090.00",
  //   qty: "1",
  //   taxable: "2090.00",
  //   total: "2466.00",
  // },

  // ---- Repeating pattern for pagination testing ----
  ...Array.from({ length: 5 }, (_, i) => ({
    sn: i + 11,
    part: "General Spare Part",
    code: `34900${i + 11}`,
    model: ["Splendor", "Apache", "Pulsar"][i % 3],
    hsn: `34900${i + 11}`,
    mrp: "3000",
    gst: "18",
    before: "400.00",
    disc: "0",
    after: "400.00",
    qty: "2",
    taxable: "800.00",
    total: "944.00",
  })),
];

// GST Table data

const gstTableHeaders = [
  "Tax (Head)",
  "Taxable Value",
  "2.5%",
  "5%",
  "9%",
  "18%",
];

const gstTableColumnWidths = [50, 70, 50, 50, 50, 50];

const gstTableRows = [
  {
    taxHead: "CGST",
    taxValue: "4189.83",
    firstPercent: "-",
    secondPercent: "-",
    thirdPercent: "-",
    fourthPercent: "-",
  },
  {
    taxHead: "SGST",
    taxValue: "4189.83",
    firstPercent: "-",
    secondPercent: "-",
    thirdPercent: "-",
    fourthPercent: "-",
  },
  {
    taxHead: "IGST",
    taxValue: "4189.83",
    firstPercent: "-",
    secondPercent: "-",
    thirdPercent: "-",
    fourthPercent: "-",
  },
];

// draw table row

const drawTableRow = ({ doc, x, y, row, columnWidths, isHeader = false }) => {
  let maxHeight = 0;

  // Calculate row height
  row.forEach((cell, i) => {
    let height = 0;
    const cellWidth = columnWidths[i] - 6;

    if (i === 1 && typeof cell === "object") {
      // height of name
      const nameHeight = doc.heightOfString(cell.name, {
        width: cellWidth,
      });

      // height of code
      const codeHeight = doc.heightOfString(cell.code, {
        width: cellWidth,
      });

      height = nameHeight + codeHeight;
    } else {
      height = doc.heightOfString(String(cell), {
        width: cellWidth,
      });
    }

    maxHeight = Math.max(maxHeight, height + 10);
  });

  // Header background
  if (isHeader) {
    doc
      .rect(
        x,
        y,
        columnWidths.reduce((a, b) => a + b, 0),
        maxHeight,
      )
      .fill("#F6F8FC");
  }

  // Draw text (NO vertical borders)
  let currentX = x;
  row.forEach((cell, i) => {
    const cellX = currentX + 3;
    const cellY = y + 5;
    const cellWidth = columnWidths[i] - 6;

    if (i === 1 && typeof cell === "object") {
      // Draw Name (normal color)
      doc
        .font(FONT_REGULAR)
        .fillColor("#333333")
        .fontSize(7)
        .text(cell.name, cellX, cellY, {
          width: cellWidth,
          align: "left",
        });

      // Get height of name
      const nameHeight = doc.heightOfString(cell.name, {
        width: cellWidth,
      });

      // Draw Code (different color)
      doc
        .font(FONT_SEMIBOLD)
        .fillColor("#111") // 👈 change color here
        .fontSize(7)
        .text(cell.code, cellX, cellY + nameHeight, {
          width: cellWidth,
          align: "left",
        });
    } else {
      doc
        .font(isHeader ? FONT_SEMIBOLD : FONT_REGULAR)
        .fillColor("#333333")
        .fontSize(7)
        .text(cell, cellX, cellY, {
          width: cellWidth,
          align: i === 1 ? "left" : "center",
        });
    }

    currentX += columnWidths[i];
  });

  // Horizontal bottom line only
  doc
    .moveTo(x, y + maxHeight)
    .lineTo(x + columnWidths.reduce((a, b) => a + b, 0), y + maxHeight)
    .strokeColor("#E2E6EA")
    .lineWidth(0.3)
    .stroke();

  return maxHeight;
};

// draw complete table
const drawSparePartsTable = ({
  doc,
  x,
  startY,
  headers,
  rows,
  columnWidths,
  headerHeight,
}) => {
  const topMargin = 10;
  const bottomMargin = 35;

  let y = startY;

  //  Draw header initially
  y += drawTableRow({
    doc,
    x,
    y,
    row: headers,
    columnWidths,
    isHeader: true,
  });

  rows.forEach((item) => {
    const rowData = [
      String(item.sn),
      { name: item.part, code: item.code },
      item.model,
      item.hsn,
      item.mrp,
      item.gst,
      item.before,
      item.disc,
      item.after,
      item.qty,
      item.taxable,
      item.total,
    ];

    //  CHECK SPACE BEFORE DRAWING ROW
    const estimatedHeight = 20; // safe row height

    if (y + estimatedHeight > doc.page.height - bottomMargin) {
      doc.addPage();

      y = topMargin + headerHeight - 50;

      //  redraw header on new page
      y += drawTableRow({
        doc,
        x,
        y,
        row: headers,
        columnWidths,
        isHeader: true,
      });
    }

    //  draw row
    y += drawTableRow({
      doc,
      x,
      y,
      row: rowData,
      columnWidths,
    });
  });

  return y;
};

/* ---------- MAIN PDF FUNCTION ---------- */

const sparePartInvoice = (res) => {
  const doc = new PDFDocument({ size: "A4", margin: 10, bufferPages: true });

  /* ---------- FONT REGISTRATION ---------- */
  doc.registerFont(
    FONT_REGULAR,
    path.join(__dirname, "assets/fonts/Inter_24pt-Regular.ttf"),
  );
  doc.registerFont(
    FONT_SEMIBOLD,
    path.join(__dirname, "assets/fonts/Inter_24pt-SemiBold.ttf"),
  );
  doc.registerFont(
    FONT_BOLD,
    path.join(__dirname, "assets/fonts/Inter_28pt-Bold.ttf"),
  );

  /* ---------- RESPONSE HEADERS ---------- */
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="invoice.pdf"');

  doc.pipe(res);

  doc.on("pageAdded", () => {
    drawHeaderColumns(
      doc,
      repeatFromData,
      repeatBuyerData,
      repeatConsigneeData,
    );
  });

  /* ---------- HEADER IMAGES ---------- */
  const pageWidth = doc.page.width;

  /* ---------- LAYOUT ---------- */
  const x = 20;
  const boxWidth = 550;
  const columnWidth = boxWidth / 3;

  doc.fontSize(7);

  /* ---------- DRAW COLUMNS ---------- */

  const headerHeight = drawHeaderColumns(
    doc,
    fromData,
    buyerData,
    consigneeData,
  );

  /* ------------- After Border ---------------- */

  const secondSectionY = headerHeight + 8; // spacing after first section

  const Section1Array1 = [
    { label: "Supply Nature : ", value: "Interstate / Intrastate" },
    {
      label: "Supply Category : ",
      value: "Goods / Services",
    },
    { label: "PO : ", value: "9027914004" },
    { label: "Delivery Mode : ", value: "Haryana" },
    { label: "Tranporter Name : ", value: "06" },
    { label: "Transporter GSTIN : ", value: "06AAICR7704D1ZI" },
  ];

  const section2Col1 = drawColumn({
    doc,
    x,
    y: secondSectionY,
    labelWidth: 66,
    rows: Section1Array1,
  });

  const section2Array2 = [
    { label: "E-way Bill No : ", value: "RO-06-AA00009" },
    {
      label: "E-way Bill Date : ",
      value: "2nd Dec 2025",
    },
    { label: "Invoice No : ", value: "RO-06-AA00009" },
    {
      label: "Invoice Date : ",
      value: "2nd Dec 2025",
    },
    { label: "Vehicle No : ", value: "HR29 AQ 7964" },
    { label: "Place Of Supply : ", value: "West Bengal" },
    { label: "Designation : ", value: "Murshidabad(WestBengal)" },
    {
      label: "Reverse Charge Applicable? : ",
      value: "Yes/No",
      labelWidth: 97,
    },
  ];

  const section2Col2 = drawColumn({
    doc,
    x: x + columnWidth + 5,
    y: secondSectionY,
    labelWidth: 65,
    rows: section2Array2,
  });

  const section2Array3 = [
    {
      label: "IRN No : ",
      value: "70d387753ce3807124e2c3677039af56c8f85b90e5cc2a69d8- ea9b02d0f9f1",
    },
    { label: "Ack No : ", value: "132524780394198" },
    { label: "Ack Date : ", value: "04-12-2025" },
  ];

  const section2Col3 = drawColumn({
    doc,
    x: x + columnWidth * 2 + 5,
    y: secondSectionY,
    labelWidth: 34,
    rows: section2Array3,
  });

  doc.image(
    path.join(__dirname, "assets/invoiceQRCode.png"),
    pageWidth - 86,
    headerHeight + 42,
    { width: 60 },
  );

  const bottomY2 = Math.max(section2Col1, section2Col2, section2Col3);

  doc
    .strokeColor(BORDER_COLOR)
    .lineWidth(0.6)
    .moveTo(x, bottomY2 + 8)
    .lineTo(x + boxWidth, bottomY2 + 8)
    .stroke();

  /* ---------- SPARE PARTS TABLE ---------- */

  const tableStartY = bottomY2 + 30;

  doc
    .fillColor(LABEL_COLOR)
    .font(FONT_BOLD)
    .fontSize(8)
    .text("Spare Parts", x, bottomY2 + 23 - doc.currentLineHeight());

  const tableEndY = drawSparePartsTable({
    doc,
    x,
    startY: tableStartY,
    headers: sparePartsHeaders,
    rows: sparePartsRows,
    columnWidths: sparePartsColumnWidths,
    headerHeight,
  });

  //   Price total box

  const totalAmountInWords =
    "Amount in words : Five Lakh Forty Four Thousand Four Hundred Nine Rupees And Fifty Eight Paise Only Fifty Eight Paise Only";

  const taxTotal = "1279650.00";
  const amountTotal = "12790.00";

  const padding = 6;

  const totalPriceBoxWidth = sparePartsColumnWidths.reduce((a, b) => a + b, 0);

  const heightOfAmountInWords = doc.heightOfString(totalAmountInWords, {
    width: 350,
  });

  let totalBoxHeight = heightOfAmountInWords + padding * 2;
  let totalPriceBoxY = tableEndY + 10;

  if (totalPriceBoxY + totalBoxHeight > doc.page.height - 40) {
    doc.addPage();
    totalPriceBoxY = headerHeight - 45; // reset Y for new page
  }

  doc.font(FONT_BOLD).fontSize(8);

  doc.rect(x, totalPriceBoxY, boxWidth, totalBoxHeight).fill("#F6F8FC");

  doc
    .fillColor("#333333")
    .text(totalAmountInWords, x + padding, totalPriceBoxY + padding, {
      width: 350,
    });

  const widthOfRightTotal = doc.widthOfString(`₹ ${amountTotal}`, {
    width: totalPriceBoxWidth - 5,
  });

  doc
    .fillColor("#333333")
    .text(`Total: ₹ ${taxTotal}`, x, totalPriceBoxY + padding, {
      width: totalPriceBoxWidth - widthOfRightTotal - 20,
      align: "right",
    });

  doc
    .fillColor("#333333")
    .text(`₹ ${amountTotal}`, x, totalPriceBoxY + padding, {
      width: totalPriceBoxWidth - 5,
      align: "right",
    });

  // GST Table

  let gstHeaderHeight = 0;
  let gstTableY = totalPriceBoxY + heightOfAmountInWords + 20;

  gstTableRows.forEach((cell, i) => {
    const height = doc.heightOfString(cell, {
      width: gstTableColumnWidths[i] - 6,
    });
    gstHeaderHeight = Math.max(gstHeaderHeight, height);
  });

  gstHeaderHeight += 8;

  let rowsHeight = 0;

  gstTableRows.forEach((row) => {
    let rowHeight = 0;
    const gstRowData = Object.values(row);

    gstRowData.forEach((cell, i) => {
      const h = doc.heightOfString(String(cell ?? ""), {
        width: gstTableColumnWidths[i] - 6,
      });
      rowHeight = Math.max(rowHeight, h);
    });

    rowsHeight += rowHeight + 8;
  });

  const totalGstTableHeight = gstHeaderHeight + rowsHeight;

  if (gstTableY + totalGstTableHeight > doc.page.height - 40) {
    doc.addPage();
    gstTableY = headerHeight - 45;
  }

  doc
    .rect(
      x,
      gstTableY,
      gstTableColumnWidths.reduce((a, b) => a + b, 0),
      gstHeaderHeight,
    )
    .fill("#F6F8FC");

  let tableCellX = x;

  gstTableHeaders?.forEach((cell, i) => {
    doc
      .font(FONT_BOLD)
      .fillColor("#333333")
      .fontSize(8)
      .text(cell, tableCellX + 5, gstTableY + 4, {
        width: gstTableColumnWidths[i] - 6,
      });

    tableCellX += gstTableColumnWidths[i];
  });

  // Draw rows
  let tableRowY = gstTableY + gstHeaderHeight;

  gstTableRows?.forEach((row) => {
    let rowHeight = 0;

    const gstRowData = [
      row.taxHead,
      row.taxValue,
      row.firstPercent,
      row.secondPercent,
      row.thirdPercent,
      row.fourthPercent,
    ];

    gstRowData.forEach((cell, i) => {
      const h = doc.heightOfString(String(cell ?? ""), {
        width: gstTableColumnWidths[i] - 6,
      });
      rowHeight = Math.max(rowHeight, h);
    });

    rowHeight += 8;

    let rowX = x;
    gstRowData.forEach((cell, i) => {
      doc
        .font(i === 0 ? FONT_SEMIBOLD : FONT_REGULAR)
        .fillColor("#333333")
        .fontSize(8)
        .text(String(cell ?? ""), rowX + 5, tableRowY + 4, {
          width: gstTableColumnWidths[i] - 6,
        });
      rowX += gstTableColumnWidths[i];
    });

    tableRowY += rowHeight;
  });

  // All total table

  const summaryData = [
    { label: "CGST 2.5%", value: "-" },
    { label: "SGST 2.5%", value: "377.83" },
    { label: "IGST 5%", value: "-" },
    { label: "CGST 9%", value: "377.83" },
    { label: "SGST 9%", value: "377.83" },
    { label: "IGST 9%", value: "377.83" },
    { label: "Tax Total", value: "754.17" },
    { label: "Net Total", value: "4944.83" },
    { label: "Paid Total", value: "4944.83" },
    { label: "Balance Total", value: "4944.83" },
  ];

  let currentPage = 1;

  let summaryEndedOnNewPage = false;
  let summaryEndPage = currentPage;

  const boxX = pageWidth - 140;
  const boxY = gstTableY;
  const boxTotalWidth = 120;

  const rowHeight = 18.4;

  const labelWidth = 70;
  const valueWidth = boxTotalWidth - labelWidth;

  let totalPriceY = boxY;

  summaryData.forEach((item, index) => {
    if (totalPriceY + rowHeight > doc.page.height - 40) {
      doc.addPage();
      totalPriceY = headerHeight - 50;

      summaryEndedOnNewPage = true;
      summaryEndPage = currentPage;
    }
    if (Number(item?.value) > 0 || item?.label == "Balance Total") {
      // Label
      doc
        .font(FONT_SEMIBOLD)
        .fillColor("#333333")
        .text(item.label, boxX + 8, totalPriceY, {
          width: labelWidth,
        });
      // Value (right aligned)
      doc
        .font(index === summaryData.length - 1 ? FONT_SEMIBOLD : FONT_REGULAR)
        .text(`₹${item.value}`, boxX + labelWidth, totalPriceY, {
          width: valueWidth - 8,
          align: "right",
        });

      // Divider (skip last)
      doc
        .moveTo(boxX + 6, totalPriceY + rowHeight - 4)
        .lineTo(boxX + boxTotalWidth - 6, totalPriceY + rowHeight - 4)
        .strokeColor("#E2E6EA")
        .lineWidth(0.3)
        .stroke();

      totalPriceY += rowHeight;
    }
  });

  doc
    .font(FONT_SEMIBOLD)
    .fillColor("#333333")
    .fontSize(5)
    .text("E. & O.E.", pageWidth - 44, totalPriceY);

  doc.fontSize(7);

  const headerTexts = [
    "TERMS & CONDITIONS",
    "PAYMENT DETAILS",
    "RATNASHIL ONLINE SERVICE PRIVATE LIMITED",
  ];

  const termsAndConditions = [
    "All invoices are payable within the stipulated due date.",
    "Interest may apply on delayed payments as per company policy.",
    "Goods once sold are not eligible for return or exchange.",
    "Any shortage, damage, or discrepancy must be reported within 24 hours of delivery.",
    "Warranty/Guarantee, wherever applicable, will be governed by the manufacturer’s terms only.",
    "Prices, specification and availability are subject to change without prior notice.",
    "Company reserves the right to revise or cancel the invoice if required.",
    "All transactions are governed by applicable GST laws.",
    "Jurisdiction for all disputes shall be the city of our registered office only.",
    "E. & O.E. (Errors & Omissions Excepted).",
    "For any queries or document requirements related to this invoice, please email us at the address mentioned above.",
  ];

  // ---- TERMS HEIGHT ----
  let termsHeight = 0;
  termsAndConditions.forEach((text, i) => {
    termsHeight +=
      doc.heightOfString(`${i + 1}. ${text}`, {
        width: columnWidth - 14,
      }) + 3;
  });

  // ---- BANK HEIGHT ----
  let bankHeight = 0;

  // QR space
  bankHeight += 80;
  // ---- SIGNATURE HEIGHT ----
  const signImg = doc.openImage(path.join(__dirname, "assets/signImage.png"));
  const signHeight = signImg.height + 50;

  // ---- FINAL ESTIMATED HEIGHT ----
  const estimatedHeight = Math.max(termsHeight, bankHeight, signHeight);

  const topMargin = 40;
  const bottomMargin = 40;
  const textY = totalPriceY + 20;

  let maxTextHeight = 0;
  let termsY = textY;
  let bankY = textY;
  let signY = textY;

  if (textY + estimatedHeight > doc.page.height - bottomMargin) {
    doc.addPage();
    const height = 100;

    termsY = topMargin + height;
    bankY = topMargin + height;
    signY = topMargin + height;
  }

  // redraw header
  doc.rect(x, termsY, totalPriceBoxWidth, maxTextHeight + 16).fill("#F6F8FC");

  headerTexts.forEach((text, index) => {
    const textX =
      index === 2 ? x + index * columnWidth + 22 : x + index * columnWidth + 6;

    doc
      .font(FONT_BOLD)
      .fillColor("#333333")
      .text(text, textX, termsY + 4, {
        width: columnWidth - 11,
      });
  });

  termsAndConditions.forEach((text, index) => {
    const numberedText = `${index + 1}. ${text}`;

    const textHeight = doc.heightOfString(numberedText, {
      width: columnWidth - 14,
    });

    doc
      .font(FONT_REGULAR)
      .fillColor("#333333")
      .text(`${index + 1}. ${text}`, x + 6, termsY + 20, {
        width: columnWidth - 14,
      });

    termsY += textHeight + 3;
  });

  const bankDetails = [
    { label: "A/c Holder Name : ", value: "Ratnashil Online Services Pvt Ltd" },
    { label: "A/c No. : ", value: "661351200021" },
    { label: "Bank Name : ", value: "ICICI Bank" },
    { label: "IFSC Code : ", value: "ICIC0006613" },
    { label: "Branch Location : ", value: "Faridabad-Neelam Bata" },
    { label: "UPI ID : ", value: "14ry@sbiBank" },
  ];

  bankDetails.forEach((item, idx) => {
    const text = `${item.label} ${item.value}`;
    const labelWidth = 62;

    const lineHeight = doc.heightOfString(text, {
      width: columnWidth - 14,
    });

    doc
      .font(FONT_SEMIBOLD)
      .fillColor("#333333")
      .text(item.label, columnWidth + 26, bankY + 20);

    doc
      .font(FONT_REGULAR)
      .fillColor("#333333")
      .text(item.value, columnWidth + labelWidth + 26, bankY + 20);

    bankY += lineHeight + 4;
  });

  doc.image(
    path.join(__dirname, "assets/invoiceQRCode.png"),
    columnWidth + 40,
    bankY + 30,
    { width: 60 },
  );

  const img = doc.openImage(path.join(__dirname, "assets/signImage.png"));

  const imageWidth = 110;
  const imageHeight = img.height;

  doc.image(img, columnWidth * 2 + columnWidth / 3, signY + 30, {
    width: imageWidth,
  });

  doc
    .font(FONT_SEMIBOLD)
    .text(
      "Authorised Signature",
      columnWidth * 2 + columnWidth / 2.2,
      signY + imageHeight + 35,
    );

  const range = doc.bufferedPageRange();

  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);

    const pageNumberText = `Page ${i + 1} of ${range.count}`;

    doc
      .font(FONT_REGULAR)
      .fontSize(8)
      .fillColor("#666666")
      .text(pageNumberText, 0, doc.page.height - 30, {
        align: "center",
        width: doc.page.width,
      });
  }

  doc.end();
};

export default sparePartInvoice;
