export interface BlockedSite {
  id: string
  domain: string
  category: string
}

export interface BlockerSettings {
  enabled: boolean
  blockedSites: BlockedSite[]
  blockDuringFocus: boolean
  blockDuringBreaks: boolean
  allowedDuringBreaks: string[]
  strictMode: boolean
}

export const DEFAULT_BLOCKED_SITES: BlockedSite[] = [
  { id: 'yt', domain: 'youtube.com', category: 'video' },
  { id: 'tw', domain: 'twitter.com', category: 'social' },
  { id: 'x', domain: 'x.com', category: 'social' },
  { id: 'fb', domain: 'facebook.com', category: 'social' },
  { id: 'ig', domain: 'instagram.com', category: 'social' },
  { id: 'rd', domain: 'reddit.com', category: 'social' },
  { id: 'tk', domain: 'tiktok.com', category: 'social' },
  { id: 'nf', domain: 'netflix.com', category: 'video' },
  { id: 'hn', domain: 'news.ycombinator.com', category: 'news' },
  { id: 'tv', domain: 'twitch.tv', category: 'video' },
]

export const SITE_CATEGORIES = ['social', 'video', 'news', 'gaming', 'shopping', 'other'] as const
export type SiteCategory = (typeof SITE_CATEGORIES)[number]

export const DEFAULT_BLOCKER_SETTINGS: BlockerSettings = {
  enabled: true,
  blockedSites: DEFAULT_BLOCKED_SITES,
  blockDuringFocus: true,
  blockDuringBreaks: false,
  allowedDuringBreaks: [],
  strictMode: false,
}

export function isBlocked(
  domain: string,
  settings: BlockerSettings,
  isFocusing: boolean,
  isOnBreak: boolean
): boolean {
  if (!settings.enabled) return false
  if (!isFocusing && !isOnBreak) return false
  if (isOnBreak && !settings.blockDuringBreaks) return false
  if (isOnBreak && settings.allowedDuringBreaks.includes(domain)) return false

  return settings.blockedSites.some(
    (site) => domain === site.domain || domain.endsWith(`.${site.domain}`)
  )
}

export function addBlockedSite(
  settings: BlockerSettings,
  domain: string,
  category: SiteCategory = 'other'
): BlockerSettings {
  const normalized = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '')
  if (settings.blockedSites.some((s) => s.domain === normalized)) {
    return settings
  }
  const id = normalized.replace(/\./g, '-')
  return {
    ...settings,
    blockedSites: [...settings.blockedSites, { id, domain: normalized, category }],
  }
}

export function removeBlockedSite(
  settings: BlockerSettings,
  siteId: string
): BlockerSettings {
  return {
    ...settings,
    blockedSites: settings.blockedSites.filter((s) => s.id !== siteId),
  }
}

export function getBlockedByCategory(sites: BlockedSite[]): Record<string, BlockedSite[]> {
  return sites.reduce(
    (acc, site) => {
      const cat = site.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(site)
      return acc
    },
    {} as Record<string, BlockedSite[]>
  )
}

export function getBlockStats(settings: BlockerSettings) {
  const totalBlocked = settings.blockedSites.length
  const byCategory = getBlockedByCategory(settings.blockedSites)
  const categoryCount = Object.keys(byCategory).length

  return { totalBlocked, categoryCount, byCategory }
}
