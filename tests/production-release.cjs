'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app='MILFT_Tournois_V1_1_PRODUCTION_PRETE_2026-11-17.html';
const html=fs.readFileSync(app,'utf8');
const drive=fs.readFileSync('milft-drive-v11-production.js','utf8');
const sw=fs.readFileSync('sw.production.js','utf8');
const entry=fs.readFileSync('index.html','utf8');
const manifest=JSON.parse(fs.readFileSync('manifest.production.webmanifest','utf8'));
assert.match(entry,/MILFT_Tournois_V1_1_PRODUCTION_PRETE_2026-11-17\.html/);
assert.equal(manifest.start_url,'./'+app);
for(const text of [
 "const KEY='milft_prod_v11_20261117_tournois_v01'",
 "const PLAN_KEY='milft_prod_v11_20261117_planning_v066'",
 "const MILFT_PROGRESS_PREFS='milft_prod_v11_20261117_progress_v069'",
 "const MILFT_THEME_KEY='milft_prod_v11_20261117_ui_theme'",
 "MILFT_PROD_V11_20261117_SECOURS",
 'SAUVEGARDE LOCALE ACTIVE • Google Drive facultatif',
 'milft-drive-v11-production.js?v=20261119-prod-candidate-200-01'
]) assert(html.includes(text),'Required production artifact missing: '+text);
assert(!html.includes("MILFT_ISO_20261102_SECOURS"));
assert(!html.includes("MILFT_JOUEURS_REFERENCE_20261014"));
assert(!html.includes("drive.appdata"));
assert(!html.includes("Google Drive désactivé"));
assert(html.includes('<small>Gestion des tournois de football de table</small>'),'General application subtitle required');
assert(html.includes('<span class="pill">MILFT Tournois V1.1</span>'),'Correct application badge required');
assert(!html.includes('V1.1 CHAMPIONNAT SIMPLE'),'Obsolete specific badge prohibited');
assert(!html.includes('Gestion de tournois • championnat annuel Simple'),'Obsolete specific subtitle prohibited');
assert.match(drive,/const MAX_DAILY_UPLOADS = 200/);
assert.match(drive,/const AUTO_INTERVAL_CHOICES = \[5,10,15,30,60\]/);
assert.match(drive,/const DEFAULT_AUTO_MINUTES = 15/);
assert.match(drive,/let client=null, connected=false, auto=false/,'No automatic consent');
assert.match(drive,/async function toggleAuto\(\)/,'Auto requires user action');
assert.match(drive,/function backupSummary\(data\)/,'Consent preview');
assert.match(drive,/const ok=await upload\('activation',true,prepared\)/,'First backup consent required');
assert.match(drive,/startsWith\('\/milft-tournois\/'\)/,'Production origin restriction');
assert(!drive.includes("startsWith('/milft-tournois-validation/')"));
assert.match(sw,/milft-drive-v11-production\.js\?v=20261119-prod-candidate-200-01/);
assert(!fs.existsSync('MILFT_SAUVEGARDE_COMPLETE_2026-11-19.json'));
for(const [i,script] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(([,attrs,code])=>!/(?:^|\s)src\s*=/.test(attrs)&&code.trim()).entries()) new vm.Script(script[2],{filename:'inline-prod-'+i+'.js'});
new vm.Script(drive,{filename:'milft-drive-v11-production.js'});
new vm.Script(sw,{filename:'sw.production.js'});
console.log('OK production V1.1: protected storage, consent, Drive 200/day, script integrity, unchanged index/manifest');
