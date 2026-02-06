import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

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

// table data

const tableHeader = [
  "Spare/Service Description",
  "Product Code",
  "HSN/SAC",
  "MRP",
  "Dis (₹)",
  "Quantity",
  "Value",
];

const tableColumnWidths = [180, 76, 76, 60, 45, 50, 73];

const tableRows = [
  {
    name: "Some Noise Coming In Jumping Rod Bush ",
    jobSheet: [
      {
        name: "Jumping Road Bush Replacement ",
        count: 1,
        type: "Service",
        price: 1500,
        discount: 0,
        discountPercent: 0,
        tax: 228.81,
        discountedPrice: 1500,
        total: 1500,
        taxRate: 18,
        status: "approved",
      },
      {
        name: "Brake Shoe Replacement ",
        count: 1,
        type: "Product",
        productCode: "PRT89348204",
        price: 2500,
        discount: 125,
        discountPercent: 5,
        tax: 258.81,
        discountedPrice: 2375,
        total: 2375,
        taxRate: 18,
        status: "deny",
      },
    ],
  },
  {
    name: "Front Bumper Damage",
    jobSheet: [
      {
        name: "Denting & Painting",
        count: 1,
        type: "Service",
        price: 3500,
        discount: 700,
        discountPercent: 20,
        tax: 240.81,
        discountedPrice: 2800,
        total: 2800,
        taxRate: 18,
      },
      {
        name: "Basic Service",
        count: 1,
        type: "Product",
        productCode: "PRT89348200",
        hsnCode: "HSN43677833",
        price: 4500,
        discount: 450,
        discountPercent: 10,
        tax: 250.81,
        discountedPrice: 4050,
        total: 4050,
        taxRate: 18,
      },
    ],
  },
  {
    name: "Some Noise Coming In Jumping Rod Bush ",
    jobSheet: [
      {
        name: "Jumping Road Bush Replacement ",
        count: 1,
        type: "Service",
        price: 1500,
        discount: 0,
        discountPercent: 0,
        tax: 228.81,
        discountedPrice: 1500,
        total: 1500,
        taxRate: 18,
      },
      {
        name: "Brake Shoe Replacement ",
        count: 1,
        type: "Product",
        productCode: "PRT89348204",
        price: 2500,
        discount: 125,
        discountPercent: 5,
        tax: 258.81,
        discountedPrice: 2375,
        total: 2375,
        taxRate: 18,
      },
    ],
  },
  {
    name: "Front Bumper Damage",
    jobSheet: [
      {
        name: "Denting & Painting",
        count: 1,
        type: "Service",
        price: 3500,
        discount: 700,
        discountPercent: 20,
        tax: 240.81,
        discountedPrice: 2800,
        total: 2800,
        taxRate: 18,
      },
      {
        name: "Basic Service",
        count: 1,
        type: "Product",
        productCode: "PRT89348200",
        hsnCode: "HSN43677833",
        price: 4500,
        discount: 450,
        discountPercent: 10,
        tax: 250.81,
        discountedPrice: 4050,
        total: 4050,
        taxRate: 18,
      },
      {
        name: "Basic Service",
        count: 1,
        type: "Product",
        productCode: "PRT89348200",
        hsnCode: "HSN43677833",
        price: 4500,
        discount: 450,
        discountPercent: 10,
        tax: 250.81,
        discountedPrice: 4050,
        total: 4050,
        taxRate: 18,
      },
    ],
  },
  {
    name: "Some Noise Coming In Jumping Rod Bush ",
    jobSheet: [
      {
        name: "Jumping Road Bush Replacement ",
        count: 1,
        type: "Service",
        price: 1500,
        discount: 0,
        discountPercent: 0,
        tax: 228.81,
        discountedPrice: 1500,
        total: 1500,
        taxRate: 18,
      },
      {
        name: "Brake Shoe Replacement ",
        count: 1,
        type: "Product",
        productCode: "PRT89348204",
        price: 2500,
        discount: 125,
        discountPercent: 5,
        tax: 258.81,
        discountedPrice: 2375,
        total: 2375,
        taxRate: 18,
        status: "deny",
      },
    ],
  },
  {
    name: "Front Bumper Damage",
    jobSheet: [
      {
        name: "Denting & Painting",
        count: 1,
        type: "Service",
        price: 3500,
        discount: 700,
        discountPercent: 20,
        tax: 240.81,
        discountedPrice: 2800,
        total: 2800,
        taxRate: 18,
      },
      {
        name: "Basic Service",
        count: 1,
        type: "Product",
        productCode: "PRT89348200",
        hsnCode: "HSN43677833",
        price: 4500,
        discount: 450,
        discountPercent: 10,
        tax: 250.81,
        discountedPrice: 4050,
        total: 4050,
        taxRate: 18,
      },
    ],
  },
  {
    name: "Some Noise Coming In Jumping Rod Bush ",
    jobSheet: [
      {
        name: "Jumping Road Bush Replacement ",
        count: 1,
        type: "Service",
        price: 1500,
        discount: 0,
        discountPercent: 0,
        tax: 228.81,
        discountedPrice: 1500,
        total: 1500,
        taxRate: 18,
      },
      {
        name: "Brake Shoe Replacement ",
        count: 1,
        type: "Product",
        productCode: "PRT89348204",
        price: 2500,
        discount: 125,
        discountPercent: 5,
        tax: 258.81,
        discountedPrice: 2375,
        total: 2375,
        taxRate: 18,
      },
    ],
  },
  {
    name: "Front Bumper Damage",
    jobSheet: [
      {
        name: "Denting & Painting",
        count: 1,
        type: "Service",
        price: 3500,
        discount: 700,
        discountPercent: 20,
        tax: 240.81,
        discountedPrice: 2800,
        total: 2800,
        taxRate: 18,
      },
      {
        name: "Basic Service",
        count: 1,
        type: "Product",
        productCode: "PRT89348200",
        hsnCode: "HSN43677833",
        price: 4500,
        discount: 450,
        discountPercent: 10,
        tax: 250.81,
        discountedPrice: 4050,
        total: 4050,
        taxRate: 18,
      },
    ],
  },
  {
    name: "Front Bumper Damage",
    jobSheet: [
      {
        name: "Denting & Painting",
        count: 1,
        type: "Service",
        price: 3500,
        discount: 700,
        discountPercent: 20,
        tax: 240.81,
        discountedPrice: 2800,
        total: 2800,
        taxRate: 18,
        status: "deny",
      },
      {
        name: "Basic Service",
        count: 1,
        type: "Product",
        productCode: "PRT89348200",
        hsnCode: "HSN43677833",
        price: 4500,
        discount: 450,
        discountPercent: 10,
        tax: 250.81,
        discountedPrice: 4050,
        total: 4050,
        taxRate: 18,
      },
    ],
  },
  // {
  //   name: "Front Bumper Damage",
  //   jobSheet: [
  //     {
  //       name: "Denting & Painting",
  //       count: 1,
  //       type: "Service",
  //       price: 3500,
  //       discount: 700,
  //       discountPercent: 20,
  //       tax: 240.81,
  //       discountedPrice: 2800,
  //       total: 2800,
  //       taxRate: 18,
  //     },
  //     {
  //       name: "Basic Service",
  //       count: 1,
  //       type: "Product",
  //       productCode: "PRT89348200",
  //       hsnCode: "HSN43677833",
  //       price: 4500,
  //       discount: 450,
  //       discountPercent: 10,
  //       tax: 250.81,
  //       discountedPrice: 4050,
  //       total: 4050,
  //       taxRate: 18,
  //     },
  //     {
  //       name: "Basic Service",
  //       count: 1,
  //       type: "Product",
  //       productCode: "PRT89348200",
  //       hsnCode: "HSN43677833",
  //       price: 4500,
  //       discount: 450,
  //       discountPercent: 10,
  //       tax: 250.81,
  //       discountedPrice: 4050,
  //       total: 4050,
  //       taxRate: 18,
  //       status: "deny",
  //     },
  //     {
  //       name: "Basic Service",
  //       count: 1,
  //       type: "Product",
  //       productCode: "PRT89348200",
  //       hsnCode: "HSN43677833",
  //       price: 4500,
  //       discount: 450,
  //       discountPercent: 10,
  //       tax: 250.81,
  //       discountedPrice: 4050,
  //       total: 4050,
  //       taxRate: 18,
  //     },
  //     {
  //       name: "Basic Service",
  //       count: 1,
  //       type: "Product",
  //       productCode: "PRT89348200",
  //       hsnCode: "HSN43677833",
  //       price: 4500,
  //       discount: 450,
  //       discountPercent: 10,
  //       tax: 250.81,
  //       discountedPrice: 4050,
  //       total: 4050,
  //       taxRate: 18,
  //       status: "deny",
  //     },
  //     {
  //       name: "Basic Service",
  //       count: 1,
  //       type: "Product",
  //       productCode: "PRT89348200",
  //       hsnCode: "HSN43677833",
  //       price: 4500,
  //       discount: 450,
  //       discountPercent: 10,
  //       tax: 250.81,
  //       discountedPrice: 4050,
  //       total: 4050,
  //       taxRate: 18,
  //     },
  //   ],
  // },
  {
    name: "Front Bumper Damage",
    jobSheet: [
      {
        name: "Denting & Painting",
        count: 1,
        type: "Service",
        price: 3500,
        discount: 700,
        discountPercent: 20,
        tax: 240.81,
        discountedPrice: 2800,
        total: 2800,
        taxRate: 18,
      },
      {
        name: "Basic Service",
        count: 1,
        type: "Product",
        productCode: "PRT89348200",
        hsnCode: "HSN43677833",
        price: 4500,
        discount: 450,
        discountPercent: 10,
        tax: 250.81,
        discountedPrice: 4050,
        total: 4050,
        taxRate: 18,
      },
    ],
  },
  // {
  //   name: "Front Bumper Damage",
  //   jobSheet: [
  //     {
  //       name: "Denting & Painting",
  //       count: 1,
  //       type: "Service",
  //       price: 3500,
  //       discount: 700,
  //       discountPercent: 20,
  //       tax: 240.81,
  //       discountedPrice: 2800,
  //       total: 2800,
  //       taxRate: 18,
  //     },
  //     {
  //       name: "Basic Service",
  //       count: 1,
  //       type: "Product",
  //       productCode: "PRT89348200",
  //       hsnCode: "HSN43677833",
  //       price: 4500,
  //       discount: 450,
  //       discountPercent: 10,
  //       tax: 250.81,
  //       discountedPrice: 4050,
  //       total: 4050,
  //       taxRate: 18,
  //     },
  //   ],
  // },
  // {
  //   name: "Front Bumper Damage",
  //   jobSheet: [
  //     {
  //       name: "Denting & Painting",
  //       count: 1,
  //       type: "Service",
  //       price: 3500,
  //       discount: 700,
  //       discountPercent: 20,
  //       tax: 240.81,
  //       discountedPrice: 2800,
  //       total: 2800,
  //       taxRate: 18,
  //     },
  //     {
  //       name: "Basic Service",
  //       count: 1,
  //       type: "Product",
  //       productCode: "PRT89348200",
  //       hsnCode: "HSN43677833",
  //       price: 4500,
  //       discount: 450,
  //       discountPercent: 10,
  //       tax: 250.81,
  //       discountedPrice: 4050,
  //       total: 4050,
  //       taxRate: 18,
  //     },
  //   ],
  // },
];

// physical concerns

const garageVehicleImages = [
  {
    fileUrl:
      "https://pikpart-testing.s3.ap-south-1.amazonaws.com/1000001880.jpg",
  },
  {
    fileUrl:
      "https://pikpart-testing.s3.ap-south-1.amazonaws.com/1000001869.jpg",
  },
  {
    fileUrl:
      "https://pikpart-testing.s3.ap-south-1.amazonaws.com/1000001849.jpg",
  },
  {
    fileUrl:
      "https://pikpart-testing.s3.ap-south-1.amazonaws.com/1000001880.jpg",
  },
  {
    fileUrl:
      "https://pikpart-testing.s3.ap-south-1.amazonaws.com/1000001869.jpg",
  },
  {
    fileUrl:
      "https://pikpart-testing.s3.ap-south-1.amazonaws.com/1000001849.jpg",
  },
  {
    fileUrl:
      "https://pikpart-testing.s3.ap-south-1.amazonaws.com/1000001880.jpg",
  },
  {
    fileUrl:
      "https://pikpart-testing.s3.ap-south-1.amazonaws.com/1000001869.jpg",
  },
  {
    fileUrl:
      "https://pikpart-testing.s3.ap-south-1.amazonaws.com/1000001849.jpg",
  },
];

const allImages = [
  {
    name: "Back",
    images: [
      {
        name: "Image 1",
        url: "https://pikpart-testing.s3.ap-south-1.amazonaws.com/1000001849.jpg",
      },
      {
        name: "Image 2",
        url: "https://pikpart-testing.s3.ap-south-1.amazonaws.com/1000001849.jpg",
      },
    ],
  },
  {
    name: "Front",
    images: [
      {
        name: "Image 1",
        url: "https://pikpart-testing.s3.ap-south-1.amazonaws.com/1000001882.jpg",
      },
      {
        name: "Image 2",
        url: "https://pikpart-testing.s3.ap-south-1.amazonaws.com/1000001882.jpg",
      },
      {
        name: "Image 3",
        url: "https://pikpart-testing.s3.ap-south-1.amazonaws.com/1000001882.jpg",
      },
    ],
  },
];

// accessories

const garageOthers = [
  {
    name: "Mud Flap",
    qty: 4,
  },
  {
    name: "Wheel Cover",
    qty: 4,
  },
  {
    name: "Speaker",
    qty: 4,
  },
  {
    name: "Floor Mat",
    qty: 4,
  },
];

const allAccessories = [
  "Perfume",
  "Charger",
  "Bottle",
  "Perfume",
  "Perfume",
  "Charger",
  "Bottle",
  "Perfume",
  "Perfume",
  "Charger",
  "Bottle",
  "Perfume",
];

const HealthData = [
  {
    name: "Good",
    list: [
      "Tire Pressure",
      "Engine",
      "Door Lock",
      "Wiper",
      "Engine Oil Check",
      "Brake System",
      "Battery Condition",
    ],
  },
  {
    name: "Not Good",
    list: [
      "Tire Pressure",
      "Engine",
      "Door Lock",
      "Wiper",
      "Engine Oil Check",
      "Brake System",
      "Battery Condition",
    ],
  },
  {
    name: "Not Good",
    list: [],
  },
];

const pickupRemarks = [
  "Engine Making Noise",
  "Tyre Puncture",
  "Brake System Malfunction",
  "Transmission Issue",
  "Brake System Malfunction",
  "Transmission Issue",
  "Brake System Malfunction",
  "Transmission Issue",
  "Transmission Issue",
];

const termsAndConditions = [
  "Subject to Faridabad Jurisdiction.",
  "Our Responsibility ceases as soon as goods leaves our premises.",
  "Goods once Sold will not be taken back.",
  "By signing this Tax Invoice, you agree to the added labour and parts specified. We take great care during service, but Pikpart is not liable for any damage that may occur during service.",
];

const getImageBuffer = (url) => {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const data = [];
        res.on("data", (chunk) => data.push(chunk));
        res.on("end", () => resolve(Buffer.concat(data)));
      })
      .on("error", reject);
  });
};

async function renderAllImageSections(doc, allImages, startY) {
  const imageWidth = 70;
  const imageHeight = 65;
  const gap = 10;

  let imageX = 20;
  let imageY = startY;
  let titleY = startY;

  for (let s = 0; s < allImages.length; s++) {
    const section = allImages[s];

    // ---- PAGE BREAK CHECK (before title) ----
    if (imageY + imageHeight > doc.page.height - 70) {
      doc.addPage();
      imageY = 110;
      imageX = 20;
    }

    // ---- IMAGES ----
    for (let i = 0; i < section.images.length; i++) {
      const item = section.images[i];

      // horizontal overflow → new row
      if (imageX + imageWidth > doc.page.width - 20) {
        imageX = 20;
        imageY += imageHeight + gap + 20;
        titleY += imageHeight + gap + 20;
      }

      // vertical overflow → new page
      if (imageY + imageHeight > doc.page.height - 70) {
        doc.addPage();
        imageY = 110;
        imageX = 20;
      }

      const buffer = await getImageBuffer(item.url);

      const radius = 4;

      doc.save(); // important

      doc
        .roundedRect(imageX, imageY + 20, imageWidth, imageHeight, radius)
        .clip();

      doc.image(buffer, imageX, imageY + 20, {
        width: imageWidth,
        height: imageHeight,
      });

      doc.restore();

      doc
        .font(FONT_SEMIBOLD)
        .fillColor("#333")
        .text(item.name, imageX, imageY + imageHeight + 25, {
          width: imageWidth,
          align: "left",
        });

      imageX += imageWidth + gap;
    }

    imageX += 25;
  }

  return imageY + imageHeight;
}

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
    .text("Job Card", boxWidth - 59, y + 22);

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
  const y = 135;
  const boxWidth = 550;
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

const drawTableRow = ({
  doc,
  x,
  y,
  row,
  columnWidths,
  isHeader = false,
  item,
}) => {
  let maxHeight = 0;

  doc.font(isHeader ? FONT_SEMIBOLD : FONT_REGULAR).fontSize(7);

  // Calculate row height
  row.forEach((cell, i) => {
    const height = doc.heightOfString(
      isHeader || i !== 0 ? String(cell) : cell.name,
      { width: columnWidths[i] - 6 },
    );
    maxHeight = Math.max(maxHeight, height + 10);
  });

  let currentX = x;

  row.forEach((cell, i) => {
    if (!isHeader && i === 0) {
      // ICON BASED ON TYPE
      if (item?.status == "deny") {
        doc.rect(currentX - 5, y, 560, 18).fill("#FFF3EF");
      }
      const iconPath =
        cell.type === "Service"
          ? path.join(__dirname, "assets/Service.png")
          : path.join(__dirname, "assets/Spare.png");

      doc.image(iconPath, currentX - 2, y + 3, { width: 12 });

      // TEXT FOR FIRST COLUMN
      doc
        .fillColor(item?.status == "deny" ? "#888888" : "#333333")
        .text(cell.name, currentX + 13, y + 5, {
          width: columnWidths[i] - 6,
          align: "left",
        });
    } else {
      doc
        .fillColor(
          isHeader ? "#060606" : item?.status == "deny" ? "#888888" : "#333333",
        )
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

    if (item?.status == "deny") {
      doc
        .moveTo(currentX - 5, y + 9)
        .lineTo(x - 5 + columnWidths.reduce((a, b) => a + b, 0), y + 9)
        .lineWidth(0.2)
        .strokeColor("#CD2A00")
        .stroke();
    }
    currentX += columnWidths[i];
  });

  // Bottom border
  doc
    .moveTo(x - 5, y + maxHeight)
    .lineTo(x - 5 + columnWidths.reduce((a, b) => a + b, 0), y + maxHeight)
    .lineWidth(0.2)
    .strokeColor("#f0f0f0")
    .stroke();

  return maxHeight;
};

const drawGroupRow = ({ doc, x, y, text, columnWidths }) => {
  const rowHeight = 18;
  const totalWidth = columnWidths.reduce((a, b) => a + b, 0);

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

const drawItemsTable = ({ doc, x, startY, headers, rows, columnWidths }) => {
  const topMargin = 10;
  const bottomMargin = 40;

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

  rows.forEach((parent) => {
    /* --------- CHECK PAGE BREAK FOR GROUP ROW --------- */
    if (y + 20 > doc.page.height - bottomMargin) {
      doc.addPage();
      y = 120;

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
    parent.jobSheet.forEach((item) => {
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

      if (y + estimatedHeight > doc.page.height - bottomMargin) {
        doc.addPage();
        y = 120;

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
        item,
      });
    });
  });

  return y;
};

const jobCardPdf = async (res) => {
  const doc = new PDFDocument({ size: "A4", margin: 10, bufferPages: true });

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
  res.setHeader("Content-Disposition", 'inline; filename="jobCard.pdf"');

  doc.pipe(res);
  doc.fontSize(7);
  doc.on("pageAdded", () => {
    repeatingHeader(doc);
  });

  repeatingHeader(doc);

  const infoSectionHeight = repeatingInfo(doc);

  const tableStartY = infoSectionHeight + 20;

  const tableEndY = drawItemsTable({
    doc,
    x: 20,
    startY: tableStartY,
    headers: tableHeader,
    rows: tableRows,
    columnWidths: tableColumnWidths,
  });

  doc
    .font(FONT_SEMIBOLD)
    .fillColor("#333333")
    .text("Spare Total: ₹12900", boxWidth - 120, tableEndY + 10);

  doc
    .font(FONT_SEMIBOLD)
    .fillColor("#333333")
    .text("Labor Total: ₹12900", boxWidth - 40, tableEndY + 10);

  const padding = 6;
  const rectHeight = 22;
  let TotalBoxY = tableEndY + 30;

  if (TotalBoxY + rectHeight > doc.page.height - 40) {
    doc.addPage();
    TotalBoxY = 125;
  }

  doc.rect(15, TotalBoxY, boxWidth + 10, rectHeight).fill("#F6F8FC");

  doc.fillColor("#333333");

  doc
    .fontSize(8)
    .font(FONT_BOLD)
    .text(
      "Amount in words: ₹ One Lakh Twenty Three Thousand Eight Hundred Thirty Rupees Only",
      20,
      TotalBoxY + padding,
      { width: boxWidth - 2 * padding },
    );

  doc
    .fontSize(8)
    .font(FONT_BOLD)
    .text(`Total: ₹ ${13790.0}`, 20, TotalBoxY + padding, {
      width: boxWidth - 5,
      align: "right",
    });

  doc.fontSize(7);

  const physicalConcernHeadingY = TotalBoxY + 30;

  const headBoxHeight = 17;

  doc
    .rect(15, physicalConcernHeadingY, boxWidth + 10, headBoxHeight)
    .fill("#F6F8FC");

  doc
    .fillColor("#333333")
    .font(FONT_BOLD)
    .text("Images -", 20, physicalConcernHeadingY + 4, {
      width: boxWidth - 2 * padding,
    });

  const imageSectionHeight = await renderAllImageSections(
    doc,
    allImages,
    physicalConcernHeadingY + 10,
  );

  const gap = 15;

  const columnWidth = boxWidth / 2;

  const leftX = 15;
  const rightX = doc.page.width - columnWidth - 20;

  let firstBoxRowY = imageSectionHeight + padding + 40;

  if (firstBoxRowY + headBoxHeight + 5 > doc.page.height - 40) {
    doc.addPage();
    firstBoxRowY = 130;
  }

  doc
    .rect(leftX, firstBoxRowY, columnWidth, headBoxHeight)
    .fill("#F6F8FC")
    .stroke();

  doc
    .rect(rightX, firstBoxRowY, columnWidth, headBoxHeight)
    .fill("#F6F8FC")
    .stroke();

  doc
    .fontSize(7)
    .font(FONT_SEMIBOLD)
    .fillColor("#060606")
    .text("Driver Concern Audio", leftX + 5, firstBoxRowY + 4);

  const textWidth1 = doc.widthOfString("Driver Concern Audio");

  doc
    .fillColor("#888888")
    .text("(Click on link)", leftX + textWidth1 + 8, firstBoxRowY + 4);

  doc.fillColor("#2869B8").text("Audio Link", leftX, firstBoxRowY + 4, {
    width: columnWidth - 10,
    align: "right",
    link: "https://example.com/audio",
    // underline: true,
  });

  doc
    .strokeColor("#2869B8")
    .lineWidth(0.5)
    .moveTo(columnWidth - 30, firstBoxRowY + 13)
    .lineTo(columnWidth + 5, firstBoxRowY + 13)
    .stroke();

  doc
    .fillColor("#060606")
    .text("360 Degree Video", rightX + 5, firstBoxRowY + 4);

  const textWidth3 = doc.widthOfString("360 Degree Video");

  doc
    .fillColor("#888888")
    .text("(Click on link)", rightX + textWidth3 + 8, firstBoxRowY + 4);

  doc.fillColor("#2869B8").text("Video Link", rightX, firstBoxRowY + 4, {
    width: columnWidth - 10,
    align: "right",
    link: "https://example.com/audio",
  });

  doc
    .strokeColor("#2869B8")
    .lineWidth(0.5)
    .moveTo(rightX + columnWidth - 45, firstBoxRowY + 13)
    .lineTo(rightX + columnWidth - 10, firstBoxRowY + 13)
    .stroke();

  let secondBoxRowY = firstBoxRowY;

  if (secondBoxRowY + headBoxHeight + 5 > doc.page.height - 60) {
    doc.addPage();
    secondBoxRowY = 100;
  }

  doc
    .rect(leftX, secondBoxRowY + headBoxHeight + 10, columnWidth, headBoxHeight)
    .fill("#F6F8FC")
    .stroke();
  doc
    .rect(
      rightX,
      secondBoxRowY + headBoxHeight + 10,
      columnWidth,
      headBoxHeight,
    )
    .fill("#F6F8FC")
    .stroke();

  doc
    .font(FONT_SEMIBOLD)
    .fillColor("#060606")
    .text(
      "Fuel Quantity -",
      leftX + 5,
      secondBoxRowY + headBoxHeight + gap - 1,
    );

  const textWidth2 = doc.widthOfString("Fuel Quantity -");

  doc
    .fillColor("#E04B24")
    .text(
      "80%",
      leftX + textWidth2 + 8,
      secondBoxRowY + headBoxHeight + gap - 1,
    );

  doc
    .fillColor("#060606")
    .text("Odometer -", rightX + 5, secondBoxRowY + headBoxHeight + gap - 1);

  const textWidth4 = doc.widthOfString("Odometer -");

  doc
    .fillColor("#E04B24")
    .text(
      "837424 km",
      rightX + textWidth4 + 8,
      secondBoxRowY + headBoxHeight + gap - 1,
    );

  let accessoriesStartY = secondBoxRowY + headBoxHeight * 3 + 5;

  doc
    .rect(leftX, accessoriesStartY, boxWidth + 10, headBoxHeight)
    .fill("#F6F8FC")
    .stroke();

  doc
    .font(FONT_SEMIBOLD)
    .fillColor("#060606")
    .text("Accessories", leftX + 5, accessoriesStartY + 4);

  let accessoriesColumn = boxWidth / 4;
  let accessoriesX = 20;
  let accessoriesY = accessoriesStartY + 25;

  let rowMaxHeight = 0;

  garageOthers.forEach((item, index) => {
    if (index % 4 === 0 && index !== 0) {
      accessoriesX = 20;
      accessoriesY += rowMaxHeight + 6;
      rowMaxHeight = 0;
    }

    const textHeight = doc.heightOfString(`${item?.name} : ${item?.qty}`, {
      width: accessoriesColumn - 10,
    });

    if (accessoriesY + textHeight > doc.page.height - 40) {
      doc.addPage();
      accessoriesY = 125;
    }

    doc
      .fillColor("#333333")
      .font(FONT_REGULAR)
      .text(`${item?.name} : ${item?.qty}`, accessoriesX, accessoriesY, {
        width: accessoriesColumn - 10,
      });

    rowMaxHeight = Math.max(rowMaxHeight, textHeight);

    accessoriesX += accessoriesColumn + 6;
  });

  let accessoriesNewX = 20;
  let accessoriesNewY = accessoriesY + 25;

  allAccessories.forEach((item, index) => {
    if (index % 4 === 0 && index !== 0) {
      accessoriesNewX = 20;
      accessoriesNewY += rowMaxHeight + 6;
      rowMaxHeight = 0;
    }

    const textHeight = doc.heightOfString(`• ${item}`, {
      width: accessoriesColumn - 10,
    });

    if (accessoriesNewY + textHeight > doc.page.height - 40) {
      doc.addPage();
      accessoriesNewY = 125;
    }

    doc
      .fillColor("#888888")
      .font(FONT_REGULAR)
      .text(`• ${item}`, accessoriesNewX, accessoriesNewY, {
        width: accessoriesColumn - 10,
      });

    rowMaxHeight = Math.max(rowMaxHeight, textHeight);

    // Move to next column
    accessoriesNewX += accessoriesColumn + 6;
  });

  let HealthColumn = boxWidth / 4;
  let HealthStartY = accessoriesNewY + 24;
  let HealthDataX = 20;
  let HealthDataY = HealthStartY + 24;

  if (HealthDataY > doc.page.height - 40) {
    doc.addPage();
    HealthStartY = 130;
    HealthDataY = HealthStartY + 24;
  }

  doc
    .rect(leftX, HealthStartY, boxWidth + 5, headBoxHeight)
    .fill("#F6F8FC")
    .stroke();

  doc
    .fillColor("#060606")
    .font(FONT_SEMIBOLD)
    .text("Vehicle Health Check-up", leftX + 5, HealthStartY + 4);

  HealthData?.forEach((item) => {
    if (HealthDataY > doc.page.height - 50) {
      doc.addPage();
      HealthDataY = 130;
    }

    if (item?.list?.length > 0) {
      doc
        .fillColor("#34C759")
        .font(FONT_REGULAR)
        .text(item?.name, leftX + 5, HealthDataY, {
          width: HealthColumn - 10,
        });
    }

    item?.list?.forEach((item, idx) => {
      if (idx % 4 === 0 && idx !== 0) {
        HealthDataX = 20;
        HealthDataY += rowMaxHeight + 6;
        rowMaxHeight = 0;
      }

      const textHeight = doc.heightOfString(`• ${item}`, {
        width: HealthColumn - 10,
      });

      if (HealthDataY + textHeight > doc.page.height - 50) {
        doc.addPage();
        HealthDataY = 110;
      }

      doc
        .fillColor("#333333")
        .font(FONT_REGULAR)
        .text(`• ${item}`, HealthDataX, HealthDataY + 15, {
          width: HealthColumn - 10,
        });

      rowMaxHeight = Math.max(rowMaxHeight, textHeight);

      HealthDataX += HealthColumn + 6;
    });

    if (item?.list?.length > 0) {
      HealthDataY += 30;
      HealthDataX = 20;
    }
  });

  let RemarkStartY = HealthDataY + 10;

  const drawRemarkHeader = () => {
    doc
      .rect(leftX, RemarkStartY, boxWidth + 5, headBoxHeight)
      .fill("#F6F8FC")
      .stroke();

    doc
      .fillColor("#060606")
      .font(FONT_SEMIBOLD)
      .text("Pickup Remark", leftX + 5, RemarkStartY + 4);
  };

  drawRemarkHeader();

  let RemarkDataX = 20;
  let RemarkDataY = RemarkStartY + 25;
  let RemarkColumn = boxWidth / 2;

  pickupRemarks.forEach((item, idx) => {
    if (idx % 2 === 0 && idx !== 0) {
      RemarkDataX = 20;
      RemarkDataY += rowMaxHeight + 6;
      rowMaxHeight = 0;
    }

    const textHeight = doc.heightOfString(`• ${item}`, {
      width: RemarkColumn - 10,
    });

    if (RemarkDataY + textHeight > doc.page.height - 50) {
      doc.addPage();

      RemarkStartY = 110;
      RemarkDataY = RemarkStartY + 15;
    }

    doc
      .fillColor("#333333")
      .font(FONT_REGULAR)
      .text(`• ${item}`, RemarkDataX, RemarkDataY, {
        width: RemarkColumn - 10,
      });

    rowMaxHeight = Math.max(rowMaxHeight, textHeight);

    RemarkDataX += RemarkColumn + 6;
  });

  doc
    .strokeColor("#C7CED5")
    .lineWidth(0.5)
    .moveTo(leftX, RemarkDataY + 18)
    .lineTo(boxWidth + 20, RemarkDataY + 18)
    .stroke();

  let termsY = RemarkDataY + 25;

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
    termsY = 145;
  }

  doc.font(FONT_BOLD).text("TERMS & CONDITIONS", 20, termsY);

  termsAndConditions.forEach((text, index) => {
    const numberedText = `${index + 1}. ${text}`;

    const textHeight = doc.heightOfString(numberedText, {
      width: boxWidth - 12,
    });

    doc
      .font(FONT_REGULAR)
      .fillColor("#333333")
      .text(numberedText, 20, termsY + 15, { width: boxWidth - 12 });

    termsY += textHeight + 3;
  });

  doc.font(FONT_SEMIBOLD).text("Declaration : ", 20, termsY + 20);

  doc
    .font(FONT_REGULAR)
    .text(
      "The final amount of this estimate may vary by up to ±10% based on actual requirements and execution.",
      63,
      termsY + 20,
    );

  doc
    .font(FONT_SEMIBOLD)
    .text("Customer Signature".toUpperCase(), 20, termsY + 40);

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

export default jobCardPdf;
