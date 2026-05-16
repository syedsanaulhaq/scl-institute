// capture_screenshots.js — take cadmin screenshots for demo
const { chromium } = require('playwright');
const path = require('path');

const SS_DIR = path.join(__dirname, 'Client-Overview-Screenshots', 'screenshots');
const BASE = 'https://system.sclsandbox.xyz';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 860 });

  // Login
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'collegeadmin@scl.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/`, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Student Applications — click sidebar
  await page.click('button:has-text("Student Applications")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("All Applications")');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SS_DIR, 's32-cadmin-applications.jpg'), type: 'jpeg', quality: 85, fullPage: false });
  console.log('✓ s32-cadmin-applications.jpg saved');

  // Student Management — navigate directly (session already established)
  await page.goto(`${BASE}/student-list`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SS_DIR, 's33-cadmin-students.jpg'), type: 'jpeg', quality: 85, fullPage: false });
  console.log('✓ s33-cadmin-students.jpg saved');

  await browser.close();
})();
