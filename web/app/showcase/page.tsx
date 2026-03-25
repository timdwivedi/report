'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Particle {
  x: number; y: number
  vx: number; vy: number
  opacity: number; size: number
  life: number; maxLife: number
}

// ─── Smoke Canvas ─────────────────────────────────────────────────────────────

function useSmokeCanvas(trigger: number) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>()
  const isActiveRef = useRef(false)

  const burst = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = canvas.width
    const h = canvas.height
    const newParticles: Particle[] = []
    for (let i = 0; i < 80; i++) {
      const angle = (i / 80) * Math.PI * 2 + (Math.random() - 0.5) * 0.8
      const speed = 1.2 + Math.random() * 3.5
      const life = 60 + Math.random() * 60
      newParticles.push({
        x: w / 2 + (Math.random() - 0.5) * w * 0.6,
        y: h / 2 + (Math.random() - 0.5) * h * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8,
        opacity: 0.35 + Math.random() * 0.45,
        size: 20 + Math.random() * 50,
        life, maxLife: life,
      })
    }
    particlesRef.current = newParticles
    isActiveRef.current = true
  }, [])

  useEffect(() => {
    if (trigger === 0) return
    burst()
  }, [trigger, burst])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (!isActiveRef.current) return

      const ps = particlesRef.current
      let alive = false

      ctx.save()
      ctx.filter = 'blur(18px)'
      for (const p of ps) {
        if (p.life <= 0) continue
        alive = true
        p.x += p.vx
        p.y += p.vy
        p.vy -= 0.04
        p.vx *= 0.98
        p.size += 0.8
        p.life--
        const progress = p.life / p.maxLife
        const alpha = p.opacity * progress * Math.sin(progress * Math.PI)
        ctx.globalAlpha = alpha
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
        grad.addColorStop(0, 'rgba(120,140,180,0.8)')
        grad.addColorStop(0.5, 'rgba(60,80,130,0.4)')
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      if (!alive) isActiveRef.current = false
    }
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return canvasRef
}

// ─── UI Mockup Components ─────────────────────────────────────────────────────

function QuoteMockup() {
  return (
    <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/20 flex items-center justify-center">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
        <div>
          <div className="text-white font-semibold text-sm">Gildan 5000 Heavy Cotton</div>
          <div className="text-white/40 text-xs">Screen Print · 2 Colors · Front Chest</div>
        </div>
        <div className="ml-auto text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">Live</div>
      </div>
      <div className="space-y-1.5">
        <div className="text-white/30 text-xs uppercase tracking-widest mb-2">Quantity Breaks</div>
        {[
          { qty: '50', price: '$14.75', margin: '38%', active: false },
          { qty: '100', price: '$9.40', margin: '41%', active: false },
          { qty: '250', price: '$6.85', margin: '44%', active: true },
          { qty: '500', price: '$5.20', margin: '46%', active: false },
          { qty: '1,000', price: '$4.10', margin: '48%', active: false },
        ].map(({ qty, price, margin, active }) => (
          <div key={qty} className={`flex justify-between items-center px-3 py-2 rounded-lg transition-all ${active ? 'bg-blue-500/15 border border-blue-400/30' : 'bg-white/[0.03] border border-transparent'}`}>
            <span className={`text-sm tabular-nums ${active ? 'text-white' : 'text-white/50'}`}>{qty} units</span>
            <div className="flex items-center gap-3">
              <span className="text-white/25 text-xs">{margin}</span>
              <span className={`font-bold text-sm tabular-nums ${active ? 'text-blue-300' : 'text-white/60'}`}>{price}/ea</span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/8 pt-3 flex justify-between items-center">
        <span className="text-white/40 text-xs">250 units · 1 location</span>
        <div className="text-right">
          <div className="text-white font-bold text-lg">$1,712.50</div>
          <div className="text-white/30 text-xs">Margin $751.25</div>
        </div>
      </div>
    </div>
  )
}

function MockupMockup() {
  const [activeSize, setActiveSize] = useState('Standard F')
  const [activeView, setActiveView] = useState('Front')
  const sizes = ['Athletic M', 'Standard F', 'Plus Size']
  const views = ['Front', 'Back', 'Left Sleeve']

  return (
    <div className="w-full max-w-xs space-y-2.5">
      {/* Body type tabs */}
      <div className="flex gap-1.5">
        {sizes.map(s => (
          <button
            key={s}
            onClick={() => setActiveSize(s)}
            className="flex-1 text-xs py-1.5 rounded-lg border transition-all duration-200"
            style={{
              background: activeSize === s ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
              borderColor: activeSize === s ? 'rgba(96,165,250,0.35)' : 'rgba(255,255,255,0.08)',
              color: activeSize === s ? '#93C5FD' : 'rgba(255,255,255,0.35)',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Video frame */}
      <div className="relative rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
        <video
          key={activeSize}
          src="/satu001.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full object-cover"
          style={{ maxHeight: 260 }}
        />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/20">AI</span>
          <span className="text-xs bg-black/40 text-white/50 px-2 py-0.5 rounded-full border border-white/10">{activeSize}</span>
        </div>
        <div className="absolute bottom-2.5 right-2.5 text-xs text-white/30 bg-black/40 px-2 py-0.5 rounded-full">
          {activeView}
        </div>
      </div>

      {/* Colorway row */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          {['bg-blue-500', 'bg-slate-700', 'bg-red-600', 'bg-white', 'bg-yellow-500'].map((c, i) => (
            <div key={i} className={`w-5 h-5 rounded-full ${c} ${i === 0 ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-black' : ''}`} />
          ))}
        </div>
        <span className="text-white/30 text-xs ml-auto">12 colorways</span>
      </div>

      {/* View toggle */}
      <div className="grid grid-cols-3 gap-1.5 text-center">
        {views.map(v => (
          <button
            key={v}
            onClick={() => setActiveView(v)}
            className="text-xs py-1.5 rounded-lg border transition-all duration-200"
            style={{
              background: activeView === v ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
              borderColor: activeView === v ? 'rgba(96,165,250,0.30)' : 'rgba(255,255,255,0.08)',
              color: activeView === v ? '#93C5FD' : 'rgba(255,255,255,0.35)',
            }}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

function BlankSelectorMockup() {
  const vibes = ['Streetwear', 'Corporate', 'Athletic', 'Luxury', 'Events']
  const blanks = [
    { name: 'Bella+Canvas 3001CVC', sku: 'BC3001CVC', price: '$5.40', weight: '4.2 oz', feel: 'Soft', badge: '360°', match: '97%', ai: true },
    { name: 'Alternative 1070', sku: 'AA1070', price: '$6.80', weight: '4.4 oz', feel: 'Vintage', badge: '360°', match: '91%', ai: false },
    { name: 'Comfort Colors 1717', sku: 'CC1717', price: '$7.20', weight: '6.1 oz', feel: 'Garment dyed', badge: '', match: '84%', ai: false },
  ]
  return (
    <div className="w-full max-w-xs space-y-3">
      {/* Vibe selector */}
      <div className="space-y-1.5">
        <div className="text-white/25 text-xs uppercase tracking-widest">Brand Vibe</div>
        <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 flex items-center justify-between">
          <span className="text-white text-sm font-medium">Streetwear</span>
          <div className="flex items-center gap-2">
            <span className="text-blue-400 text-xs bg-blue-400/10 px-2 py-0.5 rounded-full">AI matched</span>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="#ffffff40" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {vibes.map(v => (
            <span key={v} className={`text-xs px-2 py-1 rounded-lg border ${v === 'Streetwear' ? 'bg-blue-500/20 border-blue-400/30 text-blue-300' : 'bg-white/5 border-white/10 text-white/30'}`}>{v}</span>
          ))}
        </div>
      </div>
      {/* Blank cards */}
      <div className="space-y-2">
        {blanks.map(({ name, sku, price, weight, feel, badge, match, ai }) => (
          <div key={sku} className={`p-3 rounded-xl border ${ai ? 'bg-blue-500/10 border-blue-400/30' : 'bg-white/[0.03] border-white/8'}`}>
            <div className="flex gap-3">
              {/* Blank thumbnail */}
              <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex flex-col items-center justify-center relative ${ai ? 'bg-blue-500/20' : 'bg-white/10'}`}>
                <svg width="20" height="24" fill="none" viewBox="0 0 24 28"><path d="M8 4C8 2.9 8.9 2 10 2h4c1.1 0 2 .9 2 2v2l2 1v17H6V9l2-1V4z" stroke={ai ? '#60A5FA' : '#ffffff30'} strokeWidth="1.2"/><path d="M6 9c-2 .5-4 2-4 4v11h4" stroke={ai ? '#60A5FA' : '#ffffff30'} strokeWidth="1.2"/><path d="M18 9c2 .5 4 2 4 4v11h-4" stroke={ai ? '#60A5FA' : '#ffffff30'} strokeWidth="1.2"/></svg>
                {badge && <span className="absolute -top-1 -right-1 text-white/60 text-xs bg-black border border-white/20 rounded px-0.5 leading-tight">360</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${ai ? 'text-white' : 'text-white/70'}`}>{name}</div>
                <div className="text-white/30 text-xs">{weight} · {feel}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1 w-16 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${ai ? 'bg-blue-400' : 'bg-white/30'}`} style={{ width: match }} />
                  </div>
                  <span className={`text-xs ${ai ? 'text-blue-400' : 'text-white/30'}`}>{match} vibe match</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold text-sm ${ai ? 'text-blue-300' : 'text-white/60'}`}>{price}</div>
                {ai && <div className="text-xs text-blue-400/50">Best fit</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center text-white/20 text-xs">Showing 3 of 2,847 · Sorted by vibe match</div>
    </div>
  )
}

function ProofVaultMockup() {
  const versions = [
    { v: 'v1', date: 'Mar 10', status: 'Rejected', color: 'text-red-400 bg-red-400/10 border-red-400/20', note: 'Wrong PMS color' },
    { v: 'v2', date: 'Mar 12', status: 'Rejected', color: 'text-red-400 bg-red-400/10 border-red-400/20', note: 'Logo too small' },
    { v: 'v3', date: 'Mar 14', status: 'Approved', color: 'text-green-400 bg-green-400/10 border-green-400/20', note: '' },
  ]
  return (
    <div className="w-full max-w-xs space-y-3">
      <div className="space-y-2">
        {versions.map(({ v, date, status, color, note }) => (
          <div key={v} className={`flex items-center gap-3 p-3 rounded-xl border bg-white/[0.03] ${status === 'Approved' ? 'border-green-400/25' : 'border-white/8'}`}>
            <div className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold ${status === 'Approved' ? 'text-green-300' : 'text-white/40'}`}>{v}</div>
            <div className="flex-1">
              <div className="text-white/60 text-xs">{date}</div>
              {note && <div className="text-white/30 text-xs">{note}</div>}
              {status === 'Approved' && <div className="text-green-400/70 text-xs">Sarah Chen · Mar 14, 2:34 PM</div>}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${color}`}>{status}</span>
          </div>
        ))}
      </div>
      <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-3 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div>
          <div className="text-green-300 text-xs font-semibold">Auto-released to production</div>
          <div className="text-green-400/50 text-xs">v3 locked · IP logged · Audit trail saved</div>
        </div>
      </div>
    </div>
  )
}

function SmartLocationMockup() {
  const poloLocations = ['Left Chest', 'Right Chest', 'Upper Back', 'Center Back', 'Left Sleeve']
  return (
    <div className="w-full max-w-xs space-y-3">
      <div className="flex gap-2">
        {['T-Shirt', 'Polo', 'Hoodie', 'Hat'].map(g => (
          <button key={g} className={`flex-1 text-xs py-2 rounded-lg border transition-all ${g === 'Polo' ? 'bg-blue-500/20 border-blue-400/40 text-blue-300 font-semibold' : 'bg-white/5 border-white/10 text-white/40'}`}>{g}</button>
        ))}
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b border-white/8 flex items-center justify-between">
          <span className="text-white/50 text-xs">Imprint Location</span>
          <span className="text-blue-400/60 text-xs">Polo only</span>
        </div>
        {poloLocations.map((loc, i) => (
          <div key={loc} className={`px-3 py-2.5 flex items-center justify-between ${i === 0 ? 'bg-blue-500/10' : ''} border-b border-white/5 last:border-0`}>
            <span className={`text-sm ${i === 0 ? 'text-blue-300 font-medium' : 'text-white/60'}`}>{loc}</span>
            {i === 0 && <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"/></svg>}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-white/30 text-xs px-1">
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#ffffff30" strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke="#ffffff30" strokeWidth="1.5" strokeLinecap="round"/></svg>
        Only shows locations valid for the selected garment type
      </div>
    </div>
  )
}

function VectorMockup() {
  return (
    <div className="w-full max-w-xs space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="text-white/30 text-xs text-center uppercase tracking-wider">Before</div>
          <div className="bg-white/5 border border-white/10 rounded-xl h-24 flex items-center justify-center relative overflow-hidden">
            <div className="text-white/20 text-xs text-center px-3">
              <div className="text-2xl mb-1">🖼</div>
              <div>logo_final.jpg</div>
              <div className="text-white/15">72 DPI · Raster</div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-transparent" />
          </div>
          <div className="text-red-400/60 text-xs text-center">⚠ Not print-ready</div>
        </div>
        <div className="space-y-2">
          <div className="text-white/30 text-xs text-center uppercase tracking-wider">After</div>
          <div className="bg-white/5 border border-green-400/20 rounded-xl h-24 flex items-center justify-center relative overflow-hidden">
            <div className="text-green-300/70 text-xs text-center px-3">
              <div className="text-2xl mb-1">✦</div>
              <div>logo_final.svg</div>
              <div className="text-green-400/40">Infinite DPI · Vector</div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-transparent" />
          </div>
          <div className="text-green-400/60 text-xs text-center">✓ Print-ready</div>
        </div>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 text-xs">Converting artwork…</span>
          <span className="text-blue-400 text-xs">Auto</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full w-4/5" />
        </div>
        <div className="flex justify-between mt-1.5 text-white/20 text-xs">
          <span>Raster trace</span>
          <span>Path cleanup</span>
          <span>Export</span>
        </div>
      </div>
    </div>
  )
}

function SustainabilityMockup() {
  const certs = [
    { label: 'OEKO-TEX® 100', icon: '🌿', color: 'text-green-300 bg-green-400/10 border-green-400/20' },
    { label: 'Recycled 70%', icon: '♻', color: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/20' },
    { label: 'Fair Trade USA', icon: '✓', color: 'text-amber-300 bg-amber-400/10 border-amber-400/20' },
    { label: 'B Corp', icon: '◈', color: 'text-purple-300 bg-purple-400/10 border-purple-400/20' },
  ]
  return (
    <div className="w-full max-w-xs space-y-3">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-white font-semibold text-sm">Bella+Canvas 3001CVC</div>
            <div className="text-white/40 text-xs">Heather jersey · 52% Cotton</div>
          </div>
          <div className="text-white/60 font-bold text-sm">$5.40</div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {certs.map(({ label, icon, color }) => (
            <div key={label} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs ${color}`}>
              <span>{icon}</span>
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
        <span className="text-white/40 text-xs">ESG Score for this PO</span>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full w-5/6" />
          </div>
          <span className="text-green-400 text-xs font-bold">A+</span>
        </div>
      </div>
    </div>
  )
}

function TariffMockup() {
  const rows = [
    { origin: '🇨🇳 China', sku: '6109.10.20', tariff: '+30%', cost: '$3.20', flag: true },
    { origin: '🇻🇳 Vietnam', sku: '6109.10.00', tariff: '0%', cost: '$3.55', flag: false },
    { origin: '🇧🇩 Bangladesh', sku: '6109.10.00', tariff: '0%', cost: '$3.40', flag: false },
  ]
  return (
    <div className="w-full max-w-xs space-y-3">
      <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl px-3 py-2.5 flex items-center gap-2">
        <span className="text-amber-400">⚠</span>
        <div>
          <div className="text-amber-300 text-xs font-semibold">3 products affected by tariff change</div>
          <div className="text-amber-400/50 text-xs">Updated HTS rates as of Mar 2026</div>
        </div>
      </div>
      <div className="space-y-1.5">
        {rows.map(({ origin, sku, tariff, cost, flag }) => (
          <div key={origin} className={`flex items-center gap-3 p-2.5 rounded-xl border ${flag ? 'bg-red-500/5 border-red-400/20' : 'bg-white/[0.03] border-white/8'}`}>
            <span className="text-base">{origin.split(' ')[0]}</span>
            <div className="flex-1">
              <div className="text-white/60 text-xs">{origin.split(' ')[1]}</div>
              <div className="text-white/25 text-xs">HTS {sku}</div>
            </div>
            <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${flag ? 'text-red-400 bg-red-400/10' : 'text-green-400 bg-green-400/10'}`}>{tariff}</div>
            <div className={`text-sm font-bold ${flag ? 'text-red-300' : 'text-green-300'}`}>{cost}</div>
          </div>
        ))}
      </div>
      <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-3 text-center">
        <div className="text-green-300 text-xs font-semibold">Switch to Vietnam · Save $0.15/unit</div>
        <div className="text-green-400/50 text-xs">$1,875 saved on next 12,500 unit PO</div>
      </div>
    </div>
  )
}

function CashFlowMockup() {
  const items = [
    { label: 'PO issued to SanMar', day: 'Day 0', amount: '-$14,200', type: 'out' },
    { label: 'Decorator invoice due', day: 'Day 22', amount: '-$8,400', type: 'out' },
    { label: 'Client invoice sent', day: 'Day 28', amount: '+$34,500', type: 'in' },
    { label: 'Net 30 — client pays', day: 'Day 58', amount: '+$34,500', type: 'recv' },
  ]
  return (
    <div className="w-full max-w-xs space-y-3">
      <div className="space-y-1.5">
        {items.map(({ label, day, amount, type }) => (
          <div key={label} className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${type === 'out' ? 'bg-red-400' : type === 'in' ? 'bg-amber-400' : 'bg-green-400'}`} />
            <div className="flex-1 flex items-center justify-between">
              <div>
                <div className="text-white/60 text-xs">{label}</div>
                <div className="text-white/25 text-xs">{day}</div>
              </div>
              <span className={`text-xs font-bold tabular-nums ${type === 'out' ? 'text-red-400' : type === 'in' ? 'text-amber-400' : 'text-green-400'}`}>{amount}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/40 text-xs">Cash gap exposure</span>
          <span className="text-amber-400 text-xs font-bold">Days 0–58</span>
        </div>
        <div className="h-6 bg-white/5 rounded-lg overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full bg-red-500/30 rounded-l-lg" style={{ width: '48%' }} />
          <div className="absolute right-0 top-0 h-full bg-green-500/30 rounded-r-lg" style={{ width: '40%' }} />
          <div className="absolute inset-0 flex items-center justify-center text-white/40 text-xs">$22,600 float required</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5 text-center">
        {[{ l: 'Invoiced', v: '$34.5K', c: 'text-amber-400' }, { l: 'Outstanding', v: '$22.6K', c: 'text-red-400' }, { l: 'Collected', v: '$11.9K', c: 'text-green-400' }].map(({ l, v, c }) => (
          <div key={l} className="bg-white/5 border border-white/8 rounded-lg py-2">
            <div className={`text-sm font-bold ${c}`}>{v}</div>
            <div className="text-white/30 text-xs">{l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PipelineMockup() {
  const columns = [
    { label: 'Quoting', count: 4, color: 'bg-slate-600/40' },
    { label: 'In Review', count: 2, color: 'bg-blue-600/30' },
    { label: 'Production', count: 3, color: 'bg-amber-600/30' },
    { label: 'Shipped', count: 1, color: 'bg-green-600/30' },
  ]
  const cards = {
    'Quoting': [{ name: 'Red Bull · Q2 Kits', val: '$8,400' }, { name: 'Spotify HQ · Polos', val: '$2,100' }],
    'In Review': [{ name: 'Nike Campus Event', val: '$14,200' }],
    'Production': [{ name: 'Google I/O Tees ×2K', val: '$22,800' }],
    'Shipped': [{ name: 'Netflix Wrap', val: '$6,750' }],
  }
  return (
    <div className="w-full max-w-sm overflow-x-auto">
      <div className="flex gap-2 min-w-max pb-1">
        {columns.map(({ label, color }) => (
          <div key={label} className="w-32 space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-white/50 text-xs font-medium">{label}</span>
            </div>
            {((cards as Record<string, { name: string; val: string }[]>)[label] || []).map(({ name, val }) => (
              <div key={name} className={`${color} border border-white/10 rounded-xl p-2.5 space-y-1`}>
                <div className="text-white/70 text-xs leading-tight font-medium">{name}</div>
                <div className="text-white/40 text-xs">{val}</div>
              </div>
            ))}
            {((cards as Record<string, { name: string; val: string }[]>)[label] || []).length === 0 && (
              <div className="border border-dashed border-white/10 rounded-xl h-14" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ClientPortalMockup() {
  return (
    <div className="w-full max-w-xs space-y-3">
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="bg-white/5 border-b border-white/8 px-3 py-2 flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
          </div>
          <div className="flex-1 bg-white/8 rounded-md px-2 py-0.5 text-white/30 text-xs text-center">
            brandops.io/portal/spotify-q2
          </div>
        </div>
        <div className="p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/70 text-xs font-semibold">Spotify HQ · Q2 Merch</div>
              <div className="text-white/30 text-xs">3 products · Awaiting approval</div>
            </div>
            <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
          </div>
          {[
            { name: 'Bella+Canvas Crewneck', qty: '200 units', status: 'Approve' },
            { name: 'Richardson 112 Cap', qty: '200 units', status: 'Approve' },
          ].map(({ name, qty, status }) => (
            <div key={name} className="flex items-center justify-between bg-white/5 border border-white/8 rounded-lg px-2.5 py-2">
              <div>
                <div className="text-white/60 text-xs font-medium">{name}</div>
                <div className="text-white/25 text-xs">{qty}</div>
              </div>
              <button className="text-xs bg-blue-500/20 border border-blue-400/30 text-blue-300 px-2.5 py-1 rounded-lg">{status}</button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/30 text-xs truncate">
          brandops.io/portal/spotify-q2
        </div>
        <button className="bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs px-3 py-2 rounded-xl font-medium">Copy</button>
      </div>
    </div>
  )
}

function ThreeXMockup() {
  const [active, setActive] = useState<string[]>(['Front Print (3 colors)', 'Back Print (2 colors)'])

  const decorations = [
    { name: 'Front Print (3 colors)', setup: 45, run: 0.50 },
    { name: 'Back Print (2 colors)', setup: 45, run: 0.45 },
    { name: 'Left Chest Logo (1 color)', setup: 25, run: 0.30 },
    { name: 'Sleeve Hit (1 color)', setup: 25, run: 0.28 },
  ]
  const units = 250
  const blank = 2.80
  const sellPrice = 8.40

  const decorCost = decorations
    .filter(d => active.includes(d.name))
    .reduce((sum, d) => sum + (d.setup / units) + d.run, 0)

  const totalCost = blank + decorCost
  const mult = sellPrice / totalCost
  const targetPrice = (totalCost * 3).toFixed(2)
  const gaugeWidth = Math.min((mult / 4) * 100, 100)

  const multColor = mult >= 3.0 ? '#34D399' : mult >= 2.5 ? '#FBBF24' : '#F87171'

  const toggle = (name: string) => {
    setActive(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }

  return (
    <div className="w-full max-w-xs space-y-3">
      {/* AI Design Decomposition */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
          <span className="text-white/30 text-xs uppercase tracking-wider">AI Design Scan</span>
          <span className="ml-auto text-blue-400/50 text-xs font-mono">client-logo.pdf</span>
        </div>
        <div className="space-y-1.5">
          {decorations.map(d => {
            const isOn = active.includes(d.name)
            const unitCost = (d.setup / units) + d.run
            return (
              <button
                key={d.name}
                onClick={() => toggle(d.name)}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2 transition-all duration-200"
                style={{
                  background: isOn ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isOn ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: isOn ? '#60A5FA' : 'rgba(255,255,255,0.2)' }}>
                    {isOn ? '◉' : '○'}
                  </span>
                  <span className="text-xs text-left" style={{ color: isOn ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.3)' }}>
                    {d.name}
                  </span>
                </div>
                <span className="text-white/35 font-mono text-xs">+${unitCost.toFixed(2)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Margin Gauge */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/30 text-xs uppercase tracking-wider">Your Margin</span>
          <span className="font-bold text-lg font-mono transition-all duration-500" style={{ color: multColor }}>
            {mult.toFixed(2)}×
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${gaugeWidth}%`, background: `linear-gradient(to right, ${multColor}66, ${multColor})` }}
          />
        </div>
        <div className="flex justify-between text-white/20 text-xs font-mono">
          <span>0×</span>
          <span className="text-white/35">3× target</span>
          <span>4×</span>
        </div>
      </div>

      {/* Suggestions */}
      <div className="space-y-1.5">
        {mult < 3.0 ? (
          <>
            <div className="text-white/20 text-xs uppercase tracking-wider px-1 mb-1.5">To reach your margin target</div>
            <div className="bg-amber-500/10 border border-amber-400/20 rounded-lg px-3 py-2 text-amber-300/65 text-xs">
              → Remove 1 decoration: saves $0.39/unit → {(sellPrice / Math.max(totalCost - 0.39, 0.01)).toFixed(1)}×
            </div>
            <div className="bg-amber-500/10 border border-amber-400/20 rounded-lg px-3 py-2 text-amber-300/65 text-xs">
              → Order 150 more units: saves $0.27/unit → {(sellPrice / Math.max(totalCost - 0.27, 0.01)).toFixed(1)}×
            </div>
            <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg px-3 py-2 text-blue-300/65 text-xs">
              → Reprice to ${targetPrice} to restore margin ✓
            </div>
          </>
        ) : (
          <div className="bg-green-500/10 border border-green-400/20 rounded-xl px-3 py-2.5 text-green-300/70 text-xs text-center">
            ✓ Margin target achieved — safe to quote
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Nick's Ideas Mockups ─────────────────────────────────────────────────────

function GuardrailMockup() {
  const [generated, setGenerated] = useState(false)
  return (
    <div className="w-full max-w-xs space-y-3">
      {!generated ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Guardrail Generator</div>
          <div className="space-y-2">
            {[
              { label: 'Volume', value: '250 units' },
              { label: 'Blank', value: 'Bella+Canvas 3001CVC' },
              { label: 'Budget', value: '$8.40 / unit max' },
              { label: 'Decoration', value: 'Screen print, max 4 colors' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between text-xs">
                <span className="text-white/30">{row.label}</span>
                <span className="text-white/55 font-medium">{row.value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setGenerated(true)}
            className="w-full mt-1 bg-amber-500/15 border border-amber-400/25 text-amber-300/70 text-xs py-2.5 rounded-lg font-medium hover:bg-amber-500/25 transition-colors"
          >
            Generate Designer PDF Guardrail →
          </button>
        </div>
      ) : (
        <div className="bg-white/5 border border-amber-400/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-sm">✓</span>
            <span className="text-white/40 text-xs uppercase tracking-wider">Guardrail PDF Ready</span>
          </div>
          <div className="bg-amber-500/5 border border-amber-400/10 rounded-lg p-3 space-y-2">
            <div className="text-amber-300/50 text-xs font-semibold uppercase tracking-wide">Project Brief — Designer Use Only</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-white/35"><span>Blank SKU:</span><span>BC3001CVC</span></div>
              <div className="flex justify-between text-white/35"><span>Print areas:</span><span>Front + back only</span></div>
              <div className="flex justify-between text-white/35"><span>Color limit:</span><span>4 per location</span></div>
              <div className="flex justify-between text-white/35"><span>Max art size:</span><span>12&quot; × 14&quot;</span></div>
              <div className="flex justify-between text-amber-300/60 font-medium border-t border-white/10 pt-1.5"><span>Budget ceiling:</span><span>$8.40 / unit</span></div>
            </div>
          </div>
          <button onClick={() => setGenerated(false)} className="w-full text-white/20 text-xs py-1 hover:text-white/40 transition-colors">← Reset</button>
        </div>
      )}
    </div>
  )
}

function VelocityMockup() {
  const [showAlert, setShowAlert] = useState(false)
  const items = [
    { sku: 'Summit Hoodie / Navy', d90: 85, d60: 52, d30: 21, alert: true },
    { sku: 'Everyday Tee / White', d90: 78, d60: 61, d30: 45, alert: false },
    { sku: 'Campus Fleece / Grey', d90: 90, d60: 74, d30: 58, alert: false },
  ]
  return (
    <div className="w-full max-w-xs space-y-3">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/30 text-xs uppercase tracking-wider">Stock Velocity</span>
          <span className="text-red-400/60 text-xs border border-red-400/20 px-2 py-0.5 rounded-full">1 alert</span>
        </div>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.sku} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-white/45 text-xs">{item.sku}</span>
                {item.alert && (
                  <button onClick={() => setShowAlert(true)} className="text-red-400/65 text-xs border border-red-400/20 px-1.5 py-0.5 rounded-full hover:border-red-400/40 transition-colors">
                    ⚠ 21 days
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {[['90d', item.d90], ['60d', item.d60], ['30d', item.d30]].map(([label, val]) => {
                  const isLow = label === '30d' && item.alert
                  const pct = val as number
                  return (
                    <div key={label as string} className="flex-1">
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: isLow ? '#F87171' : pct > 60 ? '#34D399' : '#FBBF24',
                          }}
                        />
                      </div>
                      <div className="text-white/20 text-xs mt-0.5 text-center">{label as string}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      {showAlert && (
        <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-red-300/70 text-xs font-medium">Summit Hoodie / Navy — Trigger Alert</span>
            <button onClick={() => setShowAlert(false)} className="text-white/20 text-xs hover:text-white/40">✕</button>
          </div>
          <div className="space-y-1 text-xs">
            <div className="text-amber-300/65">→ Bundle: &quot;3 for $65&quot; (was $75)</div>
            <div className="text-amber-300/65">→ Scarcity badge: &quot;Only 47 left in Navy&quot;</div>
            <div className="text-blue-300/55">→ Reorder PO: 144 units @ $2.80 ea</div>
          </div>
        </div>
      )}
    </div>
  )
}

function FulfillmentMockup() {
  const months = [
    { m: 'Oct', orders: 180, over: false },
    { m: 'Nov', orders: 220, over: false },
    { m: 'Dec', orders: 265, over: false },
    { m: 'Jan', orders: 298, over: false },
    { m: 'Feb', orders: 341, over: true },
    { m: 'Mar', orders: 387, over: true },
  ]
  const maxOrders = 420
  return (
    <div className="w-full max-w-xs space-y-3">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <div className="text-white/30 text-xs uppercase tracking-wider">Monthly Order Volume</div>
        <div className="flex items-end gap-1.5 h-20">
          {months.map(m => (
            <div key={m.m} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm transition-all duration-500"
                style={{
                  height: `${(m.orders / maxOrders) * 72}px`,
                  background: m.over ? '#F59E0B' : 'rgba(255,255,255,0.12)',
                }}
              />
              <span className="text-white/25 text-xs">{m.m}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-amber-400" />
            <span className="text-white/30">300+ threshold</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-white/20" />
            <span className="text-white/30">Below</span>
          </div>
        </div>
      </div>
      <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl p-4 space-y-2">
        <div className="text-amber-300/75 text-xs font-semibold">3PL Opportunity Detected</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-white/35"><span>Current volume</span><span className="text-amber-300">341 orders / mo</span></div>
          <div className="flex justify-between text-white/35"><span>Savings per unit</span><span className="text-green-300">$0.40</span></div>
          <div className="flex justify-between text-white/35"><span>Monthly gain</span><span className="text-green-300">~$1,364</span></div>
        </div>
        <button className="w-full mt-1 bg-amber-500/15 border border-amber-400/20 text-amber-300/70 text-xs py-2 rounded-lg hover:bg-amber-500/25 transition-colors">
          View 3PL Partners →
        </button>
      </div>
    </div>
  )
}

function CalendarMockup() {
  const events = [
    { label: 'Order placed', date: 'Dec 15', type: 'action' },
    { label: 'Production start', date: 'Jan 5', type: 'action' },
    { label: 'Chinese New Year', date: 'Jan 15 – Feb 10', type: 'blocked' },
    { label: 'Factory reopens', date: 'Feb 12', type: 'warning' },
    { label: 'Original delivery', date: 'Mar 1', type: 'late' },
  ]
  return (
    <div className="w-full max-w-xs space-y-3">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/30 text-xs uppercase tracking-wider">Production Calendar</span>
          <span className="text-red-400/60 text-xs">⚠ Conflict</span>
        </div>
        <div className="space-y-2">
          {events.map(e => (
            <div key={e.label} className="flex items-center gap-3">
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background: e.type === 'blocked' ? '#F87171' : e.type === 'warning' ? '#FBBF24' : e.type === 'late' ? '#F97316' : '#60A5FA',
                }}
              />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-xs" style={{
                  color: e.type === 'blocked' ? 'rgba(248,113,113,0.75)' : e.type === 'late' ? 'rgba(251,191,36,0.55)' : 'rgba(255,255,255,0.45)',
                }}>
                  {e.label}
                </span>
                <span className="text-xs font-mono" style={{
                  color: e.type === 'blocked' ? 'rgba(248,113,113,0.55)' : 'rgba(255,255,255,0.2)',
                }}>{e.date}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-red-500/10 border border-red-400/15 rounded-lg p-2 text-red-300/55 text-xs">
          26-day delay due to factory closure
        </div>
      </div>
      <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-3 space-y-2">
        <div className="text-green-300/75 text-xs font-semibold">Domestic Alternative Found</div>
        <div className="flex justify-between text-xs text-white/35">
          <span>Murray Fleece Co. (USA)</span>
          <span className="text-amber-300/60">+$0.85 / unit</span>
        </div>
        <div className="flex justify-between text-xs text-white/35">
          <span>Delivery by</span>
          <span className="text-green-300/60">Jan 28</span>
        </div>
        <button className="w-full mt-1 bg-green-500/12 border border-green-400/15 text-green-300/65 text-xs py-1.5 rounded-lg hover:bg-green-500/20 transition-colors">
          Switch to domestic supplier
        </button>
      </div>
    </div>
  )
}

function PODMigrationMockup() {
  const [sent, setSent] = useState(false)
  const designs = [
    { name: 'Summit Trail Hoodie', orders: 247, over: true },
    { name: 'Campus Classic Tee', orders: 143, over: false },
    { name: 'Mountain Logo Cap', orders: 89, over: false },
  ]
  return (
    <div className="w-full max-w-xs space-y-3">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <div className="text-white/30 text-xs uppercase tracking-wider">POD Design Tracker</div>
        <div className="space-y-3">
          {designs.map(d => (
            <div key={d.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-white/45 text-xs">{d.name}</span>
                <span className="text-xs font-mono" style={{ color: d.over ? '#FCD34D' : 'rgba(255,255,255,0.25)' }}>
                  {d.orders} orders
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min((d.orders / 300) * 100, 100)}%`,
                    background: d.over ? '#F59E0B' : '#3B82F6',
                  }}
                />
              </div>
              {d.over && <div className="text-amber-400/45 text-xs">↑ Above migration threshold</div>}
            </div>
          ))}
        </div>
      </div>
      {!sent ? (
        <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl p-3 space-y-2">
          <div className="text-amber-300/75 text-xs font-semibold">Migration Opportunity — Summit Trail Hoodie</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-white/35"><span>POD cost (247 orders)</span><span>$14,820</span></div>
            <div className="flex justify-between text-white/35"><span>Distributor cost</span><span className="text-green-300/70">$12,994</span></div>
            <div className="flex justify-between text-green-300/65 font-medium pt-1 border-t border-white/10"><span>Client saves</span><span>$1,826</span></div>
          </div>
          <button onClick={() => setSent(true)} className="w-full mt-1 bg-amber-500/15 border border-amber-400/20 text-amber-300/70 text-xs py-2 rounded-lg hover:bg-amber-500/25 transition-colors">
            Send migration pitch to client →
          </button>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-sm">✓</span>
            <span className="text-green-300/70 text-xs font-semibold">Pitch sent to client</span>
          </div>
          <div className="text-white/30 text-xs leading-relaxed italic">
            &quot;Your Summit Trail Hoodie has hit a volume where distributor pricing saves you $1,826. Want to make the switch?&quot;
          </div>
          <button onClick={() => setSent(false)} className="text-white/20 text-xs hover:text-white/40 transition-colors">← Reset</button>
        </div>
      )}
    </div>
  )
}

// ─── Feature Definitions ──────────────────────────────────────────────────────

const FEATURES = [
  {
    num: '01',
    tag: 'Quoting Engine',
    title: 'They took 20 hours.\nWe quoted in\n10 minutes.',
    description: 'We sent quote requests to Threadbird, Hit Promotional, Boundless, and Touchstone. Hit had no quote submission form. Threadbird went 20+ hours silent. The rest: 8+ hours and still waiting. BrandOps considers 10 pricing variables — blanks, decoration method, color counts per location, quantity breaks, run charges, fixed fees, freight, rush, margin, and tax — all AI-assisted. Client-ready quote in under 10 minutes.',
    stat: { label: 'Industry competitors who responded within 8 hours', value: '0 of 4' },
    component: QuoteMockup,
  },
  {
    num: '02',
    tag: 'AI Mockups',
    title: 'Show clients the\nproduct before you\norder it.',
    description: 'AI-generated virtual samples across multiple body types — athletic, standard, plus-size — with instant colorway switching. Drop the PDF attachment.',
    stat: { label: 'Body types rendered per quote', value: '3× instant' },
    component: MockupMockup,
  },
  {
    num: '03',
    tag: 'Smart Blank Selection',
    title: 'The right blank,\npriced, in stock,\nin seconds.',
    description: 'AI surfaces the best blank for the job based on decoration method, budget, and available inventory. Cost automatically calculated. No more calling SanMar.',
    stat: { label: 'Blanks in the database', value: '2,800+' },
    component: BlankSelectorMockup,
  },
  {
    num: '04',
    tag: 'Art Proof Vault',
    title: 'End the rerun.\nForever.',
    description: 'Version-controlled artwork with IP-logged client approvals. The decorator always sees the correct file. Every approval is timestamped, audited, and defensible.',
    stat: { label: 'Average rerun cost eliminated', value: '$50K+' },
    component: ProofVaultMockup,
  },
  {
    num: '05',
    tag: 'Smart Location Filter',
    title: 'Only the locations\nthat make sense.',
    description: 'Select a garment type and only valid imprint locations appear. No more clients choosing "Left Chest" on a hat. Context-aware from the first click.',
    stat: { label: 'Invalid location selections', value: '0' },
    component: SmartLocationMockup,
  },
  {
    num: '06',
    tag: 'Auto Vector Convert',
    title: 'No more "can you\nsend a better file?"',
    description: 'JPG and PNG logos are automatically converted to print-ready vector files. Raster logos never reach the decorator. Returns caused by art issues: eliminated.',
    stat: { label: 'File format rejections', value: 'Zero' },
    component: VectorMockup,
  },
  {
    num: '07',
    tag: 'Sustainability Intelligence',
    title: 'Close enterprise\ndeals with ESG\ncompliance built in.',
    description: 'Certification data — OEKO-TEX, recycled content, Fair Trade, B Corp — surfaced on every product. Sustainability reports generated for Fortune 500 program renewals.',
    stat: { label: 'Sustainable product sales growing', value: '20% YoY' },
    component: SustainabilityMockup,
  },
  {
    num: '08',
    tag: 'Tariff Radar',
    title: 'Stop losing margin\nto tariffs you\ncould have avoided.',
    description: 'HTS code visibility per product. Current tariff rates. Alternative suppliers from lower-tariff countries. Existing quotes auto-repriced when rates change.',
    stat: { label: 'Top distributors cite tariffs as #1 concern', value: '82.4%' },
    component: TariffMockup,
  },
  {
    num: '09',
    tag: 'Cash Flow Tracker',
    title: 'See the gap before\nit becomes a\ncrisis.',
    description: 'Full cash flow visibility — see exactly when money leaves (supplier POs, decorator invoices) and when it arrives (client payments). Know your cash flow position and float requirement before you confirm a single order. Stop finding out you\'re underwater 30 days too late.',
    stat: { label: 'Average cash flow gap on a single large order', value: '$22K+' },
    component: CashFlowMockup,
  },
  {
    num: '10',
    tag: 'Brand Licensing',
    title: 'Copyrighted logo.\nLicensing cleared.\nProduction started.',
    description: 'Printing a university crest, a Fortune 500 logo, or a sports team mark is intellectual property. It requires trademark clearance from the brand owner — a process that normally takes 5–10 business days over email. BrandOps centralizes the RFP submission, tracks licensing review status, sends automated reminders to brand owners, and only releases the order to production once clearance is confirmed and logged.',
    stat: { label: 'Typical manual licensing review time', value: '5–10 days' },
    component: PipelineMockup,
  },
  {
    num: '11',
    tag: 'Client Portal',
    title: 'A portal, not\na PDF.',
    description: 'Shareable project links give clients real-time visibility. Browse products, approve artwork, confirm quantities — all in one link. No login required.',
    stat: { label: 'Client approval time', value: 'Same day' },
    component: ClientPortalMockup,
  },
  {
    num: '12',
    tag: 'The 3× Rule',
    title: 'Nick Roccanti\'s rule:\nprice should be 3×\nyour cost. Ours enforces it.',
    description: 'Industry veteran Nick Roccanti built Threadbird to $20M on one principle: your sell price must be at least 3× your blank cost to survive. Decoration costs, overhead, and freight eat margin faster than you think. BrandOps calculates your effective multiplier in real time. The moment adding a screen print location or a run charge drops you below 3×, you get a margin compression warning — and the exact price you need to restore it.',
    stat: { label: 'Effective multiplier shown in real time', value: '3× enforced' },
    component: ThreeXMockup,
  },
]

// ─── Marketing Angles ────────────────────────────────────────────────────────

const ANGLES = [
  {
    num: '01',
    hook: '"How long did your\nlast quote take?"',
    target: 'Any distributor doing manual quoting',
    signal: 'Ask them. The answer is always "too long."',
    proof: 'Industry average: 47 minutes per quote. 4 of 4 major competitors didn\'t respond within 8 hours when we asked for quotes.',
    pitch: 'BrandOps quotes in under 10 minutes — considering 10 pricing variables, AI-assisted, client-ready presentation included. The rep who responds first wins the job. That\'s now you.',
    accent: 'from-blue-500/10 to-blue-500/5',
    border: 'border-blue-400/20',
    tag_color: 'text-blue-400 border-blue-400/20',
  },
  {
    num: '02',
    hook: '"Your last return —\nwas it the wrong size?"',
    target: 'Apparel-heavy distributors, collegiate & corporate uniform programs',
    signal: 'Ask: "What\'s your chargeback rate on apparel orders?" If they pause, they have a problem.',
    proof: '40% of all chargebacks come from merchant errors. Wrong size = decorated item = no return possible = full rerun at distributor cost.',
    pitch: 'BrandOps captures size breakdowns directly in the client portal — no re-keying, no spreadsheet transcription. The right sizes go to the right location, confirmed in writing before production starts.',
    accent: 'from-red-500/10 to-red-500/5',
    border: 'border-red-400/20',
    tag_color: 'text-red-400 border-red-400/20',
  },
  {
    num: '03',
    hook: '"Your client sent a JPG.\nThe print came back blurry.\nWho paid for the rerun?"',
    target: 'Any distributor doing apparel or hard goods decoration',
    signal: 'JPG-caused reprints happen constantly. Nobody tracks the cost. Ask them.',
    proof: 'Raster files are the #1 cause of rejected artwork. Once decorated, goods cannot be returned. A blurry imprint on 500 shirts = full rerun at $4,000–$25,000.',
    pitch: 'BrandOps automatically converts client-uploaded JPGs and PNGs to print-ready vector files before they ever reach the decorator. Bad file quality becomes structurally impossible.',
    accent: 'from-orange-500/10 to-orange-500/5',
    border: 'border-orange-400/20',
    tag_color: 'text-orange-400 border-orange-400/20',
  },
  {
    num: '04',
    hook: '"Six reps. Six clients.\nSix different versions\nof the same logo."',
    target: 'Multi-rep shops, agencies with multiple client accounts',
    signal: 'Ask: "How do you make sure the decorator always has the latest approved artwork file?" The answer reveals the chaos.',
    proof: 'Artwork version errors are the #1 cause of decorated goods reprints. Files named "logo_final_APPROVED_USE_THIS_v3.ai" are the industry standard. That\'s not a standard — it\'s a liability.',
    pitch: 'BrandOps is a version-controlled art vault. Every file has a history. Every approval is IP-logged. Production only starts on the confirmed version. Dispute-proof, by design.',
    accent: 'from-purple-500/10 to-purple-500/5',
    border: 'border-purple-400/20',
    tag_color: 'text-purple-400 border-purple-400/20',
  },
  {
    num: '05',
    hook: '"Do you know your\ncash flow position\nright now?"',
    target: '$2M+ distributors with large institutional or enterprise clients',
    signal: 'Ask: "On your last big order, when did you pay your supplier vs. when did the client pay you?" The gap tells the story.',
    proof: 'Distributors pay suppliers Net 30 or prepay. Clients pay Net 30–60. On a $200K order, the distributor funds $120K+ before seeing a dollar. Average cash flow gap: $22K+ per large order.',
    pitch: 'BrandOps maps every payment: when POs go out, when invoices come in, what your float exposure is. You see the cash flow gap before you confirm the order — not 45 days later when you can\'t make payroll.',
    accent: 'from-green-500/10 to-green-500/5',
    border: 'border-green-400/20',
    tag_color: 'text-green-400 border-green-400/20',
  },
  {
    num: '06',
    hook: '"Count your open tabs.\nThat\'s your\nsoftware problem."',
    target: 'Any distributor who can\'t name all the tools they use without thinking',
    signal: 'Ask: "Walk me through what you open when a new order comes in." Count the apps. The average is 8–12.',
    proof: 'Average distributor runs 8–12 platforms simultaneously: ESP/SAGE for search, OMS for orders, Dropbox for art, QuickBooks for accounting, email for everything, supplier portals for status, Shopify for stores, Salesforce for CRM. Every handoff between them is a potential error.',
    pitch: 'BrandOps is one platform covering the entire lifecycle: quoting, client portal, artwork, supplier POs, order tracking, commission reporting, cash flow. The integrations you\'re duct-taping together become one native workflow.',
    accent: 'from-cyan-500/10 to-cyan-500/5',
    border: 'border-cyan-400/20',
    tag_color: 'text-cyan-400 border-cyan-400/20',
  },
  {
    num: '07',
    hook: '"Did Campus A get\nCampus C\'s shirts?"',
    target: 'Distributors doing enterprise, institutional, or multi-location orders',
    signal: 'Ask: "How do you build your packing matrix for split shipments?" If the answer involves Excel, you have an angle.',
    proof: 'Packing matrix errors — wrong sizes to wrong locations — are discovered at delivery. By then, orientation is tomorrow. Repack + re-ship costs run $2,000–$8,000 and destroys the client relationship.',
    pitch: 'BrandOps captures the size-per-location breakdown directly from the client portal. It generates the packing matrix, creates packing slips per location, and produces a verification checklist before a single box is taped. Wrong-location shipments become structurally impossible.',
    accent: 'from-amber-500/10 to-amber-500/5',
    border: 'border-amber-400/20',
    tag_color: 'text-amber-400 border-amber-400/20',
  },
  {
    num: '08',
    hook: '"When a client issue\ncomes in — how long\nbefore it\'s resolved?"',
    target: 'Distributors with a support or ops team handling client complaints',
    signal: 'Ask: "Where do client issues go when they come in?" If the answer is "email" or "Slack," the resolution time is measured in days.',
    proof: 'Unresolved client issues = chargebacks, lost renewals, and negative referrals. Distributors at $2M+ process enough volume that issues become a steady operational drain. Without a structured system, issues sit in inboxes until they escalate.',
    pitch: 'BrandOps has a built-in ticketing system tied to the order. Every issue is logged against the specific order, assigned, tracked, and resolved with full audit trail. Issues stop being surprises and start being metrics.',
    accent: 'from-rose-500/10 to-rose-500/5',
    border: 'border-rose-400/20',
    tag_color: 'text-rose-400 border-rose-400/20',
  },
  {
    num: '09',
    hook: '"We know you\'re on\nCommonSKU. Here\'s\nwhat you\'re missing."',
    target: 'CommonSKU users — identifiable via BuiltWith or direct research',
    signal: 'Use BuiltWith.com to find companies running CommonSKU. These are warm targets: they\'ve already bought into the category, they know the pain, and they\'re paying $198+/seat for a product the industry calls "Windows 98 shit."',
    proof: 'CommonSKU has 900 customers and $1.4B in combined user revenue. Their average customer is a $1.5M distributor. They\'re not serving the $5M–$20M segment well — no AI quoting, no art vault, no tariff radar, no cash flow visibility, no PE roll-up features.',
    pitch: 'You\'re already paying for an OMS. You\'re already bought into the workflow. BrandOps does everything CommonSKU does — and adds AI quoting, automated art approval, sustainability data, tariff radar, and cash flow tracking. Same category. Different ceiling.',
    accent: 'from-slate-500/10 to-slate-500/5',
    border: 'border-slate-400/20',
    tag_color: 'text-slate-400 border-slate-400/20',
  },
  {
    num: '10',
    hook: '"One platform.\nEvery vendor, supplier,\ndecorator, and client."',
    target: 'Any distributor managing 3+ suppliers and 2+ decorators simultaneously',
    signal: 'Ask: "How many vendor relationships are you actively managing right now?" The complexity is the opening.',
    proof: 'A $5M distributor manages SanMar, alphabroder, 3–5 contract decorators, 2 freight carriers, and 50+ active client accounts — across 8–12 disconnected platforms. Every new vendor is another login, another portal, another status email chain.',
    pitch: 'BrandOps connects every party in one place. Clients see their portal. Decorators receive structured POs and update production status directly. Suppliers connect via PromoStandards ePO — eliminating 3–7 status emails per order per day. One platform. Every relationship managed.',
    accent: 'from-indigo-500/10 to-indigo-500/5',
    border: 'border-indigo-400/20',
    tag_color: 'text-indigo-400 border-indigo-400/20',
  },
]

function AngleSection({
  angle,
  index,
  isActive,
}: {
  angle: typeof ANGLES[0]
  index: number
  isActive: boolean
}) {
  return (
    <section
      data-index={index}
      className="relative min-h-screen flex items-center justify-center px-8 py-20"
      style={{ scrollSnapAlign: 'start' }}
    >
      <div
        className={`absolute inset-0 pointer-events-none bg-gradient-to-br ${angle.accent} opacity-60`}
      />
      <div
        className="relative z-10 w-full max-w-5xl mx-auto"
        style={{
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'translateY(0px)' : 'translateY(32px)',
          filter: isActive ? 'blur(0px)' : 'blur(8px)',
          transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1), filter 0.8s ease',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: The pitch */}
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-white/25 text-xs font-mono tracking-widest">{angle.num}</span>
                <span className={`text-xs uppercase tracking-widest border px-2.5 py-1 rounded-full ${angle.tag_color}`}>
                  Marketing Angle
                </span>
              </div>
              <h2
                className="text-4xl font-bold tracking-tight text-white leading-tight"
                style={{
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  whiteSpace: 'pre-line',
                }}
              >
                {angle.hook}
              </h2>
            </div>
            <p className="text-white/45 text-base leading-relaxed">{angle.pitch}</p>
          </div>

          {/* Right: Targeting intel card */}
          <div
            style={{
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'translateX(0px)' : 'translateX(24px)',
              transition: 'opacity 1s cubic-bezier(0.16,1,0.3,1) 0.2s, transform 1s cubic-bezier(0.16,1,0.3,1) 0.2s',
            }}
          >
            <div className={`rounded-2xl border ${angle.border} bg-white/5 backdrop-blur-sm p-6 space-y-5`}>
              <div className="space-y-1">
                <div className="text-white/25 text-xs uppercase tracking-widest">Target</div>
                <div className="text-white/70 text-sm leading-relaxed">{angle.target}</div>
              </div>
              <div className={`h-px bg-gradient-to-r from-transparent ${angle.border} to-transparent`} />
              <div className="space-y-1">
                <div className="text-white/25 text-xs uppercase tracking-widest">How to Find Them</div>
                <div className="text-white/60 text-sm leading-relaxed">{angle.signal}</div>
              </div>
              <div className={`h-px bg-gradient-to-r from-transparent ${angle.border} to-transparent`} />
              <div className="space-y-1">
                <div className="text-white/25 text-xs uppercase tracking-widest">Proof Point</div>
                <div className="text-white/60 text-sm leading-relaxed">{angle.proof}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Section Component ────────────────────────────────────────────────────────

function FeatureSection({
  feature,
  index,
  isActive,
  isFirst,
}: {
  feature: typeof FEATURES[0]
  index: number
  isActive: boolean
  isFirst?: boolean
}) {
  const MockupComponent = feature.component
  return (
    <section
      data-index={index}
      className="relative min-h-screen flex items-center justify-center px-8 py-20"
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Gradient background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at ${isFirst ? '50%' : '70%'} 50%, rgba(37,99,235,0.06) 0%, transparent 70%)`,
        }}
      />

      <div
        className="relative z-10 w-full max-w-5xl mx-auto"
        style={{
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'translateY(0px)' : 'translateY(32px)',
          filter: isActive ? 'blur(0px)' : 'blur(8px)',
          transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1), filter 0.8s ease',
        }}
      >
        {isFirst ? (
          // Hero layout — centered
          <div className="text-center max-w-2xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 text-blue-400/60 text-xs uppercase tracking-widest border border-blue-400/20 px-3 py-1.5 rounded-full">
              <span className="w-1 h-1 bg-blue-400 rounded-full" />
              BrandOps · Feature Overview
            </div>
            <h1 className="text-5xl font-bold tracking-tight leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
              <span className="text-white">The merch operations</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
                platform that exists now.
              </span>
            </h1>
            <p className="text-white/40 text-lg leading-relaxed max-w-lg mx-auto">
              Twelve features built for distributors doing real volume. Scroll to see each one.
            </p>
            <div className="flex items-center justify-center gap-2 text-white/20 text-sm animate-bounce">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Scroll
            </div>
          </div>
        ) : (
          // Feature layout — split
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-blue-400/40 text-xs font-mono tracking-widest">{feature.num}</span>
                  <span className="text-blue-400/60 text-xs uppercase tracking-widest border border-blue-400/20 px-2.5 py-1 rounded-full">{feature.tag}</span>
                </div>
                <h2
                  className="text-4xl font-bold tracking-tight text-white leading-tight"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                    whiteSpace: 'pre-line',
                  }}
                >
                  {feature.title}
                </h2>
              </div>
              <p className="text-white/45 text-lg leading-relaxed">{feature.description}</p>
              <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div>
                  <div className="text-white/30 text-xs">{feature.stat.label}</div>
                  <div className="text-blue-300 font-bold text-xl">{feature.stat.value}</div>
                </div>
              </div>
            </div>

            {/* Right: UI Mockup */}
            <div
              className="flex justify-center lg:justify-end"
              style={{
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'translateX(0px) scale(1)' : 'translateX(24px) scale(0.97)',
                transition: 'opacity 1s cubic-bezier(0.16,1,0.3,1) 0.15s, transform 1s cubic-bezier(0.16,1,0.3,1) 0.15s',
              }}
            >
              <MockupComponent />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Nick's Ideas Definitions ────────────────────────────────────────────────

const NICK_IDEAS = [
  {
    num: 'N1',
    tag: 'Guardrail Generator',
    title: 'Every designer gets\na brief. Not a guess.',
    description: 'Before a designer touches Illustrator, BrandOps generates a PDF guardrail: exact volume, approved blank, max decoration budget, and compliant imprint areas. No back-and-forth revisions. No "we can\'t print that" calls.',
    stat: { label: 'Design revision rounds eliminated', value: '2.7 avg' },
    component: GuardrailMockup,
  },
  {
    num: 'N2',
    tag: 'Velocity Tracking',
    title: '30-60-90 day stock\nalerts. Know before\nyou run out.',
    description: 'Tracks reorder velocity per SKU. At trigger thresholds — 30, 60, and 90 days of remaining stock — BrandOps fires automatic bundle and discount suggestions to protect revenue and prevent stockouts before they happen.',
    stat: { label: 'Stockout revenue loss prevented per event', value: 'Up to $8K' },
    component: VelocityMockup,
  },
  {
    num: 'N3',
    tag: 'Fulfillment Upsell',
    title: 'Over 300 orders/month.\nTime to talk 3PL.',
    description: 'When a client crosses the 300 orders/month threshold, BrandOps surfaces a 3PL recommendation with projected per-unit savings, fulfillment lead time comparison, and a one-click proposal draft — turning volume milestones into upgrade conversations.',
    stat: { label: 'Avg per-unit savings at 3PL threshold', value: '$0.40 / unit' },
    component: FulfillmentMockup,
  },
  {
    num: 'N4',
    tag: 'Overseas Calendar',
    title: 'Chinese New Year\nwon\'t blindside\nyou again.',
    description: 'BrandOps maps every overseas order against factory production calendars. Chinese New Year, Golden Week, and supplier holidays are flagged automatically — with domestic alternatives and cost deltas shown before you commit to a production date.',
    stat: { label: 'Orders impacted by factory shutdowns per year', value: '1 in 4' },
    component: CalendarMockup,
  },
  {
    num: 'N5',
    tag: 'POD Migration Engine',
    title: 'Their print-on-demand\nhas become your\ndistributor deal.',
    description: 'BrandOps tracks reorder frequency per design. When a client\'s POD design crosses the economic break-even point, it flags the opportunity and auto-drafts a migration pitch — showing exactly how much they save switching to distributor pricing.',
    stat: { label: 'Client savings at 247 POD orders vs distributor', value: '$1,826' },
    component: PODMigrationMockup,
  },
]

// ─── Nick Idea Section Component ─────────────────────────────────────────────

function NickIdeaSection({
  idea,
  index,
  isActive,
}: {
  idea: typeof NICK_IDEAS[0]
  index: number
  isActive: boolean
}) {
  const MockupComponent = idea.component
  return (
    <section
      data-index={index}
      className="relative min-h-screen flex items-center justify-center px-8 py-20"
      style={{ scrollSnapAlign: 'start' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(245,158,11,0.05) 0%, transparent 70%)' }}
      />
      <div
        className="relative z-10 w-full max-w-5xl mx-auto"
        style={{
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'translateY(0px)' : 'translateY(32px)',
          filter: isActive ? 'blur(0px)' : 'blur(8px)',
          transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1), filter 0.8s ease',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-amber-400/40 text-xs font-mono tracking-widest">{idea.num}</span>
                <span className="text-amber-400/60 text-xs uppercase tracking-widest border border-amber-400/20 px-2.5 py-1 rounded-full">{idea.tag}</span>
                <span className="text-amber-400/35 text-xs border border-amber-400/12 px-2 py-0.5 rounded-full">Nick&apos;s Idea</span>
              </div>
              <h2
                className="text-4xl font-bold tracking-tight text-white leading-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", whiteSpace: 'pre-line' }}
              >
                {idea.title}
              </h2>
            </div>
            <p className="text-white/45 text-lg leading-relaxed">{idea.description}</p>
            <div className="inline-flex items-center gap-3 bg-amber-500/5 border border-amber-400/15 rounded-xl px-4 py-3">
              <div>
                <div className="text-white/30 text-xs">{idea.stat.label}</div>
                <div className="text-amber-300 font-bold text-xl">{idea.stat.value}</div>
              </div>
            </div>
          </div>

          {/* Right: UI Mockup */}
          <div
            className="flex justify-center lg:justify-end"
            style={{
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'translateX(0px) scale(1)' : 'translateX(24px) scale(0.97)',
              transition: 'opacity 1s cubic-bezier(0.16,1,0.3,1) 0.15s, transform 1s cubic-bezier(0.16,1,0.3,1) 0.15s',
            }}
          >
            <MockupComponent />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ShowcasePage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [smokeCount, setSmokeCount] = useState(0)
  const canvasRef = useSmokeCanvas(smokeCount)
  const containerRef = useRef<HTMLDivElement>(null)
  const prevIndexRef = useRef(0)

  // Intersection Observer: detect which section is active
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-index]')
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            const idx = parseInt((entry.target as HTMLElement).dataset.index || '0', 10)
            if (idx !== prevIndexRef.current) {
              setSmokeCount(c => c + 1)
              prevIndexRef.current = idx
            }
            setActiveIndex(idx)
          }
        }
      },
      { threshold: 0.5, root: containerRef.current }
    )

    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const scrollToSection = useCallback((i: number) => {
    const el = document.querySelector<HTMLElement>(`[data-index="${i}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Total sections: 1 hero + 12 features + 1 transition + 10 angles + 1 nick transition + 5 nick ideas
  const totalSections = 1 + FEATURES.length + 1 + ANGLES.length + 1 + NICK_IDEAS.length

  return (
    <div
      ref={containerRef}
      className="bg-black"
      style={{
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        height: '100vh',
      }}
    >
      {/* Canvas smoke overlay */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 40 }}
      />

      {/* Navigation dots — right side */}
      <nav
        className="fixed right-5 top-1/2 -translate-y-1/2 flex flex-col gap-2.5"
        style={{ zIndex: 50 }}
      >
        {Array.from({ length: totalSections }, (_, i) => (
          <button
            key={i}
            onClick={() => scrollToSection(i)}
            className="relative flex items-center justify-center"
            style={{ width: 20, height: 20 }}
            aria-label={`Go to section ${i}`}
          >
            <span
              className="rounded-full transition-all duration-500"
              style={{
                display: 'block',
                width: activeIndex === i ? 8 : 4,
                height: activeIndex === i ? 8 : 4,
                background: activeIndex === i ? '#60A5FA' : 'rgba(255,255,255,0.2)',
                boxShadow: activeIndex === i ? '0 0 10px #60A5FA88' : 'none',
              }}
            />
          </button>
        ))}
      </nav>

      {/* Section counter — bottom left */}
      <div
        className="fixed bottom-6 left-8 font-mono text-white/20 text-xs"
        style={{ zIndex: 50 }}
      >
        <span className="text-white/50">{String(activeIndex + 1).padStart(2, '0')}</span>
        <span className="mx-1.5">/</span>
        <span>{String(totalSections).padStart(2, '0')}</span>
      </div>

      {/* BrandOps wordmark — top left */}
      <div
        className="fixed top-6 left-8 flex items-center gap-2"
        style={{ zIndex: 50 }}
      >
        <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">B</span>
        </div>
        <span className="text-white/40 text-sm font-medium tracking-wide">BrandOps</span>
      </div>

      {/* Hero Section */}
      <FeatureSection
        feature={FEATURES[0]}
        index={0}
        isActive={activeIndex === 0}
        isFirst
      />

      {/* Feature Sections */}
      {FEATURES.map((feature, i) => (
        <FeatureSection
          key={feature.num}
          feature={feature}
          index={i + 1}
          isActive={activeIndex === i + 1}
        />
      ))}

      {/* Transition slide: Features → Marketing Angles */}
      <section
        data-index={1 + FEATURES.length}
        className="relative min-h-screen flex items-center justify-center px-8"
        style={{ scrollSnapAlign: 'start' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(37,99,235,0.08) 0%, transparent 70%)' }}
        />
        <div
          className="relative z-10 text-center max-w-2xl mx-auto space-y-8"
          style={{
            opacity: activeIndex === 1 + FEATURES.length ? 1 : 0,
            transform: activeIndex === 1 + FEATURES.length ? 'translateY(0)' : 'translateY(32px)',
            filter: activeIndex === 1 + FEATURES.length ? 'blur(0px)' : 'blur(8px)',
            transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1), filter 0.8s ease',
          }}
        >
          <div className="inline-flex items-center gap-2 text-white/20 text-xs uppercase tracking-widest border border-white/10 px-3 py-1.5 rounded-full">
            <span className="w-1 h-1 bg-white/30 rounded-full" />
            The platform is built. Now let&apos;s sell it.
          </div>
          <h2
            className="text-5xl font-bold text-white leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            10 angles to close<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
              your first 10 clients.
            </span>
          </h2>
          <p className="text-white/35 text-lg">
            Each angle targets a specific, documented pain point — with the proof, the target, and the pitch already written.
          </p>
          <div className="flex items-center justify-center gap-2 text-white/20 text-sm animate-bounce">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Keep scrolling
          </div>
        </div>
      </section>

      {/* Marketing Angle Sections */}
      {ANGLES.map((angle, i) => (
        <AngleSection
          key={angle.num}
          angle={angle}
          index={1 + FEATURES.length + 1 + i}
          isActive={activeIndex === 1 + FEATURES.length + 1 + i}
        />
      ))}

      {/* Transition slide: Angles → Nick's Ideas */}
      <section
        data-index={1 + FEATURES.length + 1 + ANGLES.length}
        className="relative min-h-screen flex items-center justify-center px-8"
        style={{ scrollSnapAlign: 'start' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(245,158,11,0.06) 0%, transparent 70%)' }}
        />
        <div
          className="relative z-10 text-center max-w-2xl mx-auto space-y-8"
          style={{
            opacity: activeIndex === 1 + FEATURES.length + 1 + ANGLES.length ? 1 : 0,
            transform: activeIndex === 1 + FEATURES.length + 1 + ANGLES.length ? 'translateY(0)' : 'translateY(32px)',
            filter: activeIndex === 1 + FEATURES.length + 1 + ANGLES.length ? 'blur(0px)' : 'blur(8px)',
            transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1), filter 0.8s ease',
          }}
        >
          <div className="inline-flex items-center gap-2 text-amber-400/40 text-xs uppercase tracking-widest border border-amber-400/15 px-3 py-1.5 rounded-full">
            <span className="w-1 h-1 bg-amber-400/50 rounded-full" />
            Nick&apos;s Ideas
          </div>
          <h2
            className="text-5xl font-bold text-white leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            Five more features<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              already on the roadmap.
            </span>
          </h2>
          <p className="text-white/35 text-lg">
            Nick Roccanti&apos;s ideas for the next layer of intelligence — automation that compounds every operation you run.
          </p>
          <div className="flex items-center justify-center gap-2 text-white/20 text-sm animate-bounce">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Keep scrolling
          </div>
        </div>
      </section>

      {/* Nick's Ideas Sections */}
      {NICK_IDEAS.map((idea, i) => (
        <NickIdeaSection
          key={idea.num}
          idea={idea}
          index={1 + FEATURES.length + 1 + ANGLES.length + 1 + i}
          isActive={activeIndex === 1 + FEATURES.length + 1 + ANGLES.length + 1 + i}
        />
      ))}

      {/* Final CTA section */}
      <section
        data-index={totalSections}
        className="min-h-screen flex items-center justify-center px-8"
        style={{ scrollSnapAlign: 'start' }}
      >
        <div
          style={{
            opacity: activeIndex === totalSections ? 1 : 0,
            transform: activeIndex === totalSections ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}
          className="text-center max-w-xl mx-auto space-y-8"
        >
          <div className="text-blue-400/50 text-xs uppercase tracking-widest font-mono">Built. Deployed. Ready.</div>
          <h2
            className="text-4xl font-bold text-white leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            The platform the merch<br />industry has been waiting for.
          </h2>
          <p className="text-white/35 text-lg">
            Not a roadmap. Not a beta. Live today.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 hover:scale-105 text-sm"
          >
            Enter BrandOps
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>
      </section>
    </div>
  )
}
