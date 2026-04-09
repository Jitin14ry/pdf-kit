import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";

// Manually define `__dirname`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------- CONSTANTS ---------- */
const LABEL_COLOR = "#000000";
const VALUE_COLOR = "#555555";
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

const VehicleData = [
  {
    label: "Brand",
    value: "Maruti Suzuki",
  },
  {
    label: "Model",
    value: "BREEZA",
  },
  {
    label: "Regn No.",
    value: "BR01BJ8834",
  },
  {
    label: "Odometer",
    value: "7869798 KM",
  },
];

const CustomerData = [
  {
    label: "Customer Name",
    value: "Sakshi Gupta",
    labelWidth: 68,
  },
  {
    label: "Mobile No.",
    value: "1234567890",
    labelWidth: 68,
  },
  {
    label: "Vehicle IN Time",
    value: "2026-04-02 17:55:34",
    labelWidth: 68,
  },
  {
    label: "Vehicle OUT Time",
    value: "2026-04-03 11:05:21",
    labelWidth: 68,
  },
];

// Draw single label-value row

const repeatingHeader = (doc, x, y, contactInfo, pdfType) => {
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
  doc.image(path.join(__dirname, "assets/SGLogo.png"), boxWidth - 93, y, {
    width: 125,
  });

  doc
    .font(FONT_BOLD)
    .fillColor("#060606")
    .fontSize(20)
    .text("Gate Pass", 27, y + 22, { width: boxWidth, align: "right" });

  doc
    .font(FONT_BOLD)
    .fontSize(9)
    .text(pdfType, 27, y + 48, {
      width: boxWidth,
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

const drawRow = ({
  doc,
  label,
  value,
  x,
  labelWidth = 42,
  valueWidth = 120,
}) => {
  doc.fillColor(LABEL_COLOR).font(FONT_SEMIBOLD).text(label, x);

  doc
    .fillColor(VALUE_COLOR)
    .font(FONT_REGULAR)
    .text(value, x + labelWidth, doc.y - doc.currentLineHeight(), {
      width: valueWidth,
    });

  doc.moveDown(0.8);
};

const drawColumn = ({ doc, x, y, rows, name, labelWidth, columnWidth }) => {
  doc.y = y;
  doc
    .fillColor("#060606")
    .font(FONT_BOLD)
    .fontSize(8)
    .text(name, x + 5);

  const heightOfHeader = doc.heightOfString(name) + 4;

  doc.fontSize(7);
  doc.moveDown(1);

  const heightOfRows = rows.reduce((total, row) => {
    const rowHeight =
      doc.heightOfString(row.label) + doc.heightOfString(row.value) - 1;
    return total + rowHeight;
  }, 0);

  doc
    .rect(x, y + heightOfHeader, columnWidth - 15, heightOfRows)
    .fill("#F6F8FC");

  rows.forEach((row) => drawRow({ doc, x: x + 5, labelWidth, ...row }));
  return doc.y;
};

const drawHeaderColumns = (
  doc,
  x,
  y,
  columnWidth,
  vehicleData,
  customerData,
) => {
  const section1Col1 = drawColumn({
    doc,
    x,
    y,
    rows: customerData,
    name: "CUSTOMER DETAIL",
    columnWidth,
  });

  const section1Col2 = drawColumn({
    doc,
    x: x + columnWidth + 5,
    y,
    rows: vehicleData,
    name: "VEHICLE DETAIL",
    columnWidth,
  });

  const height = Math.max(section1Col1, section1Col2); // 🔹 header section height

  return height;
};

const gatePass = (res) => {
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

  /* ---------- LAYOUT ---------- */
  const x = 20;
  const y = 140;
  const boxWidth = 550;
  const columnWidth = boxWidth / 2;

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  const middleY = pageHeight / 2;

  doc.fontSize(7);

  repeatingHeader(doc, x, 20, contactInfo, "Garage Receipt");

  const headerHeight1 = drawHeaderColumns(
    doc,
    x,
    y,
    columnWidth,
    VehicleData,
    CustomerData,
  );

  const bottomY1 = headerHeight1 + 10;

  doc.rect(x, bottomY1, boxWidth, 45).fill("#F6F8FC");

  doc
    .fillColor(LABEL_COLOR)
    .font(FONT_SEMIBOLD)
    .text("Booking Cost", x + 5, bottomY1 + 5);

  doc
    .fillColor(VALUE_COLOR)
    .font(FONT_REGULAR)
    .text("54354", 93, bottomY1 + 5);

  doc
    .fillColor(LABEL_COLOR)
    .font(FONT_SEMIBOLD)
    .text("Payment Status", x + 5, bottomY1 + 18);

  doc
    .fillColor(VALUE_COLOR)
    .font(FONT_REGULAR)
    .text("Paid", 93, bottomY1 + 18);

  doc
    .fillColor(LABEL_COLOR)
    .font(FONT_SEMIBOLD)
    .text("Customer Signature", x + 5, bottomY1 + 31);

  doc
    .fillColor(VALUE_COLOR)
    .font(FONT_REGULAR)
    .text("sign", 93, bottomY1 + 31);

  doc
    .moveTo(0, middleY - 15)
    .lineTo(pageWidth, middleY - 15)
    .dash(5, { space: 3 })
    .strokeColor("#e1e1e1")
    .lineWidth(1)
    .stroke()
    .undash();

  repeatingHeader(doc, x, middleY, contactInfo, "Customer Receipt");

  const headerHeight2 = drawHeaderColumns(
    doc,
    x,
    middleY + 120,
    columnWidth,
    VehicleData,
    CustomerData,
  );

  const bottomY2 = headerHeight2 + 10;

  doc.rect(x, bottomY2, boxWidth, 45).fill("#F6F8FC");

  doc
    .fillColor(LABEL_COLOR)
    .font(FONT_SEMIBOLD)
    .text("Booking Cost", x + 5, bottomY2 + 5);

  doc
    .fillColor(VALUE_COLOR)
    .font(FONT_REGULAR)
    .text("54354", 93, bottomY2 + 5);

  doc
    .fillColor(LABEL_COLOR)
    .font(FONT_SEMIBOLD)
    .text("Payment Status", x + 5, bottomY2 + 18);

  doc
    .fillColor(VALUE_COLOR)
    .font(FONT_REGULAR)
    .text("Paid", 93, bottomY2 + 18);

  doc
    .fillColor(LABEL_COLOR)
    .font(FONT_SEMIBOLD)
    .text("Customer Signature", x + 5, bottomY2 + 31);

  doc
    .fillColor(VALUE_COLOR)
    .font(FONT_REGULAR)
    .text("sign", 93, bottomY2 + 31);

  doc.end();
};

export default gatePass;
