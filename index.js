import express from "express";
import bodyParser from "body-parser";
import generateInvoice from "./generateInvoice.js"
const app = express();
app.use(bodyParser.json());

const PORT = 3000;

// Route to generate and download PDF
app.get("/download-pdf", (req, res) => {
    generateInvoice(res);
});

app.listen(PORT, () => {
    console.log(`Server Running At http://localhost:${PORT}`);
});