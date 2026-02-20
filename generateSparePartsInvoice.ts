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

/* ---------------- HELPERS ---------------- */

const ensureDirExists = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Draw single label-value row
const drawRow = ({
  doc,
  label,
  value,
  x,
  labelWidth = 50,
  valueWidth = 120,
}: any) => {
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
const drawColumn = ({ doc, x, y, rows, labelWidth }: any) => {
  doc.y = y;
  rows.forEach((row: any) => drawRow({ doc, x, labelWidth, ...row }));
  return doc.y;
};

const drawHeaderColumns = (
  doc: any,
  sellerData: any[],
  buyerData: any[],
  consigneeData: any[],
) => {
  const x = 20;
  const y = 75;
  const boxWidth = 550;
  const columnWidth = boxWidth / 3;
  const pageWidth = doc.page.width;

  /* ---------- HEADER IMAGES ---------- */
  doc.image(path.join(__dirname, "../public/taxInvoiceImg.png"), 0, 20, {
    width: 150,
  });

  doc.image(
    path.join(__dirname, "../public/invoiceLogo.png"),
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
    rows: sellerData,
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

/* ---------------- TABLE FUNCTIONS ---------------- */

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
        columnWidths.reduce((a: any, b: any) => a + b, 0),
        maxHeight,
      )
      .fill("#F6F8FC");
  }

  // Draw text (NO vertical borders)
  let currentX = x;
  row.forEach((cell: any, i: any) => {
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
  headerHeight,
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

/* ---------------- MAIN GENERIC FUNCTION ---------------- */

export const generateSparePartsInvoice = async (invoiceData: any) => {
  const {
    repeatSellerData,
    repeatBuyerData,
    repeatConsigneeData,
    sellerData,
    buyerData,
    consigneeData,
    invoiceMeta,
    sparePartsHeaders,
    sparePartsColumnWidths,
    sparePartsRows,
    gstTableHeaders,
    gstTableColumnWidths,
    gstTableRows,
    summaryData,
    totalAmountInWords,
    totalTaxable,
    totalAmount,
    termsAndConditions,
    bankDetails,
    headerTexts,
  } = invoiceData;

  const tempFilePath = path.join(
    __dirname,
    `../public/invoice_${uuidv4()}.pdf`,
  );
  ensureDirExists(tempFilePath);

  const doc: any = new PDFDocument({
    size: "A4",
    margin: 10,
    bufferPages: true,
  });

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

  doc.on("pageAdded", () => {
    drawHeaderColumns(
      doc,
      repeatSellerData,
      repeatBuyerData,
      repeatConsigneeData,
    );
  });

  const pageWidth = doc.page.width;
  const x = 20;
  const boxWidth = 550;
  const columnWidth = boxWidth / 3;

  doc.fontSize(7);

  /* ---------- HEADER ---------- */

  const headerHeight = drawHeaderColumns(
    doc,
    sellerData,
    buyerData,
    consigneeData,
  );

  const secondSectionY = headerHeight + 8;

  const section2Col1 = drawColumn({
    doc,
    x,
    y: secondSectionY,
    labelWidth: 66,
    rows: invoiceMeta.left,
  });

  const section2Col2 = drawColumn({
    doc,
    x: x + columnWidth + 5,
    y: secondSectionY,
    labelWidth: 65,
    rows: invoiceMeta.middle,
  });

  const section2Col3 = drawColumn({
    doc,
    x: x + columnWidth * 2 + 5,
    y: secondSectionY,
    labelWidth: 34,
    rows: invoiceMeta.right,
  });

  if (invoiceMeta.qrImagePath) {
    doc.image(
      path.join(__dirname, invoiceMeta.qrImagePath),
      pageWidth - 86,
      headerHeight + 42,
      { width: 60 },
    );
  }

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

  /* ---------- AMOUNT IN WORDS BOX ---------- */

  const padding = 6;

  const totalPriceBoxWidth = sparePartsColumnWidths.reduce(
    (a: number, b: number) => a + b,
    0,
  );

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

  const widthOfRightTotal = doc.widthOfString(`₹ ${totalAmount}`, {
    width: totalPriceBoxWidth - 5,
  });

  doc
    .fillColor("#333333")
    .text(`Total : ₹ ${totalTaxable}`, x, totalPriceBoxY + padding, {
      width: totalPriceBoxWidth - widthOfRightTotal - 20,
      align: "right",
    });

  doc
    .fillColor("#333333")
    .text(`₹ ${totalAmount}`, x, totalPriceBoxY + padding, {
      width: totalPriceBoxWidth - 5,
      align: "right",
    });

  /* ---------- GST TABLE ---------- */
  let gstHeaderHeight = 0;
  let gstTableY = totalPriceBoxY + heightOfAmountInWords + 20;

  gstTableHeaders.forEach((cell: any, i: any) => {
    const h = doc.heightOfString(cell, {
      width: gstTableColumnWidths[i] - 6,
    });
    gstHeaderHeight = Math.max(gstHeaderHeight, h);
  });

  gstHeaderHeight += 8;

  let rowsHeight = 0;

  gstTableRows.forEach((row: any) => {
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
      gstTableColumnWidths.reduce((a: any, b: any) => a + b, 0),
      gstHeaderHeight,
    )
    .fill("#F6F8FC");

  let tableCellX = x;

  gstTableHeaders.forEach((cell: any, i: any) => {
    doc
      .font(FONT_BOLD)
      .fillColor("#333333")
      .fontSize(8)
      .text(cell, tableCellX + 5, gstTableY + 4, {
        width: gstTableColumnWidths[i] - 6,
      });

    tableCellX += gstTableColumnWidths[i];
  });

  let tableRowY = gstTableY + gstHeaderHeight;

  gstTableRows.forEach((row: any) => {
    let rowHeight = 0;

    const gstRowData = Object.values(row);

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
        .fontSize(7)
        .text(String(cell ?? ""), rowX + 5, tableRowY + 4, {
          width: gstTableColumnWidths[i] - 6,
        });

      rowX += gstTableColumnWidths[i];
    });

    tableRowY += rowHeight;
  });

  /* ---------- SUMMARY BOX ---------- */

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

  summaryData.forEach((item: any, index: number) => {
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

  // ---- TERMS HEIGHT ----
  let termsHeight = 0;
  termsAndConditions.forEach((text: any, i: any) => {
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
  // const signImg = doc.openImage(
  // path.join(__dirname, invoiceMeta.signImagePath),
  // );
  // const signHeight = signImg.height + 50;
  const signHeight = 50;

  // ---- FINAL ESTIMATED HEIGHT ----
  const estimatedHeight = Math.max(termsHeight, bankHeight, signHeight);

  const bottomMargin = 40;
  const textY = totalPriceY + 20;

  let maxTextHeight = 0;
  let termsY = textY;
  let bankY = textY;
  let signY = textY;

  if (textY + estimatedHeight > doc.page.height - bottomMargin) {
    doc.addPage();

    termsY = headerHeight + 100;
    bankY = headerHeight + 100;
    signY = headerHeight + 100;
  }

  // redraw header
  doc.rect(x, termsY, totalPriceBoxWidth, maxTextHeight + 16).fill("#F6F8FC");

  headerTexts.forEach((text: any, index: any) => {
    const textX =
      index === 2 ? x + index * columnWidth + 22 : x + index * columnWidth + 6;

    doc
      .font(FONT_BOLD)
      .fillColor("#333333")
      .text(text, textX, termsY + 4, {
        width: columnWidth - 11,
      });
  });

  termsAndConditions.forEach((text: any, index: any) => {
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

  bankDetails.forEach((item: any, idx: any) => {
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

  if (invoiceMeta.qrImagePath) {
    doc.image(
      path.join(__dirname, invoiceMeta.qrImagePath),
      columnWidth + 40,
      bankY + 30,
      { width: 60 },
    );
  }

  // const img = doc.openImage(path.join(__dirname, invoiceMeta.signImagePath));

  // const imageWidth = 110;
  // const imageHeight = img.height;
  const imageHeight = 0;

  // doc.image(img, columnWidth * 2 + columnWidth / 3, signY + 30, {
  //   width: imageWidth,
  // });

  doc
    .font(FONT_SEMIBOLD)
    .text(
      "Authorised Signature",
      columnWidth * 2 + columnWidth / 2.2,
      signY + imageHeight + 35,
    );

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
  console.log(uploadResult.Location);
  return uploadResult.Location;
};
