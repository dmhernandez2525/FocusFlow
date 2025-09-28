import Link from 'next/link'

interface AuthLayoutProps {
  readonly children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-primary">
        <div className="mx-auto max-w-md text-center">
          <Link href="/" className="text-4xl font-bold text-primary-foreground">
            FocusFlow
          </Link>
          <p className="mt-6 text-lg text-primary-foreground/80">
            Transform your productivity with intelligent focus management and workflow optimization.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center text-primary-foreground/80">
              <div className="mr-3 h-2 w-2 rounded-full bg-primary-foreground/60" />
              <span>Intelligent task prioritization</span>
            </div>
            <div className="flex items-center text-primary-foreground/80">
              <div className="mr-3 h-2 w-2 rounded-full bg-primary-foreground/60" />
              <span>Focus session tracking</span>
            </div>
            <div className="flex items-center text-primary-foreground/80">
              <div className="mr-3 h-2 w-2 rounded-full bg-primary-foreground/60" />
              <span>Productivity analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-2xl font-bold">
              FocusFlow
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}