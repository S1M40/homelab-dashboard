export interface Service {
  id: string; name: string; description: string
  url: string; icon: string; category: string
  color?: string; favorite?: boolean
}
export interface Settings { title: string; subtitle: string }
export interface Config { settings: Settings; services: Service[] }
export type Theme = 'dark' | 'light' | 'system'
export type ConfigError = { type: 'fetch' | 'parse' | 'validation'; message: string }
