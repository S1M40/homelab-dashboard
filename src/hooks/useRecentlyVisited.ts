import { useState, useCallback } from 'react'
import type { Service } from '../types'

const STORAGE_KEY = 'homelab-recent'
const MAX_RECENT = 5

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as string[]
  } catch {
    // ignore
  }
  return []
}

function saveRecent(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // ignore
  }
}

export function useRecentlyVisited(services: Service[]) {
  const [recentIds, setRecentIds] = useState<string[]>(loadRecent)

  const trackVisit = useCallback((id: string) => {
    setRecentIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX_RECENT)
      saveRecent(next)
      return next
    })
  }, [])

  const recentServices = recentIds
    .map((id) => services.find((s) => s.id === id))
    .filter((s): s is Service => s !== undefined)

  return { recentServices, trackVisit }
}
