import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

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

const labelText = (doc, text, x, y) => {
  doc.font(FONT_SEMIBOLD).fillColor("#E04B24").fontSize(7).text(text, x, y);
};

const valueText = (doc, text, x, y) => {
  doc.font(FONT_REGULAR).fillColor("#333333").fontSize(7).text(text, x, y);
};

/* --

/* ---------- COLUMN DATA ---------- */

const repeatBilledData = [
  { label: "Name", value: "Ratnashil" },
  { label: "Address", value: "Dinesh Saini" },
  { label: "Contact", value: "1234567890" },
];

const billedTo = [
  { label: "Name", value: "Ratnashil" },
  { label: "Address", value: "Dinesh Saini" },
  { label: "Contact", value: "1234567890" },
  { label: "Email", value: "dineshsaini@gmail.com" },
  { label: "GSTIN/UIN", value: "ABC" },
  { label: "Business Name", value: "ABC" },
  { label: "GST Address", value: "ABC" },
];

const repeatVehicleData = [
  { label: "Vehicle No.", value: "MP23A98193" },
  { label: "Brand/Model", value: "Maruti Suzuki/Dzire" },
  { label: "Odometer", value: "398394 kms" },
];

const vehicleData = [
  { label: "Vehicle Type", value: "4W" },
  { label: "Vehicle No.", value: "MP23A98193" },
  { label: "Chassis No.", value: "1234567890" },
  { label: "Engine No.", value: "4857234928493" },
  { label: "Brand/Model", value: "Maruti Suzuki/Dzire" },
  { label: "Fuel Type", value: "Petrol" },
  { label: "Odometer", value: "398394 kms" },
];

const repeatServiceData = [
  { label: "Generated On", value: "28th Jul 2025" },
  { label: "Invoice No.", value: "SA656544656" },
  { label: "Supervisor", value: "Pawan Bhamniya" },
];

const serviceData = [
  { label: "Generated On", value: "28th Jul 2025" },
  { label: "Invoice No.", value: "SA656544656" },
  { label: "Supervisor", value: "Pawan Bhamniya" },
  { label: "Booking ID", value: "BKG8697676" },
];

const billerInfo = [
  { label: "Name", value: "Garage" },
  { label: "Address", value: "Dinesh Saini" },
  { label: "State", value: "ABC" },
  { label: "Status code", value: "ABC" },
  { label: "Contact", value: "1234567890" },
  { label: "Email", value: "dineshsaini@gmail.com" },
  { label: "GSTIN", value: "ABC" },
];

const serviceInfo = [
  { label: "Garage Name", value: "Garage", labelWidth: 75 },
  { label: "Garage Address", value: "Dinesh Saini", labelWidth: 75 },
  { label: "Garage State", value: "Dinesh Saini", labelWidth: 75 },
  { label: "Garage State Code", value: "Dinesh Saini", labelWidth: 75 },
  { label: "Garage Contact", value: "1234567890", labelWidth: 75 },
  { label: "Garage Email", value: "dineshsaini@gmail.com", labelWidth: 75 },
  { label: "Garage GSTIN/UIN", value: "ABC", labelWidth: 75 },
];

/* ---------- HELPER FUNCTIONS ---------- */

const repeatingHeader = (doc, contactInfo) => {
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
    .fillColor("#666666")
    .fontSize(7)
    .text("(A Unit Of Ratnashil Online Services Pvt. Ltd.)", x, y + 78);

  /* ---------- DIVIDER ---------- */
  doc
    .moveTo(0, 113)
    .lineTo(140, 113)
    .strokeColor("#CA2A01")
    .lineWidth(1)
    .stroke();

  /* ---------- RIGHT HEADER ---------- */
  doc.image(path.join(__dirname, "assets/SGLogo.png"), boxWidth - 70, 18, {
    width: 100,
  });

  // doc
  //   .font(FONT_SEMIBOLD)
  //   .fillColor("#E04B24")
  //   .fontSize(15)
  //   .text("smart garage", 27, y, {
  //     width: boxWidth,
  //     align: "right",
  //   });

  doc
    .font(FONT_BOLD)
    .fillColor("#060606")
    .fontSize(18)
    .text("Tax Invoice", 27, y + 20, { width: boxWidth, align: "right" });

  doc
    .font(FONT_BOLD)
    .fontSize(9)
    .text("SA00231-26IA214", 27, y + 43, {
      width: boxWidth,
      align: "right",
    });

  const date = "28th Jul 2025";

  doc
    .font(FONT_SEMIBOLD)
    .fillColor("#555555")
    .fontSize(8)
    .text(date, 0, y + 56, {
      width: boxWidth + 26,
      align: "right",
    });
};

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

  doc.moveDown(0.5);
};

// Draw a complete column from config
const drawColumn = ({ doc, x, y, rows, name, labelWidth, columnWidth, bg }) => {
  doc.y = y;
  doc
    .fillColor("#060606")
    .font(FONT_BOLD)
    .fontSize(8)
    .text(name, x + 5);

  const heightOfHeader = doc.heightOfString(name) + 4;

  doc.fontSize(7);
  doc.moveDown(0.8);

  if (bg == true) {
    const heightOfRows = rows.reduce((total, row) => {
      const rowHeight =
        doc.heightOfString(row.label) + doc.heightOfString(row.value) - 1;
      return total + rowHeight;
    }, 0);

    doc
      .rect(x, y + heightOfHeader, columnWidth - 15, heightOfRows - 18)
      .fill("#F6F8FC");
  }

  rows.forEach((row) => drawRow({ doc, x: x + 5, labelWidth, ...row }));
  return doc.y;
};

const drawHeaderColumns = (doc, x, y, billerData, sellerData, buyerData) => {
  const boxWidth = 550;
  const columnWidth = boxWidth / 3;

  doc.fontSize(7);

  const section1Col1 = drawColumn({
    doc,
    x,
    y,
    rows: billerData,
    name: "BILLED TO",
    columnWidth,
    bg: false,
  });

  const section1Col2 = drawColumn({
    doc,
    x: x + columnWidth + 5,
    y,
    rows: sellerData,
    name: "VEHICLE DETAIL",
    columnWidth,
    bg: false,
  });

  const section1Col3 = drawColumn({
    doc,
    x: x + columnWidth * 2 + 5,
    y,
    rows: buyerData,
    name: "SERVICE DETAIL",
    columnWidth,
    bg: false,
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

const drawHeaderColumns1 = (
  doc,
  x,
  y,
  columnWidth1,
  billerInfo,
  serviceInfo,
) => {
  const section1Col1 = drawColumn({
    doc,
    x,
    y,
    rows: billerInfo,
    name: "BILLER INFO",
    columnWidth: columnWidth1,
    bg: true,
  });

  const section1Col2 = drawColumn({
    doc,
    x: x + columnWidth1 + 5,
    y,
    rows: serviceInfo,
    name: "SERVICE PROVIDER",
    columnWidth: columnWidth1,
    bg: true,
  });

  const height = Math.max(section1Col1, section1Col2); // 🔹 header section height

  return height;
};

// products table data

const sparePartsHeaders = [
  "SN.",
  "Name/Code",
  "HSN/SAC",
  "MRP",
  "GST%",
  "Unit Price\n(Before Disc.)",
  "Discount %",
  "Unit Price\n(After Disc.)",
  "Qty.",
  "Taxable\nValue",
  "Net Total",
];

const sparePartsColumnWidths = [
  20, // SN
  144, // Spare Parts // Code
  49, // HSN
  38, // MRP
  30, // GST
  60, // Unit Price Before
  37, // Discount
  60, // Unit Price After
  22, // Qty
  45, // Taxable Value
  45, // Net Total
];

const sparePartsRows = [
  {
    sn: 1,
    part: "Relay Assembly_blower Motor",
    code: "71711M74L00-5PK",
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
    part: "Relay Assembly blower Motor Relay Assembly blower Motor Relay Assembly blower Motor",
    code: "ZA-4011",
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
    code: "MOU001",
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
    code: "45810M69R00",
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
    code: "18213M68PB1",
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
  {
    sn: 6,
    part: "Spark Plug",
    code: "35321M69R00",
    hsn: "3483333",
    mrp: "890",
    gst: "18",
    before: "120.00",
    disc: "0",
    after: "120.00",
    qty: "3",
    taxable: "360.00",
    total: "425.00",
  },
  // {
  //   sn: 7,
  //   part: "Chain Sprocket",
  //   code: "68004M69R01",
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
  //   code: "53200M69R00",
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
  //   code: "22400M66R00",
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
  //   code: "13400M68P10",
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
  //   code: "57711M69R00",
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
  ...Array.from({ length: 2 }, (_, i) => ({
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
  "SAC",
  "MRP",
  "GST%",
  "Unit Price\n(Before Disc.)",
  "Discount\n%",
  "Unit Price\n(After Disc.)",
  "Qty.",
  "Taxable\nValue",
  "Net Total",
];

const servicesColumnWidths = [
  20, // SN
  144, // Spare Parts (+25)
  49, // HSN
  38, // MRP
  30, // GST
  60, // Unit Price Before
  37, // Discount
  60, // Unit Price After
  22, // Qty
  45, // Taxable Value
  45, // Net Total
];

const servicesPartsRows = [
  {
    sn: 1,
    part: "Air Filter",
    sac : "435345435",
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
    sac : "435345435",
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
    mrp: "3784",
    gst: "20",
    before: "150.00",
    disc: "0",
    after: "180.00",
    qty: "2",
    approved: "67",
    taxable: "300.00",
    total: "280.00",
  },
  {
    sn: 4,
    part: "Brake Pad",
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
      { name: item.part, code: item.code },
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
      item.sac,
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

      y = topMargin + headerHeight - 165;

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

const signImage =
  "https://pikpart-testing.s3.ap-south-1.amazonaws.com/1000001880.jpg";

/* ---------- MAIN PDF FUNCTION ---------- */

const purchaseInvoice = async (res) => {
  const doc = new PDFDocument({ size: "A4", margin: 10, bufferPages: true });

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

  /* ---------- HEADER IMAGES ---------- */
  const pageWidth = doc.page.width;

  /* ---------- LAYOUT ---------- */
  const x = 20;
  const y = 120;
  const boxWidth = 550;
  const columnWidth1 = boxWidth / 2;
  const columnWidth = boxWidth / 3;

  doc.fontSize(7);

  /* ---------- DRAW COLUMNS ---------- */

  repeatingHeader(doc, contactInfo);

  const headerHeight1 = drawHeaderColumns1(
    doc,
    x,
    y,
    columnWidth1,
    billerInfo,
    serviceInfo,
  );

  doc.on("pageAdded", () => {
    repeatingHeader(doc, contactInfo);
    drawHeaderColumns(
      doc,
      x,
      y,
      repeatBilledData,
      repeatVehicleData,
      repeatServiceData,
    );
  });

  const headerHeight = drawHeaderColumns(
    doc,
    x,
    headerHeight1 + 10,
    billedTo,
    vehicleData,
    serviceData,
  );

  const tableStartY =
    sparePartsRows?.length > 0 ? headerHeight + 10 : headerHeight;

  if (sparePartsRows?.length > 0) {
    doc
      .fillColor(LABEL_COLOR)
      .font(FONT_BOLD)
      .fontSize(8)
      .text("SPARE PARTS", x + 5, tableStartY);
  }

  const tableEndY =
    sparePartsRows?.length > 0
      ? drawSparePartsTable({
          doc,
          x,
          startY: tableStartY + 17,
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
      .text(
        "SERVICE & PACKAGES",
        x + 5,
        tableEndY + 30 - doc.currentLineHeight(),
      );
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

  const totalAmountInWords =
    "Amount in words : Five Lakh Forty Four Thousand Four Hundred Nine Rupees And Fifty Eight Paise Only Fifty Eight Paise Only";

  const padding = 6;

  const totalPriceBoxWidth = sparePartsColumnWidths.reduce((a, b) => a + b, 0);

  const heightOfAmountInWords = doc.heightOfString(totalAmountInWords, {
    width: 300,
  });

  const totalBoxHeight = heightOfAmountInWords + padding * 2;

  let totalPriceBoxY = servicesTableEndY + 25;

  if (totalPriceBoxY + totalBoxHeight > doc.page.height - 40) {
    doc.addPage();
    totalPriceBoxY = headerHeight - 50; // reset Y for new page
  }

  doc.font(FONT_BOLD).fontSize(8);

  doc.rect(x, totalPriceBoxY, boxWidth, totalBoxHeight).fill("#F6F8FC");

  doc
    .fillColor("#333333")
    .text(totalAmountInWords, x + padding, totalPriceBoxY + padding, {
      width: 350,
    });

  const taxTotal = "1279650.00";
  const totalAmount = "12790.00";

  const widthOfRightTotal = doc.widthOfString(`₹ ${totalAmount}`, {
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
    .text(`₹ ${totalAmount}`, x, totalPriceBoxY + padding, {
      width: totalPriceBoxWidth - 5,
      align: "right",
    });

  let gstHeaderHeight = 0;
  let gstTableY = totalPriceBoxY + heightOfAmountInWords + 25;

  gstTableHeaders.forEach((cell, i) => {
    const h = doc.heightOfString(cell, {
      width: gstTableColumnWidths[i] - 6,
    });
    gstHeaderHeight = Math.max(gstHeaderHeight, h);
  });

  gstHeaderHeight += 8;

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
    gstTableY = headerHeight - 50;
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
      .fontSize(8)
      .text(cell, tableCellX + 5, gstTableY + 4, {
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

    rowHeight += 10;

    let rowX = x;
    cellValues.forEach((cell, i) => {
      doc
        .font(i === 0 ? FONT_SEMIBOLD : FONT_REGULAR)
        .fillColor("#333333")
        .fontSize(8)
        .text(String(cell ?? ""), rowX + 5, tableRowY + 5, {
          width: gstTableColumnWidths[i] - 6,
        });

      rowX += gstTableColumnWidths[i];
    });

    tableRowY += rowHeight;

    doc
      .moveTo(x, tableRowY)
      .lineTo(rowX, tableRowY)
      .strokeColor("#d5dade")
      .lineWidth(0.2)
      .stroke();
  });

  let currentPage = 1;

  let summaryEndedOnNewPage = false;
  let summaryEndPage = currentPage;

  const summaryData = [
    { label: "CGST 2.5%", value: "-" },
    // { label: "SGST 2.5%", value: "377.83" },
    // { label: "IGST 5%", value: "-" },
    // { label: "CGST 9%", value: "377.83" },
    // { label: "SGST 9%", value: "377.83" },
    // { label: "IGST 9%", value: "377.83" },
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
    .text("E. & O.E.", pageWidth - 46, totalPriceY);

  doc.fontSize(7);

  let termStartY;

  if (summaryEndedOnNewPage) {
    termStartY = headerHeight + 10;
  } else {
    termStartY = tableRowY;
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

  let termsY = termStartY + 40;
  let termsStartX = 20;

  if (termsY + totalTermsHeight > doc.page.height - 40) {
    doc.addPage();
    termsY = headerHeight - 22;
  }

  doc
    .font(FONT_BOLD)
    .fillColor("#333333")
    .fontSize(8)
    .text("TERMS & CONDITIONS", termsStartX, termsY - 15);

  termsAndConditions.forEach((text, index) => {
    const numberedText = `${index + 1}. ${text}`;

    const textHeight = doc.heightOfString(numberedText, {
      width: boxWidth - 20,
    });

    doc
      .font(FONT_REGULAR)
      .fillColor("#333333")
      .text(numberedText, termsStartX, termsY, { width: boxWidth });

    termsY += textHeight + 3;
  });

  const widthOfDec = doc.font(FONT_SEMIBOLD).widthOfString("Declaration : ");

  doc.font(FONT_SEMIBOLD).text("Declaration : ", termsStartX, termsY + 10);

  doc
    .font(FONT_REGULAR)
    .text(
      "We Declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
      widthOfDec + termsStartX,
      termsY + 10,
      { width: boxWidth },
    );

  let bankStartX = 20;

  let bankY = termsY + 40;

  const bankDetails = [
    {
      label: "Account Holder Name",
      value: "Ratnashil Online Services Pvt Ltd",
    },
    { label: "Account Number", value: "661351200021" },
    { label: "Bank Name", value: "ICICI Bank" },
    { label: "Branch Name", value: "-" },
    { label: "IFSC Code", value: "ICIC0006613" },
  ];

  const getBankHeight = () => {
    let height = 0;

    bankDetails.forEach((item) => {
      const combinedText = `${item.label} ${item.value}`;

      const lineHeight = doc.heightOfString(combinedText, {
        width: boxWidth - 130,
      });

      height += lineHeight + 4;
    });

    return height;
  };

  const totalBankHeight = getBankHeight();

  if (bankY + totalBankHeight > doc.page.height - 40) {
    doc.addPage();
    bankY = headerHeight - 50;
  }

  doc.rect(bankStartX - 4, bankY - 4, columnWidth1 + 4, 20).fill("#F6F8FC");

  doc
    .font(FONT_BOLD)
    .fillColor("#333333")
    .fontSize(8)
    .text("BANK ACCOUNT DETAILS", bankStartX, bankY + 2);

  bankDetails.forEach((item, idx) => {
    const text = `${item.label} ${item.value}`;
    const labelWidth = 140;

    const lineHeight = doc.heightOfString(text, {
      width: boxWidth - 130,
    });

    doc
      .font(FONT_SEMIBOLD)
      .fillColor("#333333")
      .text(item.label, bankStartX, bankY + 24);

    doc
      .font(FONT_REGULAR)
      .fillColor("#333333")
      .text(item.value, labelWidth + bankStartX, bankY + 24);

    bankY += lineHeight + 10;

    doc
      .moveTo(bankStartX, bankY + 20)
      .lineTo(bankStartX + columnWidth1, bankY + 20)
      .strokeColor("#E2E6EA")
      .lineWidth(0.2)
      .stroke();
  });

  // const totalWidth = columnWidth1 - 5;
  // const gap = 4; // minimal gap
  // const halfWidth = (totalWidth - gap) / 2;

  // // Left rectangle
  // doc
  //   .rect(columnWidth1 + 25, termsY + 36, halfWidth, totalBankHeight + 55)
  //   .fill("#F6F8FC");

  // // Right rectangle
  // doc
  //   .rect(
  //     columnWidth1 + 25 + halfWidth + gap,
  //     termsY + 36,
  //     halfWidth,
  //     totalBankHeight + 55,
  //   )
  //   .fill("#F6F8FC");

  // doc
  //   .font(FONT_SEMIBOLD)
  //   .fillColor("#333333")
  //   .text("Garage Signature", columnWidth1 + 30, termsY + 41);

  // doc
  //   .font(FONT_SEMIBOLD)
  //   .fillColor("#333333")
  //   .text(
  //     "Customer Signature",
  //     columnWidth1 + 25 + halfWidth + gap + 5,
  //     termsY + 41,
  //   );

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

export default purchaseInvoice;
