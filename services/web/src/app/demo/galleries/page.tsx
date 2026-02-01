'use client'

import { useState } from 'react'
import { useDemo } from '@/contexts/demo-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import {
  Eye,
  ImageIcon,
  Download,
  Lock,
  Calendar,
  Search,
  Plus,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Trash2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function DemoGalleriesPage() {
  const { galleries } = useDemo()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredGalleries = galleries.filter(gallery => {
    const matchesSearch = gallery.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || gallery.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      expired: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    }
    return styles[status] || styles.draft
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Galleries</h1>
          <p className="text-muted-foreground">
            Manage and share your photo galleries with clients
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Gallery
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search galleries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'published', 'draft', 'expired'].map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGalleries.map(gallery => (
          <Card key={gallery.id} className="overflow-hidden group">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={gallery.coverImage}
                alt={gallery.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-semibold truncate">{gallery.name}</h3>
                <div className="flex items-center gap-3 text-white/80 text-sm mt-1">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="h-3.5 w-3.5" />
                    {gallery.photoCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {gallery.viewCount}
                  </span>
                </div>
              </div>
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(gallery.status)}`}>
                  {gallery.status}
                </span>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(gallery.createdAt)}
                </div>
                <div className="flex items-center gap-2">
                  {gallery.isDownloadable ? (
                    <Download className="h-4 w-4 text-green-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm mb-4">
                <span className="text-muted-foreground">Access Code:</span>
                <code className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                  {gallery.accessCode}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/demo/galleries/${gallery.id}`}>
                    View Gallery
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Client View
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Share Link
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Gallery
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGalleries.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No galleries found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first gallery to start sharing photos with clients'}
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Gallery
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
