import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: { runId: string } }
) {
  const run = await prisma.run.findUnique({
    where: { id: params.runId },
    select: {
      status: true,
      enrichedCount: true,
      failedCount: true,
      totalContacts: true,
      completedAt: true,
    },
  })

  if (!run) return NextResponse.json({ error: 'Run not found' }, { status: 404 })

  return NextResponse.json(run)
}
