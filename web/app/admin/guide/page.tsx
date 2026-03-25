"use client"

const EXAMPLES = [
  {
    title: "Changing a color",
    bad: "I don't like this green. I showed you before the color I wanted. It's more like a turquoise, you know? Like the one on my booking page. It just looks way better and more professional. Everything that's green should be that turquoise instead. I mean, it's my brand color so it should be everywhere. I told you about this before too.",
    good: "The green color across the site — I want it changed to the turquoise from my booking page. I'm attaching a screenshot of the exact color I mean. Every button, heading, and glow that's currently green should use this turquoise instead.",
    why: "Says what to change, shows the reference, and makes the scope clear — all in 3 sentences.",
  },
  {
    title: "Removing something",
    bad: "This page is way too much. We don't need all of this. I said before I want it simple. Nobody reads all this stuff. Just get rid of it. It looks like a sales page and I don't want it to look like a sales page. I want it minimalistic and clean.",
    good: "On the landing page — remove everything below the main headline and the form. I only want: the image, one line of text, name + email fields, and the button. Nothing else.",
    why: "Names the page, says exactly what to keep (not just what to remove), paints a clear picture.",
  },
  {
    title: "Changing text or a question",
    bad: "This question doesn't make sense. Nobody would answer that. I gave you better questions before. Can you just use the ones I sent? This one needs to go. It's not good.",
    good: "Replace the first question the chat asks with this exact text: 'What are you trying to grow right now — and where does it get stuck?' Delete the current question completely.",
    why: "Gives the exact replacement text. No guessing needed.",
  },
  {
    title: "Design or layout feedback",
    bad: "It needs to look like that picture I sent. You know the one. It should be more like that. The whole vibe should match.",
    good: "I'm attaching the image I want this to match. Specifically: the glowing border around the circle, and the dark background behind it. The text placement is fine — just match the visual style of the image.",
    why: "Attaches the reference AND points out which specific parts to match.",
  },
  {
    title: "Something's broken",
    bad: "It's not working on my phone. I tried it earlier and it was weird. Can you check?",
    good: "On the video page, the video doesn't play on my iPhone in Safari. I see the thumbnail but tapping play does nothing. Works fine on my laptop though.",
    why: "Says which page, which device, what happens, and what should happen.",
  },
]

const CATEGORIES = [
  { name: "UI", desc: "Colors, spacing, layout, animations", example: "Button glow too subtle — boost to match this screenshot" },
  { name: "Data", desc: "Text content, copy changes, labels", example: "Change headline to: 'The Revenue Ceiling Mirror'" },
  { name: "Feature", desc: "New functionality, behavior changes", example: "Add name + email fields before the mirror entry" },
  { name: "Bug", desc: "Something broken", example: "Video doesn't autoplay on mobile Safari" },
  { name: "Workflow", desc: "Flow or sequence changes", example: "Skip the qualify page — go straight from reveal to cost" },
]

const CHECKLIST = [
  "Is this ONE specific change? (not 5 things bundled together)",
  "Did I say WHICH page and WHICH element?",
  "Did I give the EXACT text, color, or behavior I want?",
  "Did I attach a screenshot if it's about something visual?",
  "If I'm referencing old feedback, did I mention what it was about?",
]

const VOICE_TIPS = [
  { bold: "One topic per recording.", rest: "If you have 3 things to change, send 3 short voice notes — not one long one. Short = fast fixes." },
  { bold: "Start with the page.", rest: '"On the landing page..." or "On the mirror chat page..." — this tells us exactly where to look.' },
  { bold: "Say what you want, not just what's wrong.", rest: '"Change this to..." is 10x faster than "I don\'t like this." We need to know what you DO want.' },
  { bold: "Screenshot first, then talk.", rest: "If it's about how something looks, grab a screenshot in X-ray mode, then record your note about it." },
  { bold: "Skip the backstory.", rest: "You don't need to explain why you want it changed. Just tell us what the change is. We'll make it happen." },
]

export default function AdminGuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Hero */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#0F172A", fontFamily: "Plus Jakarta Sans, system-ui, sans-serif" }}>
          How to Talk to Me
        </h1>
        <p className="mt-2 text-base" style={{ color: "#64748B" }}>
          Get your changes shipped faster. Here&apos;s how to give feedback I can act on immediately.
        </p>
      </div>

      {/* Golden Rule */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderLeft: "4px solid #2563EB",
        }}
      >
        <h2 className="text-lg font-semibold mb-2" style={{ color: "#2563EB" }}>
          The Golden Rule
        </h2>
        <p className="text-base leading-relaxed" style={{ color: "#334155" }}>
          <strong style={{ color: "#0F172A" }}>One change per feedback item.</strong>{" "}
          Don&apos;t combine 5 things in one voice note. Each thing you want changed gets its own separate note. This way nothing gets missed, and every change ships faster.
        </p>
      </div>

      {/* The Format */}
      <div>
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#0F172A", fontFamily: "Plus Jakarta Sans, system-ui, sans-serif" }}>
          The Format
        </h2>
        <p className="mb-4 text-sm" style={{ color: "#64748B" }}>
          Every piece of feedback should cover these three things:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { num: "1", label: "PAGE", desc: "Which page are you on? X-ray mode fills this in automatically when you click an element." },
            { num: "2", label: "ELEMENT", desc: 'What specific thing are you pointing at? Click it in X-ray mode, or describe it: "the big button", "the headline text".' },
            { num: "3", label: "WHAT TO CHANGE", desc: 'Be specific. Not "make it look better." Say what you actually want: the new text, the color, the behavior.' },
          ].map((step) => (
            <div
              key={step.num}
              className="rounded-xl p-5"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                  style={{ backgroundColor: "rgba(37,99,235,0.1)", color: "#2563EB" }}
                >
                  {step.num}
                </span>
                <span className="text-sm font-semibold tracking-wider" style={{ color: "#2563EB" }}>
                  {step.label}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Before & After Examples */}
      <div>
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#0F172A", fontFamily: "Plus Jakarta Sans, system-ui, sans-serif" }}>
          Examples: Confusing vs. Clear
        </h2>
        <div className="space-y-6">
          {EXAMPLES.map((ex, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0" }}
            >
              <div className="px-5 py-3" style={{ borderBottom: "1px solid #E2E8F0" }}>
                <span className="text-sm font-semibold" style={{ color: "#0F172A" }}>
                  {ex.title}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: "#E2E8F0" }}>
                {/* Bad */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full text-xs" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
                      ✕
                    </span>
                    <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: "#EF4444" }}>
                      Confusing
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed italic" style={{ color: "#94A3B8" }}>
                    &ldquo;{ex.bad}&rdquo;
                  </p>
                </div>
                {/* Good */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full text-xs" style={{ backgroundColor: "rgba(37,99,235,0.1)", color: "#2563EB" }}>
                      ✓
                    </span>
                    <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: "#2563EB" }}>
                      Clear
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#334155" }}>
                    &ldquo;{ex.good}&rdquo;
                  </p>
                </div>
              </div>
              {/* Why */}
              <div className="px-5 py-3" style={{ backgroundColor: "rgba(37,99,235,0.04)", borderTop: "1px solid #E2E8F0" }}>
                <p className="text-xs" style={{ color: "#2563EB" }}>
                  <strong>Why it&apos;s better:</strong> {ex.why}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Checklist */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0" }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: "#0F172A", fontFamily: "Plus Jakarta Sans, system-ui, sans-serif" }}>
          Quick Checklist
        </h2>
        <p className="text-sm mb-4" style={{ color: "#64748B" }}>
          Before you submit feedback, quickly check:
        </p>
        <ul className="space-y-3">
          {CHECKLIST.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center"
                style={{ borderColor: "#E2E8F0" }}
              />
              <span className="text-sm" style={{ color: "#334155" }}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#0F172A", fontFamily: "Plus Jakarta Sans, system-ui, sans-serif" }}>
          What Category to Use
        </h2>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}>
                <th className="text-left px-5 py-3 text-xs font-semibold tracking-wider uppercase" style={{ color: "#64748B" }}>Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold tracking-wider uppercase" style={{ color: "#64748B" }}>Best For</th>
                <th className="text-left px-5 py-3 text-xs font-semibold tracking-wider uppercase hidden md:table-cell" style={{ color: "#64748B" }}>Example</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#F8FAFC" : "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}>
                  <td className="px-5 py-3">
                    <span className="text-sm font-semibold" style={{ color: "#2563EB" }}>{cat.name}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm" style={{ color: "#334155" }}>{cat.desc}</span>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className="text-sm italic" style={{ color: "#94A3B8" }}>&ldquo;{cat.example}&rdquo;</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voice Note Tips */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0" }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: "#0F172A", fontFamily: "Plus Jakarta Sans, system-ui, sans-serif" }}>
          Voice Note Tips
        </h2>
        <ul className="space-y-4">
          {VOICE_TIPS.map((tip, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-1 w-2 h-2 rounded-full" style={{ backgroundColor: "#2563EB" }} />
              <p className="text-sm leading-relaxed" style={{ color: "#334155" }}>
                <strong style={{ color: "#0F172A" }}>{tip.bold}</strong> {tip.rest}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom spacer */}
      <div className="h-8" />
    </div>
  )
}
