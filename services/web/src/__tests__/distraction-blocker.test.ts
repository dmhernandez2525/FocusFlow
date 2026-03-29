import {
  isBlocked,
  addBlockedSite,
  removeBlockedSite,
  getBlockedByCategory,
  getBlockStats,
  DEFAULT_BLOCKER_SETTINGS,
  DEFAULT_BLOCKED_SITES,
  type BlockerSettings,
  type BlockedSite,
} from '@/lib/distraction-blocker'

describe('isBlocked', () => {
  const settings = DEFAULT_BLOCKER_SETTINGS

  it('blocks a listed domain during focus', () => {
    expect(isBlocked('youtube.com', settings, true, false)).toBe(true)
  })

  it('blocks a subdomain of listed domain', () => {
    expect(isBlocked('www.youtube.com', settings, true, false)).toBe(true)
    expect(isBlocked('m.facebook.com', settings, true, false)).toBe(true)
  })

  it('does not block when not focusing or on break', () => {
    expect(isBlocked('youtube.com', settings, false, false)).toBe(false)
  })

  it('does not block when disabled', () => {
    const disabled = { ...settings, enabled: false }
    expect(isBlocked('youtube.com', disabled, true, false)).toBe(false)
  })

  it('does not block during breaks when blockDuringBreaks is false', () => {
    expect(isBlocked('youtube.com', settings, false, true)).toBe(false)
  })

  it('blocks during breaks when blockDuringBreaks is true', () => {
    const breakBlocking = { ...settings, blockDuringBreaks: true }
    expect(isBlocked('youtube.com', breakBlocking, false, true)).toBe(true)
  })

  it('allows break-allowed sites during breaks', () => {
    const breakBlocking = {
      ...settings,
      blockDuringBreaks: true,
      allowedDuringBreaks: ['youtube.com'],
    }
    expect(isBlocked('youtube.com', breakBlocking, false, true)).toBe(false)
  })

  it('does not block unlisted domains', () => {
    expect(isBlocked('google.com', settings, true, false)).toBe(false)
    expect(isBlocked('github.com', settings, true, false)).toBe(false)
  })

  it('does not partially match domains', () => {
    expect(isBlocked('notyoutube.com', settings, true, false)).toBe(false)
  })
})

describe('addBlockedSite', () => {
  const settings = DEFAULT_BLOCKER_SETTINGS

  it('adds a new site', () => {
    const result = addBlockedSite(settings, 'pinterest.com')
    expect(result.blockedSites).toHaveLength(settings.blockedSites.length + 1)
    expect(result.blockedSites.find((s) => s.domain === 'pinterest.com')).toBeTruthy()
  })

  it('strips protocol and path', () => {
    const result = addBlockedSite(settings, 'https://www.pinterest.com/some/path')
    expect(result.blockedSites.find((s) => s.domain === 'pinterest.com')).toBeTruthy()
  })

  it('does not add duplicate sites', () => {
    const result = addBlockedSite(settings, 'youtube.com')
    expect(result.blockedSites).toHaveLength(settings.blockedSites.length)
  })

  it('assigns the given category', () => {
    const result = addBlockedSite(settings, 'pinterest.com', 'social')
    const added = result.blockedSites.find((s) => s.domain === 'pinterest.com')
    expect(added?.category).toBe('social')
  })

  it('defaults to "other" category', () => {
    const result = addBlockedSite(settings, 'random-site.com')
    const added = result.blockedSites.find((s) => s.domain === 'random-site.com')
    expect(added?.category).toBe('other')
  })

  it('generates a valid id from domain', () => {
    const result = addBlockedSite(settings, 'some.site.com')
    const added = result.blockedSites.find((s) => s.domain === 'some.site.com')
    expect(added?.id).toBe('some-site-com')
  })
})

describe('removeBlockedSite', () => {
  const settings = DEFAULT_BLOCKER_SETTINGS

  it('removes a site by id', () => {
    const result = removeBlockedSite(settings, 'yt')
    expect(result.blockedSites.find((s) => s.id === 'yt')).toBeUndefined()
    expect(result.blockedSites).toHaveLength(settings.blockedSites.length - 1)
  })

  it('does nothing for non-existent id', () => {
    const result = removeBlockedSite(settings, 'nonexistent')
    expect(result.blockedSites).toHaveLength(settings.blockedSites.length)
  })
})

describe('getBlockedByCategory', () => {
  it('groups sites by category', () => {
    const sites: BlockedSite[] = [
      { id: '1', domain: 'youtube.com', category: 'video' },
      { id: '2', domain: 'twitter.com', category: 'social' },
      { id: '3', domain: 'netflix.com', category: 'video' },
    ]

    const result = getBlockedByCategory(sites)
    expect(Object.keys(result)).toEqual(['video', 'social'])
    expect(result.video).toHaveLength(2)
    expect(result.social).toHaveLength(1)
  })

  it('returns empty object for empty list', () => {
    expect(getBlockedByCategory([])).toEqual({})
  })
})

describe('getBlockStats', () => {
  it('returns correct stats', () => {
    const stats = getBlockStats(DEFAULT_BLOCKER_SETTINGS)
    expect(stats.totalBlocked).toBe(DEFAULT_BLOCKED_SITES.length)
    expect(stats.categoryCount).toBeGreaterThan(0)
    expect(typeof stats.byCategory).toBe('object')
  })

  it('counts categories correctly', () => {
    const settings: BlockerSettings = {
      ...DEFAULT_BLOCKER_SETTINGS,
      blockedSites: [
        { id: '1', domain: 'a.com', category: 'social' },
        { id: '2', domain: 'b.com', category: 'social' },
        { id: '3', domain: 'c.com', category: 'video' },
      ],
    }
    const stats = getBlockStats(settings)
    expect(stats.totalBlocked).toBe(3)
    expect(stats.categoryCount).toBe(2)
  })
})
