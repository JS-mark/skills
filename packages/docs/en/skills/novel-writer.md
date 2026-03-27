# novel-writer

Novel Writing Assistant — full-cycle novel creation: outline architecture, character design, chapter writing, progress management, with material search and illustration generation.

## Features

- **Full Workflow** — Outline → Characters → Chapter writing → Progress tracking
- **Auto-Save** — Each chapter saved automatically, cross-session context recovery
- **Foreshadowing Management** — Track planting and resolution of foreshadowing
- **Material Search** — WebSearch / WebFetch for real-world reference material
- **Illustration Generation** — MCP tool image generation / Prompt export (Midjourney / DALL-E / SD)
- **Multi-Genre** — Urban cultivation, urban military, fantasy, xianxia, suspense, etc.

## Installation

```bash
# Option 1: Copy to skills directory
cp -r skills/novel-writer ~/.claude/skills/novel-writer

# Option 2: Local development mode
claude --skill-dir /path/to/novel-writer
```

## Usage

### Slash Command

```bash
/write                         # Use default path ~/Desktop/novel/
/write ~/Documents/my-story    # Use custom path
```

### Natural Language Triggers

Keywords that activate this Skill:

- "write a novel", "create a story", "write fiction"
- "continue writing", "next chapter"
- "write outline", "design characters"
- "search material", "generate illustration"

## Creation Workflow

| Stage | Description | Output |
|-------|-------------|--------|
| Story Outline | World building, main plot, volume planning | `outline.md` |
| Character Outline | Character profiles, personality, relationship map | `characters.md` |
| Chapter Writing | 3000-5000 words per chapter | `chapters/Vol-X/Chapter-XXX-title.md` |
| Progress Management | Auto-update progress and foreshadowing status | `progress.md` |

## Usage Example

```
User: Help me write an urban cultivation novel
→ Enter outline stage, discuss world building, main plot, volumes

User: Design the protagonist
→ Enter character stage, build character profile

User: Start chapter 1, protagonist gets fired then meets a mysterious old man
→ Write 3000-5000 word chapter based on synopsis

User: Continue writing
→ Auto-advance to next chapter following outline
```

## Project File Structure

```
<NOVEL_ROOT>/
├── outline.md                   # Story outline
├── characters.md                # Character profiles
├── progress.md                  # Progress & foreshadowing
└── chapters/
    ├── Vol-1/
    │   ├── Chapter-001-title.md
    │   └── ...
    └── Vol-2/
```
