const fs = require('fs'), path = require('path');
const appdata = process.env.APPDATA;
const base = path.join(appdata, 'Code - Insiders', 'User', 'workspaceStorage', 'd63c8aa6b579b133a86c5c03f45d3677', 'GitHub.copilot-chat', 'chat-session-resources', '7db7304b-40b6-4067-b94e-8d2d97c17723');
const dir = path.join('C:\\SCL System', 'scl-institute', 'Client-Overview-Screenshots', 'screenshots');

function readB64(toolId) {
  const cf = path.join(base, toolId, 'content.txt');
  const raw = fs.readFileSync(cf, 'utf8').trim();
  const m = raw.match(/^Result:\s*"([\s\S]*)"$/);
  if (m) return m[1];
  return raw;
}

const saves = [
  // Login screen
  ['toolu_01JKHvNTz95hvtnax9wun5uS__vscode-1777784441872', 's00-login-screen.jpg'],
  // Student screenshots
  ['toolu_01JRd2ceEYoLddASdhHDHxpM__vscode-1777784441777', null], // JSON - handled below
  // Teacher screenshots
  ['toolu_0113hLvZzcToosBh8xcesbuq__vscode-1777784441814', null], // JSON - handled below
  ['toolu_019JLJqrZZfTBzo2V6B6L4Ah__vscode-1777784441816', null], // JSON - teacher programme
  // Manager screenshots
  ['toolu_013yLkw9EBBewwNkAnzE9Rgv__vscode-1777784441822', 's21-manager-dashboard.png'],
  ['toolu_01Lp6XffRBwov3wrCjk2UcMT__vscode-1777784441836', 's22-manager-applications.jpg'],
  ['toolu_01TZtCSYHDbm8bEXgcJq295f__vscode-1777784441842', 's23-manager-intakes.jpg'],
  ['toolu_01YbPJLsCcasANdXmRd3Et3h__vscode-1777784441852', 's24-manager-lms.jpg'],
  ['toolu_01THkxZp8QtR1E9mgykeWac5__vscode-1777784441858', 's25-manager-lifecycle.jpg'],
  // College Admin screenshots
  ['toolu_01FLKrzXQQtxKGGVVw1vf2AY__vscode-1777784441862', 's31-cadmin-dashboard.jpg'],
  ['toolu_01TzfYUoym2DxArU5TqsY2RK__vscode-1777784441865', 's32-cadmin-applications.jpg'],
  ['toolu_01Swj1XczcBdKfHyxZjViBTC__vscode-1777784441867', 's33-cadmin-students.jpg'],
];

// Save plain b64 results
saves.filter(s => s[1]).forEach(([id, name]) => {
  try {
    const b64 = readB64(id);
    fs.writeFileSync(path.join(dir, name), Buffer.from(b64, 'base64'));
    console.log(name, fs.statSync(path.join(dir, name)).size);
  } catch(e) {
    console.error('FAILED', name, e.message);
  }
});

// Save student JSON result
const stuRaw = fs.readFileSync(path.join(base, 'toolu_01JRd2ceEYoLddASdhHDHxpM__vscode-1777784441777', 'content.txt'), 'utf8').trim();
const stuData = JSON.parse(JSON.parse(stuRaw.replace(/^Result:\s*/, '')));
fs.writeFileSync(path.join(dir, 's01-student-portal.png'), Buffer.from(stuData.s1, 'base64'));
fs.writeFileSync(path.join(dir, 's02-student-grades.png'), Buffer.from(stuData.s2, 'base64'));
console.log('s01-student-portal.png', fs.statSync(path.join(dir, 's01-student-portal.png')).size);
console.log('s02-student-grades.png', fs.statSync(path.join(dir, 's02-student-grades.png')).size);

// Save teacher JSON result (portal + grades)
const tchRaw = fs.readFileSync(path.join(base, 'toolu_0113hLvZzcToosBh8xcesbuq__vscode-1777784441814', 'content.txt'), 'utf8').trim();
const tchData = JSON.parse(JSON.parse(tchRaw.replace(/^Result:\s*/, '')));
fs.writeFileSync(path.join(dir, 's11-teacher-portal.png'), Buffer.from(tchData.s1, 'base64'));
fs.writeFileSync(path.join(dir, 's12-teacher-grades.png'), Buffer.from(tchData.s2, 'base64'));
console.log('s11-teacher-portal.png', fs.statSync(path.join(dir, 's11-teacher-portal.png')).size);

// Save teacher programme JSON
const tpRaw = fs.readFileSync(path.join(base, 'toolu_019JLJqrZZfTBzo2V6B6L4Ah__vscode-1777784441816', 'content.txt'), 'utf8').trim();
const tpData = JSON.parse(JSON.parse(tpRaw.replace(/^Result:\s*/, '')));
fs.writeFileSync(path.join(dir, 's13-teacher-programme.png'), Buffer.from(tpData.s1, 'base64'));
console.log('s13-teacher-programme.png', fs.statSync(path.join(dir, 's13-teacher-programme.png')).size);

