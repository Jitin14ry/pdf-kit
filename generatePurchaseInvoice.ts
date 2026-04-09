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

const ensureDirExists = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

/* ---------- HELPER FUNCTIONS ---------- */

const repeatingHeader = ({ doc, contactInfo }: any) => {
  const x = 20;
  const y = 20;
  const boxWidth = 550;

  let cursorY = y;

  labelText({ doc, text: "Contact :", x, y: cursorY });
  valueText({ doc, text: contactInfo?.contact, x: x + 32, y: cursorY });

  cursorY += doc.currentLineHeight() + 4.5;

  labelText({ doc, text: "Email :", x, y: cursorY });
  valueText({ doc, text: contactInfo?.email, x: x + 23, y: cursorY });

  cursorY += doc.currentLineHeight() + 4.5;

  labelText({ doc, text: "GSTIN/UIN :", x, y: cursorY });
  valueText({ doc, text: contactInfo?.gstNo, x: x + 41, y: cursorY });

  cursorY += doc.currentLineHeight() + 10;

  const name = contactInfo?.garageName;

  const textWidth = doc.widthOfString(name, { font: FONT_BOLD, size: 13 });

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

  doc.image(path.join(__dirname, "assets/garageNameBG.png"), 0, cursorY, {
    width: textWidth + extraWidth,
    height: 36,
  });

  doc
    .font(FONT_BOLD)
    .fontSize(13)
    .fillColor("#fff")
    .text(name, x, y + 49);

  doc
    .font(FONT_REGULAR)
    .fillColor("#666666")
    .fontSize(7)
    .text("(A Unit Of Ratnashil Online Services Pvt. Ltd.)", x, y + 78);

  doc
    .moveTo(0, 113)
    .lineTo(140, 113)
    .strokeColor("#CA2A01")
    .lineWidth(1)
    .stroke();

  doc.image(path.join(__dirname, "assets/SGLogo.png"), boxWidth - 70, 18, {
    width: 100,
  });

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
}: any) => {
  doc.fillColor(LABEL_COLOR).font(FONT_SEMIBOLD).text(label, x);

  doc
    .fillColor(VALUE_COLOR)
    .font(FONT_REGULAR)
    .text(value, x + labelWidth, doc.y - doc.currentLineHeight(), {
      width: valueWidth,
    });

  doc.moveDown(0.5);
};

const drawColumn = ({
  doc,
  x,
  y,
  rows,
  name,
  labelWidth,
  columnWidth,
  bg,
}: any) => {
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
    const heightOfRows = rows.reduce((total: any, row: any) => {
      const rowHeight =
        doc.heightOfString(row.label) + doc.heightOfString(row.value) - 1;
      return total + rowHeight;
    }, 0);

    doc
      .rect(x, y + heightOfHeader, columnWidth - 15, heightOfRows - 18)
      .fill("#F6F8FC");
  }

  rows.forEach((row: any) => drawRow({ doc, x: x + 5, labelWidth, ...row }));
  return doc.y;
};

const drawHeaderColumns = ({
  doc,
  x,
  y,
  billerData,
  sellerData,
  buyerData,
}: any) => {
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

const drawHeaderColumns1 = ({
  doc,
  x,
  y,
  columnWidth1,
  billerInfo,
  serviceInfo,
}: any) => {
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
      item.part,
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

export const generatePurchaseInvoice = async (pdfData: any) => {
  const {
    contactInfo,
    billerInfo,
    serviceInfo,
    repeatBilledData,
    repeatVehicleData,
    repeatServiceData,
    billedTo,
    vehicleData,
    sparePartsRows,
    sparePartsHeaders,
    sparePartsColumnWidths,
    serviceData,
    servicesPartsRows,
    servicesHeaders,
    servicesColumnWidths,
    totalAmountInWords,
    totalAmount,
    taxTotal,
    gstTableHeaders,
    gstTableColumnWidths,
    gstTableRows,
    summaryData,
    termsAndConditions,
    bankDetails,
  } = pdfData;

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

  /* ---------- HEADER IMAGES ---------- */
  const pageWidth = doc.page.width;

  /* ---------- LAYOUT ---------- */
  const x = 20;
  const y = 120;
  const boxWidth = 550;
  const columnWidth1 = boxWidth / 2;
  const columnWidth = boxWidth / 3;

  doc.fontSize(7);

  repeatingHeader({ doc, contactInfo });

  const headerHeight1 = drawHeaderColumns1({
    doc,
    x,
    y,
    columnWidth1,
    billerInfo,
    serviceInfo,
  });

  doc.on("pageAdded", () => {
    repeatingHeader({ doc, contactInfo });
    drawHeaderColumns({
      doc,
      x,
      y,
      repeatBilledData,
      repeatVehicleData,
      repeatServiceData,
    });
  });

  const headerHeight = drawHeaderColumns({
    doc,
    x,
    y: headerHeight1 + 10,
    billedTo,
    vehicleData,
    serviceData,
  });

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

  const padding = 6;

  const totalPriceBoxWidth = sparePartsColumnWidths.reduce(
    (a: any, b: any) => a + b,
    0,
  );

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
      gstTableColumnWidths.reduce((a: any, b: any) => a + b, 0),
      gstHeaderHeight,
    )
    .fill("#F6F8FC");

  let tableCellX = x;

  gstTableHeaders.forEach((cell: any, i: any) => {
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

  gstTableRows.forEach((row: any) => {
    let rowHeight = 0;

    const cellValues = [
      row.taxHead,
      row.taxValue,
      row.firstPercent,
      row.secondPercent,
      row.thirdPercent,
      row.fourthPercent,
    ];

    cellValues.forEach((cell: any, i: any) => {
      const h = doc.heightOfString(String(cell ?? ""), {
        width: gstTableColumnWidths[i] - 6,
      });
      rowHeight = Math.max(rowHeight, h);
    });

    rowHeight += 10;

    let rowX = x;
    cellValues.forEach((cell: any, i: any) => {
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

  const boxX = pageWidth - 140;
  const boxY = gstTableY;
  const boxTotalWidth = 120;

  const rowHeight = 18.4;

  const labelWidth = 70;
  const valueWidth = boxTotalWidth - labelWidth;

  let totalPriceY = boxY;

  summaryData.forEach((item: any, index: any) => {
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

  termsAndConditions.forEach((text: any, index: any) => {
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

  const getBankHeight = () => {
    let height = 0;

    bankDetails.forEach((item: any) => {
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

  bankDetails.forEach((item: any, idx: any) => {
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

  return uploadResult.Location;
};
