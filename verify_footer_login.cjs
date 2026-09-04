
const { spawn } = require('child_process');
const fs = require('fs');

async function testFooter() {
  const tmpDir = 'C:\\Users\\Navitha\\AppData\\Local\\Temp\\chrome-footer-' + Date.now();
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-extensions',
    '--disable-gpu',
    '--window-size=1280,800',
    '--remote-debugging-port=9245',
    `--user-data-dir=${tmpDir}`,
    'http://localhost:5173/'
  ]);

  let targetTab = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      const res = await fetch('http://127.0.0.1:9245/json/list');
      const tabs = await res.json();
      targetTab = tabs.find(t => t.type === 'page');
      if (targetTab) break;
    } catch (e) { }
  }

  if (!targetTab) {
    console.error('Failed to find tab');
    chromeProc.kill();
    process.exit(1);
  }

  const ws = new WebSocket(targetTab.webSocketDebuggerUrl);
  const errors = [];

  ws.addEventListener('open', () => {
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
  });

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.exceptionThrown') {
      errors.push(msg.params.exceptionDetails);
    }
  });

  await new Promise(r => setTimeout(r, 3000));

  // Step 1: Verify footer content
  const checkFooterScript = `
    (() => {
      const footer = document.querySelector('footer');
      const ceoBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('CEO Login'));
      const adminBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Admin Login'));
      const staffBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Staff Login'));

      return {
        hasFooter: !!footer,
        hasCeoBtn: !!ceoBtn,
        hasAdminBtn: !!adminBtn,
        hasStaffBtn: !!staffBtn,
        footerTextSnippet: footer ? footer.innerText.slice(0, 200) : null
      };
    })()
  `;

  ws.send(JSON.stringify({
    id: 10,
    method: 'Runtime.evaluate',
    params: { expression: checkFooterScript, returnByValue: true }
  }));

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id === 10) {
      console.log('=== FOOTER VERIFICATION ===');
      console.log(JSON.stringify(msg.result?.result?.value, null, 2));
    }
  });

  await new Promise(r => setTimeout(r, 1000));

  // Step 2: Click CEO Login and verify Anarav OS loads with CEO dashboard
  const clickCeoScript = `
    (() => {
      const ceoBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('CEO Login'));
      if (ceoBtn) ceoBtn.click();
      return { clicked: !!ceoBtn };
    })()
  `;

  ws.send(JSON.stringify({
    id: 20,
    method: 'Runtime.evaluate',
    params: { expression: clickCeoScript, returnByValue: true }
  }));

  await new Promise(r => setTimeout(r, 2000));

  // Step 3: Check that Anarav OS dashboard is rendered!
  const checkAnaravOsScript = `
    (() => {
      const isAnaravOs = !!document.querySelector('aside') || !!document.querySelector('header');
      const userText = document.body.innerText.includes('Dr. Bhaskar Reddy') || document.body.innerText.includes('CEO Dashboard');
      const hasReturnBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('Public Website'));

      return {
        isAnaravOs,
        hasCeoDashboard: userText,
        hasReturnBtn,
        bodySnippet: document.body.innerText.slice(0, 300)
      };
    })()
  `;

  ws.send(JSON.stringify({
    id: 30,
    method: 'Runtime.evaluate',
    params: { expression: checkAnaravOsScript, returnByValue: true }
  }));

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id === 30) {
      console.log('=== ANARAV OS CEO REDIRECTION RESULT ===');
      console.log(JSON.stringify(msg.result?.result?.value, null, 2));
    }
  });

  await new Promise(r => setTimeout(r, 1500));

  console.log('=== CONSOLE ERRORS ===');
  console.log(JSON.stringify(errors, null, 2));

  chromeProc.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { }
  process.exit(0);
}

testFooter().catch(console.error);
