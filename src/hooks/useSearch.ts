import { useMemo } from 'react'
import type { Service } from '../types'

export function useSearch(services: Service[], query: string) {
  return useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return services

    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    )
  }, [services, query])
}

export function groupByCategory(services: Service[]): Map<string, Service[]> {
  const map = new Map<string, Service[]>()
  for (const service of services) {
    const cat = service.category || 'Other'
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat)!.push(service)
  }
  return map
}
