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
import crypto from "crypto";
import os from "os";
import { execSync } from "child_process";

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
// WebSocket helpers (RFC 6455, zero-dependency)
// ═══════════════════════════════════════════════════════════════════════════

const wsClients = new Set();

function wsBroadcast(msg) {
  const data = JSON.stringify(msg);
  for (const ws of wsClients) {
    try { wsSend(ws, data); } catch { wsClients.delete(ws); }
  }
}

function wsSend(socket, data) {
  const buf = Buffer.from(data);
  let header;
  if (buf.length < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81;
    header[1] = buf.length;
  } else if (buf.length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(buf.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(buf.length), 2);
  }
  socket.write(Buffer.concat([header, buf]));
}

function wsParseFrame(buf) {
  if (buf.length < 2) return null;
  const masked = (buf[1] & 0x80) !== 0;
  let payloadLen = buf[1] & 0x7f;
  let offset = 2;
  if (payloadLen === 126) { payloadLen = buf.readUInt16BE(2); offset = 4; }
  else if (payloadLen === 127) { payloadLen = Number(buf.readBigUInt64BE(2)); offset = 10; }
  const maskOffset = offset;
  if (masked) offset += 4;
  if (buf.length < offset + payloadLen) return null;
  const payload = Buffer.alloc(payloadLen);
  for (let i = 0; i < payloadLen; i++) {
    payload[i] = masked ? buf[offset + i] ^ buf[maskOffset + (i % 4)] : buf[offset + i];
  }
  return { opcode: buf[0] & 0x0f, payload, totalLength: offset + payloadLen };
}

function handleWsUpgrade(req, socket) {
  const key = req.headers['sec-websocket-key'];
  if (!key) { socket.destroy(); return; }
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-5AB541DC65BD').digest('base64');
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
  );
  wsClients.add(socket);
  let buffer = Buffer.alloc(0);
  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (true) {
      const frame = wsParseFrame(buffer);
      if (!frame) break;
      buffer = buffer.slice(frame.totalLength);
      if (frame.opcode === 0x8) { socket.end(); wsClients.delete(socket); return; } // close
      if (frame.opcode === 0x9) { // ping -> pong
        const pong = Buffer.alloc(2); pong[0] = 0x8a; pong[1] = 0;
        socket.write(pong);
      }
    }
  });
  socket.on('close', () => wsClients.delete(socket));
  socket.on('error', () => wsClients.delete(socket));
}

// Enhanced writeStatus: broadcast on change
const _origWriteStatus = writeStatus;
function writeStatusAndBroadcast(root, data) {
  _origWriteStatus(root, data);
  wsBroadcast({ type: 'status', data: getEnrichedStatus(root) });
}

// ═══════════════════════════════════════════════════════════════════════════
// Role management helpers
// ═══════════════════════════════════════════════════════════════════════════

const BUILT_IN_ROLES = new Set(['pm', 'architect', 'ui-designer', 'fullstack', 'tester', 'reviewer']);

const EXTRA_ROLE_TEMPLATES = {
  'devops': `# 角色: DevOps 工程师\n\n你是一名资深 DevOps 工程师，负责 CI/CD 流水线、基础设施和部署。\n\n## 核心职责\n- 搭建 CI/CD 流水线\n- 配置部署环境\n- 编写 Dockerfile 和 compose 文件\n- 管理基础设施即代码 (IaC)\n\n## 产出\n所有产出输出到 \`docs/devops/\`，文件名: \`feature-<name>.md\``,
  'dba': `# 角色: 数据库管理员\n\n你是一名资深 DBA，负责数据库 Schema 设计、迁移和性能优化。\n\n## 核心职责\n- 设计数据库 Schema\n- 编写迁移脚本\n- 优化查询和索引\n- 制定数据备份策略\n\n## 产出\n所有产出输出到 \`docs/database/\`，文件名: \`feature-<name>.md\``,
  'security-auditor': `# 角色: 安全审计员\n\n你是一名资深安全工程师，负责安全审查和漏洞评估。\n\n## 核心职责\n- 审查代码安全漏洞 (OWASP Top 10)\n- 检查认证和授权逻辑\n- 验证输入校验与过滤\n- 评估依赖安全性\n\n## 产出\n所有产出输出到 \`docs/security/\`，文件名: \`feature-<name>.md\``,
  'tech-writer': `# 角色: 技术文档工程师\n\n你是一名资深技术文档工程师，负责面向用户的文档编写。\n\n## 核心职责\n- 编写 API 文档\n- 创建用户指南和教程\n- 维护 README 文件\n- 记录架构决策 (ADR)\n\n## 产出\n所有产出输出到 \`docs/guides/\`，文件名: \`feature-<name>.md\``,
};

function getRoles(root) {
  const rolesDir = path.join(root, '.claude/roles');
  if (!dirExists(rolesDir)) return [];
  return fs.readdirSync(rolesDir).filter(f => f.endsWith('.md')).map(f => {
    const name = f.replace('.md', '');
    const fp = path.join(rolesDir, f);
    return {
      name,
      filename: f,
      content: fs.readFileSync(fp, 'utf-8'),
      builtIn: BUILT_IN_ROLES.has(name),
      size: fileSize(fp),
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Code management helpers
// ═══════════════════════════════════════════════════════════════════════════

function buildFileTree(dir, prefix = '') {
  const result = [];
  if (!dirExists(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', '__pycache__', '.claude', '.next', 'out'].includes(entry.name)) continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push({ name: entry.name, path: rel, type: 'directory', children: buildFileTree(abs, rel) });
    } else {
      result.push({ name: entry.name, path: rel, type: 'file', size: fileSize(abs), mtime: fileMtime(abs) });
    }
  }
  return result;
}

function countLines(filePath) {
  try { return fs.readFileSync(filePath, 'utf-8').split('\n').length; } catch { return 0; }
}

function getCodeStats(root) {
  const srcDir = path.join(root, 'src');
  const files = walkDir(srcDir);
  const languages = {};
  let totalLines = 0;
  let totalSize = 0;
  for (const f of files) {
    const ext = f.path.split('.').pop() || 'other';
    languages[ext] = (languages[ext] || 0) + 1;
    totalLines += countLines(path.join(srcDir, f.path));
    totalSize += f.size;
  }
  return { totalFiles: files.length, totalLines, totalSize, languages };
}

function searchFiles(root, query) {
  const srcDir = path.join(root, 'src');
  const files = walkDir(srcDir);
  const results = [];
  const lowerQ = query.toLowerCase();
  for (const f of files) {
    if (results.length >= 50) break;
    // Match filename
    if (f.path.toLowerCase().includes(lowerQ)) {
      results.push({ file: f.path, line: 0, text: f.path });
      continue;
    }
    // Match content
    try {
      const abs = path.join(srcDir, f.path);
      const lines = fs.readFileSync(abs, 'utf-8').split('\n');
      for (let i = 0; i < lines.length && results.length < 50; i++) {
        if (lines[i].toLowerCase().includes(lowerQ)) {
          results.push({ file: f.path, line: i + 1, text: lines[i].trim().slice(0, 200) });
        }
      }
    } catch {}
  }
  return results;
}

function getGitDiff(root) {
  try { return execSync('git diff --stat && echo "---" && git diff', { cwd: root, encoding: 'utf-8', maxBuffer: 5 * 1024 * 1024, timeout: 10000 }); }
  catch { return 'Git diff not available'; }
}

// ═══════════════════════════════════════════════════════════════════════════
// Dashboard Server (Enhanced)
// ═══════════════════════════════════════════════════════════════════════════

let dashboardServer = null;

function safePath(root, ...parts) {
  const abs = path.resolve(root, ...parts);
  if (!abs.startsWith(path.resolve(root))) return null;
  return abs;
}

function jsonReply(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function textReply(res, text, status = 200) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}

function startDashboard(root, port) {
  if (dashboardServer) {
    try { dashboardServer.close(); } catch {}
    dashboardServer = null;
  }

  const srv = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    const p = url.pathname;

    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    // ─── Existing API endpoints ───
    if (p === '/api/status') { return jsonReply(res, getEnrichedStatus(root)); }
    if (p === '/api/docs') { return jsonReply(res, getDocuments(root)); }

    if (p === '/api/doc') {
      const dp = url.searchParams.get('path');
      if (!dp) { res.writeHead(400); res.end('missing path'); return; }
      const abs = safePath(root, dp);
      if (!abs || !fileExists(abs)) { res.writeHead(404); res.end('not found'); return; }
      return textReply(res, fs.readFileSync(abs, 'utf-8'));
    }

    if (p === '/api/file' && req.method === 'PUT') {
      const body = await readBody(req);
      const fp = body.path;
      const content = body.content;
      if (!fp || typeof content !== 'string') { res.writeHead(400); res.end('missing path or content'); return; }
      const abs = safePath(root, 'src', fp);
      if (!abs) { res.writeHead(403); res.end('forbidden'); return; }
      try {
        const dir = path.dirname(abs);
        if (!dirExists(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(abs, content, 'utf-8');
        return jsonReply(res, { ok: true });
      } catch (e) {
        return jsonReply(res, { error: e.message }, 500);
      }
    }

    if (p === '/api/file') {
      const fp = url.searchParams.get('path');
      if (!fp) { res.writeHead(400); res.end('missing path'); return; }
      const abs = safePath(root, 'src', fp);
      if (!abs || !fileExists(abs)) { res.writeHead(404); res.end('not found'); return; }
      const content = fs.readFileSync(abs, 'utf-8');
      if (content.length > 2 * 1024 * 1024) return textReply(res, '文件过大', 413);
      return textReply(res, content);
    }

    if (p === '/api/logs') {
      const file = url.searchParams.get('file');
      const ld = logDir(root);
      if (file) {
        const abs = path.join(ld, path.basename(file));
        const content = abs.startsWith(ld) && fileExists(abs) ? fs.readFileSync(abs, 'utf-8').replace(/\x1b\[[0-9;]*m/g, '') : '';
        return textReply(res, content);
      }
      const logs = dirExists(ld) ? fs.readdirSync(ld).filter(f => f.endsWith('.log')).map(f => ({ name: f, size: fileSize(path.join(ld, f)), mtime: fileMtime(path.join(ld, f)) })) : [];
      return jsonReply(res, logs);
    }

    // ─── SSE: Log stream ───
    if (p === '/api/logs/stream') {
      const file = url.searchParams.get('file');
      if (!file) { res.writeHead(400); res.end('missing file'); return; }
      const abs = path.join(logDir(root), path.basename(file));
      if (!abs.startsWith(logDir(root))) { res.writeHead(403); res.end('forbidden'); return; }
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
      let lastSize = fileExists(abs) ? fs.statSync(abs).size : 0;
      const interval = setInterval(() => {
        try {
          if (!fileExists(abs)) return;
          const currentSize = fs.statSync(abs).size;
          if (currentSize > lastSize) {
            const fd = fs.openSync(abs, 'r');
            const buf = Buffer.alloc(currentSize - lastSize);
            fs.readSync(fd, buf, 0, buf.length, lastSize);
            fs.closeSync(fd);
            const chunk = buf.toString('utf-8').replace(/\x1b\[[0-9;]*m/g, '');
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
            lastSize = currentSize;
          }
        } catch {}
      }, 1000);
      req.on('close', () => clearInterval(interval));
      return;
    }

    // ─── Control API ───
    if (p === '/api/control/pause' && req.method === 'POST') {
      const data = readStatus(root);
      if (!data) return jsonReply(res, { error: 'No pipeline' }, 404);
      data.status = 'paused';
      writeStatusAndBroadcast(root, data);
      return jsonReply(res, { ok: true, status: 'paused' });
    }

    if (p === '/api/control/resume' && req.method === 'POST') {
      const data = readStatus(root);
      if (!data) return jsonReply(res, { error: 'No pipeline' }, 404);
      data.status = 'running';
      writeStatusAndBroadcast(root, data);
      return jsonReply(res, { ok: true, status: 'running' });
    }

    if (p === '/api/control/cancel' && req.method === 'POST') {
      const body = await readBody(req);
      const data = readStatus(root);
      if (!data) return jsonReply(res, { error: 'No pipeline' }, 404);
      if (body.scope === 'pipeline') {
        data.status = 'cancelled';
        for (const phase of data.phases) {
          if (phase.status === 'pending' || phase.status === 'running') phase.status = 'cancelled';
          if (phase.subtasks) {
            for (const st of phase.subtasks) {
              if (st.status === 'pending' || st.status === 'running') st.status = 'cancelled';
            }
          }
        }
        data.completedAt = isoNow();
      } else if (body.scope === 'phase' && body.phaseId) {
        const phase = data.phases.find(p => p.id === body.phaseId);
        if (phase) phase.status = 'skipped';
      }
      writeStatusAndBroadcast(root, data);
      return jsonReply(res, { ok: true });
    }

    if (p === '/api/control/retry' && req.method === 'POST') {
      const body = await readBody(req);
      const data = readStatus(root);
      if (!data) return jsonReply(res, { error: 'No pipeline' }, 404);
      const phase = data.phases.find(p => p.id === body.phaseId);
      if (phase) {
        phase.status = 'pending';
        delete phase.error;
        delete phase.completedAt;
        if (data.status === 'failed') data.status = 'running';
      }
      writeStatusAndBroadcast(root, data);
      return jsonReply(res, { ok: true });
    }

    if (p === '/api/control/skip-to' && req.method === 'POST') {
      const body = await readBody(req);
      const data = readStatus(root);
      if (!data) return jsonReply(res, { error: 'No pipeline' }, 404);
      const target = body.phaseId;
      for (const phase of data.phases) {
        if (phase.id < target && (phase.status === 'pending' || phase.status === 'running')) {
          phase.status = 'skipped';
        }
      }
      data.currentPhase = target;
      writeStatusAndBroadcast(root, data);
      return jsonReply(res, { ok: true });
    }

    // ─── Roles API ───
    if (p === '/api/roles' && req.method === 'GET') {
      return jsonReply(res, getRoles(root));
    }

    if (p === '/api/roles/templates' && req.method === 'GET') {
      return jsonReply(res, EXTRA_ROLE_TEMPLATES);
    }

    if (p.startsWith('/api/roles/') && p !== '/api/roles/templates') {
      const name = decodeURIComponent(p.split('/api/roles/')[1]).replace(/\/$/, '');
      const rolesDir = path.join(root, '.claude/roles');
      const filePath = path.join(rolesDir, `${name}.md`);

      if (req.method === 'GET') {
        if (!fileExists(filePath)) return jsonReply(res, { error: 'not found' }, 404);
        const content = fs.readFileSync(filePath, 'utf-8');
        return jsonReply(res, { name, filename: `${name}.md`, content, builtIn: BUILT_IN_ROLES.has(name), size: fileSize(filePath) });
      }
      if (req.method === 'PUT') {
        const body = await readBody(req);
        if (!body.content) return jsonReply(res, { error: 'missing content' }, 400);
        fs.mkdirSync(rolesDir, { recursive: true });
        fs.writeFileSync(filePath, body.content);
        return jsonReply(res, { ok: true });
      }
      if (req.method === 'DELETE') {
        if (BUILT_IN_ROLES.has(name)) return jsonReply(res, { error: 'cannot delete built-in role' }, 403);
        if (fileExists(filePath)) fs.unlinkSync(filePath);
        return jsonReply(res, { ok: true });
      }
    }

    if (p === '/api/roles' && req.method === 'POST') {
      const body = await readBody(req);
      if (!body.name) return jsonReply(res, { error: 'missing name' }, 400);
      const rolesDir = path.join(root, '.claude/roles');
      fs.mkdirSync(rolesDir, { recursive: true });
      const filePath = path.join(rolesDir, `${body.name}.md`);
      if (fileExists(filePath)) return jsonReply(res, { error: 'role already exists' }, 409);
      fs.writeFileSync(filePath, body.content || `# Role: ${body.name}\n\nDescribe responsibilities here.\n`);
      return jsonReply(res, { ok: true });
    }

    // ─── Code API ───
    if (p === '/api/code/tree') {
      return jsonReply(res, buildFileTree(path.join(root, 'src')));
    }
    if (p === '/api/code/stats') {
      return jsonReply(res, getCodeStats(root));
    }
    if (p === '/api/code/search') {
      const q = url.searchParams.get('q');
      if (!q) return jsonReply(res, []);
      return jsonReply(res, searchFiles(root, q));
    }
    if (p === '/api/code/diff') {
      return textReply(res, getGitDiff(root));
    }

    // ─── Export (simple tar-like zip placeholder — returns file list for now) ───
    if (p === '/api/export') {
      const docs = getDocuments(root);
      const srcFiles = walkDir(path.join(root, 'src'));
      return jsonReply(res, { docs: docs.map(d => d.path), src: srcFiles.map(f => 'src/' + f.path) });
    }

    // ─── Serve Next.js static export (out/) ───
    const selfDir = import.meta.dirname || path.dirname(new URL(import.meta.url).pathname);
    const dashDir = [
      path.resolve(selfDir, '../dashboard'),                   // npm package: src/ → agent-pipeline/dashboard/
      path.resolve(selfDir, 'dashboard'),                     // local plugin: agent-pipeline/dashboard/
      path.resolve(selfDir, '../../pipeline-dashboard/out'),  // source monorepo: src/ → packages/pipeline-dashboard/out/
    ].find(d => dirExists(d));
    if (dashDir) {
      let filePath = path.join(dashDir, p === '/' ? 'index.html' : p);
      // Try exact file, then with .html, then index.html in directory
      if (!fileExists(filePath) && !filePath.endsWith('.html')) {
        if (fileExists(filePath + '.html')) filePath = filePath + '.html';
        else if (dirExists(filePath) && fileExists(path.join(filePath, 'index.html'))) filePath = path.join(filePath, 'index.html');
        else filePath = path.join(dashDir, 'index.html'); // SPA fallback
      }
      if (fileExists(filePath) && filePath.startsWith(dashDir)) {
        const ext = path.extname(filePath);
        const mimeTypes = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };
        res.writeHead(200, { 'Content-Type': (mimeTypes[ext] || 'application/octet-stream') + (ext === '.html' || ext === '.css' || ext === '.js' ? '; charset=utf-8' : '') });
        res.end(fs.readFileSync(filePath));
        return;
      }
    }

    // Fallback: prompt to build the Next.js dashboard
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pipeline Dashboard</title></head><body style="font-family:system-ui;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="text-align:center;max-width:480px"><h1 style="font-size:24px;margin-bottom:16px">Pipeline Dashboard</h1><p style="color:#94a3b8;margin-bottom:24px">Dashboard has not been built yet.</p><code style="background:#1e293b;padding:12px 20px;border-radius:8px;display:block;font-size:14px;color:#38bdf8">pnpm --filter @aspect-mark/pipeline-dashboard build</code></div></body></html>');
  });

  // WebSocket upgrade
  srv.on('upgrade', (req, socket, head) => {
    if (req.url === '/ws') {
      handleWsUpgrade(req, socket);
    } else {
      socket.destroy();
    }
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
    writeStatusAndBroadcast(root, data);
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
    writeStatusAndBroadcast(root, data);

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
    writeStatusAndBroadcast(root, data);
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
    writeStatusAndBroadcast(root, data);
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

// ── Tool: pipeline_pause ──
server.tool(
  "pipeline_pause",
  "Pause the running pipeline. Agents should check status and halt when paused.",
  { root: z.string().optional().describe("Project root path") },
  async ({ root: rootArg }) => {
    const root = resolveRoot(rootArg);
    const data = readStatus(root);
    if (!data) return { content: [{ type: "text", text: "No pipeline status file found." }] };
    data.status = 'paused';
    writeStatusAndBroadcast(root, data);
    return { content: [{ type: "text", text: "Pipeline paused." }] };
  }
);

// ── Tool: pipeline_resume ──
server.tool(
  "pipeline_resume",
  "Resume a paused pipeline.",
  { root: z.string().optional().describe("Project root path") },
  async ({ root: rootArg }) => {
    const root = resolveRoot(rootArg);
    const data = readStatus(root);
    if (!data) return { content: [{ type: "text", text: "No pipeline status file found." }] };
    data.status = 'running';
    writeStatusAndBroadcast(root, data);
    return { content: [{ type: "text", text: "Pipeline resumed." }] };
  }
);

// ── Tool: pipeline_cancel ──
server.tool(
  "pipeline_cancel",
  "Cancel a phase or the entire pipeline",
  {
    root: z.string().optional().describe("Project root path"),
    scope: z.enum(['phase', 'pipeline']).describe("Cancel scope: single phase or entire pipeline"),
    phaseId: z.number().optional().describe("Phase ID to cancel (when scope=phase)"),
  },
  async ({ root: rootArg, scope, phaseId }) => {
    const root = resolveRoot(rootArg);
    const data = readStatus(root);
    if (!data) return { content: [{ type: "text", text: "No pipeline status file found." }] };
    if (scope === 'pipeline') {
      data.status = 'cancelled';
      for (const phase of data.phases) {
        if (phase.status === 'pending' || phase.status === 'running') phase.status = 'cancelled';
        if (phase.subtasks) phase.subtasks.forEach(st => { if (st.status === 'pending' || st.status === 'running') st.status = 'cancelled'; });
      }
      data.completedAt = isoNow();
    } else if (phaseId) {
      const phase = data.phases.find(p => p.id === phaseId);
      if (phase) phase.status = 'skipped';
    }
    writeStatusAndBroadcast(root, data);
    return { content: [{ type: "text", text: scope === 'pipeline' ? "Pipeline cancelled." : `Phase ${phaseId} skipped.` }] };
  }
);

// ── Tool: pipeline_retry ──
server.tool(
  "pipeline_retry",
  "Retry a failed phase by resetting it to pending",
  {
    root: z.string().optional().describe("Project root path"),
    phaseId: z.number().min(1).max(7).describe("Phase ID to retry"),
  },
  async ({ root: rootArg, phaseId }) => {
    const root = resolveRoot(rootArg);
    const data = readStatus(root);
    if (!data) return { content: [{ type: "text", text: "No pipeline status file found." }] };
    const phase = data.phases.find(p => p.id === phaseId);
    if (phase) { phase.status = 'pending'; delete phase.error; }
    if (data.status === 'failed') data.status = 'running';
    writeStatusAndBroadcast(root, data);
    return { content: [{ type: "text", text: `Phase ${phaseId} reset to pending for retry.` }] };
  }
);

// ── Tool: pipeline_skip_to ──
server.tool(
  "pipeline_skip_to",
  "Skip to a specific phase, marking intermediate phases as skipped",
  {
    root: z.string().optional().describe("Project root path"),
    phaseId: z.number().min(1).max(7).describe("Target phase ID to skip to"),
  },
  async ({ root: rootArg, phaseId }) => {
    const root = resolveRoot(rootArg);
    const data = readStatus(root);
    if (!data) return { content: [{ type: "text", text: "No pipeline status file found." }] };
    for (const phase of data.phases) {
      if (phase.id < phaseId && (phase.status === 'pending' || phase.status === 'running')) phase.status = 'skipped';
    }
    data.currentPhase = phaseId;
    writeStatusAndBroadcast(root, data);
    return { content: [{ type: "text", text: `Skipped to Phase ${phaseId}.` }] };
  }
);

// ── Tool: pipeline_manage_role ──
server.tool(
  "pipeline_manage_role",
  "Manage pipeline roles: list, get, create, update, or delete role files",
  {
    root: z.string().optional().describe("Project root path"),
    action: z.enum(['list', 'get', 'create', 'update', 'delete']).describe("Action to perform"),
    name: z.string().optional().describe("Role name (filename without .md)"),
    content: z.string().optional().describe("Role file content (for create/update)"),
  },
  async ({ root: rootArg, action, name, content }) => {
    const root = resolveRoot(rootArg);
    const rolesDir = path.join(root, '.claude/roles');

    if (action === 'list') {
      return { content: [{ type: "text", text: JSON.stringify(getRoles(root), null, 2) }] };
    }
    if (action === 'get') {
      if (!name) return { content: [{ type: "text", text: "Missing role name." }] };
      const p = path.join(rolesDir, `${name}.md`);
      if (!fileExists(p)) return { content: [{ type: "text", text: `Role not found: ${name}` }] };
      return { content: [{ type: "text", text: fs.readFileSync(p, 'utf-8') }] };
    }
    if (action === 'create') {
      if (!name) return { content: [{ type: "text", text: "Missing role name." }] };
      fs.mkdirSync(rolesDir, { recursive: true });
      const p = path.join(rolesDir, `${name}.md`);
      if (fileExists(p)) return { content: [{ type: "text", text: `Role already exists: ${name}` }] };
      fs.writeFileSync(p, content || `# Role: ${name}\n\nDescribe responsibilities here.\n`);
      return { content: [{ type: "text", text: `Role created: ${name}` }] };
    }
    if (action === 'update') {
      if (!name || !content) return { content: [{ type: "text", text: "Missing name or content." }] };
      fs.mkdirSync(rolesDir, { recursive: true });
      fs.writeFileSync(path.join(rolesDir, `${name}.md`), content);
      return { content: [{ type: "text", text: `Role updated: ${name}` }] };
    }
    if (action === 'delete') {
      if (!name) return { content: [{ type: "text", text: "Missing role name." }] };
      if (BUILT_IN_ROLES.has(name)) return { content: [{ type: "text", text: `Cannot delete built-in role: ${name}` }] };
      const p = path.join(rolesDir, `${name}.md`);
      if (fileExists(p)) fs.unlinkSync(p);
      return { content: [{ type: "text", text: `Role deleted: ${name}` }] };
    }
    return { content: [{ type: "text", text: `Unknown action: ${action}` }] };
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
