import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about FocusFlow and our mission',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-8">About FocusFlow</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-muted-foreground mb-6">
            FocusFlow is a comprehensive productivity platform designed to help individuals
            and teams achieve their goals through better focus management and workflow optimization.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p>
              We believe that everyone deserves the tools and insights needed to work at their best.
              Our mission is to eliminate distractions, enhance focus, and provide actionable
              insights that lead to meaningful productivity improvements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
            <ul className="space-y-2">
              <li>• Intelligent task management and prioritization</li>
              <li>• Focus session tracking and analytics</li>
              <li>• Distraction blocking and website filtering</li>
              <li>• Team collaboration and productivity insights</li>
              <li>• Customizable workflows and automation</li>
              <li>• Detailed productivity reports and trends</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Get Started Today</h2>
            <p>
              Ready to transform your productivity? Join thousands of users who have already
              discovered the power of focused work with FocusFlow.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}