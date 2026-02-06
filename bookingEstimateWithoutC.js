import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";

/* ---------- FIX __dirname FOR ESM ---------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------- FONT CONSTANTS ---------- */
const FONT_REGULAR = "Inter-Regular";
const FONT_SEMIBOLD = "Inter-SemiBold";
const FONT_BOLD = "Inter-Bold";

/* ---------- CONSTANTS ---------- */
const LABEL_COLOR = "#333333";
const VALUE_COLOR = "#888888";
const BORDER_COLOR = "#C7CED5";

const labelText = (doc, text, x, y) => {
  doc.font(FONT_SEMIBOLD).fillColor("#E04B24").fontSize(7).text(text, x, y);
};

const valueText = (doc, text, x, y) => {
  doc.font(FONT_REGULAR).fillColor("#333333").fontSize(7).text(text, x, y);
};

/* ---------- COLUMN DATA ---------- */

const customerData = [
  { label: "Name : ", value: "Jatin 14ry" },
  {
    label: "Address : ",
    value: "Plot no.967 Bypass Road, Sector-9, Faridabad Haryana - 121006",
  },
  { label: "Contact : ", value: "9027914004" },
  { label: "Email ID : ", value: "account@pikpart.com" },
  { label: "GSTIN/UIN : ", value: "06AAICR7704D1ZI" },
  { label: "GST Address : ", value: "14RY Farm" },
  { label: "Business Name : ", value: "Choudhary" },
];

const vehicleData = [
  { label: "Vehicle Type : ", value: "4W" },
  {
    label: "Vehicle No. : ",
    value: "UP23AU1001",
  },
  { label: "Chassis No. : ", value: "xxxxxxxxxxxxx" },
  { label: "Engine No. : ", value: "xxxxxxxxxxxxx" },
  { label: "Brand/Model : ", value: "Naam hi Brand" },
  { label: "Fuel Type : ", value: "Petrol" },
  { label: "Odometer : ", value: "398394 kms" },
];

const serviceData = [
  { label: "Generated On : ", value: "28th Jul 2025" },
  {
    label: "Supervisor. : ",
    value: "Pawan Bhamniya",
  },
];

const termsAndConditions = [
  "Subject to Faridabad Jurisdiction.",
  "Our Responsibility ceases as soon as goods leaves our premises.",
  "Goods once Sold will not be taken back.",
  "By signing this Tax Invoice, you agree to the added labour and parts specified. We take great care during service, but Pikpart is not liable for any damage that may occur during service.",
];

// spare parts table data

const sparePartsHeaders = [
  "SN.",
  "Name",
  "Part Code",
  "HSN/SAC",
  "MRP",
  "Dis (₹)",
  "Quantity",
  "Value",
];

const sparePartsColumnWidths = [
  29, // SN.
  121, // Name
  95, // Part Code
  77, // HSN/SAC
  63, // MRP
  63, // Dis (₹)
  52, // Quantity
  50, // Value
];

const sparePartsRows = [
  {
    sn: 1,
    part: "Air Filter",
    code: "34802353480235",
    hsn: "3480235",
    mrp: "5678",
    disc: "0",
    qty: "2",
    total: "330.00",
  },
  {
    sn: 2,
    part: "Front Bumper",
    code: "5434543543543",
    hsn: "3488935",
    mrp: "4823",
    disc: "0",
    qty: "2",
    total: "210.00",
  },
  {
    sn: 3,
    part: "Engine Oil",
    code: "54543543643643",
    hsn: "3484567",
    mrp: "3784",
    disc: "0",
    qty: "2",
    total: "280.00",
  },
  {
    sn: 4,
    part: "Brake Pad",
    code: "5656456454453",
    hsn: "3481111",
    mrp: "2890",
    disc: "10",
    qty: "1",
    total: "340.00",
  },
];

// services table data
const servicesHeaders = [
  "SN.",
  "Service Description",
  "HSN/SAC",
  "MRP",
  "Dis (₹)",
  "Quantity",
  "Value",
];

const servicesColumnWidths = [
  31, // SN.
  214, // Service Description
  77, // HSN/SAC
  63, // MRP
  63, // Dis (₹)
  52, // Quantity
  50, // Value
];

const servicesPartsRows = [
  // {
  //   sn: 1,
  //   part: "Air Filter",
  //   hsn: "2541206",
  //   mrp: "5678",
  //   disc: "0",
  //   qty: "2",
  //   total: "330.00",
  // },
  // {
  //   sn: 2,
  //   part: "Front Bumper",
  //   hsn: "9548125",
  //   mrp: "4823",
  //   disc: "0",
  //   qty: "2",
  //   total: "210.00",
  // },
  // {
  //   sn: 3,
  //   part: "Engine Oil",
  //   hsn: "5478511",
  //   mrp: "3784",
  //   disc: "0",
  //   qty: "2",
  //   total: "280.00",
  // },
  // ---- Repeating pattern for pagination testing ----
  // ...Array.from({ length: 15 }, (_, i) => ({
  //   sn: i + 5,
  //   part: "General Spare Part",
  //   hsn: `34900${i + 11}`,
  //   mrp: "3000",
  //   disc: "0",
  //   qty: "2",
  //   total: "944.00",
  // })),
];

const tableRows = [
  { name: "Some Noise Coming In Jumping Rod Bush ", jobSheet: [] },
  { name: "Front Bumper Damage", jobSheet: [] },
  { name: "Some Noise Coming In Jumping Rod Bush ", jobSheet: [] },
  { name: "Front Bumper Damage", jobSheet: [] },
  { name: "Some Noise Coming In Jumping Rod Bush ", jobSheet: [] },
  { name: "Front Bumper Damage", jobSheet: [] },
  { name: "Some Noise Coming In Jumping Rod Bush ", jobSheet: [] },
  { name: "Front Bumper Damage", jobSheet: [] },
  { name: "Front Bumper Damage", jobSheet: [] },
  { name: "Front Bumper Damage", jobSheet: [] },
  { name: "Front Bumper Damage", jobSheet: [] },
  { name: "Front Bumper Damage", jobSheet: [] },
  { name: "Front Bumper Damage", jobSheet: [] },
];

// Draw single label-value row
const drawRow = ({ doc, label, value, x }) => {
  doc.fillColor(LABEL_COLOR).font(FONT_REGULAR).text(label, x);

  const labelWidth = doc.widthOfString(label);

  doc
    .fillColor(VALUE_COLOR)
    .font(FONT_REGULAR)
    .text(value, x + labelWidth + 1, doc.y - doc.currentLineHeight(), {
      width: 120,
    });

  doc.moveDown(0.6);
};

// Draw a complete column from config
const drawColumn = ({ doc, x, y, rows, name }) => {
  doc.y = y;
  doc.fillColor("#060606").font(FONT_BOLD).text(name, x);
  doc.moveDown(0.6);
  rows.forEach((row) => drawRow({ doc, x, ...row }));
  return doc.y;
};

const repeatingHeader = (doc) => {
  const x = 20;
  const y = 20;
  const boxWidth = 550;

  let cursorY = y;

  /* ---------- CONTACT INFO ---------- */
  labelText(doc, "Contact :", x, cursorY);
  valueText(doc, "1234567890", x + 32, cursorY);

  cursorY += doc.currentLineHeight() + 4.5;

  labelText(doc, "Email :", x, cursorY);
  valueText(doc, "panwarmotors@gmail.com", x + 23, cursorY);

  cursorY += doc.currentLineHeight() + 4.5;

  labelText(doc, "GSTIN/UIN :", x, cursorY);
  valueText(doc, "23BETPD6825A1ZR", x + 41, cursorY);

  /* ---------- BRAND ---------- */
  cursorY += doc.currentLineHeight() + 10;

  const name = "Panwar Motors";

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
    .text("smart garage", boxWidth - 67, y, { width: 130 });

  doc
    .font(FONT_BOLD)
    .fillColor("#060606")
    .fontSize(20)
    .text("Repair Estimate", boxWidth - 120, y + 22);

  doc
    .font(FONT_BOLD)
    .fontSize(9)
    .text("SA00231-26IA214", boxWidth - 124, y + 50, {
      width: 150,
      align: "right",
    });
  /* ---------- ADDRESS ---------- */
  doc.image(
    path.join(__dirname, "assets/InvoiceLocationIcon.png"),
    boxWidth + 17,
    y + 65,
    { width: 10 },
  );

  doc
    .font(FONT_REGULAR)
    .fillColor("#333333")
    .fontSize(7)
    .text(
      "Mandsaur Chandrapura Survey No. 676 Mandsaur Madhya Pradesh 458001",
      boxWidth - 185,
      y + 65,
      { width: 200, align: "right" },
    );
};

const repeatingInfo = (doc) => {
  const x = 20;
  const y = 130;
  const boxWidth = 555;
  const columnWidth = boxWidth / 3;

  const section1Col1 = drawColumn({
    doc,
    x,
    y,
    rows: customerData,
    name: "CUSTOMER DETAIL",
  });

  const section1Col2 = drawColumn({
    doc,
    x: x + columnWidth + 5,
    y,
    rows: vehicleData,
    name: "VEHICLE DETAIL",
  });

  const section1Col3 = drawColumn({
    doc,
    x: x + columnWidth * 2 + 5,
    y,
    rows: serviceData,
    name: "SERVICE DETAIL",
  });

  const height = Math.max(section1Col1, section1Col2, section1Col3); // 🔹 header section height

  /* ---------- BOTTOM BORDER ---------- */

  doc
    .strokeColor(BORDER_COLOR)
    .lineWidth(0.5)
    .moveTo(x, height + 8)
    .lineTo(x + boxWidth, height + 8)
    .stroke();

  return height;
};

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
        align: "left",
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
      item.disc,
      item.qty,
      item.total,
    ];

    //  CHECK SPACE BEFORE DRAWING ROW
    const estimatedHeight = 20; // safe row height

    if (y + estimatedHeight > doc.page.height - bottomMargin) {
      doc.addPage();

      y = topMargin + 120;

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
const drawServiceTable = ({ doc, x, startY, headers, rows, columnWidths }) => {
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
      item.disc,
      item.qty,
      item.total,
    ];

    //  CHECK SPACE BEFORE DRAWING ROW
    const estimatedHeight = 20; // safe row height

    if (y + estimatedHeight > doc.page.height - bottomMargin) {
      doc.addPage();

      y = topMargin + 120;

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

const generateRepairEstimationWithoutC = (res) => {
  const doc = new PDFDocument({ size: "A4", margin: 10, bufferPages: true });

  const x = 20;
  const boxWidth = 550;

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
  res.setHeader(
    "Content-Disposition",
    'inline; filename="bookingEstimate.pdf"',
  );

  doc.pipe(res);
  doc.fontSize(7);

  repeatingHeader(doc);

  doc.on("pageAdded", () => {
    repeatingHeader(doc);
  });

  const infoSectionHeight = repeatingInfo(doc);

  const tableStartY =
    sparePartsRows?.length > 0 ? infoSectionHeight + 30 : infoSectionHeight;

  if (sparePartsRows?.length > 0) {
    doc
      .fillColor(LABEL_COLOR)
      .font(FONT_BOLD)
      .fontSize(8)
      .text("SPARE PARTS", x, infoSectionHeight + 23 - doc.currentLineHeight());
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
        })
      : tableStartY;

  if (sparePartsRows?.length > 0) {
    doc
      .fillColor(LABEL_COLOR)
      .font(FONT_SEMIBOLD)
      .fontSize(8)
      .text(`Spare Total : ₹${12900}`, boxWidth - 180, tableEndY + 5, {
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
      .text("SERVICE & PACKAGE", x, tableEndY + 30 - doc.currentLineHeight());
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
        })
      : servicesTableStartY;

  if (servicesPartsRows?.length > 0) {
    doc
      .fillColor(LABEL_COLOR)
      .font(FONT_SEMIBOLD)
      .fontSize(8)
      .text(`Labour Total : ₹${12900}`, boxWidth - 180, servicesTableEndY + 5, {
        width: 200,
        align: "right",
      });
  }

  const padding = 3;
  const rectHeight = 18;
  let TotalBoxY = servicesTableEndY + 30;

  if (TotalBoxY + rectHeight > doc.page.height - 40) {
    doc.addPage();
    TotalBoxY = 125;
  }

  doc.rect(15, TotalBoxY, boxWidth + 5, rectHeight).fill("#F6F8FC");

  doc.fillColor("#333333");

  doc
    .font(FONT_SEMIBOLD)
    .text(
      "Amount in words: ₹ One Lakh Twenty Three Thousand Eight Hundred Thirty Rupees Only",
      20,
      TotalBoxY + padding,
      { width: boxWidth - 2 * padding },
    );

  doc.text("₹ 13790.00", 20, TotalBoxY + padding, {
    width: boxWidth - 2 * padding,
    align: "right",
  });

  let termsY = TotalBoxY + 50;

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

  if (termsY + totalTermsHeight > doc.page.height - 40) {
    doc.addPage();
    termsY = 145; // below repeating header
  }

  doc.font(FONT_BOLD).text("CONCERNS", 20, termsY - 15);

  tableRows.forEach((item, index) => {
    const numberedText = `${index + 1}. ${item?.name}`;

    const textHeight = doc.heightOfString(numberedText, {
      width: boxWidth - 12,
    });

    doc
      .font(FONT_REGULAR)
      .fillColor("#333333")
      .text(numberedText, 20, termsY, { width: boxWidth - 12 });

    termsY += textHeight + 5;
  });

  doc.font(FONT_SEMIBOLD).text("Declaration : ", 20, termsY + 10);

  doc
    .font(FONT_REGULAR)
    .text(
      "We Declare that this invoice shows this invoice shows this invoice shows this invoice shows the actual price of the goods described and that all particulars are true and correct.",
      68,
      termsY + 10,
      { width: boxWidth - 44 },
    );

  doc
    .font(FONT_SEMIBOLD)
    .text("Customer Signature".toUpperCase(), 20, termsY + 36);

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

export default generateRepairEstimationWithoutC;
