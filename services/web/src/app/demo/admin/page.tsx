'use client'

import { useDemo } from '@/contexts/demo-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DollarSign,
  Users,
  TrendingUp,
  Camera,
  BarChart3,
  Shield,
  Building2,
  ArrowUpRight,
} from 'lucide-react'
import { demoTeamMembers } from '@/lib/demo-data'

export default function DemoAdminPage() {
  const { metrics, chartData, clients } = useDemo()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate team stats
  const totalTeamRevenue = demoTeamMembers.reduce((sum, m) => sum + m.revenueThisMonth, 0)
  const totalTeamSessions = demoTeamMembers.reduce((sum, m) => sum + m.sessionsThisMonth, 0)
  const photographers = demoTeamMembers.filter(m => m.role === 'photographer')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Studio Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your team, view reports, and configure studio settings.
        </p>
      </div>

      {/* Key Business Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
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
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoTeamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              {photographers.length} photographers, {demoTeamMembers.length - photographers.length} support
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions This Month</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeamSessions}</div>
            <p className="text-xs text-muted-foreground">
              Across all photographers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Base</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+{metrics.newClientsThisMonth}</span>
              <span className="ml-1">new this month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Revenue and sessions by team member</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {demoTeamMembers.map(member => (
              <div key={member.id} className="flex items-center gap-4">
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{member.name}</p>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      member.role === 'photographer'
                        ? 'bg-primary/10 text-primary'
                        : member.role === 'admin'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(member.revenueThisMonth)}</p>
                  <p className="text-xs text-muted-foreground">{member.sessionsThisMonth} sessions</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Photographer</CardTitle>
            <CardDescription>Monthly revenue contribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {photographers.map(member => {
                const percentage = totalTeamRevenue > 0
                  ? Math.round((member.revenueThisMonth / totalTeamRevenue) * 100)
                  : 0
                return (
                  <div key={member.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{member.name}</span>
                      <span className="font-medium">{formatCurrency(member.revenueThisMonth)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">{percentage}% of total</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Studio Management</CardTitle>
          <CardDescription>Administrative settings and configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-medium">Team Management</div>
                <div className="text-xs text-muted-foreground">Add or manage team members</div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div className="text-left">
                <div className="font-medium">Financial Reports</div>
                <div className="text-xs text-muted-foreground">View detailed analytics</div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <div className="text-left">
                <div className="font-medium">Permissions</div>
                <div className="text-xs text-muted-foreground">Configure role access</div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <Building2 className="h-5 w-5 text-amber-500" />
              <div className="text-left">
                <div className="font-medium">Studio Settings</div>
                <div className="text-xs text-muted-foreground">Business preferences</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Monthly revenue over the past 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-end gap-2">
            {chartData.map((item, index) => {
              const maxRevenue = Math.max(...chartData.map(d => d.revenue))
              const heightPercent = (item.revenue / maxRevenue) * 100
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-medium">{formatCurrency(item.revenue)}</div>
                  <div className="w-full bg-muted rounded-t relative" style={{ height: `${heightPercent}%`, minHeight: '20px' }}>
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
    </div>
  )
}
