import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/admin/LoginForm'
import { isAuthenticated, usingDefaultPassword } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage() {
  // Already signed in: skip the form rather than asking twice.
  if (await isAuthenticated()) redirect('/admin')

  return (
    <main className="login">
      <LoginForm defaultPassword={usingDefaultPassword()} />
    </main>
  )
}
