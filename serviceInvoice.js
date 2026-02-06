import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";

// Manually define `__dirname`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------- CONSTANTS ---------- */
const LABEL_COLOR = "#333333";
const VALUE_COLOR = "#888888";
const BORDER_COLOR = "#C7CED5";

const FONT_REGULAR = "Inter_24pt-Regular";
const FONT_SEMIBOLD = "Inter_24pt-SemiBold";
const FONT_BOLD = "Inter_28pt-Bold";

const labelText = (doc, text, x, y) => {
  doc.font(FONT_SEMIBOLD).fillColor("#E04B24").fontSize(7).text(text, x, y);
};

const valueText = (doc, text, x, y) => {
  doc.font(FONT_REGULAR).fillColor("#333333").fontSize(7).text(text, x, y);
};

/* --

/* ---------- COLUMN DATA ---------- */

const fromData = [
  { label: "From", value: "RATNASHIL ONLINE SERVICES PRIVATE LIMITED" },
  {
    label: "Address",
    value: "Plot no.967 Bypass Road, Sector-9, Faridabad Haryana - 121006",
  },
  { label: "Contact", value: "9027914004" },
  { label: "State Name", value: "Haryana" },
  { label: "State Code", value: "06" },
  { label: "GSTIN", value: "06AAICR7704D1ZI" },
  { label: "PAN No", value: "AAICR7704D" },
  { label: "Email ID", value: "account@pikpart.com" },
];

const buyerData = [
  { label: "Buyer", value: "9027914004" },
  {
    label: "Address",
    value: "Raghunathganj-II, Murshidabad, West Bengal - 742213",
  },
  { label: "Contact", value: "8250794411" },
  { label: "State Name", value: "West Bengal" },
  { label: "State Code", value: "19" },
  {
    label: "GSTIN Status",
    value: "Registered / Unregistered",
    //   labelWidth: 80,
  },
  { label: "GSTIN/ARN", value: "NA" },
  { label: "PAN No", value: "AAICR7704D" },
];

const consigneeData = [
  { label: "Consignee", value: "Chainstart Autopart" },
  {
    label: "Address",
    value: "Raghunathganj-II, Murshidabad, West Bengal - 742213",
  },
  { label: "Contact", value: "8250794411" },
  { label: "State Name", value: "West Bengal" },
  { label: "State Code", value: "19" },
  {
    label: "GSTIN Status",
    value: "Registered / Unregistered",
    //   labelWidth: 80,
  },
  { label: "GSTIN/ARN", value: "NA" },
  { label: "Business Name", value: "-" },
];

/* ---------- HELPER FUNCTIONS ---------- */

// Draw single label-value row
const drawRow = ({
  doc,
  label,
  value,
  x,
  labelWidth = 54,
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

const repeatingHeader = (doc, contactInfo, invoiceType) => {
  const x = 20;
  const y = 20;
  const boxWidth = 550;

  let cursorY = y;

  /* ---------- CONTACT INFO ---------- */
  labelText(doc, "Contact :", x, cursorY);
  valueText(doc, contactInfo?.contact, x + 32, cursorY);

  cursorY += doc.currentLineHeight() + 4.5;

  labelText(doc, "Email :", x, cursorY);
  valueText(doc, contactInfo?.email, x + 23, cursorY);

  cursorY += doc.currentLineHeight() + 4.5;

  labelText(doc, "GSTIN/UIN :", x, cursorY);
  valueText(doc, contactInfo?.gstNo, x + 41, cursorY);

  /* ---------- BRAND ---------- */
  cursorY += doc.currentLineHeight() + 10;

  const name = contactInfo?.garageName;

  // measure text width
  const textWidth = doc.widthOfString(name, { font: FONT_BOLD, size: 13 });

  // calculate extra padding dynamically (approx buckets)
  let extraWidth = 0;

  if (textWidth < 30) {
    extraWidth = 60;
  } else if (textWidth < 40) {
    extraWidth = 80;
  } else if (textWidth < 60) {
    extraWidth = 90;
  } else if (textWidth < 80) {
    extraWidth = 120;
  } else if (textWidth < 120) {
    extraWidth = 175;
  } else if (textWidth < 130) {
    extraWidth = 190;
  } else if (textWidth < 180) {
    extraWidth = 220;
  } else if (textWidth < 220) {
    extraWidth = 230;
  }

  // draw background image
  doc.image(path.join(__dirname, "assets/garageNameBG.png"), 0, cursorY, {
    width: textWidth + extraWidth,
    height: 36, // fixed height
  });

  // draw text on top
  doc
    .font(FONT_BOLD)
    .fontSize(13)
    .fillColor("#fff")
    .text(
      name,
      x, // x padding inside image
      y + 49, //f y: center text vertically in image
    );

  doc
    .font(FONT_REGULAR)
    .fillColor("#888888")
    .fontSize(7)
    .text("(A Unit Of Ratnashil Online Services Pvt. Ltd.)", x, y + 78);

  /* ---------- DIVIDER ---------- */
  doc
    .moveTo(0, 115)
    .lineTo(140, 115)
    .strokeColor("#CA2A01")
    .lineWidth(1)
    .stroke();

  /* ---------- RIGHT HEADER ---------- */
  doc.image(
    path.join(__dirname, "assets/SGInvoiceLogo.png"),
    boxWidth - 96,
    18,
    { width: 23 },
  );

  doc
    .font(FONT_SEMIBOLD)
    .fillColor("#E04B24")
    .fontSize(15)
    .text("smart garage", 27, y, {
      width: boxWidth,
      align: "right",
    });

  doc
    .font(FONT_BOLD)
    .fillColor("#060606")
    .fontSize(20)
    .text(invoiceType, 27, y + 22, { width: boxWidth, align: "right" });

  if (invoiceType != "Proforma Invoice") {
    doc
      .font(FONT_BOLD)
      .fontSize(9)
      .text("SA00231-26IA214", 27, y + 50, {
        width: boxWidth,
        align: "right",
      });
  }

  /* ---------- ADDRESS ---------- */
  doc.image(
    path.join(__dirname, "assets/InvoiceLocationIcon.png"),
    boxWidth + 17,
    invoiceType != "Proforma Invoice" ? y + 65 : y + 54,
    { width: 10 },
  );

  doc
    .font(FONT_REGULAR)
    .fillColor("#333333")
    .fontSize(7)
    .text(
      "Mandsaur Chandrapura Survey No. 676 Mandsaur Madhya Pradesh 458001",
      boxWidth - 185,
      invoiceType != "Proforma Invoice" ? y + 65 : y + 54,
      { width: 200, align: "right" },
    );
};

// Draw a complete column from config
const drawColumn = ({ doc, x, y, rows, labelWidth }) => {
  doc.y = y;
  rows.forEach((row) => drawRow({ doc, x, labelWidth, ...row }));
  return doc.y;
};

const drawHeaderColumns = (doc, fromData, buyerData, consigneeData) => {
  const x = 20;
  const y = 120;
  const boxWidth = 550;
  const columnWidth = boxWidth / 3;

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
  "Name",
  "Code",
  "HSN",
  "MRP/Unit Price",
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
  85, // Spare Parts
  40, // Code
  45, // HSN
  38, // MRP
  30, // GST
  60, // Unit Price Before
  42, // Discount
  65, // Unit Price After
  22, // Qty
  52, // Taxable Value
  52, // Net Total
];

const sparePartsRows = [
  {
    sn: 1,
    part: "Air Filter",
    code: "34802353480235",
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
    part: "Front Bumper",
    code: "5434543543543",
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
  // {
  //   sn: 3,
  //   part: "Engine Oil",
  //   code: "54543543643643",
  //   hsn: "3484567",
  //   mrp: "3784",
  //   gst: "20",
  //   before: "150.00",
  //   disc: "0",
  //   after: "180.00",
  //   qty: "2",
  //   taxable: "300.00",
  //   total: "280.00",
  // },
  // {
  //   sn: 4,
  //   part: "Brake Pad",
  //   code: "5656456454453",
  //   hsn: "3481111",
  //   mrp: "2890",
  //   gst: "18",
  //   before: "320.00",
  //   disc: "10",
  //   after: "288.00",
  //   qty: "1",
  //   taxable: "288.00",
  //   total: "340.00",
  // },
  // {
  //   sn: 5,
  //   part: "Clutch Plate",
  //   code: "456456456456",
  //   hsn: "3482222",
  //   mrp: "6500",
  //   gst: "18",
  //   before: "950.00",
  //   disc: "5",
  //   after: "902.50",
  //   qty: "1",
  //   taxable: "902.50",
  //   total: "1065.00",
  // },
  // {
  //   sn: 6,
  //   part: "Spark Plug",
  //   code: "45645654654654",
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
  //   code: "456456456546",
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
  //   code: "456456456456456",
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
  //   code: "4456456546456",
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
  //   code: "344564564568777",
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
  // {
  //   sn: 10,
  //   part: "Battery",
  //   code: "344564564568777",
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
  ...Array.from({ length: 1 }, (_, i) => ({
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

// services table data
const servicesHeaders = [
  "SN.",
  "Service Description",
  "HSN",
  "MRP/\nUnit Price",
  "GST%",
  "Unit Price\n(Before Disc.)",
  "Discount",
  "Unit Price\n(After Disc.)",
  "Qty.",
  "Taxable\nValue",
  "Net Total",
];

const servicesColumnWidths = [
  20, // SN
  95, // Spare Parts (+25)
  45, // Model (+10)
  45, // MRP (+10)
  35, // GST (+5)
  75, // Unit Price Before (+20)
  37, // Discount
  80, // Unit Price After (+20)
  22, // Qty
  55, // Taxable Value (+10)
  41, // Net Total (-16 to balance)
];

const servicesPartsRows = [
  {
    sn: 1,
    part: "Air Filter",
    hsn: "Splendor",
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
    part: "Front Bumper",
    hsn: "Apache",
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
    hsn: "Splendor",
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
    hsn: "Pulsar",
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
    hsn: "Apache",
    mrp: "6500",
    gst: "18",
    before: "950.00",
    disc: "5",
    after: "902.50",
    qty: "1",
    taxable: "902.50",
    total: "1065.00",
  },
  // ---- Repeating pattern for pagination testing ----
  ...Array.from({ length: 1 }, (_, i) => ({
    sn: i + 11,
    part: "General Spare Part",
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
    const height = doc.heightOfString(cell, {
      width: columnWidths[i] - 6,
    });
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
    doc
      .font(isHeader ? FONT_SEMIBOLD : FONT_REGULAR)
      .fillColor("#333333")
      .fontSize(7)
      .text(cell, currentX + 3, y + 5, {
        width: columnWidths[i] - 6,
        align: i === 1 ? "left" : "center",
      });

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
  const bottomMargin = 40;

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
      item.part,
      item.code,
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

      y = topMargin + headerHeight;

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

// draw sevice table
const drawServiceTable = ({
  doc,
  x,
  startY,
  headers,
  rows,
  columnWidths,
  headerHeight,
}) => {
  const topMargin = 10;
  const bottomMargin = 40;

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
      item.part,
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

      y = topMargin + headerHeight;

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

const newPdf = (res) => {
  const doc = new PDFDocument({ size: "A4", margin: 10, bufferPages: true });

  const invoiceType = "Tax Invoice";

  const contactInfo = {
    contact: "1234567890",
    email: "panwarmotors@gmail.com",
    gstNo: "23BETPD6825A1ZR",
    garageName: "Kabi",
  };

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
    repeatingHeader(doc, contactInfo, invoiceType);
    drawHeaderColumns(doc, fromData, buyerData, consigneeData);
  });

  /* ---------- HEADER IMAGES ---------- */
  const pageWidth = doc.page.width;

  /* ---------- LAYOUT ---------- */
  const x = 20;
  const boxWidth = 550;
  const columnWidth = boxWidth / 3;

  doc.fontSize(7);

  /* ---------- DRAW COLUMNS ---------- */

  repeatingHeader(doc, contactInfo, invoiceType);

  const headerHeight = drawHeaderColumns(
    doc,
    fromData,
    buyerData,
    consigneeData,
  );

  const bottomY1 = headerHeight;

  /* ------------- After Border ---------------- */

  const secondSectionY = bottomY1 + 8; // spacing after first section

  const Section1Array1 = [
    { label: "Vehicle Type  ", value: "4W" },
    {
      label: "Vehicle No.  ",
      value: "UP23AU1001",
    },
    { label: "Chassis No.  ", value: "1234567890" },
    { label: "Engine No.  ", value: "4857234928493" },
    { label: "Brand/Model  ", value: "Maruti Suzuki/Dzire" },
    { label: "Fuel Type  ", value: "Petrol" },
    { label: "Odometer  ", value: "398394 kms" },
  ];

  const section2Col1 = drawColumn({
    doc,
    x,
    y: secondSectionY,
    labelWidth: 54,
    rows: Section1Array1,
  });

  const section2Array2 = [
    { label: "Generated On", value: "28th Jul 2025" },
    {
      label: "Supervisor.",
      value: "Choudhary Saab",
    },
  ];

  const section2Col2 = drawColumn({
    doc,
    x: x + columnWidth + 5,
    y: secondSectionY,
    labelWidth: 54,
    rows: section2Array2,
  });

  doc.image(
    path.join(__dirname, "assets/invoiceQRCode.png"),
    pageWidth - 110,
    bottomY1 + 10,
    { width: 80 },
  );

  const bottomY2 = Math.max(section2Col1, section2Col2);

  doc
    .strokeColor(BORDER_COLOR)
    .lineWidth(0.6)
    .moveTo(x, bottomY2 + 8)
    .lineTo(x + boxWidth, bottomY2 + 8)
    .stroke();

  // Table code starts

  const tableStartY = sparePartsRows?.length > 0 ? bottomY2 + 30 : bottomY2;

  if (sparePartsRows?.length > 0) {
    doc
      .fillColor(LABEL_COLOR)
      .font(FONT_BOLD)
      .fontSize(8)
      .text("Spare Parts", x, bottomY2 + 23 - doc.currentLineHeight());
  }

  const tableEndY =
    sparePartsRows?.length > 0
      ? drawSparePartsTable({
          doc,
          x,
          startY: tableStartY,
          headers: sparePartsHeaders,
          rows: sparePartsRows,
          columnWidths: sparePartsColumnWidths,
          headerHeight,
        })
      : tableStartY;

  if (sparePartsRows?.length > 0) {
    doc
      .fillColor(LABEL_COLOR)
      .font(FONT_SEMIBOLD)
      .fontSize(8)
      .text(`Spare Total : ₹${12900}`, pageWidth - 230, tableEndY + 5, {
        width: 200,
        align: "right",
      });
  }

  const servicesTableStartY =
    servicesPartsRows?.length > 0 ? tableEndY + 35 : tableEndY;

  if (servicesPartsRows?.length > 0) {
    doc
      .fillColor(LABEL_COLOR)
      .font(FONT_BOLD)
      .fontSize(8)
      .text("Service & Package", x, tableEndY + 30 - doc.currentLineHeight());
  }

  const servicesTableEndY =
    servicesPartsRows?.length > 0
      ? drawServiceTable({
          doc,
          x,
          startY: servicesTableStartY,
          headers: servicesHeaders,
          rows: servicesPartsRows,
          columnWidths: servicesColumnWidths,
          headerHeight,
        })
      : servicesTableStartY;

  if (sparePartsRows?.length > 0) {
    doc
      .fillColor(LABEL_COLOR)
      .font(FONT_SEMIBOLD)
      .fontSize(8)
      .text(
        `Labour Total : ₹${12900}`,
        pageWidth - 230,
        servicesTableEndY + 5,
        {
          width: 200,
          align: "right",
        },
      );
  }

  //   Price total box

  const totalPriceText =
    "Amount in words : One Lakh Twenty Three Thousand Eight Hundred Thirty Rupees Only";

  const padding = 6;

  const totalPriceBoxWidth = sparePartsColumnWidths.reduce((a, b) => a + b, 0);

  const textHeight = doc.heightOfString(totalPriceText, {
    width: totalPriceBoxWidth - padding * 2,
  });

  const totalBoxHeight = textHeight + padding * 2;

  let totalPriceBoxY = servicesTableEndY + 25;

  if (servicesTableEndY + 40 + totalBoxHeight > doc.page.height - 40) {
    doc.addPage();
    totalPriceBoxY = headerHeight + 10; // reset Y for new page
  }

  doc.font(FONT_BOLD).fontSize(8);

  doc.rect(x, totalPriceBoxY, boxWidth, totalBoxHeight).fill("#F6F8FC");

  doc
    .fillColor("#333333")
    .text(totalPriceText, x + padding, totalPriceBoxY + padding, {
      width: totalPriceBoxWidth - padding * 2,
    });

  // doc
  //   .fillColor("#333333")
  //   .text("Total: ₹ 12790.00", x, totalPriceBoxY + padding, {
  //     width: totalPriceBoxWidth,
  //     align: "right",
  //   });

  // doc.fillColor("#333333").text("₹ 13790.00", x, totalPriceBoxY + padding, {
  //   width: totalPriceBoxWidth - 5,
  //   align: "right",
  // });

  const taxTotal = "1279650.00";
  const amountTotal = "12790.00";

  const widthOfRightTotal = doc.widthOfString(`${amountTotal}`, {
    width: totalPriceBoxWidth - 5,
  });

  doc
    .fillColor("#333333")
    .text(`Total : ₹ ${taxTotal}`, x, totalPriceBoxY + padding, {
      width: totalPriceBoxWidth - widthOfRightTotal - 20,
      align: "right",
    });

  doc
    .fillColor("#333333")
    .text(`₹${amountTotal}`, x, totalPriceBoxY + padding, {
      width: totalPriceBoxWidth - 5,
      align: "right",
    });
  // GST Table

  // header height
  let gstHeaderHeight = 0;
  let gstTableY = totalPriceBoxY + 33;

  gstTableHeaders.forEach((cell, i) => {
    const h = doc.heightOfString(cell, {
      width: gstTableColumnWidths[i] - 6,
    });
    gstHeaderHeight = Math.max(gstHeaderHeight, h);
  });

  gstHeaderHeight += 8; // padding

  let rowsHeight = 0;

  gstTableRows.forEach((row) => {
    let rowHeight = 0;

    const cellValues = [
      row.taxHead,
      row.taxValue,
      row.firstPercent,
      row.secondPercent,
      row.thirdPercent,
      row.fourthPercent,
    ];

    cellValues.forEach((cell, i) => {
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
    gstTableY = headerHeight + 10;
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

  gstTableHeaders.forEach((cell, i) => {
    doc
      .font(FONT_SEMIBOLD)
      .fillColor("#333333")
      .fontSize(7)
      .text(cell, tableCellX + 3, gstTableY + 4, {
        width: gstTableColumnWidths[i] - 6,
      });

    tableCellX += gstTableColumnWidths[i];
  });

  let tableRowY = gstTableY + gstHeaderHeight;

  gstTableRows.forEach((row) => {
    let rowHeight = 0;

    const cellValues = [
      row.taxHead,
      row.taxValue,
      row.firstPercent,
      row.secondPercent,
      row.thirdPercent,
      row.fourthPercent,
    ];

    cellValues.forEach((cell, i) => {
      const h = doc.heightOfString(String(cell ?? ""), {
        width: gstTableColumnWidths[i] - 6,
      });
      rowHeight = Math.max(rowHeight, h);
    });

    rowHeight += 8;

    let rowX = x;
    cellValues.forEach((cell, i) => {
      doc
        .font(i === 0 ? FONT_SEMIBOLD : FONT_REGULAR)
        .fillColor("#333333")
        .fontSize(7)
        .text(String(cell ?? ""), rowX + 3, tableRowY + 4, {
          width: gstTableColumnWidths[i] - 6,
        });

      rowX += gstTableColumnWidths[i];
    });

    tableRowY += rowHeight;
  });

  // All total table

  let currentPage = 1;

  let summaryEndedOnNewPage = false;
  let summaryEndPage = currentPage;

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
      totalPriceY = headerHeight + 10;

      summaryEndedOnNewPage = true;
      summaryEndPage = currentPage;
    }
    if (Number(item?.value) > 0) {
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
    .text("E. & O.E.", pageWidth - 46, totalPriceY);

  doc.fontSize(7);

  // terms and conditon data

  let termsStartY;

  if (summaryEndedOnNewPage) {
    termsStartY = headerHeight + 25;
  } else {
    termsStartY = tableRowY + 30;
  }

  const termsAndConditions = [
    "Subject to Faridabad Jurisdiction.",
    "Our Responsibility ceases as soon as goods leaves our premises.",
    "Goods once Sold will not be taken back.",
    "By signing this Tax Invoice, you agree to the added labour and parts specified. We take great care during service, but Pikpart is not liable for any damage that may occur during service.",
  ];

  const getTermsHeight = () => {
    let height = 0;

    termsAndConditions.forEach((text, index) => {
      const numberedText = `${index + 1}. ${text}`;

      height +=
        doc.heightOfString(numberedText, {
          width: boxWidth - 12,
        }) + 3;
    });

    return height;
  };

  const totalTermsHeight = getTermsHeight();

  if (termsStartY + totalTermsHeight > doc.page.height - 40) {
    doc.addPage();
    termsStartY = headerHeight + 10;
  }

  let termsY = termsStartY;

  doc.font(FONT_BOLD).text("TERMS & CONDITIONS", 20, termsY - 15);

  termsAndConditions.forEach((text, index) => {
    const numberedText = `${index + 1}. ${text}`;

    const textHeight = doc.heightOfString(numberedText, {
      width: boxWidth - 130,
    });

    doc
      .font(FONT_REGULAR)
      .fillColor("#333333")
      .text(numberedText, 20, termsY, { width: boxWidth - 130 });

    termsY += textHeight + 3;
  });

  doc.font(FONT_SEMIBOLD).text("Declaration : ", 20, termsY + 10);

  doc
    .font(FONT_REGULAR)
    .text(
      "We Declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
      63,
      termsY + 10,
      { width: boxWidth - 130 },
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

export default newPdf;
