import { DashboardLayout } from '@/components/layouts/dashboard-layout'

interface DashboardLayoutProps {
  readonly children: React.ReactNode
}

export default function Layout({ children }: DashboardLayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>
}