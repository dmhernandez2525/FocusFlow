import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your productivity dashboard',
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your productivity dashboard.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Tasks</h3>
          </div>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">+2 from yesterday</p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center space-y-0 pb-2">
            <h3 className="text-sm font-medium">Completed</h3>
          </div>
          <div className="text-2xl font-bold">18</div>
          <p className="text-xs text-muted-foreground">+6 from yesterday</p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center space-y-0 pb-2">
            <h3 className="text-sm font-medium">Focus Time</h3>
          </div>
          <div className="text-2xl font-bold">4.2h</div>
          <p className="text-xs text-muted-foreground">+0.5h from yesterday</p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center space-y-0 pb-2">
            <h3 className="text-sm font-medium">Productivity</h3>
          </div>
          <div className="text-2xl font-bold">85%</div>
          <p className="text-xs text-muted-foreground">+5% from yesterday</p>
        </div>
      </div>
    </div>
  )
}