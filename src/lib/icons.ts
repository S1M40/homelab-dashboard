/**
 * Icon resolution for services.
 *
 * Uses the Simple Icons CDN at runtime to fetch SVG icons by slug.
 * This keeps the bundle small and gives access to all 3000+ icons.
 *
 * For fully offline use, switch to the npm package approach (see README).
 *
 * Simple Icons CDN: https://cdn.simpleicons.org/{slug}/{color}
 *
 * Icon slugs: lowercase, no spaces, no special chars.
 * Find slugs at: https://simpleicons.org/
 */

// Map from our config icon identifiers → Simple Icons slugs
// In most cases the slug matches the identifier, but some need mapping.
export const ICON_SLUG_MAP: Record<string, string> = {
  // Infrastructure
  proxmox: 'proxmox',
  opnsense: 'opnsense',
  truenas: 'truenas',
  portainer: 'portainer',

  // Monitoring
  grafana: 'grafana',
  prometheus: 'prometheus',
  zabbix: 'zabbix',
  uptimekuma: 'uptimekuma',

  // Media
  jellyfin: 'jellyfin',
  sonarr: 'sonarr',
  radarr: 'radarr',
  lidarr: 'lidarr',
  prowlarr: 'prowlarr',
  bazarr: 'bazarr',
  navidrome: 'navidrome',
  plex: 'plex',
  emby: 'emby',

  // Network/DNS
  pihole: 'pihole',
  adguard: 'adguardhome',
  adguardhome: 'adguardhome',
  nginx: 'nginx',
  traefik: 'traefikproxy',
  caddy: 'caddy',
  cloudflare: 'cloudflare',
  wireguard: 'wireguard',
  openvpn: 'openvpn',

  // Development
  github: 'github',
  gitlab: 'gitlab',
  n8n: 'n8n',
  docker: 'docker',
  kubernetes: 'kubernetes',
  helm: 'helm',
  ansible: 'ansible',
  terraform: 'terraform',
  jenkins: 'jenkins',
  gitea: 'gitea',
  drone: 'drone',
  vault: 'vault',

  // Databases
  postgresql: 'postgresql',
  mysql: 'mysql',
  mariadb: 'mariadb',
  redis: 'redis',
  mongodb: 'mongodb',
  influxdb: 'influxdb',

  // Productivity / Self-hosted
  nextcloud: 'nextcloud',
  vaultwarden: 'bitwarden',
  bitwarden: 'bitwarden',
  paperless: 'paperlessngx',
  paperlessngx: 'paperlessngx',
  homeassistant: 'homeassistant',
  freshrss: 'freshrss',
  immich: 'immich',

  // OS
  linux: 'linux',
  ubuntu: 'ubuntu',
  debian: 'debian',
  archlinux: 'archlinux',
}

// In-memory cache: slug → SVG string
const svgCache = new Map<string, string>()

/**
 * Fetch SVG from Simple Icons CDN.
 * Returns null if the icon can't be fetched.
 */
export async function getIconSvg(iconKey: string): Promise<string | null> {
  const slug = ICON_SLUG_MAP[iconKey.toLowerCase()] ?? iconKey.toLowerCase()

  if (svgCache.has(slug)) {
    return svgCache.get(slug)!
  }

  try {
    // Try Simple Icons CDN
    const res = await fetch(`https://cdn.simpleicons.org/${slug}`, {
      cache: 'force-cache', // Cache aggressively — icons never change
    })

    if (!res.ok) {
      svgCache.set(slug, '') // Cache miss to avoid repeated failed fetches
      return null
    }

    const svg = await res.text()
    svgCache.set(slug, svg)
    return svg
  } catch {
    svgCache.set(slug, '')
    return null
  }
}

/**
 * Generate a clean fallback SVG icon with the first letter of the service name.
 */
export function getFallbackSvg(name: string, color?: string): string {
  const letter = name.charAt(0).toUpperCase()
  const bg = color ?? '#334155'
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <rect width="24" height="24" rx="5" fill="${bg}" opacity="0.25"/>
    <text x="12" y="17" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="700" fill="${bg}" text-anchor="middle">${letter}</text>
  </svg>`
}
