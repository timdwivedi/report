"use client"

import { useState, useEffect } from "react"

const ACCESS_CODE = "vibing"
const STORAGE_KEY = "brandops_unlocked"

export default function LockScreen() {
  const [unlocked, setUnlocked] = useState(false)
  const [code, setCode] = useState("")
  const [error, setError] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY) === "true") {
      setUnlocked(true)
    }
  }, [])

  if (process.env.NEXT_PUBLIC_APP_LOCKED !== "true" || unlocked) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.toLowerCase().trim() === ACCESS_CODE) {
      sessionStorage.setItem(STORAGE_KEY, "true")
      setUnlocked(true)
    } else {
      setError(true)
      setTimeout(() => setError(false), 1500)
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-md mx-auto text-center px-6">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Account On Hold</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Your application access has been temporarily paused. Please contact your account manager to reactivate.
        </p>
        <form onSubmit={handleSubmit} className="mb-6">
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access code"
            className={`w-full px-4 py-3 rounded-xl bg-slate-800 border ${error ? 'border-red-500 animate-shake' : 'border-slate-700'} text-white placeholder-slate-500 text-center text-lg tracking-widest focus:outline-none focus:border-amber-500 transition-colors mb-3`}
            autoFocus
          />
          <button
            type="submit"
            className="w-full px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold transition-colors"
          >
            Unlock
          </button>
        </form>
        <a
          href="mailto:support@brandops.io"
          className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  )
}
