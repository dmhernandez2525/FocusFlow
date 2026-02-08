'use client'

import { useDemo } from '@/contexts/demo-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Calendar,
  Users,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  FileText,
} from 'lucide-react'

export default function DemoAssistantPage() {
  const { sessions, clients, getUpcomingSessions } = useDemo()
  const upcomingSessions = getUpcomingSessions()

  // Filter sessions that need follow-up (inquiries and confirmations needed)
  const pendingTasks = sessions.filter(s =>
    s.status === 'inquiry' || (s.status === 'booked' && !s.contractSigned)
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours ?? '0')
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes ?? '00'} ${ampm}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Assistant Dashboard</h1>
        <p className="text-muted-foreground">
          Manage bookings, client communications, and scheduling tasks.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.filter(s => s.status === 'inquiry').length}</div>
            <p className="text-xs text-muted-foreground">Need response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
            <p className="text-xs text-muted-foreground">Sessions scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contracts Pending</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.filter(s => !s.contractSigned && s.status !== 'inquiry').length}</div>
            <p className="text-xs text-muted-foreground">Awaiting signature</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.filter(c => c.lifecycleStage !== 'prospect').length}</div>
            <p className="text-xs text-muted-foreground">With active bookings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Tasks</CardTitle>
            <CardDescription>Action items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTasks.length === 0 ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-700 dark:text-green-300">All caught up! No pending tasks.</span>
              </div>
            ) : (
              pendingTasks.map(task => (
                <div key={task.id} className="flex items-start gap-4 p-3 border rounded-lg">
                  <div className={`mt-0.5 ${task.status === 'inquiry' ? 'text-amber-500' : 'text-blue-500'}`}>
                    {task.status === 'inquiry' ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{task.clientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.status === 'inquiry'
                        ? `New inquiry for ${task.sessionType}`
                        : `Contract pending for ${task.sessionType}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(task.date)} at {formatTime(task.time)}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    {task.status === 'inquiry' ? 'Respond' : 'Send Contract'}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Sessions scheduled for the coming days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming sessions scheduled
              </p>
            ) : (
              upcomingSessions.slice(0, 5).map(session => (
                <div key={session.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10">
                    <span className="text-xs font-medium text-primary">
                      {new Date(session.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {new Date(session.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{session.clientName}</p>
                    <p className="text-sm text-muted-foreground">{session.sessionType}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(session.time)} - {session.location}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      session.status === 'confirmed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              ))
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/demo/sessions">View All Sessions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Client Communications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Client Communications</CardTitle>
          <CardDescription>Quick access to client contact information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {clients.slice(0, 6).map(client => (
              <div key={client.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {client.avatarUrl ? (
                    <img src={client.avatarUrl} alt={client.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <Users className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{client.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
