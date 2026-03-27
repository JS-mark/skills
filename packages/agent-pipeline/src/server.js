/**
 * Multi-Agent Pipeline — Claude Code MCP Plugin
 *
 * Tools:
 *   pipeline_status          Get pipeline status (structured JSON)
 *   pipeline_update_phase    Update a phase/subtask status
 *   pipeline_init_project    Scaffold project dirs, role files
 *   pipeline_dashboard       Start/stop web dashboard
 *   pipeline_role_prompt     Get role system prompt for agent spawning
 *   pipeline_check_ready     Check if project has required role files
 *   pipeline_init_status     Create initial status JSON for a pipeline run
 *   pipeline_finalize        Mark pipeline as done/failed
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";
import http from "http";
import os from "os";

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

const fileExists = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } };
const dirExists = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };
const fileSize = (p) => { try { return fs.statSync(p).size; } catch { return 0; } };
const fileMtime = (p) => { try { return fs.statSync(p).mtime.toISOString(); } catch { return null; } };
const isoNow = () => new Date().toISOString();
const formatSize = (b) => { if (!b) return '0 B'; if (b < 1024) return b + ' B'; if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'; return (b / 1048576).toFixed(1) + ' MB'; };

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

function globMatch(dir, pattern) {
  if (!dirExists(dir)) return [];
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  return fs.readdirSync(dir).filter(f => regex.test(f));
}

function resolveRoot(rootArg) {
  return rootArg || process.env.PIPELINE_ROOT || process.cwd();
}

function statusPath(root) { return path.join(root, 'docs/.pipeline-status.json'); }
function logDir(root) { return path.join(root, 'docs/.pipeline-logs'); }

function readStatus(root) {
  const p = statusPath(root);
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; }
}

function writeStatus(root, data) {
  const p = statusPath(root);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

// ═══════════════════════════════════════════════════════════════════════════
// Role file templates
// ═══════════════════════════════════════════════════════════════════════════

const ROLE_TEMPLATES = {
  'pm.md': `# Role: Product Manager (PM)

You are a senior product manager. Your job is to convert user requirements into clear, actionable Product Requirements Documents (PRD).

## Core Responsibilities
- Analyze user requirements and define feature boundaries
- Write standardized PRD documents
- Define user stories and acceptance criteria
- Plan priorities and iteration rhythm

## Work Process
### Input
- User's feature request or problem description
- Existing product documents (if any)

### Output
All output goes to \`docs/prd/\`, filename format: \`feature-<name>.md\`

### PRD Template

---
feature: <name>
role: pm
status: draft
date: <YYYY-MM-DD>
---

# <Feature Name> — Product Requirements Document

## 1. Overview
## 2. Target Users
## 3. User Stories
## 4. Functional Requirements
### 4.1 Core Features
### 4.2 Extended Features (optional)
## 5. Non-Functional Requirements
## 6. Acceptance Criteria
## 7. Priority Matrix
## 8. Open Questions

## Guidelines
1. User-first perspective
2. Clear boundaries — define what's NOT included
3. Verifiable — every requirement has acceptance criteria
4. Pragmatic — phase appropriately, avoid over-design
5. Communicate — ask when uncertain, don't assume`,

  'architect.md': `# Role: Architecture Designer

You are a senior architect. Your job is to convert PRD into executable technical design documents.

## Core Responsibilities
- Module design and dependency management
- Interface definition (API, Props, data contracts)
- Data model and flow design
- Tech stack selection and justification
- Risk assessment and mitigation

## Work Process
### Input
- PRD from \`docs/prd/feature-<name>.md\` (MUST read first)

### Output
All output goes to \`docs/architecture/\`, filename format: \`feature-<name>.md\`

### Technical Design Template

---
feature: <name>
role: architect
status: draft
depends_on:
  - docs/prd/feature-<name>.md
date: <YYYY-MM-DD>
---

# <Feature Name> — Technical Design Document

## 1. Overview
## 2. Module Design
## 3. Interface Definitions
## 4. Data Models
## 5. Tech Stack Selection
## 6. Risk Assessment
## 7. Implementation Steps

## Guidelines
1. Read PRD first — always
2. Leverage existing architecture
3. Interface-first design
4. Justify every tech choice`,

  'ui-designer.md': `# Role: UI Designer

You are a senior UI/UX designer. Your job is to create interface design specifications and interaction flows.

## Core Responsibilities
- Page layout and information architecture
- Component decomposition and reuse strategy
- Interaction flows and state transitions
- Design tokens and style guide
- Responsive / adaptive design

## Work Process
### Input
- PRD from \`docs/prd/feature-<name>.md\`
- Technical design from \`docs/architecture/feature-<name>.md\` (if exists)

### Output
All output goes to \`docs/ui-design/\`, filename format: \`feature-<name>.md\`

### UI Design Template

---
feature: <name>
role: ui-designer
status: draft
depends_on:
  - docs/prd/feature-<name>.md
date: <YYYY-MM-DD>
---

# <Feature Name> — UI Design Document

## 1. Design Overview
## 2. Page Structure
## 3. Interaction Flows
## 4. Component Planning
## 5. Style Guide
## 6. Responsive Strategy
## 7. Animation Specs

## Guidelines
1. Consistency with existing design language
2. Accessibility focus
3. Mobile-first approach
4. Use ASCII art for layout mockups`,

  'fullstack.md': `# Role: Fullstack Engineer

You are a senior fullstack engineer. Your job is to implement features according to technical specs and UI design.

## Core Responsibilities
- Implement code following design docs
- Write clean, maintainable code
- Include basic self-tests
- Follow project conventions

## Work Process
### Input
- PRD: \`docs/prd/feature-<name>.md\`
- Technical design: \`docs/architecture/feature-<name>.md\`
- UI design: \`docs/ui-design/feature-<name>.md\`

### Output
Source code in \`src/\` directory following the project's structure.

### Implementation Order
1. Read ALL upstream documents first
2. Set up project structure (if needed)
3. Implement data models / types
4. Implement core logic / services
5. Implement UI components
6. Wire everything together
7. Basic smoke testing

## Guidelines
1. Documentation-driven — follow the specs
2. Incremental commits with clear messages
3. Don't over-engineer — match the spec
4. When in doubt, refer to architecture doc`,

  'tester.md': `# Role: Test Engineer

You are a senior QA engineer. Your job is to create and execute test plans based on PRD acceptance criteria.

## Core Responsibilities
- Write test plans from acceptance criteria
- Create unit and integration tests
- Execute tests and report results
- Report bugs with reproduction steps

## Work Process
### Input
- PRD: \`docs/prd/feature-<name>.md\`
- Technical design: \`docs/architecture/feature-<name>.md\` (if exists)
- Source code: \`src/\` directory

### Output
- Test plan: \`docs/test-plans/feature-<name>.md\`
- Test code: \`src/**/__tests__/\` directories
- Test results: \`docs/test-plans/feature-<name>-results-round-N.md\`

### Test Plan Template

---
feature: <name>
role: tester
status: draft
depends_on:
  - docs/prd/feature-<name>.md
date: <YYYY-MM-DD>
---

# <Feature Name> — Test Plan

## 1. Test Scope
## 2. Test Cases
| ID | Description | Steps | Expected | Priority |
|----|-------------|-------|----------|----------|
## 3. Test Results
## 4. Bug Reports

## Guidelines
1. Acceptance criteria driven
2. Boundary testing focus
3. AAA pattern (Arrange-Act-Assert)
4. Tests must be repeatable and independent`,

  'reviewer.md': `# Role: Code Reviewer

You are a senior code reviewer. Your job is to perform comprehensive code review for quality, security, and performance.

## Core Responsibilities
- Code quality assessment
- Security vulnerability check
- Performance evaluation
- Test coverage review

## Work Process
### Input
- PRD: \`docs/prd/feature-<name>.md\`
- Technical design: \`docs/architecture/feature-<name>.md\`
- Test results: \`docs/test-plans/feature-<name>.md\`
- Code changes: use \`git diff\` to review

### Output
Review report: \`docs/reviews/feature-<name>.md\`

### Review Template

---
feature: <name>
role: reviewer
status: draft
depends_on:
  - docs/prd/feature-<name>.md
date: <YYYY-MM-DD>
---

# <Feature Name> — Code Review Report

## 1. Compliance Checklist
## 2. Code Quality
## 3. Security Assessment
## 4. Performance Evaluation
## 5. Test Coverage
## 6. Issues Found
| Severity | File | Line | Issue | Suggestion |
|----------|------|------|-------|------------|

## 7. Blocker Summary
List all 🔴 Blocker issues here. If none, write "无 Blocker 问题".

## 8. Summary & Recommendation

## Severity Levels
- 🔴 Blocker: Must fix, blocks release
- 🟡 Warning: Should fix, doesn't block
- 🟢 Info: Suggestion only

## Guidelines
1. Evidence-based — cite specific code
2. Constructive — provide solutions, not just problems`,
};

// ═══════════════════════════════════════════════════════════════════════════
// Dashboard HTML (inline)
// ═══════════════════════════════════════════════════════════════════════════

function getDashboardHTML() {
return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Pipeline Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
<style>
:root{--bg:#0f172a;--surface:#1e293b;--surface2:#334155;--border:#475569;--text:#e2e8f0;--text2:#94a3b8;--green:#22c55e;--blue:#3b82f6;--orange:#f59e0b;--red:#ef4444;--purple:#a855f7;--cyan:#06b6d4;--magenta:#d946ef}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,'SF Pro','Helvetica Neue',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
.header{background:linear-gradient(135deg,#1e3a5f,#0f172a);border-bottom:1px solid var(--border);padding:20px 32px;display:flex;align-items:center;justify-content:space-between}
.header h1{font-size:22px;font-weight:700}.header h1 span{color:var(--blue)}
.hr{display:flex;align-items:center;gap:16px;font-size:13px;color:var(--text2)}
.live-dot{width:8px;height:8px;border-radius:50%;background:var(--green);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.badge{padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600}
.b-run{background:rgba(59,130,246,.2);color:var(--blue)}.b-done{background:rgba(34,197,94,.2);color:var(--green)}
.vtag{font-size:11px;background:rgba(168,85,247,.2);color:var(--purple);padding:2px 8px;border-radius:8px}
.container{display:grid;grid-template-columns:380px 1fr;grid-template-rows:auto 1fr;height:calc(100vh - 73px)}
.pipeline{padding:24px;border-right:1px solid var(--border);overflow-y:auto}
.pipeline h2{font-size:14px;color:var(--text2);text-transform:uppercase;letter-spacing:1px;margin-bottom:20px}
.stg{display:flex;gap:16px;margin-bottom:8px;position:relative}
.stg-line{position:absolute;left:19px;top:40px;bottom:-8px;width:2px;background:var(--surface2)}.stg:last-child .stg-line{display:none}
.stg-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;z-index:1}
.stg-done .stg-icon{background:rgba(34,197,94,.15)}.stg-active .stg-icon{background:rgba(59,130,246,.2);animation:pulse 2s infinite}
.stg-pending .stg-icon{background:var(--surface2);opacity:.5}.stg-failed .stg-icon{background:rgba(239,68,68,.15)}.stg-skipped .stg-icon{background:var(--surface2);opacity:.3}
.stg-info{flex:1;padding-bottom:20px}.stg-info h3{font-size:14px;font-weight:600;margin-bottom:2px}.stg-info p{font-size:12px;color:var(--text2)}.stg-info .meta{font-size:11px;color:var(--text2);margin-top:4px}
.stg-done .stg-info h3{color:var(--green)}.stg-active .stg-info h3{color:var(--blue)}.stg-pending .stg-info h3{color:var(--text2)}.stg-failed .stg-info h3{color:var(--red)}
.subtasks{margin-top:8px;padding-left:4px}.subtask{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:12px}
.sd{width:6px;height:6px;border-radius:50%}.sd.done{background:var(--green)}.sd.running{background:var(--blue);animation:pulse 1s infinite}.sd.pending{background:var(--surface2)}.sd.failed{background:var(--red)}
.sn{color:var(--text2)}.ss{color:var(--text2);font-size:11px;margin-left:auto}
.fr{margin-top:8px}.fr-bar{display:flex;gap:4px;margin-top:4px}
.frd{width:20px;height:6px;border-radius:3px;background:var(--surface2)}.frd.passed{background:var(--green)}.frd.failed{background:var(--red)}.frd.current{background:var(--blue);animation:pulse 1s infinite}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:24px;padding-top:20px;border-top:1px solid var(--surface2)}
.stat{background:var(--surface);border-radius:10px;padding:10px;text-align:center}
.sv{font-size:20px;font-weight:700;color:var(--cyan)}.sl{font-size:10px;color:var(--text2);margin-top:2px}
.tabs{grid-column:1/-1;background:var(--surface);border-bottom:1px solid var(--border);display:flex;padding:0 24px}
.tab{padding:12px 20px;font-size:13px;font-weight:500;color:var(--text2);cursor:pointer;border:none;background:none;border-bottom:2px solid transparent;transition:all .2s}
.tab:hover{color:var(--text)}.tab.active{color:var(--blue);border-bottom-color:var(--blue)}
.main{overflow-y:auto}.pnl{display:none;padding:24px;height:100%}.pnl.active{display:block}
.dg{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:24px}
.dc{background:var(--surface);border:1px solid var(--surface2);border-radius:12px;padding:16px;cursor:pointer;transition:all .2s}.dc:hover{border-color:var(--blue);transform:translateY(-2px)}.dc h4{font-size:14px;margin-bottom:6px}
.cat{font-size:11px;padding:2px 8px;border-radius:6px;font-weight:500;display:inline-block;margin-bottom:8px}
.cat-prd{background:rgba(168,85,247,.15);color:var(--purple)}.cat-architecture{background:rgba(6,182,212,.15);color:var(--cyan)}.cat-ui-design{background:rgba(245,158,11,.15);color:var(--orange)}.cat-test-plans{background:rgba(34,197,94,.15);color:var(--green)}.cat-reviews{background:rgba(239,68,68,.15);color:var(--red)}
.dv{background:var(--surface);border-radius:12px;padding:32px;max-width:900px}
.dvh{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--surface2)}
.dvb{background:var(--surface2);border:none;color:var(--text);padding:6px 14px;border-radius:8px;cursor:pointer;font-size:13px}.dvb:hover{background:var(--border)}
.md{line-height:1.8;font-size:14px}.md h1{font-size:22px;margin:24px 0 12px;padding-bottom:8px;border-bottom:1px solid var(--surface2)}.md h2{font-size:18px;margin:20px 0 10px;color:var(--cyan)}.md h3{font-size:15px;margin:16px 0 8px}.md p{margin:8px 0}.md code{background:var(--surface2);padding:2px 6px;border-radius:4px;font-size:13px}.md pre{background:#0d1117;border-radius:8px;padding:16px;overflow-x:auto;margin:12px 0}.md pre code{background:none;padding:0}.md table{width:100%;border-collapse:collapse;margin:12px 0}.md th,.md td{border:1px solid var(--surface2);padding:8px 12px;font-size:13px;text-align:left}.md th{background:var(--surface2)}.md ul,.md ol{padding-left:24px}.md li{margin:4px 0}.md blockquote{border-left:3px solid var(--blue);padding-left:16px;color:var(--text2);margin:12px 0}
.ft{font-family:'SF Mono','Fira Code',monospace;font-size:13px}
.fi{display:flex;align-items:center;gap:8px;padding:6px 12px;border-radius:6px;cursor:pointer}.fi:hover{background:var(--surface)}.fi .ic{width:20px;text-align:center}.fi .nm{flex:1}.fi .sz{color:var(--text2);font-size:11px}
.fv{background:var(--surface);border-radius:12px;margin-top:16px}.fvh{padding:12px 16px;border-bottom:1px solid var(--surface2);font-weight:600;font-size:13px;display:flex;justify-content:space-between}.fv pre{padding:16px;overflow-x:auto;font-size:12px;line-height:1.6;max-height:600px;overflow-y:auto}
.ll{margin-bottom:16px}.li{display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--surface);border:1px solid var(--surface2);border-radius:8px;margin-bottom:8px;cursor:pointer;transition:all .2s}.li:hover{border-color:var(--blue)}.li .ln{font-size:13px;font-weight:500;flex:1}.li .lm{font-size:11px;color:var(--text2)}
.lc{background:#0d1117;border-radius:12px;padding:20px;font-family:'SF Mono',monospace;font-size:12px;line-height:1.7;white-space:pre-wrap;word-break:break-all;max-height:calc(100vh - 300px);overflow-y:auto;color:#c9d1d9}
@media(max-width:900px){.container{grid-template-columns:1fr}.pipeline{border-right:none;border-bottom:1px solid var(--border)}.stats{grid-template-columns:repeat(2,1fr)}}
</style>
</head>
<body>
<div class="header">
  <h1>📦 <span>Pipeline</span> Dashboard</h1>
  <div class="hr"><span class="vtag">MCP Plugin</span><div class="live-dot" id="ld"></div><span id="st">加载中...</span><span class="badge" id="sb">--</span><span id="ck"></span></div>
</div>
<div class="tabs">
  <button class="tab active" data-t="overview">📊 概览</button>
  <button class="tab" data-t="docs">📄 文档</button>
  <button class="tab" data-t="code">💻 代码</button>
  <button class="tab" data-t="logs">📋 日志</button>
</div>
<div class="container">
  <div class="pipeline"><h2>流水线进度</h2><div id="stages"></div><div class="stats" id="stats"></div></div>
  <div class="main">
    <div class="pnl active" id="p-overview"><div id="oDocs"></div></div>
    <div class="pnl" id="p-docs"><div id="dList"></div><div id="dView" style="display:none"></div></div>
    <div class="pnl" id="p-code"><div id="fTree"></div><div id="fView"></div></div>
    <div class="pnl" id="p-logs"><div id="lList"></div><div id="lView"></div></div>
  </div>
</div>
<script>
const PI={1:'📋',2:'🏗️',3:'💻',4:'🔍',5:'🔧',6:'🧪',7:'🔄'},PD={1:'需求分析与 PRD',2:'架构 + UI + 测试计划',3:'功能代码实现',4:'代码质量审查',5:'修复审查问题',6:'编写测试并执行',7:'Bug 修复 + 重新测试'},RL={architect:'架构师','ui-designer':'UI 设计师',tester:'测试工程师'};
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.pnl').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.getElementById('p-'+b.dataset.t).classList.add('active')}));
setInterval(()=>{document.getElementById('ck').textContent=new Date().toLocaleTimeString('zh-CN')},1000);
function fmtSz(b){if(!b)return'0 B';if(b<1024)return b+' B';if(b<1048576)return(b/1024).toFixed(1)+' KB';return(b/1048576).toFixed(1)+' MB'}
function ago(d){const s=Math.floor((Date.now()-new Date(d))/1000);if(s<60)return s+'秒前';if(s<3600)return Math.floor(s/60)+'分钟前';if(s<86400)return Math.floor(s/3600)+'小时前';return Math.floor(s/86400)+'天前'}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

function renderStages(data){const{phases,currentPhase:cp,fixRounds:fr}=data;let h='';
for(const p of phases){const s=p.status||'pending',act=p.id===cp&&s==='running',c=s==='done'?'stg-done':act?'stg-active':s==='failed'?'stg-failed':s==='skipped'?'stg-skipped':'stg-pending';
const sl={done:'✅ 完成',running:'🔄 执行中...',pending:'⏳ 等待',failed:'❌ 失败',skipped:'⏭️ 跳过'}[s]||'⏳';
let m='';if(p.fileSize)m=fmtSz(p.fileSize);if(p.fileCount)m=p.fileCount+' 文件'+(p.fileSize?' / '+fmtSz(p.fileSize):'');
h+='<div class="stg '+c+'"><div class="stg-line"></div><div class="stg-icon">'+(PI[p.id]||'📌')+'</div><div class="stg-info"><h3>Phase '+p.id+': '+p.name+'</h3><p>'+(PD[p.id]||p.name)+' — '+sl+'</p>'+(m?'<div class="meta">'+m+'</div>':'');
if(p.id===2&&p.subtasks){h+='<div class="subtasks">';for(const t of p.subtasks)h+='<div class="subtask"><div class="sd '+(t.status||'pending')+'"></div><span class="sn">'+(RL[t.role]||t.role)+'</span><span class="ss">'+(t.fileSize?fmtSz(t.fileSize):'')+'</span></div>';h+='</div>'}
if(p.id===7&&fr){const{current:cur,max,results:r}=fr;if(cur>0||s==='running'){h+='<div class="fr"><span style="font-size:11px;color:var(--text2)">修复轮次: '+cur+'/'+max+'</span><div class="fr-bar">';for(let i=0;i<max;i++){let dc='';if(i<r.length)dc=r[i]==='passed'?'passed':'failed';else if(i===r.length&&s==='running')dc='current';h+='<div class="frd '+dc+'"></div>'}h+='</div></div>'}}
h+='</div></div>'}
document.getElementById('stages').innerHTML=h;
const dn=phases.filter(x=>x.status==='done').length,tot=phases.length,sc=data.srcFiles?data.srcFiles.length:0,ts=phases.reduce((a,x)=>a+(x.fileSize||0),0),rn=fr?fr.current:0;
document.getElementById('stats').innerHTML='<div class="stat"><div class="sv">'+dn+'/'+tot+'</div><div class="sl">阶段</div></div><div class="stat"><div class="sv">'+sc+'</div><div class="sl">代码</div></div><div class="stat"><div class="sv">'+fmtSz(ts)+'</div><div class="sl">产出</div></div><div class="stat"><div class="sv">'+rn+'</div><div class="sl">修复轮</div></div>';
const bd=document.getElementById('sb'),st=document.getElementById('st'),ad=phases.every(x=>x.status==='done'||x.status==='skipped');
if(data.status==='done'||ad){bd.className='badge b-done';bd.textContent='已完成';st.textContent='全部完成';document.getElementById('ld').style.animation='none'}
else{bd.className='badge b-run';bd.textContent='Phase '+cp;const cu=phases.find(x=>x.id===cp);st.textContent=cu?cu.name+'执行中':'运行中'}}

function renderDocs(docs){const cl={prd:'PRD',architecture:'架构','ui-design':'UI','test-plans':'测试',reviews:'审查'};
const g=docs.map(d=>'<div class="dc" onclick="viewDoc(\\''+d.path+'\\')"><div class="cat cat-'+d.category+'">'+(cl[d.category]||d.category)+'</div><h4>'+d.name+'</h4><div style="font-size:11px;color:var(--text2)">'+fmtSz(d.size)+(d.mtime?' · '+ago(d.mtime):'')+'</div></div>').join('');
document.getElementById('oDocs').innerHTML='<h2 style="margin-bottom:16px;font-size:16px">📄 文档</h2><div class="dg">'+g+'</div>';
document.getElementById('dList').innerHTML='<div class="dg">'+g+'</div>'}

async function viewDoc(p){document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.pnl').forEach(x=>x.classList.remove('active'));document.querySelector('[data-t="docs"]').classList.add('active');document.getElementById('p-docs').classList.add('active');
const r=await fetch('/api/doc?path='+encodeURIComponent(p));const t=await r.text();document.getElementById('dList').style.display='none';const v=document.getElementById('dView');v.style.display='block';
v.innerHTML='<div class="dv"><div class="dvh"><span>'+p+'</span><button class="dvb" onclick="closeDV()">← 返回</button></div><div class="md">'+marked.parse(t)+'</div></div>'}
function closeDV(){document.getElementById('dList').style.display='';document.getElementById('dView').style.display='none'}

function renderFiles(files){if(!files||!files.length){document.getElementById('fTree').innerHTML='<p style="color:var(--text2);padding:20px">暂无代码...</p>';return}
const dirs={};for(const f of files){const p=f.path.split('/'),d=p.length>1?p.slice(0,-1).join('/'):'.';if(!dirs[d])dirs[d]=[];dirs[d].push(f)}
let h='';for(const[d,items]of Object.entries(dirs).sort()){h+='<div style="margin-bottom:16px"><div style="font-size:12px;color:var(--text2);margin-bottom:4px;padding:4px 12px">📁 src/'+d+'</div>';
for(const f of items){const ext=f.path.split('.').pop(),ic={js:'📜',ts:'🔷',json:'📋',vue:'💚',css:'🎨'}[ext]||'📄';
h+='<div class="fi" onclick="viewFile(\\''+f.path+'\\')"><span class="ic">'+ic+'</span><span class="nm">'+f.path.split('/').pop()+'</span><span class="sz">'+fmtSz(f.size)+'</span></div>'}h+='</div>'}
document.getElementById('fTree').innerHTML=h}
async function viewFile(p){const r=await fetch('/api/file?path='+encodeURIComponent(p));const t=await r.text();document.getElementById('fView').innerHTML='<div class="fv"><div class="fvh"><span>src/'+p+'</span><span style="color:var(--text2);font-weight:400">'+fmtSz(t.length)+'</span></div><pre><code>'+esc(t)+'</code></pre></div>'}

function renderLogs(logs){if(!logs||!logs.length){document.getElementById('lList').innerHTML='<p style="color:var(--text2);padding:20px">暂无日志...</p>';return}
let h='<h2 style="margin-bottom:16px;font-size:16px">📋 日志</h2><div class="ll">';for(const l of logs)h+='<div class="li" onclick="viewLog(\\''+l.name+'\\')"><span class="ln">'+l.name+'</span><span class="lm">'+fmtSz(l.size)+(l.mtime?' · '+ago(l.mtime):'')+'</span></div>';
h+='</div>';document.getElementById('lList').innerHTML=h}
async function viewLog(n){const r=await fetch('/api/logs?file='+encodeURIComponent(n));const t=await r.text();document.getElementById('lView').innerHTML='<h3 style="margin:16px 0 8px;font-size:14px">'+n+'</h3><div class="lc">'+esc(t)+'</div>'}

async function refresh(){try{const[sr,dr,lr]=await Promise.all([fetch('/api/status'),fetch('/api/docs'),fetch('/api/logs')]);
const s=await sr.json(),d=await dr.json(),l=await lr.json();renderStages(s);renderDocs(d);renderFiles(s.srcFiles);renderLogs(l)}catch(e){console.error(e)}}
refresh();setInterval(refresh,5000);
<\/script></body></html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Dashboard Server
// ═══════════════════════════════════════════════════════════════════════════

let dashboardServer = null;

function startDashboard(root, port) {
  if (dashboardServer) {
    try { dashboardServer.close(); } catch {}
    dashboardServer = null;
  }

  const srv = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    const p = url.pathname;
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (p === '/api/status') {
      const data = getEnrichedStatus(root);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    }
    if (p === '/api/docs') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(getDocuments(root)));
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
      const ld = logDir(root);
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
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(getDashboardHTML());
  });

  srv.listen(port);
  dashboardServer = srv;
  return port;
}

function getEnrichedStatus(root) {
  const data = readStatus(root);
  if (data && data.version === 2) {
    const srcFiles = walkDir(path.join(root, 'src'));
    data.srcFiles = srcFiles;
    data.timestamp = isoNow();
    const feature = data.feature;
    for (const phase of data.phases) {
      if (phase.id === 2 && phase.subtasks) {
        const map = { architect: `docs/architecture/feature-${feature}.md`, 'ui-designer': `docs/ui-design/feature-${feature}.md`, tester: `docs/test-plans/feature-${feature}.md` };
        for (const st of phase.subtasks) { const f = map[st.role]; if (f) { const abs = path.join(root, f); st.fileExists = fileExists(abs); st.fileSize = fileSize(abs); } }
      }
      if (phase.id === 3) { phase.fileCount = srcFiles.length; phase.fileSize = srcFiles.reduce((s, f) => s + f.size, 0); }
    }
    return data;
  }
  // Legacy fallback
  const prdDir = path.join(root, 'docs/prd');
  let feature = 'unknown';
  const prdFiles = globMatch(prdDir, 'feature-*.md');
  if (prdFiles.length > 0) feature = prdFiles[0].replace('feature-', '').replace('.md', '');
  const srcFiles = walkDir(path.join(root, 'src'));
  return { version: 2, feature, status: 'unknown', currentPhase: 0, phases: [], srcFiles, fixRounds: { current: 0, max: 5, results: [] }, timestamp: isoNow() };
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

// ═══════════════════════════════════════════════════════════════════════════
// MCP Server Definition
// ═══════════════════════════════════════════════════════════════════════════

const server = new McpServer({
  name: "agent-pipeline",
  version: "2.0.0",
});

// ── Tool: pipeline_check_ready ──
server.tool(
  "pipeline_check_ready",
  "Check if the current project has required role files and directories for the multi-agent pipeline",
  { root: z.string().optional().describe("Project root path (default: cwd)") },
  async ({ root: rootArg }) => {
    const root = resolveRoot(rootArg);
    const roles = ['pm.md', 'architect.md', 'ui-designer.md', 'fullstack.md', 'tester.md', 'reviewer.md'];
    const found = [];
    const missing = [];
    for (const r of roles) {
      const p = path.join(root, '.claude/roles', r);
      (fileExists(p) ? found : missing).push(r);
    }
    const dirs = ['docs/prd', 'docs/architecture', 'docs/ui-design', 'docs/test-plans', 'docs/reviews'];
    const existingDirs = dirs.filter(d => dirExists(path.join(root, d)));
    return {
      content: [{ type: "text", text: JSON.stringify({ root, ready: missing.length === 0, roles: { found, missing }, directories: existingDirs, projectName: path.basename(root) }, null, 2) }],
    };
  }
);

// ── Tool: pipeline_init_project ──
server.tool(
  "pipeline_init_project",
  "Initialize multi-agent workflow in a project: create role files, directories, and pipeline shim",
  {
    root: z.string().optional().describe("Project root path"),
    techStack: z.string().optional().describe("Tech stack description to customize role files"),
    language: z.string().optional().describe("Documentation language (default: 中文)"),
  },
  async ({ root: rootArg, techStack, language }) => {
    const root = resolveRoot(rootArg);
    const dirs = ['.claude/roles', 'docs/prd', 'docs/architecture', 'docs/ui-design', 'docs/test-plans', 'docs/reviews', 'docs/.pipeline-logs', 'scripts', 'src'];
    for (const d of dirs) fs.mkdirSync(path.join(root, d), { recursive: true });

    // Write role files
    for (const [name, content] of Object.entries(ROLE_TEMPLATES)) {
      const p = path.join(root, '.claude/roles', name);
      if (!fileExists(p)) {
        let c = content;
        if (techStack) c = `<!-- Tech Stack: ${techStack} -->\n${c}`;
        fs.writeFileSync(p, c);
      }
    }

    // Write pipeline shim
    const shimPath = path.join(root, 'scripts/pipeline.js');
    if (!fileExists(shimPath)) {
      fs.writeFileSync(shimPath, `#!/usr/bin/env node
const path = require('path');
const global = path.join(require('os').homedir(), '.claude/plugins/agent-pipeline/cli.js');
try { require('fs').accessSync(global); } catch {
  console.error('Agent Pipeline plugin not found: ' + global);
  process.exit(1);
}
process.env.PIPELINE_ROOT = process.env.PIPELINE_ROOT || path.resolve(__dirname, '..');
require(global);
`);
    }

    return {
      content: [{ type: "text", text: `Project initialized at ${root}\n\nCreated:\n- ${dirs.length} directories\n- ${Object.keys(ROLE_TEMPLATES).length} role files in .claude/roles/\n- scripts/pipeline.js (shim)\n\nReady to run pipeline with /agent run <feature>` }],
    };
  }
);

// ── Tool: pipeline_status ──
server.tool(
  "pipeline_status",
  "Get current pipeline status with phase progress, subtask details, and fix round info",
  {
    root: z.string().optional().describe("Project root path"),
    feature: z.string().optional().describe("Feature name (auto-detected if omitted)"),
  },
  async ({ root: rootArg, feature: featureArg }) => {
    const root = resolveRoot(rootArg);
    const data = getEnrichedStatus(root);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// ── Tool: pipeline_init_status ──
server.tool(
  "pipeline_init_status",
  "Create the initial pipeline status JSON for a new pipeline run",
  {
    root: z.string().optional().describe("Project root path"),
    feature: z.string().describe("Feature name"),
    startPhase: z.number().min(1).max(7).default(1).describe("Starting phase (1-7)"),
    maxFixRounds: z.number().default(5).describe("Max fix-test loop rounds"),
  },
  async ({ root: rootArg, feature, startPhase, maxFixRounds }) => {
    const root = resolveRoot(rootArg);
    fs.mkdirSync(logDir(root), { recursive: true });
    const data = {
      version: 2, feature, status: 'running', startedAt: isoNow(), currentPhase: startPhase,
      phases: [
        { id: 1, name: '产品经理', status: 'pending' },
        { id: 2, name: '并行设计', status: 'pending', subtasks: [
          { role: 'architect', status: 'pending' }, { role: 'ui-designer', status: 'pending' }, { role: 'tester', status: 'pending' },
        ]},
        { id: 3, name: '全栈开发', status: 'pending' },
        { id: 4, name: '代码审查', status: 'pending' },
        { id: 5, name: '审查修复', status: 'pending' },
        { id: 6, name: '测试执行', status: 'pending' },
        { id: 7, name: '修复-测试循环', status: 'pending' },
      ],
      fixRounds: { current: 0, max: maxFixRounds, results: [] },
    };
    for (let i = 1; i < startPhase; i++) data.phases[i - 1].status = 'skipped';
    writeStatus(root, data);
    return { content: [{ type: "text", text: `Pipeline status initialized for feature "${feature}" starting at Phase ${startPhase}` }] };
  }
);

// ── Tool: pipeline_update_phase ──
server.tool(
  "pipeline_update_phase",
  "Update the status of a pipeline phase or subtask",
  {
    root: z.string().optional().describe("Project root path"),
    phaseId: z.number().min(1).max(7).describe("Phase ID to update"),
    status: z.enum(['pending', 'running', 'done', 'failed', 'skipped']).describe("New status"),
    subtaskRole: z.string().optional().describe("For Phase 2 subtasks: architect, ui-designer, or tester"),
  },
  async ({ root: rootArg, phaseId, status, subtaskRole }) => {
    const root = resolveRoot(rootArg);
    const data = readStatus(root);
    if (!data) return { content: [{ type: "text", text: "No pipeline status file found. Run pipeline_init_status first." }] };

    if (subtaskRole && phaseId === 2) {
      const p2 = data.phases.find(p => p.id === 2);
      if (p2 && p2.subtasks) {
        const st = p2.subtasks.find(s => s.role === subtaskRole);
        if (st) st.status = status;
      }
    } else {
      const phase = data.phases.find(p => p.id === phaseId);
      if (phase) phase.status = status;
    }
    data.currentPhase = phaseId;
    writeStatus(root, data);

    const target = subtaskRole ? `Phase ${phaseId}/${subtaskRole}` : `Phase ${phaseId}`;
    return { content: [{ type: "text", text: `Updated ${target} → ${status}` }] };
  }
);

// ── Tool: pipeline_update_fix_round ──
server.tool(
  "pipeline_update_fix_round",
  "Record a fix-test loop round result",
  {
    root: z.string().optional().describe("Project root path"),
    round: z.number().describe("Current round number"),
    result: z.enum(['passed', 'failed']).describe("Round result"),
  },
  async ({ root: rootArg, round, result }) => {
    const root = resolveRoot(rootArg);
    const data = readStatus(root);
    if (!data) return { content: [{ type: "text", text: "No pipeline status file found." }] };
    data.fixRounds.current = round;
    data.fixRounds.results.push(result);
    writeStatus(root, data);
    return { content: [{ type: "text", text: `Fix round ${round}: ${result}` }] };
  }
);

// ── Tool: pipeline_finalize ──
server.tool(
  "pipeline_finalize",
  "Mark pipeline as done or failed, set completion timestamp",
  {
    root: z.string().optional().describe("Project root path"),
    status: z.enum(['done', 'failed']).describe("Final status"),
  },
  async ({ root: rootArg, status }) => {
    const root = resolveRoot(rootArg);
    const data = readStatus(root);
    if (!data) return { content: [{ type: "text", text: "No pipeline status file found." }] };
    data.status = status;
    data.completedAt = isoNow();
    writeStatus(root, data);
    return { content: [{ type: "text", text: `Pipeline finalized: ${status} at ${data.completedAt}` }] };
  }
);

// ── Tool: pipeline_role_prompt ──
server.tool(
  "pipeline_role_prompt",
  "Get the system prompt content for a specific role (for agent spawning)",
  {
    root: z.string().optional().describe("Project root path"),
    role: z.enum(['pm', 'architect', 'ui-designer', 'fullstack', 'tester', 'reviewer']).describe("Role name"),
  },
  async ({ root: rootArg, role }) => {
    const root = resolveRoot(rootArg);
    const p = path.join(root, `.claude/roles/${role}.md`);
    if (!fileExists(p)) {
      // Fallback to built-in template
      const template = ROLE_TEMPLATES[`${role}.md`];
      if (template) return { content: [{ type: "text", text: template }] };
      return { content: [{ type: "text", text: `Role file not found: ${p}` }] };
    }
    return { content: [{ type: "text", text: fs.readFileSync(p, 'utf-8') }] };
  }
);

// ── Tool: pipeline_dashboard ──
server.tool(
  "pipeline_dashboard",
  "Start or stop the web monitoring dashboard",
  {
    action: z.enum(['start', 'stop']).describe("Start or stop the dashboard"),
    root: z.string().optional().describe("Project root path"),
    port: z.number().default(3210).describe("Dashboard port"),
  },
  async ({ action, root: rootArg, port }) => {
    if (action === 'stop') {
      if (dashboardServer) { dashboardServer.close(); dashboardServer = null; return { content: [{ type: "text", text: "Dashboard stopped." }] }; }
      return { content: [{ type: "text", text: "No dashboard running." }] };
    }
    const root = resolveRoot(rootArg);
    try { startDashboard(root, port); } catch (e) {
      return { content: [{ type: "text", text: `Failed to start dashboard: ${e.message}` }] };
    }
    const nets = os.networkInterfaces();
    let ip = '127.0.0.1';
    for (const name of Object.keys(nets)) { for (const net of nets[name]) { if (net.family === 'IPv4' && !net.internal) { ip = net.address; break; } } }
    return { content: [{ type: "text", text: `Dashboard started!\n  Local:   http://localhost:${port}\n  Network: http://${ip}:${port}\n  Root:    ${root}\n\nAuto-refreshes every 5s.` }] };
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// Start MCP Server
// ═══════════════════════════════════════════════════════════════════════════

const transport = new StdioServerTransport();
await server.connect(transport);
