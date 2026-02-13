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

const repeatingHeader = ({
  doc,
  invoice,
  invoiceType,
  serviceCenterAddress,
}: any) => {
  const x = 20;
  const y = 20;
  const boxWidth = 550;

  let cursorY = y;

  /* ---------- CONTACT INFO ---------- */
  labelText({ doc, text: "Contact :", x, y: cursorY });
  valueText({
    doc,
    text: invoice?.service_centre?.phone_number,
    x: x + 32,
    y: cursorY,
  });

  cursorY += doc.currentLineHeight() + 4.5;

  labelText({ doc, text: "Email :", x, y: cursorY });
  valueText({
    doc,
    text: invoice?.service_centre?.email,
    x: x + 23,
    y: cursorY,
  });

  cursorY += doc.currentLineHeight() + 4.5;

  labelText({ doc, text: "GSTIN/UIN :", x, y: cursorY });
  valueText({ doc, text: invoice?.service_centre?.gst, x: x + 41, y: cursorY });

  /* ---------- BRAND ---------- */
  cursorY += doc.currentLineHeight() + 10;

  // measure text width
  const textWidth = doc.widthOfString(
    invoice?.service_centre?.business_name
      ? invoice?.service_centre?.business_name
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
    .text(invoice?.service_centre?.business_name, x, y + 49);

  doc
    .font(FONT_BOLD)
    .fillColor("#fff")
    .fontSize(13)
    .text(invoice?.service_centre?.business_name, x, y + 49);

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
      .text(invoice?.invoice_number, 27, y + 50, {
        width: boxWidth,
        align: "right",
      });
  }

  /* ---------- ADDRESS ---------- */
  doc.image(
    path.join(__dirname, "../public/InvoiceLocationIcon.png"),
    boxWidth + 17,
    invoiceType != "Proforma Invoice" ? y + 65 : y + 54,
    { width: 10 },
  );

  doc
    .font(FONT_REGULAR)
    .fillColor("#333333")
    .fontSize(7)
    .text(
      serviceCenterAddress,
      boxWidth - 185,
      invoiceType != "Proforma Invoice" ? y + 65 : y + 54,
      {
        width: 200,
        align: "right",
      },
    );
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
  doc.moveDown(0.4);
};

const drawColumn = ({ doc, x, y, rows, labelWidth }: any) => {
  doc.y = y;
  rows.forEach((row: any) => drawRow({ doc, x, labelWidth, ...row }));
  return doc.y;
};

const drawHeaderColumns = (
  doc: any,
  billerData: any[],
  sellerData: any[],
  buyerData: any[],
) => {
  const x = 20;
  const y = 120;
  const boxWidth = 550;
  const columnWidth = boxWidth / 3;

  doc.fontSize(7);

  const section1Col1 = drawColumn({ doc, x, y, rows: billerData });
  const section1Col2 = drawColumn({
    doc,
    x: x + columnWidth + 5,
    y,
    rows: sellerData,
  });
  const section1Col3 = drawColumn({
    doc,
    x: x + columnWidth * 2 + 5,
    y,
    rows: buyerData,
  });

  const height = Math.max(section1Col1, section1Col2, section1Col3);

  doc
    .strokeColor(BORDER_COLOR)
    .lineWidth(0.6)
    .moveTo(x, height + 2)
    .lineTo(x + boxWidth, height + 2)
    .stroke();

  return height;
};

/* ---------------- TABLE FUNCTIONS ---------------- */

const drawTableRow = ({
  doc,
  x,
  y,
  row,
  columnWidths,
  isHeader = false,
}: any) => {
  let maxHeight = 0;

  row.forEach((cell: string, i: number) => {
    const height = doc.heightOfString(cell, {
      width: columnWidths[i] - 6,
    });
    maxHeight = Math.max(maxHeight, height + 10);
  });

  if (isHeader) {
    doc
      .rect(
        x,
        y,
        columnWidths.reduce((a: number, b: number) => a + b, 0),
        maxHeight,
      )
      .fill("#F6F8FC");
  }

  let currentX = x;
  row.forEach((cell: string, i: number) => {
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

  doc
    .moveTo(x, y + maxHeight)
    .lineTo(
      x + columnWidths.reduce((a: number, b: number) => a + b, 0),
      y + maxHeight,
    )
    .strokeColor("#E2E6EA")
    .lineWidth(0.3)
    .stroke();

  return maxHeight;
};

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
      item.code,
      item.hsn,
      item.mrp,
      item.gst,
      item.before,
      item.disc,
      item.after,
      item.qty,
      item.approved,
      item.taxable,
      item.total,
    ];

    const estimatedHeight = 20;
    if (y + estimatedHeight > doc.page.height - bottomMargin) {
      doc.addPage();

      y = topMargin + headerHeight;
      y += drawTableRow({
        doc,
        x,
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

  return y;
};

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
      item.approved,
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

/* ---------------- MAIN GENERIC FUNCTION ---------------- */

export const generateClaimInvoice = async (invoiceData: any) => {
  const {
    invoice,
    SpareTotal,
    ServiceTotal,
    serviceCenterAddress,
    billerData,
    sellerData,
    buyerData,
    invoiceMeta,
    sparePartsHeaders,
    sparePartsColumnWidths,
    sparePartsRows,
    servicesHeaders,
    servicesColumnWidths,
    servicesRows,
    gstTableHeaders,
    gstTableColumnWidths,
    gstTableRows,
    summaryData,
    totalAmountInWords,
    totalAmount,
    taxTotal,
    termsAndConditions,
    bankDetails,
    invoiceType,
  } = invoiceData;

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

  doc.on("pageAdded", () => {
    repeatingHeader({ doc, invoice, invoiceType, serviceCenterAddress });
    drawHeaderColumns(doc, billerData, sellerData, buyerData);
  });

  const pageWidth = doc.page.width;
  const x = 20;
  const boxWidth = 550;
  const columnWidth = boxWidth / 3;

  doc.fontSize(7);

  /* ---------- HEADER ---------- */
  repeatingHeader({ doc, invoice, invoiceType, serviceCenterAddress });

  const headerHeight = drawHeaderColumns(
    doc,
    billerData,
    sellerData,
    buyerData,
  );

  const secondSectionY = headerHeight + 8;

  const section2Col1 = drawColumn({
    doc,
    x,
    y: secondSectionY,
    labelWidth: 54,
    rows: invoiceMeta.left,
  });

  const section2Col2 = drawColumn({
    doc,
    x: x + columnWidth + 5,
    y: secondSectionY,
    labelWidth: 54,
    rows: invoiceMeta.middle,
  });

  if (invoiceMeta.qrImagePath) {
    doc.image(
      path.join(__dirname, invoiceMeta.qrImagePath),
      pageWidth - 86,
      headerHeight + 42,
      { width: 60 },
    );
  }

  const bottomY2 = Math.max(section2Col1, section2Col2);

  doc
    .strokeColor(BORDER_COLOR)
    .lineWidth(0.6)
    .moveTo(x, bottomY2 + 8)
    .lineTo(x + boxWidth, bottomY2 + 8)
    .stroke();

  /* ---------- SPARE PARTS TABLE ---------- */

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
      .text(`Spare Total : ₹${SpareTotal}`, pageWidth - 230, tableEndY + 5, {
        width: 200,
        align: "right",
      });
  }

  const servicesTableStartY =
    servicesRows?.length > 0 ? tableEndY + 35 : tableEndY;

  if (servicesRows?.length > 0) {
    doc
      .fillColor(LABEL_COLOR)
      .font(FONT_BOLD)
      .fontSize(8)
      .text("Service & Package", x, tableEndY + 30 - doc.currentLineHeight());
  }

  const servicesTableEndY =
    servicesRows?.length > 0
      ? drawServiceTable({
          doc,
          x,
          startY: servicesTableStartY,
          headers: servicesHeaders,
          rows: servicesRows,
          columnWidths: servicesColumnWidths,
          headerHeight,
        })
      : servicesTableStartY;

  if (servicesRows?.length > 0) {
    doc
      .fillColor(LABEL_COLOR)
      .font(FONT_SEMIBOLD)
      .fontSize(8)
      .text(
        `Labour Total : ₹${ServiceTotal}`,
        pageWidth - 230,
        servicesTableEndY + 5,
        {
          width: 200,
          align: "right",
        },
      );
  }
  /* ---------- AMOUNT IN WORDS BOX ---------- */

  const padding = 6;
  const totalPriceBoxWidth = sparePartsColumnWidths.reduce(
    (a: number, b: number) => a + b,
    0,
  );

  const textHeight = doc.heightOfString(totalAmountInWords, {
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
    .text(totalAmountInWords, x + padding, totalPriceBoxY + padding, {
      width: totalPriceBoxWidth - padding * 2,
    });

  const widthOfRightTotal = doc.widthOfString(`₹ ${totalAmount}`, {
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
    .text(`₹ ${totalAmount}`, x, totalPriceBoxY + padding, {
      width: totalPriceBoxWidth - 5,
      align: "right",
    });

  /* ---------- GST TABLE ---------- */
  let gstHeaderHeight = 0;
  let gstTableY = totalPriceBoxY + 33;

  gstTableHeaders.forEach((cell: any, i: any) => {
    const h = doc.heightOfString(cell, {
      width: gstTableColumnWidths[i] - 6,
    });
    gstHeaderHeight = Math.max(gstHeaderHeight, h);
  });

  gstHeaderHeight += 8; // padding

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
    gstTableY = headerHeight + 10;
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
      .fontSize(7)
      .text(cell, tableCellX + 3, gstTableY + 4, {
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
        .text(String(cell ?? ""), rowX + 3, tableRowY + 4, {
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
      totalPriceY = headerHeight + 10;

      summaryEndedOnNewPage = true;
      summaryEndPage = currentPage;
    }

    if (
      Number(item?.value) > 0 ||
      item?.label === "Balance Total" ||
      item?.label === "Pending Do" ||
      item?.label === "File Charge"
    ) {
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

  // terms and conditon data

  doc.fontSize(7);

  let bankStartX;
  let bankStartY;

  if (summaryEndedOnNewPage) {
    bankStartY = headerHeight + 10;
    bankStartX = 20;
  } else {
    bankStartY = tableRowY + 15;
    bankStartX = 25;
  }

  let bankY = bankStartY;

  doc.font(FONT_BOLD).text("BANK DETAILS", bankStartX, bankY);

  bankDetails.forEach((item: any, idx: any) => {
    const text = `${item.label} ${item.value}`;
    const labelWidth = 62;

    const lineHeight = doc.heightOfString(text, {
      width: boxWidth - 130,
    });

    doc
      .font(FONT_SEMIBOLD)
      .fillColor("#333333")
      .text(item.label, bankStartX, bankY + 15);

    doc
      .font(FONT_REGULAR)
      .fillColor("#333333")
      .text(item.value, labelWidth + bankStartX, bankY + 15);

    bankY += lineHeight + 4;
  });

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

  let termsY = bankY + 50;
  let termsStartX = 20;

  if (termsY + totalTermsHeight > doc.page.height - 40) {
    doc.addPage();
    termsY = headerHeight + 23;
  }

  doc.font(FONT_BOLD).text("TERMS & CONDITIONS", termsStartX, termsY - 15);

  termsAndConditions.forEach((text: any, index: any) => {
    const numberedText = `${index + 1}. ${text}`;

    const textHeight = doc.heightOfString(numberedText, {
      width: boxWidth,
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

  doc.font(FONT_BOLD).text("CUSTOMER SIGNATURE", termsStartX, termsY + 30);

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
