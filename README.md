# Mycelium

**An Obsidian plugin for strengthening ideas, not generating notes.**

Mycelium analyzes your notes, uncovers hidden assumptions, identifies weaknesses, discovers conceptual neighbors, and surfaces tensions between ideas. Instead of summarizing what you've already written, it helps reveal what you may have missed.

---

## Why Mycelium?

Most AI note tools focus on writing more.

Mycelium focuses on thinking better.

Given a note, Mycelium will:

* Identify hidden assumptions
* Expose weak arguments
* Highlight unanswered questions
* Discover related ideas across your vault
* Compare notes for agreement, contradiction, and tension
* Suggest opportunities for synthesis

The goal is not to generate content.

The goal is to challenge and develop your thinking.

---

## Features

### Note Analysis

Analyze a note and generate structured insights including:

* Hidden Assumptions
* Weak Points
* Unanswered Questions
* Adjacent Concepts
* Related Note Search Terms
* Overall Assessment

---

### Related Note Discovery

Mycelium scans your vault and identifies notes that may be conceptually related.

Current methods include:

* Keyword extraction
* Candidate ranking
* Similarity scoring

---

### Relationship Analysis

Compare a note against related notes to discover:

* Supporting ideas
* Contradictory ideas
* Shared assumptions
* Intellectual tensions
* New questions
* Potential syntheses

---

### Structured Reports

Results are stored automatically for later review.

Example:

```text
Mycelium/
└── Time and Infinity/
    ├── analyses/
        ├── analysis.md
        └── Time and Infinity_analysis.json
    
    └── comparison/
        ├── comparison.md
        └── relationship.json
```

---

## Example Workflow

```text
Select Note
      ↓
Analyze Note
      ↓
Discover Related Notes
      ↓
Compare Ideas
      ↓
Generate Report
```

---

## Philosophy

Mycelium should:

* Expose weaknesses
* Reveal assumptions
* Discover conceptual neighbors
* Create intellectual tension
* Encourage synthesis

Mycelium should not:

* Summarize notes
* Rewrite notes
* Generate filler content
* Flatter the author

---

## How It Works

### 1. Analyze

A note is sent to an LLM for structured analysis.

Output:

```json
{
  "assumptions": [],
  "weaknesses": [],
  "questions": [],
  "concepts": []
}
```

---

### 2. Discover

Search terms and concepts are extracted from the analysis.

The vault is scanned for potentially related notes.

---

### 3. Compare

The analyzed note is compared against related notes.

Relationships are evaluated for:

* Support
* Contradiction
* Tension
* Synthesis opportunities

---

### 4. Report

Results are saved as markdown and JSON for future exploration.

---

## Technology

Built with:

* JavaScript (ESM)
* Obsidian Plugin API
* Large Language Models
* Markdown
* Node.js

---

## Installation

### Development

```bash
pnpm install
pnpm dev
```

Build:

```bash
pnpm build
```

---

## Configuration

Configure your API key through the plugin settings.

---

## Roadmap

### Current

* Note analysis
* Related note discovery
* Relationship analysis
* Report generation

### Planned

* Interactive workflow
* Weakness mapping across vaults
* Semantic search
* Embeddings
* Knowledge graph
* Relationship database
* Advanced visualization tools

---

## Project Status

Mycelium is actively under development.

The long-term vision is a tool that helps thinkers, researchers, writers, and students discover connections between ideas that would otherwise remain hidden.

---

## License

MIT License
