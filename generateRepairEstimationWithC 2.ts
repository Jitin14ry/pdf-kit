import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { v4 as uuidv4 } from "uuid";

/* ---------------- AWS CONFIG ---------------- */
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.AWS_REGION,
});

/* ---------------- CONSTANTS ---------------- */
const LABEL_COLOR = "#333333";
const VALUE_COLOR = "#888888";
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

// Draw single label-value row
const drawRow = ({ doc, label, value, x }: any) => {
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
const drawColumn = ({ doc, x, y, rows, name }: any) => {
  doc.y = y;
  doc.fillColor("#060606").font(FONT_BOLD).text(name, x);
  doc.moveDown(0.6);
  rows.forEach((row: any) => drawRow({ doc, x, ...row }));
  return doc.y;
};

const repeatingHeader = ({ doc, booking, serviceCenterAddress }: any) => {
  const x = 20;
  const y = 20;
  const boxWidth = 550;

  let cursorY = y;

  /* ---------- CONTACT INFO ---------- */
  labelText({ doc, text: "Contact :", x, y: cursorY });
  valueText({
    doc,
    text: booking?.service_centre?.phone_number,
    x: x + 32,
    y: cursorY,
  });

  cursorY += doc.currentLineHeight() + 4.5;

  labelText({ doc, text: "Email :", x, y: cursorY });
  valueText({
    doc,
    text: booking?.service_centre?.email,
    x: x + 23,
    y: cursorY,
  });

  cursorY += doc.currentLineHeight() + 4.5;

  labelText({ doc, text: "GSTIN/UIN :", x, y: cursorY });
  valueText({ doc, text: booking?.service_centre?.gst, x: x + 41, y: cursorY });

  /* ---------- BRAND ---------- */
  cursorY += doc.currentLineHeight() + 10;

  // measure text width
  const textWidth = doc.widthOfString(
    booking?.service_centre?.business_name
      ? booking?.service_centre?.business_name
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
    .text(booking?.service_centre?.business_name, x, y + 49);

  doc
    .font(FONT_BOLD)
    .fillColor("#fff")
    .fontSize(13)
    .text(booking?.service_centre?.business_name, x, y + 49);

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
    path.join(__dirname, "../public/SGInvoiceLogo.png"),
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
    .text(booking?.jobcard_number, boxWidth - 124, y + 50, {
      width: 150,
      align: "right",
    });

  /* ---------- ADDRESS ---------- */
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
    .text(serviceCenterAddress, boxWidth - 185, y + 65, {
      width: 200,
      align: "right",
    });
};

const repeatingInfo = ({
  doc,
  customerDetail,
  vehicleDetail,
  serviceDetail,
}: any) => {
  const x = 20;
  const y = 135;
  const boxWidth = 550;
  const columnWidth = boxWidth / 3;

  const section1Col1 = drawColumn({
    doc,
    x,
    y,
    rows: customerDetail,
    name: "CUSTOMER DETAIL",
  });

  const section1Col2 = drawColumn({
    doc,
    x: x + columnWidth + 5,
    y,
    rows: vehicleDetail,
    name: "VEHICLE DETAIL",
  });

  const section1Col3 = drawColumn({
    doc,
    x: x + columnWidth * 2 + 5,
    y,
    rows: serviceDetail,
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

const drawTableRow = ({
  doc,
  x,
  y,
  row,
  columnWidths,
  isHeader = false,
}: any) => {
  let maxHeight = 0;

  doc.font(isHeader ? FONT_SEMIBOLD : FONT_REGULAR).fontSize(7);

  // Calculate row height
  row.forEach((cell: any, i: any) => {
    const height = doc.heightOfString(
      isHeader || i !== 0 ? String(cell) : cell.name,
      { width: columnWidths[i] - 6 },
    );
    maxHeight = Math.max(maxHeight, height + 10);
  });

  let currentX = x;

  row.forEach((cell: any, i: any) => {
    if (!isHeader && i === 0) {
      // ICON BASED ON TYPE
      const iconPath =
        cell?.type?.trim()?.toLowerCase() === "Product"
          ? path.join(__dirname, "../public/Spare.png")
          : path.join(__dirname, "../public/Service.png");

      doc.image(iconPath, currentX - 2, y + 3, { width: 12 });

      // TEXT FOR FIRST COLUMN
      doc.fillColor("#333333").text(cell.name, currentX + 13, y + 5, {
        width: columnWidths[i] - 6,
        align: "left",
      });
    } else {
      doc
        .fillColor(isHeader ? "#060606" : "#333333")
        .fontSize(isHeader ? 8 : 7)
        .text(
          String(cell),
          isHeader && i == 0 ? currentX : currentX + 13,
          y + 5,
          {
            width: columnWidths[i] - 6,
            align: i === 0 ? "left" : "center",
          },
        );

      doc.fontSize(7);
    }

    currentX += columnWidths[i];
  });

  // Bottom border
  doc
    .moveTo(x - 5, y + maxHeight)
    .lineTo(
      x - 5 + columnWidths.reduce((a: any, b: any) => a + b, 0),
      y + maxHeight,
    )
    .lineWidth(0.2)
    .strokeColor("#f0f0f0")
    .stroke();

  return maxHeight;
};

const drawGroupRow = ({ doc, x, y, text, columnWidths }: any) => {
  const rowHeight = 18;
  const totalWidth = columnWidths.reduce((a: any, b: any) => a + b, 0);

  // background
  doc.rect(x - 5, y, totalWidth, rowHeight).fill("#F6F6F6");

  // bottom border (0.2px)
  doc
    .moveTo(x - 5, y + rowHeight)
    .lineTo(x - 5 + totalWidth, y + rowHeight)
    .lineWidth(0.1)
    .strokeColor("#C7CED5")
    .stroke();

  // text
  doc
    .fillColor("#E04B24")
    .font(FONT_SEMIBOLD)
    .text(text, x, y + 5);

  return rowHeight;
};

// draw complete table
const drawItemsTable = ({
  doc,
  x,
  startY,
  headers,
  rows,
  columnWidths,
  infoSectionHeight,
}: any) => {
  let y = startY;

  // draw header
  y += drawTableRow({
    doc,
    x,
    y,
    row: headers,
    columnWidths,
    isHeader: true,
  });

  rows.forEach((parent: any) => {
    /* --------- CHECK PAGE BREAK FOR GROUP ROW --------- */
    if (y + 20 > doc.page.height - 40) {
      doc.addPage();
      y = infoSectionHeight + 10;

      y += drawTableRow({
        doc,
        x,
        y,
        row: headers,
        columnWidths,
        isHeader: true,
      });
    }

    /* --------- DRAW PARENT ROW --------- */
    y += drawGroupRow({
      doc,
      x,
      y,
      text: parent.name,
      columnWidths,
    });

    /* --------- DRAW CHILD ROWS --------- */
    parent.jobSheet.forEach((item: any) => {
      const rowData = [
        item,
        item?.productCode || "--",
        item?.hsnCode || "--",
        String(item?.price),
        String(item?.discount),
        String(item?.count),
        String(item?.total),
      ];

      const estimatedHeight =
        Math.max(
          ...rowData.map((cell, i) =>
            doc.heightOfString(String(cell), {
              width: columnWidths[i] - 6,
            }),
          ),
        ) + 10;

      if (y + estimatedHeight > doc.page.height - 40) {
        doc.addPage();
        y = infoSectionHeight + 10;

        y += drawTableRow({
          doc,
          x: x + 10,
          y,
          row: headers,
          columnWidths,
          isHeader: true,
        });
      }

      y += drawTableRow({
        doc,
        x,
        y,
        row: rowData,
        columnWidths,
      });
    });
  });

  return y;
};

/* ---------------- MAIN GENERIC FUNCTION ---------------- */

export const generateRepairEstimationWithC = async (bookingData: any) => {
  const {
    booking,
    SpareTotal,
    ServiceTotal,
    serviceCenterAddress,
    customerDetail,
    vehicleDetail,
    serviceDetail,
    tableHeader,
    tableColumnWidths,
    tableRows,
    totalAmountInWords,
    totalAmount,
    termsAndConditions,
  } = bookingData;

  const tempFilePath = path.join(
    __dirname,
    `../public/booking_${uuidv4()}.pdf`,
  );
  ensureDirExists(tempFilePath);

  const doc = new PDFDocument({ size: "A4", margin: 10, bufferPages: true });
  const boxWidth = 550;

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

  doc.fontSize(7);

  doc.on("pageAdded", () => {
    repeatingHeader({ doc, booking, serviceCenterAddress });
    repeatingInfo({
      doc,
      customerDetail,
      vehicleDetail,
      serviceDetail,
    });
  });

  repeatingHeader({ doc, booking, serviceCenterAddress });

  /* ---------- HEADER ---------- */
  const infoSectionHeight = repeatingInfo({
    doc,
    customerDetail,
    vehicleDetail,
    serviceDetail,
  });

  const tableStartY = infoSectionHeight + 10;

  const tableEndY = drawItemsTable({
    doc,
    x: 20,
    startY: tableStartY,
    headers: tableHeader,
    rows: tableRows,
    columnWidths: tableColumnWidths,
    infoSectionHeight,
  });

  const widthOfRightTotal = doc
    .font(FONT_SEMIBOLD)
    .widthOfString(`Labour Total: ₹${ServiceTotal}`);

  doc
    .font(FONT_SEMIBOLD)
    .fillColor("#333333")
    .text(`Spare Total: ₹${SpareTotal}`, 20, tableEndY + 10, {
      width: boxWidth - widthOfRightTotal - 15,
      align: "right",
    });

  doc
    .font(FONT_SEMIBOLD)
    .fillColor("#333333")
    .text(`Labor Total: ₹${ServiceTotal}`, 20, tableEndY + 10, {
      width: boxWidth,
      align: "right",
    });

  const padding = 6;
  const rectHeight = 22;
  let TotalBoxY = tableEndY + 30;

  if (TotalBoxY + rectHeight > doc.page.height - 40) {
    doc.addPage();
    TotalBoxY = infoSectionHeight + 15;
  }

  doc.rect(15, TotalBoxY, boxWidth + 10, rectHeight).fill("#F6F8FC");

  doc.fillColor("#333333");

  doc
    .fontSize(8)
    .font(FONT_BOLD)
    .text(totalAmountInWords, 20, TotalBoxY + padding, {
      width: boxWidth - 2 * padding,
    });

  doc
    .fontSize(8)
    .font(FONT_BOLD)
    .text(`Total: ₹${totalAmount}`, 30, TotalBoxY + padding, {
      width: boxWidth - 2 * padding,
      align: "right",
    });

  doc.fontSize(7);

  let termsY = TotalBoxY + 50;

  const getTermsHeight = () => {
    let height = 0;

    termsAndConditions.forEach((text: any, index: any) => {
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
    termsY = infoSectionHeight + 35; // below repeating header
  }

  doc.font(FONT_BOLD).text("TERMS & CONDITIONS", 20, termsY - 15);

  termsAndConditions.forEach((text: any, index: any) => {
    const numberedText = `${index + 1}. ${text}`;

    const textHeight = doc.heightOfString(numberedText, {
      width: boxWidth - 12,
    });

    doc
      .font(FONT_REGULAR)
      .fillColor("#333333")
      .text(numberedText, 20, termsY, { width: boxWidth - 12 });

    termsY += textHeight + 3;
  });

  doc.font(FONT_SEMIBOLD).text("Declaration : ", 20, termsY + 10);

  doc
    .font(FONT_REGULAR)
    .text(
      "The final amount of this estimate may vary by up to ±10% based on actual requirements and execution.",
      63,
      termsY + 10,
      { width: boxWidth - 12 },
    );

  doc
    .font(FONT_SEMIBOLD)
    .text("Customer Signature".toUpperCase(), 20, termsY + 30);

  /* ---------- PAGE NUMBERS ---------- */

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

  /* ---------- WAIT FOR FILE TO WRITE ---------- */
  await new Promise((resolve) => writeStream.on("finish", resolve));

  /* ---------- UPLOAD TO S3 ---------- */

  const fileContent = fs.readFileSync(tempFilePath);

  const s3Key = `bookings/${uuidv4()}.pdf`;

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
