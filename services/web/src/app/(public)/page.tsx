import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Timer,
  CheckSquare,
  Shield,
  BarChart3,
  Target,
  Brain,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'FocusFlow - Stay Focused, Get More Done',
  description:
    'A productivity app with focus timer, task management, and distraction blocking to help you stay in the zone.',
}

const features = [
  {
    icon: Timer,
    title: 'Focus Timer',
    description:
      'Pomodoro-style timer with customizable work and break intervals. Stay on track with visual progress.',
  },
  {
    icon: CheckSquare,
    title: 'Task Management',
    description:
      'Create, organize, and prioritize tasks. Filter by status, priority, and project.',
  },
  {
    icon: Shield,
    title: 'Distraction Blocking',
    description:
      'Block distracting websites during focus sessions. Customize your blocklist by category.',
  },
  {
    icon: BarChart3,
    title: 'Productivity Analytics',
    description:
      'Track your focus time, task completion rates, and productivity trends over time.',
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    description:
      'Set daily and weekly focus goals. Track your streaks and build consistent habits.',
  },
  {
    icon: Brain,
    title: 'Smart Breaks',
    description:
      'Automatic break reminders with the right balance of work and rest for peak performance.',
  },
]

const testimonials = [
  {
    quote:
      'FocusFlow helped me double my daily output. The Pomodoro timer keeps me honest.',
    author: 'Alex R.',
    role: 'Software Engineer',
  },
  {
    quote:
      'The distraction blocker is a game-changer. No more falling into social media rabbit holes.',
    author: 'Priya S.',
    role: 'Content Creator',
  },
  {
    quote:
      'Simple, effective, and exactly what I needed to stay focused during study sessions.',
    author: 'Jordan T.',
    role: 'Graduate Student',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Stay Focused,{' '}
              <span className="text-primary">Get More Done</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A productivity toolkit that combines a focus timer, task management,
              and distraction blocking to help you achieve deep work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Focus
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple tools that work together to maximize your productivity
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-lg p-4 sm:p-6 border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Productive People
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands who have improved their focus with FocusFlow
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-card rounded-lg p-4 sm:p-6 border"
              >
                <p className="text-lg mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Work Smarter, Not Harder
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Stop letting distractions eat your time. FocusFlow gives you the structure
                to do your best work every day.
              </p>
              <ul className="space-y-4">
                {[
                  'Pomodoro timer with customizable intervals',
                  'Automatic distraction blocking during focus',
                  'Task prioritization and progress tracking',
                  'Daily and weekly productivity analytics',
                  'Works on desktop and mobile',
                ].map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 aspect-square flex items-center justify-center">
              <Timer className="h-32 w-32 text-primary/40" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-2xl p-6 sm:p-12 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Focused?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join people who have taken control of their time and boosted
              their productivity with FocusFlow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
