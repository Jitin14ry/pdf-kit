import express from "express";
import bodyParser from "body-parser";
import sparePartInvoice from "./sparePartInvoice.js";
import estimateInvoice from "./bookingEstimatePdf.js";
import gstInvoice from "./gstInvoice.js";
import purchaseInvoice from "./purchaseInvoice.js";
import bookingEstimateWithoutC from "./bookingEstimateWithoutC.js";
import jobCard from "./jobCard.js";
import claimInvoice from "./claimInvoice.js";
import gatePass from "./gatePass.js";

const app = express();
app.use(bodyParser.json());

const PORT = 3000;

// Route to generate and download PDF
app.get("/download-pdf", (req, res) => {
  gstInvoice(res);
});

app.listen(PORT, () => {
  console.log(`Server Running At http://localhost:${PORT}`);
});

// /download-pdf
