import { useState, useCallback } from 'react'

const STORAGE_KEY = 'homelab-favorites'

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return new Set(parsed as string[])
  } catch {
    // ignore
  }
  return new Set()
}

function saveFavorites(favs: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favs)))
  } catch {
    // ignore
  }
}

/**
 * Manages user-toggled favorites in localStorage.
 * The config can set `favorite: true` as a default, but users can override.
 */
export function useFavorites(configFavoriteIds: string[]) {
  const [userFavorites, setUserFavorites] = useState<Set<string>>(loadFavorites)

  const isFavorite = useCallback(
    (id: string) => {
      // If the user has explicitly set a favorite, use that
      if (userFavorites.has(id)) return true
      // Otherwise fall back to the config default
      return configFavoriteIds.includes(id)
    },
    [userFavorites, configFavoriteIds]
  )

  const toggleFavorite = useCallback(
    (id: string) => {
      setUserFavorites((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
          // Was explicitly favorited → unfavorite (even config defaults)
          next.delete(id)
          // Mark as explicitly un-favorited using a negation key
          next.add(`!${id}`)
        } else if (next.has(`!${id}`)) {
          // Was explicitly un-favorited → re-enable
          next.delete(`!${id}`)
        } else {
          next.add(id)
        }
        saveFavorites(next)
        return next
      })
    },
    []
  )

  const isExplicitlyUnfavorited = useCallback(
    (id: string) => userFavorites.has(`!${id}`),
    [userFavorites]
  )

  const isFavoriteResolved = useCallback(
    (id: string) => {
      if (isExplicitlyUnfavorited(id)) return false
      return isFavorite(id)
    },
    [isFavorite, isExplicitlyUnfavorited]
  )

  return { isFavorite: isFavoriteResolved, toggleFavorite }
}
