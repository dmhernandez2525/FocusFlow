'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckSquare,
  Timer,
  BarChart3,
  Target,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your productivity dashboard.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">75%</span>
              <span className="ml-1">completion rate</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2h</div>
            <p className="text-xs text-muted-foreground">+0.5h from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">+5% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Start a Focus Session</CardTitle>
            <CardDescription>
              Use the Pomodoro technique to stay focused and productive.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/focus">
                <Timer className="h-4 w-4 mr-2" />
                Start Timer
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Tasks</CardTitle>
            <CardDescription>
              View, create, and organize your tasks by priority.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/tasks">
                <CheckSquare className="h-4 w-4 mr-2" />
                View Tasks
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
          <CardDescription>Your focus and task completion over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-end gap-2">
            {[
              { day: 'Mon', hours: 3.5 },
              { day: 'Tue', hours: 4.2 },
              { day: 'Wed', hours: 2.8 },
              { day: 'Thu', hours: 5.1 },
              { day: 'Fri', hours: 4.7 },
              { day: 'Sat', hours: 1.2 },
              { day: 'Sun', hours: 0.5 },
            ].map((item, index) => {
              const maxHours = 5.1
              const heightPercent = (item.hours / maxHours) * 100
              const isToday = index === (new Date().getDay() + 6) % 7
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-muted-foreground">{item.hours}h</span>
                  <div
                    className="w-full rounded-t relative"
                    style={{ height: `${heightPercent}%`, minHeight: '8px' }}
                  >
                    <div
                      className={`absolute inset-0 rounded-t ${
                        isToday ? 'bg-primary' : 'bg-primary/40'
                      }`}
                    />
                  </div>
                  <span className={`text-xs ${isToday ? 'font-bold' : 'text-muted-foreground'}`}>
                    {item.day}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
