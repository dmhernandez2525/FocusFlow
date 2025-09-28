import { AuthLayout } from '@/components/layouts/auth-layout'

interface AuthLayoutProps {
  readonly children: React.ReactNode
}

export default function Layout({ children }: AuthLayoutProps) {
  return <AuthLayout>{children}</AuthLayout>
}