const express = require("express");
const puppeteer = require("puppeteer"); // ตัวเต็ม
const ejs = require("ejs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.post("/generate-pdf", async (req, res) => {
  const data = req.body;
  const templatePath = path.join(__dirname, "template.ejs");
  const html = await ejs.renderFile(templatePath, { data });

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({ format: "A4" });
  await browser.close();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=output.pdf");
  res.send(pdfBuffer);
});

app.listen(3000, () => {
  console.log("PDF server running on http://localhost:3000");
});
