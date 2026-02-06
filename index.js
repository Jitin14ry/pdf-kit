import express from "express";
import bodyParser from "body-parser";
import sparePartInvoice from "./sparePartInvoice.js";
import estimateInvoice from "./bookingEstimatePdf.js";
import serviceInvoice from "./serviceInvoice.js";
import bookingEstimateWithoutC from "./bookingEstimateWithoutC.js";
import jobCard from "./jobCard.js";

const app = express();
app.use(bodyParser.json());

const PORT = 3000;

// Route to generate and download PDF
app.get("/download-pdf", (req, res) => {
  sparePartInvoice(res);
});

app.listen(PORT, () => {
  console.log(`Server Running At http://localhost:${PORT}`);
});

// /download-pdf
