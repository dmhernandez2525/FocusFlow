import { PublicLayout } from '@/components/layouts/public-layout'

interface PublicLayoutProps {
  readonly children: React.ReactNode
}

export default function Layout({ children }: PublicLayoutProps) {
  return <PublicLayout>{children}</PublicLayout>
}