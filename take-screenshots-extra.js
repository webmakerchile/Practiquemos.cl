const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });
  const context = await browser.newContext({
    viewport: { width: 428, height: 926 },
    deviceScaleFactor: 3,
  });

  const page = await context.newPage();
  const baseUrl = 'http://localhost:8081';
  const outDir = path.join(__dirname, 'screenshots');

  try {
    await page.goto(baseUrl + '/contacto', { waitUntil: 'networkidle', timeout: 15000 });
  } catch(e) {
    try { await page.goto(baseUrl + '/contacto', { waitUntil: 'load', timeout: 15000 }); } catch(e2) {}
  }
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(outDir, '10_contacto.png'), type: 'png' });
  console.log('Captured: 10_contacto.png');

  await browser.close();
  console.log('Done!');
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
