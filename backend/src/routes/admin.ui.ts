import { Router } from 'express';

/**
 * TAVI Admin Console: single-page UI served by the backend.
 * Scripts are served from /admin/app.js (not inline) so Helmet's default CSP stays intact.
 */
export const adminUiRouter = Router();

const PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>TAVI Admin Console</title>
<style>
:root{--navy:#0B1437;--green:#00C47D;--teal:#00A3A3;--indigo:#4F46E5;--bg:#F3F6FD;--line:#E0E7F5;--muted:#64748B;--red:#EF4444;--amber:#F59E0B}
*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,Segoe UI,sans-serif;background:var(--bg);color:var(--navy)}
header{background:linear-gradient(135deg,#0B1437,#12307A 55%,#4F46E5);color:#fff;padding:18px 28px;display:flex;align-items:center;justify-content:space-between}
header h1{margin:0;font-size:20px;letter-spacing:.3px}header small{opacity:.7;display:block;font-weight:400;font-size:12px}
nav{display:flex;gap:6px;padding:14px 28px 0}nav button{border:0;background:#fff;padding:10px 22px;border-radius:12px 12px 0 0;font-weight:600;cursor:pointer;color:var(--muted)}
nav button.on{background:linear-gradient(135deg,var(--green),var(--teal));color:#fff}
main{padding:0 28px 40px}.panel{background:#fff;border-radius:0 16px 16px 16px;padding:22px;box-shadow:0 8px 30px -12px rgba(11,20,55,.18)}
.bar{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px;align-items:center}
input,select{padding:10px 12px;border:1px solid var(--line);border-radius:10px;font:inherit;background:#F8FAFF}
button.btn{border:0;padding:10px 16px;border-radius:10px;font-weight:600;cursor:pointer;color:#fff;background:linear-gradient(135deg,var(--green),var(--teal))}
button.btn.alt{background:linear-gradient(135deg,var(--indigo),#7C3AED)}button.btn.warn{background:var(--red)}button.btn.sm{padding:6px 10px;font-size:12px}
table{width:100%;border-collapse:collapse;font-size:13px}th{text-align:left;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.6px;padding:8px;border-bottom:2px solid var(--line)}
td{padding:10px 8px;border-bottom:1px solid var(--line);vertical-align:top}tr:hover td{background:#F8FAFF}
.pill{padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700}.ACTIVE,.SUCCESS{background:#DCFCE7;color:#166534}.SUSPENDED,.FAILURE{background:#FEE2E2;color:#991B1B}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:20px}
.card{border-radius:16px;padding:18px;color:#fff;background:linear-gradient(135deg,var(--green),var(--teal))}.card:nth-child(2){background:linear-gradient(135deg,var(--indigo),#7C3AED)}
.card:nth-child(3){background:linear-gradient(135deg,#F5B83D,#F97316)}.card:nth-child(4){background:linear-gradient(135deg,#0B1437,#12307A)}
.card b{display:block;font-size:28px}.card span{font-size:12px;opacity:.85}
.mono{font-family:ui-monospace,Consolas,monospace;font-size:12px;color:var(--muted)}
#login{max-width:380px;margin:90px auto;background:#fff;padding:30px;border-radius:18px;box-shadow:0 20px 45px -15px rgba(79,70,229,.35)}
#login input{width:100%;margin:12px 0}#err{color:var(--red);font-size:13px;min-height:18px}
.hidden{display:none}.pager{display:flex;gap:10px;align-items:center;margin-top:14px;color:var(--muted);font-size:13px}
dialog{border:0;border-radius:16px;padding:24px;max-width:560px;width:92%;box-shadow:0 30px 60px rgba(0,0,0,.3)}
</style></head><body>
<div id="login"><h2 style="margin:0">TAVI Admin Console</h2><p style="color:#64748B;font-size:13px">Enter the admin key to continue.</p>
<input id="key" type="password" placeholder="Admin key" autocomplete="off"><div id="err"></div><button class="btn" id="go" style="width:100%">Sign in</button></div>
<div id="app" class="hidden">
<header><h1>TAVI Admin Console<small>User management &middot; Audit &middot; Reports</small></h1><button class="btn alt sm" id="out">Sign out</button></header>
<nav><button data-t="users" class="on">User Management</button><button data-t="audit">Audit Log</button><button data-t="reports">Reports</button></nav>
<main><div class="panel" id="view"></div></main></div>
<dialog id="dlg"></dialog>
<script src="/admin/app.js"></script></body></html>`;

const SCRIPT = `
(function(){
var API=location.origin+'/api/v1';var key=sessionStorage.getItem('tavi_admin_key')||'';var tab='users';var page={users:1,audit:1};
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function money(minor,cur){return (cur||'NGN')+' '+(Number(minor||0)/100).toLocaleString(undefined,{minimumFractionDigits:2})}
function when(iso){var d=new Date(iso);return isNaN(d)?'':d.toLocaleString()+' ('+d.toISOString().replace('T',' ').slice(0,19)+' UTC)'}
function call(path,opt){opt=opt||{};opt.headers=Object.assign({'x-admin-key':key,'Content-Type':'application/json'},opt.headers||{});return fetch(API+path,opt)}
function json(path,opt){return call(path,opt).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error((j.error&&j.error.message)||'Request failed');return j})})}
function download(path,name){call(path).then(function(r){return r.blob()}).then(function(b){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click()})}
function qs(o){return Object.keys(o).filter(function(k){return o[k]!==''&&o[k]!=null}).map(function(k){return k+'='+encodeURIComponent(o[k])}).join('&')}

function signIn(){key=$('key').value.trim()||key;json('/admin/reports/summary').then(function(){sessionStorage.setItem('tavi_admin_key',key);$('login').classList.add('hidden');$('app').classList.remove('hidden');show('users')}).catch(function(e){$('err').textContent=e.message})}
$('go').onclick=signIn;$('key').onkeydown=function(e){if(e.key==='Enter')signIn()};
$('out').onclick=function(){sessionStorage.removeItem('tavi_admin_key');location.reload()};
Array.prototype.forEach.call(document.querySelectorAll('nav button'),function(b){b.onclick=function(){show(b.getAttribute('data-t'))}});
function show(t){tab=t;Array.prototype.forEach.call(document.querySelectorAll('nav button'),function(b){b.classList.toggle('on',b.getAttribute('data-t')===t)});({users:users,audit:audit,reports:reports})[t]()}

function pager(total,p,limit,cb){var pages=Math.max(1,Math.ceil(total/limit));var d=document.createElement('div');d.className='pager';
d.innerHTML='<button class="btn sm alt" id="pv">Prev</button><span>Page '+p+' of '+pages+' &middot; '+total+' records</span><button class="btn sm alt" id="nx">Next</button>';
setTimeout(function(){$('pv').onclick=function(){if(p>1)cb(p-1)};$('nx').onclick=function(){if(p<pages)cb(p+1)}});return d.outerHTML}

function users(){
$('view').innerHTML='<div class="bar"><input id="q" placeholder="Search name, phone, email, tag"><select id="st"><option value="">All statuses</option><option>ACTIVE</option><option>SUSPENDED</option></select><button class="btn" id="sr">Search</button></div><div id="tbl">Loading...</div>';
function load(){json('/admin/users?'+qs({search:$('q').value,status:$('st').value,page:page.users,limit:15})).then(function(r){
var h='<table><tr><th>User</th><th>Contact</th><th>KYC</th><th>Status</th><th>Joined</th><th>Balance</th><th></th></tr>';
r.data.forEach(function(u){var w=u.wallets[0];h+='<tr><td><b>'+esc(u.displayName)+'</b><br><span class="mono">'+esc(u.demoTag)+' &middot; '+esc(u.id)+'</span></td><td>'+esc(u.phone)+'<br><span class="mono">'+esc(u.email||'')+'</span></td><td>'+esc(u.kycTier)+'</td><td><span class="pill '+esc(u.status)+'">'+esc(u.status)+'</span></td><td>'+esc(when(u.createdAt))+'</td><td>'+(w?money(w.balanceMinor,w.currency):'-')+'</td><td><button class="btn sm" data-id="'+esc(u.id)+'">Manage</button></td></tr>'});
h+='</table>'+pager(r.total,page.users,15,function(p){page.users=p;load()});$('tbl').innerHTML=h;
Array.prototype.forEach.call($('tbl').querySelectorAll('button[data-id]'),function(b){b.onclick=function(){detail(b.getAttribute('data-id'),load)}})}).catch(function(e){$('tbl').textContent=e.message})}
$('sr').onclick=function(){page.users=1;load()};load()}

function detail(id,after){json('/admin/users/'+encodeURIComponent(id)).then(function(r){var u=r.data;var d=$('dlg');
var h='<h3 style="margin-top:0">'+esc(u.displayName)+' <span class="pill '+esc(u.status)+'">'+esc(u.status)+'</span></h3><p class="mono">'+esc(u.id)+'<br>'+esc(u.phone)+' &middot; '+esc(u.email||'')+'</p>';
h+='<p>KYC: <select id="kyc"><option>TIER_1_BASIC</option><option>TIER_2_VERIFIED</option><option>TIER_3_PRO</option></select> <button class="btn sm alt" id="kycb">Update KYC</button></p>';
h+='<p><input id="why" placeholder="Reason (recorded in audit)" style="width:100%"></p><div class="bar">';
h+=u.status==='ACTIVE'?'<button class="btn warn sm" id="sus">Suspend user</button>':'<button class="btn sm" id="act">Reactivate user</button>';
h+='<button class="btn sm alt" id="rst">Reset demo balance</button><button class="btn sm" id="cl">Close</button></div>';
h+='<b>Recent activity</b><table>'+u.recentAudit.map(function(a){return '<tr><td class="mono">'+esc(when(a.timestamp))+'</td><td>'+esc(a.action)+'</td></tr>'}).join('')+'</table>';
d.innerHTML=h;$('kyc').value=u.kycTier;d.showModal();
function act(p,o){json(p,o).then(function(){d.close();after()}).catch(function(e){alert(e.message)})}
$('cl').onclick=function(){d.close()};
$('kycb').onclick=function(){act('/admin/users/'+id+'/kyc',{method:'PATCH',body:JSON.stringify({kycTier:$('kyc').value})})};
$('rst').onclick=function(){if(confirm('Reset this user demo balance?'))act('/admin/users/'+id+'/reset-balance',{method:'POST'})};
if($('sus'))$('sus').onclick=function(){act('/admin/users/'+id+'/status',{method:'PATCH',body:JSON.stringify({status:'SUSPENDED',reason:$('why').value})})};
if($('act'))$('act').onclick=function(){act('/admin/users/'+id+'/status',{method:'PATCH',body:JSON.stringify({status:'ACTIVE',reason:$('why').value})})}}).catch(function(e){alert(e.message)})}

function audit(){
$('view').innerHTML='<div class="bar"><input id="a" placeholder="Action contains"><input id="ac" placeholder="Actor ID"><select id="s"><option value="">Any outcome</option><option>SUCCESS</option><option>FAILURE</option></select>From <input id="f" type="date">To <input id="t" type="date"><button class="btn" id="sr">Filter</button><button class="btn alt" id="csv">Export CSV</button></div><div id="tbl">Loading...</div>';
function f(){return{action:$('a').value,actor:$('ac').value,status:$('s').value,from:$('f').value,to:$('t').value}}
function load(){json('/admin/audit?'+qs(Object.assign(f(),{page:page.audit,limit:25}))).then(function(r){
var h='<table><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Target</th><th>Outcome</th><th>IP</th></tr>';
r.data.forEach(function(a){h+='<tr><td class="mono">'+esc(when(a.timestamp))+'</td><td>'+esc(a.actorType)+'<br><span class="mono">'+esc(a.actorId||'')+'</span></td><td>'+esc(a.action)+'<br><span class="mono">'+esc(a.details?JSON.stringify(a.details):'')+'</span></td><td class="mono">'+esc((a.targetType||'')+' '+(a.targetId||''))+'</td><td><span class="pill '+esc(a.status)+'">'+esc(a.status)+'</span></td><td class="mono">'+esc(a.ip||'')+'</td></tr>'});
h+='</table>'+pager(r.total,page.audit,25,function(p){page.audit=p;load()});$('tbl').innerHTML=h}).catch(function(e){$('tbl').textContent=e.message})}
$('sr').onclick=function(){page.audit=1;load()};$('csv').onclick=function(){download('/admin/audit?'+qs(Object.assign(f(),{format:'csv'})),'tavi-audit.csv')};load()}

function reports(){
$('view').innerHTML='<div class="bar">From <input id="f" type="date">To <input id="t" type="date"><button class="btn" id="sr">Run report</button></div><div id="out">Loading...</div><div class="bar" style="margin-top:18px"><button class="btn alt" id="c1">Export transactions CSV</button><button class="btn alt" id="c2">Export users CSV</button><button class="btn alt" id="c3">Export audit CSV</button></div>';
function r(){return{from:$('f').value,to:$('t').value}}
function run(){json('/admin/reports/summary?'+qs(r())).then(function(x){var d=x.data;
var h='<div class="cards"><div class="card"><b>'+d.users.total+'</b><span>Users ('+d.users.active+' active, '+d.users.suspended+' suspended)</span></div><div class="card"><b>'+d.transactions.total+'</b><span>Transactions in period</span></div><div class="card"><b>'+d.auditEvents+'</b><span>Audit events</span></div><div class="card"><b>'+money(d.transactions.totalFeesMinor)+'</b><span>Fees collected</span></div></div>';
h+='<h4>By transaction type</h4><table><tr><th>Type</th><th>Count</th><th>Volume</th></tr>'+Object.keys(d.transactions.byType).map(function(k){var v=d.transactions.byType[k];return '<tr><td>'+esc(k)+'</td><td>'+v.count+'</td><td>'+money(v.volumeMinor)+'</td></tr>'}).join('')+'</table>';
h+='<h4>By currency</h4><table><tr><th>Currency</th><th>Count</th><th>Volume</th><th>Fees</th></tr>'+Object.keys(d.transactions.byCurrency).map(function(k){var v=d.transactions.byCurrency[k];return '<tr><td>'+esc(k)+'</td><td>'+v.count+'</td><td>'+money(v.volumeMinor,k)+'</td><td>'+money(v.feesMinor,k)+'</td></tr>'}).join('')+'</table>';
h+='<h4>Total wallet balances</h4><table>'+Object.keys(d.walletBalanceByCurrency).map(function(k){return '<tr><td>'+esc(k)+'</td><td>'+money(d.walletBalanceByCurrency[k],k)+'</td></tr>'}).join('')+'</table><p class="mono">Generated '+esc(when(x.generatedAt))+'</p>';
$('out').innerHTML=h}).catch(function(e){$('out').textContent=e.message})}
$('sr').onclick=run;$('c1').onclick=function(){download('/admin/reports/transactions?'+qs(Object.assign(r(),{format:'csv'})),'tavi-transactions.csv')};
$('c2').onclick=function(){download('/admin/reports/users?format=csv','tavi-users.csv')};$('c3').onclick=function(){download('/admin/audit?'+qs(Object.assign(r(),{format:'csv'})),'tavi-audit.csv')};run()}

if(key){$('key').value=key;signIn()}
})();
`;

adminUiRouter.get('/admin', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.type('html').send(PAGE);
});

adminUiRouter.get('/admin/app.js', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.type('application/javascript').send(SCRIPT);
});

