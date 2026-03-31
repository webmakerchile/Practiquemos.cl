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

  async function waitAndScreenshot(url, filename, delay = 3000) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch(e) {
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    }
    await page.waitForTimeout(delay);
    await page.screenshot({ path: path.join(outDir, filename), type: 'png' });
    console.log('Captured:', filename);
  }

  await waitAndScreenshot(baseUrl + '/', '01_home.png', 4000);

  await page.goto(baseUrl + '/login', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2000);

  const usernameInput = await page.$('input');
  if (usernameInput) {
    await usernameInput.fill('reviewer');
  }
  await page.waitForTimeout(300);
  const allInputs = await page.$$('input');
  if (allInputs.length > 1) {
    await allInputs[1].fill('Review2025!');
  }
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, '02_login.png'), type: 'png' });
  console.log('Captured: 02_login.png');

  const loginBtns = await page.$$('div[role="button"], [accessibilityRole="button"]');
  for (const btn of loginBtns) {
    const text = await btn.textContent();
    if (text && text.includes('Iniciar')) {
      await btn.click();
      break;
    }
  }
  await page.waitForTimeout(4000);

  await waitAndScreenshot(baseUrl + '/', '03_home_logged.png', 3000);

  await waitAndScreenshot(baseUrl + '/exam?mode=daily&licenseType=clase_b', '04_exam_question.png', 4000);

  const learningLabels = await page.$$('text=Aprendizaje');
  if (learningLabels.length > 0) {
    await learningLabels[0].click();
    await page.waitForTimeout(500);
  }
  const pressables = await page.$$('[role="button"]');
  for (const p of pressables) {
    const text = await p.textContent();
    if (text && (text.includes('A)') || text.includes('a)') || text.startsWith('A.'))) {
      await p.click();
      break;
    }
  }
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outDir, '05_exam_answered.png'), type: 'png' });
  console.log('Captured: 05_exam_answered.png');

  await waitAndScreenshot(baseUrl + '/temario', '06_temario.png', 3000);

  await waitAndScreenshot(baseUrl + '/temario-detail?chapterId=ch1', '07_temario_detail.png', 3000);

  await waitAndScreenshot(baseUrl + '/plans', '08_plans.png', 3000);

  await waitAndScreenshot(baseUrl + '/mi-curso', '09_mi_curso.png', 3000);

  await waitAndScreenshot(baseUrl + '/perfil', '10_perfil.png', 3000);

  await browser.close();
  console.log('All 10 screenshots captured!');
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
