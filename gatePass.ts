import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import https from "https";

/* ---------------- AWS CONFIG ---------------- */
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.AWS_REGION,
});

/* ---------------- CONSTANTS ---------------- */
const LABEL_COLOR = "#333333";
const VALUE_COLOR = "#666666";
const BORDER_COLOR = "#C7CED5";

const FONT_REGULAR = "Inter_24pt-Regular";
const FONT_SEMIBOLD = "Inter_24pt-SemiBold";
const FONT_BOLD = "Inter_28pt-Bold";

const labelText = ({ doc, text, x, y }: any) => {
  doc.font(FONT_SEMIBOLD).fillColor("#E04B24").fontSize(7).text(text, x, y);
};

const valueText = ({ doc, text, x, y }: any) => {
  doc.font(FONT_REGULAR).fillColor("#333333").fontSize(7).text(text, x, y);
};

/* ---------------- HELPERS ---------------- */

const ensureDirExists = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const repeatingHeader = ({ doc, garageInfo, pdfType }: any) => {
  const x = 20;
  const y = 20;
  const boxWidth = 550;

  let cursorY = y;

  /* ---------- CONTACT INFO ---------- */
  labelText({ doc, text: "Contact :", x, y: cursorY });
  valueText({
    doc,
    text: garageInfo?.service_centre?.phone_number,
    x: x + 32,
    y: cursorY,
  });

  cursorY += doc.currentLineHeight() + 4.5;

  labelText({ doc, text: "Email :", x, y: cursorY });
  valueText({
    doc,
    text: garageInfo?.service_centre?.email,
    x: x + 23,
    y: cursorY,
  });

  cursorY += doc.currentLineHeight() + 4.5;

  labelText({ doc, text: "GSTIN/UIN :", x, y: cursorY });
  valueText({
    doc,
    text: garageInfo?.service_centre?.gst,
    x: x + 41,
    y: cursorY,
  });

  /* ---------- BRAND ---------- */
  cursorY += doc.currentLineHeight() + 10;

  // measure text width
  const textWidth = doc.widthOfString(
    garageInfo?.service_centre?.business_name
      ? garageInfo?.service_centre?.business_name
      : "-",
    { font: FONT_BOLD, size: 13 },
  );

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
  doc.image(path.join(__dirname, "../public/garageNameBG.png"), 0, cursorY, {
    width: textWidth + extraWidth,
    height: 36, // fixed height
  });

  // draw text on top
  doc
    .font(FONT_BOLD)
    .fontSize(13)
    .fillColor("#fff")
    .text(garageInfo?.service_centre?.business_name, x, y + 49);

  doc
    .font(FONT_BOLD)
    .fillColor("#fff")
    .fontSize(13)
    .text(garageInfo?.service_centre?.business_name, x, y + 49);

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
  doc.image(path.join(__dirname, "../public/SGLogo.png"), boxWidth - 93, 18, {
    width: 125,
  });

  doc
    .font(FONT_BOLD)
    .fillColor("#454D55")
    .fontSize(16)
    .text(pdfType, 27, y + 22, { width: boxWidth, align: "right" });

  doc
    .font(FONT_BOLD)
    .fontSize(9)
    .text(pdfType, 27, y + 48, {
      width: boxWidth,
      align: "right",
    });

  doc.image(
    path.join(__dirname, "../public/InvoiceLocationIcon.png"),
    boxWidth + 17,
    y + 65,
    { width: 10 },
  );

  doc
    .font(FONT_REGULAR)
    .fillColor("#333333")
    .fontSize(7)
    .text(garageInfo?.service_centre?.address, boxWidth - 185, y + 65, {
      width: 200,
      align: "right",
    });
};

const drawRow = ({
  doc,
  label,
  value,
  x,
  labelWidth = 42,
  valueWidth = 120,
}: any) => {
  doc.fillColor(LABEL_COLOR).font(FONT_SEMIBOLD).text(label, x);

  doc
    .fillColor(VALUE_COLOR)
    .font(FONT_REGULAR)
    .text(value, x + labelWidth, doc.y - doc.currentLineHeight(), {
      width: valueWidth,
    });

  doc.moveDown(0.8);
};

const drawColumn = ({
  doc,
  x,
  y,
  rows,
  name,
  labelWidth,
  columnWidth,
}: any) => {
  doc.y = y;
  doc
    .fillColor("#060606")
    .font(FONT_BOLD)
    .fontSize(8)
    .text(name, x + 5);

  const heightOfHeader = doc.heightOfString(name) + 4;

  doc.fontSize(7);
  doc.moveDown(1);

  const heightOfRows = rows.reduce((total: any, row: any) => {
    const rowHeight =
      doc.heightOfString(row.label) + doc.heightOfString(row.value) - 1;
    return total + rowHeight;
  }, 0);

  doc
    .rect(x, y + heightOfHeader, columnWidth - 15, heightOfRows)
    .fill("#F6F8FC");

  rows.forEach((row: any) => drawRow({ doc, x, labelWidth, ...row }));
  return doc.y;
};

const drawHeaderColumns = ({
  doc,
  x,
  y,
  columnWidth,
  vehicleData,
  customerData,
}: any) => {
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

  const height = Math.max(section1Col1, section1Col2);

  return height;
};

/* ---------------- MAIN GENERIC FUNCTION ---------------- */

export const generateGatePassPdf = async (pdfData: any) => {
  const {
    garageInfo,
    pdfType,
    VehicleData,
    CustomerData,
    bookingCost,
    paymentStatus,
    signImg,
  } = pdfData;

  const tempFilePath = path.join(
    __dirname,
    `../public/invoice_${uuidv4()}.pdf`,
  );

  ensureDirExists(tempFilePath);

  const doc = new PDFDocument({ size: "A4", margin: 10, bufferPages: true });

  /* ---------- FONT REGISTRATION ---------- */
  doc.registerFont(
    FONT_REGULAR,
    path.join(__dirname, "../public/Inter_24pt-Regular.ttf"),
  );
  doc.registerFont(
    FONT_SEMIBOLD,
    path.join(__dirname, "../public/Inter_24pt-SemiBold.ttf"),
  );
  doc.registerFont(
    FONT_BOLD,
    path.join(__dirname, "../public/Inter_28pt-Bold.ttf"),
  );

  const writeStream = fs.createWriteStream(tempFilePath);
  doc.pipe(writeStream);

  const y = 140;
  const x = 20;
  const boxWidth = 550;
  const columnWidth = boxWidth / 2;

  doc.fontSize(7);

  repeatingHeader({ doc, garageInfo, pdfType });

  const headerHeight = drawHeaderColumns({
    doc,
    x,
    y,
    columnWidth,
    VehicleData,
    CustomerData,
  });

  const bottomY1 = headerHeight + 10;

  doc.rect(x, bottomY1, boxWidth, 45).fill("#F6F8FC");

  doc
    .fillColor(LABEL_COLOR)
    .font(FONT_REGULAR)
    .text("Booking Cost", x + 5, bottomY1 + 5);

  doc
    .fillColor(VALUE_COLOR)
    .font(FONT_REGULAR)
    .text(bookingCost, 75, bottomY1 + 5);

  doc
    .fillColor(LABEL_COLOR)
    .font(FONT_REGULAR)
    .text("Payment Status", x + 5, bottomY1 + 18);

  doc
    .fillColor(VALUE_COLOR)
    .font(FONT_REGULAR)
    .text(paymentStatus, 80, bottomY1 + 18);

  doc
    .fillColor(LABEL_COLOR)
    .font(FONT_REGULAR)
    .text("Customer Signature", x + 5, bottomY1 + 31);

  doc
    .fillColor(VALUE_COLOR)
    .font(FONT_REGULAR)
    .text(signImg, 95, bottomY1 + 31);

  doc.end();

  /* ---------- WAIT FOR FILE TO WRITE ---------- */
  await new Promise((resolve) => writeStream.on("finish", resolve));

  /* ---------- UPLOAD TO S3 ---------- */

  const fileContent = fs.readFileSync(tempFilePath);

  const s3Key = `invoices/${uuidv4()}.pdf`;

  const uploadResult = await s3
    .upload({
      Bucket: process.env.BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      // ContentType: 'application/pdf',
      ACL: "public-read", // or 'public-read' if you want public access
    })
    .promise();

  fs.unlinkSync(tempFilePath);

  return uploadResult.Location;
};
