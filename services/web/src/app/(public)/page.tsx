import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Camera,
  Users,
  Calendar,
  CreditCard,
  Image,
  BarChart3,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'FocusFlow - Photography Business Management Platform',
  description:
    'Streamline your photography business with client management, gallery delivery, booking, and invoicing all in one place.',
}

const features = [
  {
    icon: Image,
    title: 'Gallery Delivery',
    description:
      'Share stunning photo galleries with clients. Password protection, download controls, and expiration settings.',
  },
  {
    icon: Users,
    title: 'Client Management',
    description:
      'Track client relationships, lifecycle stages, and communication history in one central CRM.',
  },
  {
    icon: Calendar,
    title: 'Session Booking',
    description:
      'Online booking with automated reminders, contract signing, and deposit collection.',
  },
  {
    icon: CreditCard,
    title: 'Invoicing & Payments',
    description:
      'Create professional invoices, accept online payments, and track your revenue.',
  },
  {
    icon: Camera,
    title: 'Session Workflow',
    description:
      'Manage your entire session workflow from inquiry to final delivery seamlessly.',
  },
  {
    icon: BarChart3,
    title: 'Business Analytics',
    description:
      'Understand your business with revenue reports, booking trends, and client insights.',
  },
]

const testimonials = [
  {
    quote:
      'FocusFlow transformed how I run my photography business. Client management is a breeze now.',
    author: 'Sarah M.',
    role: 'Wedding Photographer',
  },
  {
    quote:
      'The gallery delivery feature alone is worth it. My clients love the experience.',
    author: 'James K.',
    role: 'Portrait Photographer',
  },
  {
    quote:
      'Finally, one platform that handles everything. No more juggling multiple tools.',
    author: 'Emily R.',
    role: 'Studio Owner',
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
              Run Your Photography Business{' '}
              <span className="text-primary">Effortlessly</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The all-in-one platform for photographers. Manage clients, deliver
              galleries, book sessions, and get paid - all in one beautiful
              workspace.
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
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. Start your 14-day free trial today.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed specifically for professional photographers
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

      {/* Social Proof Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Photographers
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of photographers who trust FocusFlow
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
                Focus on Photography, Not Admin Work
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Stop spending hours on administrative tasks. FocusFlow automates
                the tedious work so you can focus on what you love - creating
                beautiful images.
              </p>
              <ul className="space-y-4">
                {[
                  'Automated booking confirmations and reminders',
                  'One-click gallery publishing',
                  'Integrated contracts and invoicing',
                  'Client portal for self-service',
                  'Mobile-friendly for on-the-go management',
                ].map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 aspect-square flex items-center justify-center">
              <Camera className="h-32 w-32 text-primary/40" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-2xl p-6 sm:p-12 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Streamline Your Business?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join photographers who have simplified their workflow and grown
              their business with FocusFlow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                asChild
              >
                <Link href="/signup">
                  Start Free Trial
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
