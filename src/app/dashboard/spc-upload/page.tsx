import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SPCUploadClient from './SPCUploadClient'

export const metadata: Metadata = {
  title: 'Upload Karya SPC | UNAS FEST 2025',
  description: 'Upload karya ilmiah untuk Scientific Paper Competition (SPC) semifinal stage'
}

export default async function SPCUploadPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Check if user is registered for SPC
  // This would typically fetch from database
  const isSPCParticipant = true // Placeholder - implement proper check

  if (!isSPCParticipant) {
    redirect('/dashboard')
  }

  return <SPCUploadClient user={session.user} />
}