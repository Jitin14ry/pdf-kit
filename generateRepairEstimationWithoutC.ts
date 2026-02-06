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
  console.log({ garage_name: booking?.service_centre?.business_name });
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
  const boxWidth = 555;
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

// draw table row
const drawTableRow = ({
  doc,
  x,
  y,
  row,
  columnWidths,
  isHeader = false,
}: any) => {
  let maxHeight = 0;

  // Calculate row height
  row.forEach((cell: any, i: any) => {
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
        columnWidths.reduce((a: any, b: any) => a + b, 0),
        maxHeight,
      )
      .fill("#F6F8FC");
  }

  // Draw text (NO vertical borders)
  let currentX = x;
  row.forEach((cell: any, i: any) => {
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
    .lineTo(
      x + columnWidths.reduce((a: any, b: any) => a + b, 0),
      y + maxHeight,
    )
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
}: any) => {
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

  rows.forEach((item: any) => {
    const rowData = [
      String(item.sn),
      item.name,
      item.code,
      item.hsnCode,
      item.price,
      item.discount,
      item.count,
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
const drawServiceTable = ({
  doc,
  x,
  startY,
  headers,
  rows,
  columnWidths,
}: any) => {
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

  rows.forEach((item: any) => {
    const rowData = [
      String(item.sn),
      item.name,
      item.hsnCode,
      item.price,
      item.discountedPrice,
      item.count,
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
/* ---------------- MAIN GENERIC FUNCTION ---------------- */

export const generateRepairEstimationWithoutC = async (bookingData: any) => {
  const {
    booking,
    SpareTotal,
    ServiceTotal,
    serviceCenterAddress,
    customerDetail,
    vehicleDetail,
    serviceDetail,
    sparePartsHeaders,
    sparePartsColumnWidths,
    sparePartsRows,
    servicesHeaders,
    servicesColumnWidths,
    servicesPartsRows,
    totalAmountInWords,
    totalAmount,
    termsAndConditions,
    bookingCheckpoints,
  } = bookingData;

  const tempFilePath = path.join(
    __dirname,
    `../public/booking_${uuidv4()}.pdf`,
  );
  ensureDirExists(tempFilePath);

  const doc = new PDFDocument({ size: "A4", margin: 10, bufferPages: true });
  const x = 20;
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
  repeatingHeader({ doc, booking, serviceCenterAddress });

  doc.on("pageAdded", () => {
    repeatingHeader({ doc, booking, serviceCenterAddress });
  });

  /* ---------- HEADER ---------- */
  const infoSectionHeight = repeatingInfo({
    doc,
    customerDetail,
    vehicleDetail,
    serviceDetail,
  });

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
      .text(`Spare Total : ₹${SpareTotal}`, boxWidth - 180, tableEndY + 5, {
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
      .text(
        `Labour Total : ₹${ServiceTotal}`,
        boxWidth - 180,
        servicesTableEndY + 5,
        {
          width: 200,
          align: "right",
        },
      );
  }

  const padding = 3;
  const rectHeight = 15;
  let TotalBoxY = servicesTableEndY + 30;

  if (TotalBoxY + rectHeight > doc.page.height - 40) {
    doc.addPage();
    TotalBoxY = 125;
  }

  doc.rect(15, TotalBoxY, boxWidth + 5, rectHeight).fill("#F6F8FC");

  doc.fillColor("#333333");

  doc.font(FONT_SEMIBOLD).text(totalAmountInWords, 20, TotalBoxY + padding, {
    width: boxWidth - 2 * padding,
  });

  doc.text(totalAmount, 20, TotalBoxY + padding, {
    width: boxWidth - 2 * padding,
    align: "right",
  });

  let termsY = TotalBoxY + 50;

  const getTermsHeight = () => {
    let height = 0;

    bookingCheckpoints.forEach((text: any, index: any) => {
      const numberedText = `${index + 1}. ${item?.name}`;

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

  bookingCheckpoints.forEach((item: any, index: any) => {
    const numberedText = `${index + 1}. ${item?.name}`;

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
      "We Declare that this booking estimate shows the actual price of the goods described and that all particulars are true and correct.",
      68,
      termsY + 10,
      { width: boxWidth - 44 },
    );

  doc
    .font(FONT_SEMIBOLD)
    .text("Customer Signature".toUpperCase(), 20, termsY + 36);

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
