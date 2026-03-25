# Intel — Raw Client Brain Dumps

Drop everything here. Transcripts, voice notes, brand docs, screenshots, competitor URLs, random ideas from the client. This is the unprocessed input folder.

## What goes here

- Call transcripts (verbatim, not summarized — the Surgeon needs exact words)
- Brand assets (logos, color palettes, style guides)
- Client feedback on previous rounds
- Competitor URLs or screenshots
- Feature requests, pain points, random brainstorms
- PDFs, images, text files — any format works
- **Client feedback exports** (from X-Ray Mode admin panel) — place in `feedback/` subfolder

## What the pipeline creates here

The post-build pipeline also writes to this folder:

| File | Created By | Purpose |
|------|-----------|---------|
| `extraction-summary-round-N.md` | Surgeon | Processed intel — requirements, quotes, gaps |
| `competitive-brief-round-N.md` | Scout | Competitor research findings |
| `copy-bank.md` | Surgeon | Cumulative client language (grows every round) |
| `session-log-round-N.md` | Post-pipeline | What happened this round |
| `feedback/feedback-YYYY-MM-DD.md` | Client (X-Ray Mode) | Per-day feedback from in-app overlay |

## Tips

- **One file per topic** — Don't cram everything into one massive doc
- **Keep original filenames** — The Surgeon reads everything, naming doesn't matter
- **Don't delete old files** — Previous rounds' intel is background context for future rounds
- **Verbatim > summarized** — The Surgeon catches things summaries miss
