const express = require("express");
const puppeteer = require("puppeteer-core");
const chromium = require("chrome-aws-lambda");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/generate-pdf", async (req, res) => {
  const data = req.body;

  const templatePath = path.join(__dirname, "template.ejs");
  const html = await ejs.renderFile(templatePath, { data });

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    defaultViewport: chromium.defaultViewport,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({ format: "A4" });

  await browser.close();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=output.pdf");
  res.send(pdfBuffer);
});

app.get("/", (req, res) => {
  res.send("PDF Backend is running. Use POST /generate-pdf");
});

app.listen(3000, () => {
  console.log("PDF server running on http://localhost:3000");
});
