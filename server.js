const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/generate-pdf", async (req, res) => {
  const data = req.body;

  // โหลด HTML template
  const templatePath = path.join(__dirname, "template.ejs");
  const html = await ejs.renderFile(templatePath, { data });

  // ใช้ puppeteer แปลง HTML เป็น PDF
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
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
