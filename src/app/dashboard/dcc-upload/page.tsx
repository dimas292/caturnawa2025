import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DCCUploadClient from './DCCUploadClient'

export default async function DCCUploadPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'participant') {
    redirect('/dashboard')
  }

  return <DCCUploadClient user={session.user} />
}