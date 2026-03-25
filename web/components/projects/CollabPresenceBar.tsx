"use client"

import { useState, useEffect, useMemo } from 'react'
import { Mic, MicOff, MessageCircle } from 'lucide-react'

// ===== TYPES =====

interface Collaborator {
  id: string
  name: string
  initials: string
  color: string
  isActive: boolean
  lastSeen?: string
  cursor?: { section: string }
}

interface VoiceAnnotation {
  id: string
  userId: string
  userName: string
  text: string
  section: string
  createdAt: string
}

interface CollabPresenceBarProps {
  projectId: string
  className?: string
}

// ===== MOCK DATA =====

const DEMO_COLLABORATORS: Collaborator[] = [
  { id: 'u-1', name: 'Trevor Mitchell', initials: 'TM', color: 'bg-blue-500', isActive: true, cursor: { section: 'line-items' } },
  { id: 'u-2', name: 'Sarah Johnson', initials: 'SJ', color: 'bg-purple-500', isActive: true, cursor: { section: 'creative-requests' } },
  { id: 'u-3', name: 'Mike Chen', initials: 'MC', color: 'bg-emerald-500', isActive: false, lastSeen: '5m ago' },
  { id: 'u-4', name: 'Jessica Adams', initials: 'JA', color: 'bg-amber-500', isActive: false, lastSeen: '2h ago' },
]

const DEMO_ANNOTATIONS: VoiceAnnotation[] = [
  {
    id: 'va-1',
    userId: 'u-1',
    userName: 'Trevor',
    text: 'Need to check vendor pricing on the Nike caps before sending this quote',
    section: 'line-items',
    createdAt: '2026-02-25T09:15:00Z',
  },
  {
    id: 'va-2',
    userId: 'u-2',
    userName: 'Sarah',
    text: 'Client asked for rush delivery — update the timeline',
    section: 'timeline',
    createdAt: '2026-02-25T08:30:00Z',
  },
]

// ===== STORAGE KEY =====

const STORAGE_KEY = 'brandops-collab-presence'

// ===== COMPONENT =====

export default function CollabPresenceBar({ projectId, className = '' }: CollabPresenceBarProps) {
  const [showAnnotations, setShowAnnotations] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [annotations, setAnnotations] = useState<VoiceAnnotation[]>(DEMO_ANNOTATIONS)
  const [newNote, setNewNote] = useState('')

  // Simulate real-time presence via localStorage polling
  useEffect(() => {
    const myPresence = {
      projectId,
      userId: 'u-current',
      name: 'You',
      timestamp: Date.now(),
    }
    try {
      localStorage.setItem(`${STORAGE_KEY}-${projectId}`, JSON.stringify(myPresence))
    } catch {
      // localStorage might not be available
    }
    return () => {
      try {
        localStorage.removeItem(`${STORAGE_KEY}-${projectId}`)
      } catch {
        // ignore
      }
    }
  }, [projectId])

  const activeCollabs = useMemo(
    () => DEMO_COLLABORATORS.filter(c => c.isActive),
    []
  )
  const inactiveCollabs = useMemo(
    () => DEMO_COLLABORATORS.filter(c => !c.isActive),
    []
  )

  function handleAddNote() {
    if (!newNote.trim()) return
    const note: VoiceAnnotation = {
      id: `va-${Date.now()}`,
      userId: 'u-current',
      userName: 'You',
      text: newNote.trim(),
      section: 'general',
      createdAt: new Date().toISOString(),
    }
    setAnnotations(prev => [note, ...prev])
    setNewNote('')
  }

  function toggleRecording() {
    if (isRecording) {
      // Simulate ending a voice recording
      setIsRecording(false)
      const note: VoiceAnnotation = {
        id: `va-${Date.now()}`,
        userId: 'u-current',
        userName: 'You',
        text: 'Check with the client on their budget constraints for this order',
        section: 'general',
        createdAt: new Date().toISOString(),
      }
      setAnnotations(prev => [note, ...prev])
    } else {
      setIsRecording(true)
    }
  }

  function formatAnnotationTime(dateStr: string): string {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'just now'
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className={`bg-white border-b border-slate-200 ${className}`}>
      {/* Presence Strip */}
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-3">
          {/* Active Avatars */}
          <div className="flex items-center -space-x-2">
            {activeCollabs.map(c => (
              <div
                key={c.id}
                className={`w-7 h-7 rounded-full ${c.color} flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white`}
                title={`${c.name} — viewing ${c.cursor?.section ?? 'project'}`}
              >
                {c.initials}
              </div>
            ))}
            {/* Current user */}
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white">
              You
            </div>
          </div>

          {/* Active count */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-500 font-medium">
              {activeCollabs.length + 1} viewing
            </span>
          </div>

          {/* Inactive peek */}
          {inactiveCollabs.length > 0 && (
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-200">
              {inactiveCollabs.map(c => (
                <div
                  key={c.id}
                  className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-semibold text-slate-400 ring-1 ring-white"
                  title={`${c.name} — last seen ${c.lastSeen}`}
                >
                  {c.initials}
                </div>
              ))}
              <span className="text-[10px] text-slate-400 ml-1">
                {inactiveCollabs.map(c => c.lastSeen).join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Voice Annotation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleRecording}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isRecording
                ? 'bg-red-100 text-red-700 hover:bg-red-200 animate-pulse'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isRecording ? <MicOff size={13} /> : <Mic size={13} />}
            {isRecording ? 'Stop' : 'Voice Note'}
          </button>
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showAnnotations
                ? 'bg-primary-100 text-primary-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MessageCircle size={13} />
            Notes
            {annotations.length > 0 && (
              <span className="ml-0.5 w-4 h-4 rounded-full bg-primary-600 text-white text-[9px] flex items-center justify-center font-bold">
                {annotations.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Annotations Panel (collapsible) */}
      {showAnnotations && (
        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50/50 space-y-3 max-h-48 overflow-y-auto">
          {/* Quick add */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddNote()}
              placeholder="Add a note..."
              className="flex-1 h-7 px-3 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder-slate-300"
            />
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              className="px-3 h-7 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-40 transition-colors"
            >
              Add
            </button>
          </div>

          {/* Annotation list */}
          {annotations.map(a => (
            <div key={a.id} className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500 flex-shrink-0 mt-0.5">
                {a.userName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-700">{a.userName}</span>
                  <span className="text-[10px] text-slate-400">{formatAnnotationTime(a.createdAt)}</span>
                  {a.section !== 'general' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 font-medium">
                      {a.section}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{a.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
