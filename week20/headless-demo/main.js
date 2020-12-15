const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://localhost:8080/main.html', {waitUntil: 'networkidle2'});
  // $$ 取照片
  const img = await page.$$('a');
  console.log(img);
  await browser.close();
})();