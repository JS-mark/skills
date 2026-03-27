# drama-writer

Short Drama Screenwriting Assistant — supports full-cycle creation for vertical short dramas and horizontal micro-dramas, covering project setup, outline, characters, episodes, scripts, storyboards, and cost estimation.

## Features

- **Dual Platform** — Vertical dramas (1-3 min/ep) and horizontal micro-dramas (5-15 min/ep)
- **8 Genre Templates** — Urban revenge, urban romance, urban comeback, xianxia, palace intrigue, political drama, suspense, time travel
- **Professional Script Format** — Scene headers, dialogue, camera suggestions, sound cues, ready for production
- **Hook Per Episode** — Ensures each episode ends with a cliffhanger
- **Storyboard Hints** — Shot types, composition suggestions, transitions
- **Cost Estimation** — Scene grading, VFX stats, wardrobe/props summary
- **Material Search** — WebSearch / WebFetch for industry trends and creative material
- **Auto-Save** — Cross-session progress recovery

## Installation

```bash
# Option 1: Copy to skills directory
cp -r skills/drama-writer ~/.claude/skills/drama-writer

# Option 2: Local development mode
claude --skill-dir /path/to/drama-writer
```

## Usage

### Slash Command

```bash
/drama                         # Use default path ~/Desktop/drama/
/drama ~/my-project            # Use custom path
```

### Natural Language Triggers

Keywords that activate this Skill:

- "write a drama", "screenwriting", "short drama"
- "episode outline", "next episode", "continue writing"
- "storyboard", "character design", "cost estimate"

## Creation Workflow

| Stage | Description | Output |
|-------|-------------|--------|
| Project Setup | Platform type, genre, episode count, audience | `project.md` |
| Story Outline | High concept, main plot, act structure, twist points | `outline.md` |
| Character Design | Profiles, relationship map, dialogue style | `characters.md` |
| Episode Outline | Core conflict and ending hook per episode | `outline.md` (appended) |
| Script Writing | Professional format script | `episodes/EPXXX-title.md` |
| Storyboard | Shot, composition, transition suggestions (optional) | `storyboard/EPXXX-storyboard.md` |
| Cost Estimate | Scene grading, VFX, budget reference (optional) | `cost-estimate.md` |
| Progress Tracking | Completed episodes, foreshadowing status | `progress.md` |

## Platform Comparison

| Platform | Duration/EP | Episodes | Lines/EP | Scene Style |
|----------|-------------|----------|----------|-------------|
| Vertical | 1-3 min | 60-100 | 800-1200 chars | Simple, character-focused |
| Horizontal | 5-15 min | 20-40 | 2000-4000 chars | Rich, can have grand scenes |

## Project File Structure

```
<DRAMA_ROOT>/
├── project.md                   # Project config
├── outline.md                   # Story outline + episode outline
├── characters.md                # Character profiles
├── progress.md                  # Progress + foreshadowing
├── cost-estimate.md             # Cost estimate report
├── episodes/
│   ├── EP001-title.md           # Episode script
│   └── ...
└── storyboard/
    ├── EP001-storyboard.md      # Episode storyboard
    └── ...
```
