#!/usr/bin/env python3
"""Send a GitHub trend report via SMTP with attachment.

Reads SMTP credentials from environment variables only — never accept
SMTP_PASS as a CLI flag (would leak via `ps`).

Required env:
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

Optional env:
  SMTP_FROM (defaults to SMTP_USER)
  SMTP_TLS  ("ssl" | "starttls"; default inferred from port)

Usage:
  python3 send-report.py \\
    --to "user@example.com" \\
    --subject "GitHub 趋势报告 2026-05-27" \\
    --body-file ./report.md \\
    --attach ./report.zip

By default the body file (.md) is rendered to HTML and the email is sent
as multipart/alternative (text + html). Pass --no-html to send plain text.
"""
from __future__ import annotations

import argparse
import html
import mimetypes
import os
import re
import smtplib
import ssl
import sys
from email.message import EmailMessage
from pathlib import Path


def fail(msg: str, code: int = 1) -> "None":
    print(f"[error] {msg}", file=sys.stderr)
    sys.exit(code)


def load_env() -> dict:
    cfg = {
        "host": os.environ.get("SMTP_HOST", "").strip(),
        "port": os.environ.get("SMTP_PORT", "").strip(),
        "user": os.environ.get("SMTP_USER", "").strip(),
        "secret": os.environ.get("SMTP_PASS", ""),
        "from": os.environ.get("SMTP_FROM", "").strip(),
        "tls": os.environ.get("SMTP_TLS", "").strip().lower(),
    }
    required_envs = [
        ("host", "SMTP_HOST"),
        ("port", "SMTP_PORT"),
        ("user", "SMTP_USER"),
        ("secret", "SMTP_PASS"),
    ]
    missing = [env_name for k, env_name in required_envs if not cfg[k]]
    if missing:
        fail(f"缺少环境变量：{', '.join(missing)}")
    try:
        cfg["port"] = int(cfg["port"])
    except ValueError:
        fail(f"SMTP_PORT 必须是整数，收到：{cfg['port']!r}")
    if not cfg["from"]:
        cfg["from"] = cfg["user"]
    if cfg["tls"] not in ("ssl", "starttls"):
        cfg["tls"] = "ssl" if cfg["port"] == 465 else "starttls"
    return cfg


# ────────────────────────────────────────────────────────────
# Minimal Markdown → HTML renderer (stdlib only).
# Covers what GitHub trend reports use: headers, tables, lists,
# fenced code, blockquote, hr, bold/italic/inline-code, links.
# ────────────────────────────────────────────────────────────

def _inline(text: str) -> str:
    """Render inline markdown elements with proper escaping."""
    out: list[str] = []
    i = 0
    n = len(text)
    while i < n:
        c = text[i]
        # inline code: `code`
        if c == "`":
            end = text.find("`", i + 1)
            if end != -1:
                out.append(f"<code>{html.escape(text[i + 1:end])}</code>")
                i = end + 1
                continue
        # link: [text](url)
        if c == "[":
            m = re.match(r"\[([^\]]+)\]\(([^)]+)\)", text[i:])
            if m:
                label, url = m.group(1), m.group(2)
                out.append(
                    f'<a href="{html.escape(url, quote=True)}">{html.escape(label)}</a>'
                )
                i += m.end()
                continue
        # bold: **text**
        if c == "*" and text[i:i + 2] == "**":
            end = text.find("**", i + 2)
            if end != -1:
                out.append(f"<strong>{_inline(text[i + 2:end])}</strong>")
                i = end + 2
                continue
        # italic: *text* (single, not preceded/followed by another *)
        if c == "*":
            end = text.find("*", i + 1)
            if end != -1 and "\n" not in text[i + 1:end]:
                out.append(f"<em>{_inline(text[i + 1:end])}</em>")
                i = end + 1
                continue
        out.append(html.escape(c))
        i += 1
    return "".join(out)


def _render_table(lines: list[str]) -> str:
    """Render a GitHub-style markdown table given its consecutive lines."""
    cells = [
        [c.strip() for c in re.split(r"\s*\|\s*", row.strip().strip("|"))]
        for row in lines
    ]
    # Drop separator row (e.g. | --- | --- |)
    body = [r for r in cells[1:] if not all(re.fullmatch(r":?-+:?", c) for c in r)]
    head = cells[0]
    out = ["<table>"]
    out.append("<thead><tr>")
    for h in head:
        out.append(f"<th>{_inline(h)}</th>")
    out.append("</tr></thead><tbody>")
    for row in body:
        out.append("<tr>")
        for cell in row:
            out.append(f"<td>{_inline(cell)}</td>")
        out.append("</tr>")
    out.append("</tbody></table>")
    return "".join(out)


def md_to_html(md: str) -> str:
    """Convert a subset of Markdown to HTML."""
    lines = md.splitlines()
    out: list[str] = []
    i = 0
    n = len(lines)

    def flush_para(buf: list[str]) -> "None":
        if buf:
            out.append(f"<p>{_inline(' '.join(buf))}</p>")
            buf.clear()

    para: list[str] = []

    while i < n:
        line = lines[i]
        stripped = line.strip()

        # Fenced code block
        if stripped.startswith("```"):
            flush_para(para)
            lang = stripped[3:].strip()
            i += 1
            code: list[str] = []
            while i < n and not lines[i].strip().startswith("```"):
                code.append(lines[i])
                i += 1
            i += 1  # skip closing fence
            cls = f' class="lang-{html.escape(lang, quote=True)}"' if lang else ""
            out.append(f"<pre><code{cls}>{html.escape(chr(10).join(code))}</code></pre>")
            continue

        # Horizontal rule
        if re.fullmatch(r"-{3,}|_{3,}|\*{3,}", stripped):
            flush_para(para)
            out.append("<hr>")
            i += 1
            continue

        # Headers
        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            flush_para(para)
            level = len(m.group(1))
            out.append(f"<h{level}>{_inline(m.group(2).strip())}</h{level}>")
            i += 1
            continue

        # Blockquote
        if stripped.startswith(">"):
            flush_para(para)
            quote: list[str] = []
            while i < n and lines[i].strip().startswith(">"):
                quote.append(lines[i].strip().lstrip(">").lstrip())
                i += 1
            out.append(f"<blockquote>{_inline(' '.join(quote))}</blockquote>")
            continue

        # Table: a line starting with | and the next line is a separator
        if stripped.startswith("|") and i + 1 < n and re.match(
            r"^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$", lines[i + 1]
        ):
            flush_para(para)
            tbl: list[str] = []
            while i < n and lines[i].strip().startswith("|"):
                tbl.append(lines[i])
                i += 1
            out.append(_render_table(tbl))
            continue

        # Unordered list
        if re.match(r"^\s*[-*+]\s+", line):
            flush_para(para)
            out.append("<ul>")
            while i < n and re.match(r"^\s*[-*+]\s+", lines[i]):
                item = re.sub(r"^\s*[-*+]\s+", "", lines[i])
                # Render checkboxes [ ] / [x]
                cb = re.match(r"^\[( |x|X)\]\s+(.*)$", item)
                if cb:
                    checked = " checked" if cb.group(1).lower() == "x" else ""
                    out.append(
                        f'<li><input type="checkbox" disabled{checked}> '
                        f"{_inline(cb.group(2))}</li>"
                    )
                else:
                    out.append(f"<li>{_inline(item)}</li>")
                i += 1
            out.append("</ul>")
            continue

        # Ordered list
        if re.match(r"^\s*\d+\.\s+", line):
            flush_para(para)
            out.append("<ol>")
            while i < n and re.match(r"^\s*\d+\.\s+", lines[i]):
                item = re.sub(r"^\s*\d+\.\s+", "", lines[i])
                out.append(f"<li>{_inline(item)}</li>")
                i += 1
            out.append("</ol>")
            continue

        # Blank line → paragraph break
        if not stripped:
            flush_para(para)
            i += 1
            continue

        para.append(stripped)
        i += 1

    flush_para(para)
    return "\n".join(out)


HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
                 "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
    line-height: 1.7; color: #24292f; max-width: 860px;
    margin: 24px auto; padding: 0 20px; background: #fff;
  }}
  h1, h2, h3, h4 {{ border-bottom: 1px solid #eaecef; padding-bottom: .3em; }}
  h1 {{ font-size: 1.8em; }} h2 {{ font-size: 1.5em; }}
  h3 {{ font-size: 1.2em; border-bottom: none; }}
  table {{ border-collapse: collapse; margin: 12px 0; width: 100%; }}
  th, td {{ border: 1px solid #d0d7de; padding: 6px 12px; text-align: left;
           vertical-align: top; }}
  th {{ background: #f6f8fa; }}
  tr:nth-child(even) td {{ background: #fafbfc; }}
  code {{ background: #f6f8fa; padding: 2px 5px; border-radius: 4px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 0.92em; }}
  pre {{ background: #f6f8fa; padding: 14px; border-radius: 6px; overflow-x: auto; }}
  pre code {{ background: none; padding: 0; font-size: 0.88em; }}
  blockquote {{ border-left: 4px solid #d0d7de; color: #57606a;
                margin: 12px 0; padding: 4px 14px; background: #f6f8fa; }}
  ul, ol {{ padding-left: 1.6em; }}
  hr {{ border: none; border-top: 1px solid #eaecef; margin: 24px 0; }}
  a {{ color: #0969da; text-decoration: none; }}
  a:hover {{ text-decoration: underline; }}
  input[type="checkbox"] {{ margin-right: 6px; }}
</style>
</head>
<body>
{body}
<hr>
<p style="color:#8b949e;font-size:.85em">
  由 <code>github-trend-analyzer</code> skill 自动生成 · {generated_at}
</p>
</body>
</html>"""


def render_html_email(md_text: str, *, title: str, generated_at: str) -> str:
    return HTML_TEMPLATE.format(
        title=html.escape(title),
        body=md_to_html(md_text),
        generated_at=html.escape(generated_at),
    )


def build_message(
    *, sender: str, recipients: list[str], subject: str,
    body_text: str, body_html: str | None, attachment: Path | None,
) -> EmailMessage:
    msg = EmailMessage()
    msg["From"] = sender
    msg["To"] = ", ".join(recipients)
    msg["Subject"] = subject
    msg.set_content(body_text or "(empty)", subtype="plain", charset="utf-8")
    if body_html:
        msg.add_alternative(body_html, subtype="html", charset="utf-8")

    if attachment:
        if not attachment.is_file():
            fail(f"附件不存在：{attachment}")
        ctype, encoding = mimetypes.guess_type(attachment.name)
        if ctype is None or encoding is not None:
            ctype = "application/octet-stream"
        maintype, subtype = ctype.split("/", 1)
        msg.add_attachment(
            attachment.read_bytes(),
            maintype=maintype, subtype=subtype,
            filename=attachment.name,
        )
    return msg


def send(cfg: dict, msg: EmailMessage, recipients: list[str]) -> "None":
    ctx = ssl.create_default_context()
    if cfg["tls"] == "ssl":
        with smtplib.SMTP_SSL(cfg["host"], cfg["port"], context=ctx, timeout=30) as s:
            s.login(cfg["user"], cfg["secret"])
            s.send_message(msg, from_addr=cfg["from"], to_addrs=recipients)
    else:  # starttls
        with smtplib.SMTP(cfg["host"], cfg["port"], timeout=30) as s:
            s.ehlo()
            s.starttls(context=ctx)
            s.ehlo()
            s.login(cfg["user"], cfg["secret"])
            s.send_message(msg, from_addr=cfg["from"], to_addrs=recipients)


def main() -> "None":
    p = argparse.ArgumentParser(description="Send report via SMTP.")
    p.add_argument("--to", required=True, help="recipient(s), comma-separated")
    p.add_argument("--subject", required=True)
    p.add_argument("--body-file", type=Path, default=None,
                   help="path to plain-text/markdown body")
    p.add_argument("--body", default="",
                   help="inline body text (used when --body-file omitted)")
    p.add_argument("--attach", type=Path, default=None,
                   help="path to attachment (e.g. report.zip)")
    p.add_argument("--no-html", action="store_true",
                   help="send plain text only, do not render markdown to HTML")
    p.add_argument("--dump-html", type=Path, default=None,
                   help="write rendered HTML to this path (for preview/debug)")
    args = p.parse_args()

    cfg = load_env()
    recipients = [a.strip() for a in args.to.split(",") if a.strip()]
    if not recipients:
        fail("--to 不能为空")

    body = args.body
    if args.body_file:
        if not args.body_file.is_file():
            fail(f"--body-file 不存在：{args.body_file}")
        body = args.body_file.read_text(encoding="utf-8")

    body_html = None
    if not args.no_html and body.strip():
        from datetime import datetime
        body_html = render_html_email(
            body, title=args.subject,
            generated_at=datetime.now().strftime("%Y-%m-%d %H:%M"),
        )
        if args.dump_html:
            args.dump_html.write_text(body_html, encoding="utf-8")
            print(f"[debug] HTML 已写入：{args.dump_html}")

    msg = build_message(
        sender=cfg["from"], recipients=recipients,
        subject=args.subject, body_text=body, body_html=body_html,
        attachment=args.attach,
    )

    try:
        send(cfg, msg, recipients)
    except smtplib.SMTPAuthenticationError as e:
        fail(f"鉴权失败 (535)：{e.smtp_error.decode(errors='replace') if e.smtp_error else e}\n"
             f"提示：QQ/163/Gmail 等需使用「应用专用密码 / 授权码」，而非登录密码。")
    except (smtplib.SMTPException, ssl.SSLError, OSError) as e:
        fail(f"发送失败：{type(e).__name__}: {e}")

    size_kb = (args.attach.stat().st_size / 1024) if args.attach else 0
    print(f"[ok] 已发送至：{', '.join(recipients)}")
    print(f"[ok] 主题：{args.subject}")
    print(f"[ok] 格式：{'multipart (text + HTML)' if body_html else 'plain text'}")
    if args.attach:
        print(f"[ok] 附件：{args.attach.name} ({size_kb:.1f} KB)")
    print(f"[ok] SMTP：{cfg['host']}:{cfg['port']} ({cfg['tls']})")


if __name__ == "__main__":
    main()
