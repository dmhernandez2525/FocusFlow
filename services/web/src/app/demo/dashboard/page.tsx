'use client'

import { useDemo } from '@/contexts/demo-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  DollarSign,
  Calendar,
  Users,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ImageIcon,
} from 'lucide-react'

export default function DemoDashboardPage() {
  const { metrics, chartData, getUpcomingSessions, getRecentSessions, galleries } = useDemo()
  const upcomingSessions = getUpcomingSessions()
  const recentSessions = getRecentSessions()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your photography business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+{metrics.revenueChange}%</span>
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.upcomingThisWeek} upcoming this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              +{metrics.newClientsThisMonth} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gallery Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.galleryViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+{metrics.galleryViewsChange}%</span>
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart and Upcoming Sessions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Overview */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end gap-2">
              {chartData.map((item, index) => {
                const maxRevenue = Math.max(...chartData.map(d => d.revenue))
                const heightPercent = (item.revenue / maxRevenue) * 100
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-muted rounded-t relative" style={{ height: `${heightPercent}%` }}>
                      <div
                        className={`absolute inset-0 rounded-t ${
                          index === chartData.length - 1 ? 'bg-primary' : 'bg-primary/60'
                        }`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{item.month}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Your next scheduled photo sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming sessions scheduled
              </p>
            ) : (
              upcomingSessions.slice(0, 4).map(session => (
                <div key={session.id} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.clientName}</p>
                    <p className="text-xs text-muted-foreground">{session.sessionType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatDate(session.date)}</p>
                    <p className="text-xs text-muted-foreground">{session.time}</p>
                  </div>
                </div>
              ))
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/demo/sessions">View All Sessions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Galleries and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Galleries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Galleries</CardTitle>
            <CardDescription>Your latest photo galleries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {galleries.slice(0, 4).map(gallery => (
              <div key={gallery.id} className="flex items-center gap-4">
                <div className="h-12 w-16 rounded-md bg-muted overflow-hidden flex-shrink-0">
                  <img
                    src={gallery.coverImage}
                    alt={gallery.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{gallery.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {gallery.photoCount} photos
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {gallery.viewCount} views
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    gallery.status === 'published'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : gallery.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {gallery.status}
                </span>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/demo/galleries">View All Galleries</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Recently completed photo sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentSessions.map(session => (
              <div key={session.id} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.clientName}</p>
                  <p className="text-xs text-muted-foreground">{session.sessionType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCurrency(session.totalAmount)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(session.date)}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/demo/sessions">View All Sessions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
          <CardDescription>Outstanding payments and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Pending Invoices</p>
              <p className="text-2xl font-bold">{metrics.pendingInvoices}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Outstanding Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(metrics.overdueAmount)}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">This Month&apos;s Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalRevenue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
