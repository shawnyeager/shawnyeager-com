import puppeteer from 'puppeteer';
import handler from 'serve-handler';
import http from 'http';
import { mkdirSync } from 'fs';

const PORT = 3456;

// Start local server
const server = http.createServer((req, res) => {
  return handler(req, res, { public: 'public' });
});

server.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Force light mode
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: 'light' }
  ]);

  // Viewport = final OG size (no scaling)
  await page.setViewport({ width: 1200, height: 630 });

  mkdirSync('/tmp/og-test', { recursive: true });

  // Test homepage
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: '/tmp/og-test/homepage.png', type: 'png' });
  console.log('Saved: /tmp/og-test/homepage.png');

  // Test an actual essay (clean URL at root)
  await page.goto(`http://localhost:${PORT}/sovereignty-without-sacrifice/`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: '/tmp/og-test/essay.png', type: 'png' });
  console.log('Saved: /tmp/og-test/essay.png');

  await browser.close();
  server.close();
  console.log('Done');
});
