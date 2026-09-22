import { useState, useEffect } from 'react'
import type { Config, ConfigError } from '../types'

const DEFAULT_CONFIG: Config = {
  settings: {
    title: 'Homelab',
    subtitle: 'Infrastructure Dashboard',
  },
  services: [],
}

function validateConfig(raw: unknown): Config {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Config must be a JSON object')
  }

  const obj = raw as Record<string, unknown>

  const settings =
    typeof obj.settings === 'object' && obj.settings !== null
      ? (obj.settings as Record<string, unknown>)
      : {}

  const title = typeof settings.title === 'string' ? settings.title : 'Homelab'
  const subtitle =
    typeof settings.subtitle === 'string'
      ? settings.subtitle
      : 'Infrastructure Dashboard'

  const rawServices = Array.isArray(obj.services) ? obj.services : []

  const services = rawServices
    .filter((s): s is Record<string, unknown> => typeof s === 'object' && s !== null)
    .map((s, i) => ({
      id: typeof s.id === 'string' ? s.id : `service-${i}`,
      name: typeof s.name === 'string' && s.name ? s.name : 'Unknown Service',
      description: typeof s.description === 'string' ? s.description : '',
      url: typeof s.url === 'string' ? s.url : '#',
      icon: typeof s.icon === 'string' ? s.icon : '',
      category: typeof s.category === 'string' && s.category ? s.category : 'Other',
      color: typeof s.color === 'string' ? s.color : undefined,
      favorite: s.favorite === true,
    }))

  return { settings: { title, subtitle }, services }
}

export function useConfig() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ConfigError | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchConfig() {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch('/config/services.json', {
          // Bust cache so edits are picked up on refresh
          cache: 'no-cache',
        })

        if (!res.ok) {
          throw Object.assign(new Error(`HTTP ${res.status}: ${res.statusText}`), {
            type: 'fetch' as const,
          })
        }

        let raw: unknown
        try {
          raw = await res.json()
        } catch {
          throw Object.assign(new Error('Config file contains invalid JSON'), {
            type: 'parse' as const,
          })
        }

        const validated = validateConfig(raw)
        if (!cancelled) {
          setConfig(validated)
          setError(null)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const e = err as Error & { type?: 'fetch' | 'parse' | 'validation' }
          setError({
            type: e.type ?? 'fetch',
            message: e.message ?? 'Unknown error loading configuration',
          })
          // Keep default (empty) config so UI still renders
          setConfig(DEFAULT_CONFIG)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchConfig()
    return () => {
      cancelled = true
    }
  }, [])

  return { config, loading, error }
}
