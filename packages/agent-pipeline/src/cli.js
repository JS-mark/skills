#!/usr/bin/env node
/**
 * CLI wrapper for the Agent Pipeline MCP Plugin.
 * Provides command-line access to pipeline operations without Claude Code.
 *
 * Usage:
 *   node cli.js run <feature> [phase]   — Initialize + print prompts
 *   node cli.js status [--root <path>]  — Show pipeline status
 *   node cli.js dashboard [port]        — Start dashboard server
 *   node cli.js init [--root <path>]    — Initialize project
 */

import fs from "fs";
import path from "path";
import http from "http";
import os from "os";

const ROOT = process.env.PIPELINE_ROOT || process.cwd();

// ── Helpers ──

const fileExists = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } };
const dirExists = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };
const fileSize = (p) => { try { return fs.statSync(p).size; } catch { return 0; } };
const fileMtime = (p) => { try { return fs.statSync(p).mtime.toISOString(); } catch { return null; } };
const formatSize = (b) => { if (!b) return '0 B'; if (b < 1024) return b + ' B'; if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'; return (b / 1048576).toFixed(1) + ' MB'; };

function statusPath(root) { return path.join(root, 'docs/.pipeline-status.json'); }
function readStatus(root) {
  const p = statusPath(root);
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; }
}

// ── Status display ──

function showStatus(root) {
  const data = readStatus(root);
  if (!data || data.version !== 2) {
    console.log('No v2 pipeline status found at', statusPath(root));
    console.log('Run: /agent run <feature>  or  node cli.js run <feature>');
    return;
  }

  const icons = { done: '✅', running: '🔄', pending: '⏳', failed: '❌', skipped: '⏭️' };
  const roleNames = { architect: '架构师', 'ui-designer': 'UI 设计师', tester: '测试工程师' };

  console.log(`\nFeature: ${data.feature}  |  Status: ${data.status}  |  Started: ${data.startedAt || 'N/A'}`);
  console.log('─'.repeat(55));

  for (const phase of data.phases) {
    const ic = icons[phase.status] || '⏳';
    let extra = '';
    const fp = getPhaseFile(root, data.feature, phase.id);
    if (fp && fileExists(fp)) extra = ` (${formatSize(fileSize(fp))})`;

    console.log(`Phase ${phase.id}  ${phase.name.padEnd(12)} ${ic} ${phase.status}${extra}`);

    if (phase.id === 2 && phase.subtasks) {
      for (let i = 0; i < phase.subtasks.length; i++) {
        const st = phase.subtasks[i];
        const prefix = i < phase.subtasks.length - 1 ? '├─' : '└─';
        const sic = icons[st.status] || '⏳';
        const name = (roleNames[st.role] || st.role).padEnd(10);
        console.log(`         ${prefix} ${name} ${sic} ${st.status}`);
      }
    }

    if (phase.id === 7 && data.fixRounds) {
      const fr = data.fixRounds;
      const bar = Array.from({ length: fr.max }, (_, i) => {
        if (i < fr.results.length) return fr.results[i] === 'passed' ? '●' : '✗';
        return '_';
      }).join(' ');
      console.log(`         修复轮次: ${fr.current}/${fr.max}  [${bar}]`);
    }
  }
  console.log('─'.repeat(55));
  if (data.completedAt) console.log(`Completed: ${data.completedAt}`);
}

function getPhaseFile(root, feature, phaseId) {
  const map = {
    1: `docs/prd/feature-${feature}.md`,
    4: `docs/reviews/feature-${feature}.md`,
    5: `docs/reviews/feature-${feature}-fix-log.md`,
  };
  return map[phaseId] ? path.join(root, map[phaseId]) : null;
}

// ── Dashboard ──

function startDashboardCLI(root, port) {
  // Import the dashboard HTML from server.js would create circular dependency
  // So we inline a simple redirect to the MCP-hosted dashboard, or serve standalone
  const pluginDir = path.dirname(new URL(import.meta.url).pathname);

  // Dynamic import the server module to reuse getDashboardHTML
  import(path.join(pluginDir, 'server.js')).catch(() => {
    console.error('Cannot import server.js for dashboard HTML');
    process.exit(1);
  });

  // Standalone dashboard server
  const srv = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    const p = url.pathname;
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (p === '/api/status') {
      const data = readStatus(root) || { version: 2, feature: 'unknown', status: 'unknown', currentPhase: 0, phases: [], fixRounds: { current: 0, max: 5, results: [] } };
      data.timestamp = new Date().toISOString();
      // Enrich with src files
      data.srcFiles = walkDir(path.join(root, 'src'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    }
    if (p === '/api/docs') {
      const docs = getDocuments(root);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(docs));
      return;
    }
    if (p === '/api/doc') {
      const dp = url.searchParams.get('path');
      if (!dp) { res.writeHead(400); res.end('missing path'); return; }
      const abs = path.join(root, dp);
      if (!abs.startsWith(root) || !fileExists(abs)) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(fs.readFileSync(abs, 'utf-8'));
      return;
    }
    if (p === '/api/file') {
      const fp = url.searchParams.get('path');
      if (!fp) { res.writeHead(400); res.end('missing path'); return; }
      const abs = path.join(root, 'src', fp);
      if (!abs.startsWith(root) || !fileExists(abs)) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(fs.readFileSync(abs, 'utf-8'));
      return;
    }
    if (p === '/api/logs') {
      const file = url.searchParams.get('file');
      const ld = path.join(root, 'docs/.pipeline-logs');
      if (file) {
        const abs = path.join(ld, path.basename(file));
        const content = abs.startsWith(ld) && fileExists(abs) ? fs.readFileSync(abs, 'utf-8').replace(/\x1b\[[0-9;]*m/g, '') : '';
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end(content);
      } else {
        const logs = dirExists(ld) ? fs.readdirSync(ld).filter(f => f.endsWith('.log')).map(f => ({ name: f, size: fileSize(path.join(ld, f)), mtime: fileMtime(path.join(ld, f)) })) : [];
        res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(logs));
      }
      return;
    }
    // Serve dashboard HTML
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getDashboardHTMLStandalone());
  });

  srv.listen(port, () => {
    const nets = os.networkInterfaces();
    let ip = '127.0.0.1';
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) { ip = net.address; break; }
      }
    }
    console.log(`\n📦 Pipeline Dashboard started!`);
    console.log(`  Local:   http://localhost:${port}`);
    console.log(`  Network: http://${ip}:${port}`);
    console.log(`  Root:    ${root}`);
    console.log(`\n  Auto-refreshes every 5s. Press Ctrl+C to stop.\n`);
  });
}

function walkDir(dir, prefix = '') {
  const results = [];
  if (!dirExists(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '__pycache__', '.claude'].includes(entry.name)) continue;
      results.push(...walkDir(path.join(dir, entry.name), rel));
    } else {
      results.push({ path: rel, size: fileSize(path.join(dir, entry.name)), mtime: fileMtime(path.join(dir, entry.name)) });
    }
  }
  return results;
}

function getDocuments(root) {
  const dirs = ['docs/prd', 'docs/architecture', 'docs/ui-design', 'docs/test-plans', 'docs/reviews'];
  const docs = [];
  for (const dir of dirs) {
    const abs = path.join(root, dir);
    if (!dirExists(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (!f.endsWith('.md')) continue;
      const fp = path.join(abs, f);
      docs.push({ category: dir.split('/').pop(), name: f, path: `${dir}/${f}`, size: fileSize(fp), mtime: fileMtime(fp) });
    }
  }
  return docs;
}

function getDashboardHTMLStandalone() {
  // Same dashboard HTML as in server.js - self-contained
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Pipeline Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
<style>
:root{--bg:#0f172a;--surface:#1e293b;--surface2:#334155;--border:#475569;--text:#e2e8f0;--text2:#94a3b8;--green:#22c55e;--blue:#3b82f6;--orange:#f59e0b;--red:#ef4444;--purple:#a855f7;--cyan:#06b6d4}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,'SF Pro','Helvetica Neue',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
.header{background:linear-gradient(135deg,#1e3a5f,#0f172a);border-bottom:1px solid var(--border);padding:20px 32px;display:flex;align-items:center;justify-content:space-between}
.header h1{font-size:22px;font-weight:700}.header h1 span{color:var(--blue)}
.hr{display:flex;align-items:center;gap:16px;font-size:13px;color:var(--text2)}
.live-dot{width:8px;height:8px;border-radius:50%;background:var(--green);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.badge{padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600}
.b-run{background:rgba(59,130,246,.2);color:var(--blue)}.b-done{background:rgba(34,197,94,.2);color:var(--green)}
.container{display:grid;grid-template-columns:380px 1fr;height:calc(100vh - 73px)}
.pipeline{padding:24px;border-right:1px solid var(--border);overflow-y:auto}
.pipeline h2{font-size:14px;color:var(--text2);text-transform:uppercase;letter-spacing:1px;margin-bottom:20px}
.stg{display:flex;gap:16px;margin-bottom:8px;position:relative}
.stg-line{position:absolute;left:19px;top:40px;bottom:-8px;width:2px;background:var(--surface2)}.stg:last-child .stg-line{display:none}
.stg-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;z-index:1}
.stg-done .stg-icon{background:rgba(34,197,94,.15)}.stg-active .stg-icon{background:rgba(59,130,246,.2);animation:pulse 2s infinite}
.stg-pending .stg-icon{background:var(--surface2);opacity:.5}
.stg-info{flex:1;padding-bottom:20px}.stg-info h3{font-size:14px;font-weight:600;margin-bottom:2px}.stg-info p{font-size:12px;color:var(--text2)}
.stg-done .stg-info h3{color:var(--green)}.stg-active .stg-info h3{color:var(--blue)}.stg-pending .stg-info h3{color:var(--text2)}
.subtasks{margin-top:8px}.subtask{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:12px}
.sd{width:6px;height:6px;border-radius:50%}.sd.done{background:var(--green)}.sd.running{background:var(--blue);animation:pulse 1s infinite}.sd.pending{background:var(--surface2)}
.sn{color:var(--text2)}.ss{font-size:11px;color:var(--text2);margin-left:auto}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:24px;padding-top:20px;border-top:1px solid var(--surface2)}
.stat{background:var(--surface);border-radius:10px;padding:10px;text-align:center}
.sv{font-size:20px;font-weight:700;color:var(--cyan)}.sl{font-size:10px;color:var(--text2);margin-top:2px}
.main{overflow-y:auto;padding:24px}
.dg{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:24px}
.dc{background:var(--surface);border:1px solid var(--surface2);border-radius:12px;padding:16px;cursor:pointer;transition:all .2s}.dc:hover{border-color:var(--blue)}
.dc h4{font-size:14px;margin-bottom:6px}
.cat{font-size:11px;padding:2px 8px;border-radius:6px;font-weight:500;display:inline-block;margin-bottom:8px}
.cat-prd{background:rgba(168,85,247,.15);color:var(--purple)}.cat-architecture{background:rgba(6,182,212,.15);color:var(--cyan)}.cat-ui-design{background:rgba(245,158,11,.15);color:var(--orange)}.cat-test-plans{background:rgba(34,197,94,.15);color:var(--green)}.cat-reviews{background:rgba(239,68,68,.15);color:var(--red)}
</style>
</head>
<body>
<div class="header">
  <h1>📦 <span>Pipeline</span> Dashboard</h1>
  <div class="hr"><div class="live-dot"></div><span id="st">加载中...</span><span class="badge" id="sb">--</span><span id="ck"></span></div>
</div>
<div class="container">
  <div class="pipeline"><h2>流水线进度</h2><div id="stages"></div><div class="stats" id="stats"></div></div>
  <div class="main"><div id="docs"></div></div>
</div>
<script>
const PI={1:'📋',2:'🏗️',3:'💻',4:'🔍',5:'🔧',6:'🧪',7:'🔄'},PD={1:'需求分析与 PRD',2:'架构 + UI + 测试计划',3:'功能代码实现',4:'代码质量审查',5:'修复审查问题',6:'编写测试并执行',7:'Bug 修复 + 重新测试'},RL={architect:'架构师','ui-designer':'UI 设计师',tester:'测试工程师'};
setInterval(()=>{document.getElementById('ck').textContent=new Date().toLocaleTimeString('zh-CN')},1000);
function fmtSz(b){if(!b)return'0 B';if(b<1024)return b+' B';if(b<1048576)return(b/1024).toFixed(1)+' KB';return(b/1048576).toFixed(1)+' MB'}
function ago(d){const s=Math.floor((Date.now()-new Date(d))/1000);if(s<60)return s+'秒前';if(s<3600)return Math.floor(s/60)+'分钟前';return Math.floor(s/3600)+'小时前'}

function renderStages(data){const{phases,currentPhase:cp,fixRounds:fr}=data;let h='';
for(const p of phases){const s=p.status||'pending',act=p.id===cp&&s==='running',c=s==='done'?'stg-done':act?'stg-active':'stg-pending';
const sl={done:'✅ 完成',running:'🔄 执行中...',pending:'⏳ 等待',failed:'❌ 失败',skipped:'⏭️ 跳过'}[s]||'⏳';
h+='<div class="stg '+c+'"><div class="stg-line"></div><div class="stg-icon">'+(PI[p.id]||'📌')+'</div><div class="stg-info"><h3>Phase '+p.id+': '+p.name+'</h3><p>'+(PD[p.id]||p.name)+' — '+sl+'</p>';
if(p.id===2&&p.subtasks){h+='<div class="subtasks">';for(const t of p.subtasks)h+='<div class="subtask"><div class="sd '+(t.status||'pending')+'"></div><span class="sn">'+(RL[t.role]||t.role)+'</span><span class="ss">'+(t.fileSize?fmtSz(t.fileSize):'')+'</span></div>';h+='</div>'}
if(p.id===7&&fr){const{current:cur,max,results:r}=fr;if(cur>0||s==='running'){h+='<div style="margin-top:8px"><span style="font-size:11px;color:var(--text2)">修复轮次: '+cur+'/'+max+'</span></div>'}}
h+='</div></div>'}
document.getElementById('stages').innerHTML=h;
const dn=phases.filter(x=>x.status==='done').length,tot=phases.length,sc=data.srcFiles?data.srcFiles.length:0;
document.getElementById('stats').innerHTML='<div class="stat"><div class="sv">'+dn+'/'+tot+'</div><div class="sl">阶段</div></div><div class="stat"><div class="sv">'+sc+'</div><div class="sl">代码</div></div><div class="stat"><div class="sv">'+(fr?fr.current:0)+'</div><div class="sl">修复轮</div></div><div class="stat"><div class="sv">'+(data.status==='done'?'✅':'🔄')+'</div><div class="sl">状态</div></div>';
const bd=document.getElementById('sb'),st=document.getElementById('st');
if(data.status==='done'){bd.className='badge b-done';bd.textContent='已完成';st.textContent='全部完成'}
else{bd.className='badge b-run';bd.textContent='Phase '+cp;const cu=phases.find(x=>x.id===cp);st.textContent=cu?cu.name+'执行中':'运行中'}}

function renderDocs(docs){const cl={prd:'PRD',architecture:'架构','ui-design':'UI','test-plans':'测试',reviews:'审查'};
const g=docs.map(d=>'<div class="dc"><div class="cat cat-'+d.category+'">'+(cl[d.category]||d.category)+'</div><h4>'+d.name+'</h4><div style="font-size:11px;color:var(--text2)">'+fmtSz(d.size)+(d.mtime?' · '+ago(d.mtime):'')+'</div></div>').join('');
document.getElementById('docs').innerHTML='<h2 style="margin-bottom:16px;font-size:16px">📄 产出文档</h2><div class="dg">'+(g||'<p style="color:var(--text2)">暂无文档...</p>')+'</div>'}

async function refresh(){try{const[sr,dr]=await Promise.all([fetch('/api/status'),fetch('/api/docs')]);
const s=await sr.json(),d=await dr.json();renderStages(s);renderDocs(d)}catch(e){console.error(e)}}
refresh();setInterval(refresh,5000);
<\/script></body></html>`;
}

// ── Init project ──

function initProject(root) {
  const dirs = ['.claude/roles', 'docs/prd', 'docs/architecture', 'docs/ui-design', 'docs/test-plans', 'docs/reviews', 'docs/.pipeline-logs', 'scripts', 'src'];
  for (const d of dirs) fs.mkdirSync(path.join(root, d), { recursive: true });
  console.log(`Created ${dirs.length} directories`);
  console.log(`\nProject initialized at ${root}`);
  console.log('Use /agent run <feature> in Claude Code to start the pipeline.');
}

// ── CLI dispatch ──

const args = process.argv.slice(2);
const cmd = args[0] || 'help';

switch (cmd) {
  case 'status':
  case 's':
    showStatus(ROOT);
    break;

  case 'dashboard':
  case 'd': {
    const port = parseInt(args[1]) || 3210;
    startDashboardCLI(ROOT, port);
    break;
  }

  case 'init':
  case 'i':
    initProject(ROOT);
    break;

  case 'run':
  case 'r': {
    const feature = args[1];
    const startPhase = parseInt(args[2]) || 1;
    if (!feature) {
      console.error('Usage: cli.js run <feature> [phase]');
      process.exit(1);
    }
    console.log(`\nTo run the full pipeline, use Claude Code:`);
    console.log(`  /agent run ${feature}${startPhase > 1 ? ' ' + startPhase : ''}`);
    console.log(`\nThe CLI can only show status and start the dashboard.`);
    console.log(`The pipeline orchestration requires Claude Code's Agent tool.`);
    break;
  }

  case 'help':
  case 'h':
  default:
    console.log(`
Agent Pipeline CLI

Usage: node cli.js <command> [args]

Commands:
  status                  Show pipeline progress
  dashboard [port]        Start web dashboard (default: 3210)
  init                    Initialize project directories
  run <feature> [phase]   Show how to run pipeline in Claude Code

Note: Pipeline orchestration (agent spawning) requires Claude Code.
      Use /agent run <feature> inside Claude Code for full pipeline execution.
`);
    break;
}
