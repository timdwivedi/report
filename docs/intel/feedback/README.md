# Client Feedback — X-Ray Mode Input

Files in this folder are exported from the BrandOps X-Ray Mode.
Clients toggle X-Ray in the browser, click sections, and leave feedback.
That feedback is exported as per-day markdown files and placed here.

## Naming Convention

```
feedback-YYYY-MM-DD.md
```

## How the Pipeline Uses These Files

- **Surgeon (Phase 1):** Scans this folder for files with `<!-- STATUS: UNPROCESSED -->` header. Treats them as PRIMARY intel — direct client voice.
- **Gap Agent (Phase 8):** Cross-references feedback items against code implementation to check if client concerns were addressed.

## Processed Stamp

After a pipeline round processes a feedback file, the Auditor stamps it:

```
<!-- STATUS: PROCESSED -->
<!-- PROCESSED: round-N, YYYY-MM-DDTHH:MM:SSZ -->
```

This tells future rounds to skip this file (background context only).

## Rules

- **Never delete files** — they are historical context for future rounds
- **Never edit content** — only the HTML comment headers get modified
- **One file per day** — all feedback from a single day in one export
- The admin panel is the source of truth; these files are exports
