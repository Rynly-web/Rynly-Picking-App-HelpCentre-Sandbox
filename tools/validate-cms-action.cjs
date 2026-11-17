#!/usr/bin/env node
// Fail closed if an action is not the confirmed root-level Pages CMS action on main.
const name = process.argv[2];
const raw = process.argv[3] || '';
const printShaOnly = process.argv.includes('--sha');
const expected = {
  'publish-production': 'confirm_publish',
  'restore-uat': 'confirm_restore',
};
if (!(name in expected)) throw Error('Unsupported CMS action');
let p;
try { p = JSON.parse(raw); } catch { throw Error('Missing/invalid Pages CMS action payload'); }
if (p?.source !== 'pages-cms') throw Error('Expected a Pages CMS action payload');
if (p?.action?.name !== name) throw Error('Incorrect Pages CMS action name');
if (String(p?.repository?.owner || '').toLowerCase() !== 'rynly-web' || String(p?.repository?.repo || '').toLowerCase() !== 'rynly-picking-app-helpcentre-sandbox') {
  throw Error('Action must be triggered from the Rynly Sandbox repository');
}
if (!['main', 'refs/heads/main'].includes(p?.repository?.ref)) throw Error('Action must run on main');
if (p?.repository?.workflowRef && !['main','refs/heads/main'].includes(p.repository.workflowRef)) {
  throw Error('Action workflow ref must be main');
}
const accepted = p?.inputs?.[expected[name]];
if (accepted !== true && accepted !== 'true') throw Error('Confirmation checkbox must be explicitly checked');
const sha = p?.repository?.sha;
if (typeof sha !== 'string' || !/^[a-f0-9]{40}$/.test(sha)) throw Error('Missing/invalid UAT snapshot SHA');
if (printShaOnly) process.stdout.write(sha+'\n');
else console.log('Valid confirmed CMS action:',name,'UAT snapshot:',sha);
