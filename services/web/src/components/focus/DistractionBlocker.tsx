'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, ShieldOff, Plus, X, Globe } from 'lucide-react'
import {
  type BlockerSettings,
  DEFAULT_BLOCKER_SETTINGS,
  addBlockedSite,
  removeBlockedSite,
  getBlockedByCategory,
} from '@/lib/distraction-blocker'

interface DistractionBlockerProps {
  isActive: boolean
}

export function DistractionBlocker({ isActive }: DistractionBlockerProps) {
  const [settings, setSettings] = useState<BlockerSettings>(DEFAULT_BLOCKER_SETTINGS)
  const [newDomain, setNewDomain] = useState('')

  const handleAddSite = () => {
    if (!newDomain.trim()) return
    setSettings((prev) => addBlockedSite(prev, newDomain.trim()))
    setNewDomain('')
  }

  const handleRemoveSite = (siteId: string) => {
    setSettings((prev) => removeBlockedSite(prev, siteId))
  }

  const handleToggle = () => {
    setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))
  }

  const byCategory = getBlockedByCategory(settings.blockedSites)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {settings.enabled ? (
              <Shield className="h-5 w-5 text-green-500" />
            ) : (
              <ShieldOff className="h-5 w-5 text-muted-foreground" />
            )}
            Distraction Blocker
          </CardTitle>
          <Button variant={settings.enabled ? 'default' : 'outline'} size="sm" onClick={handleToggle}>
            {settings.enabled ? 'Enabled' : 'Disabled'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isActive && settings.enabled && (
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-sm text-green-700 dark:text-green-300">
            Blocking {settings.blockedSites.length} distracting sites during your focus session.
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Add site (e.g., example.com)"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSite()}
          />
          <Button variant="outline" size="icon" onClick={handleAddSite} data-testid="add-site-btn">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {Object.entries(byCategory).map(([category, sites]) => (
            <div key={category}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {category}
              </p>
              <div className="space-y-1">
                {sites.map((site) => (
                  <div
                    key={site.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      {site.domain}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveSite(site.id)}
                      data-testid={`remove-site-${site.id}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
