import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/app/lib/auth'
import prisma from '@/app/lib/prisma'
import { createCheckout } from '@/app/lib/billing'

const Schema = z.object({
  plan: z.enum(['starter', 'pro']),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const orgId = session.user.orgId
  if (!orgId) return NextResponse.json({ error: 'account_setup_incomplete' }, { status: 503 })

  const parsed = Schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'invalid_input' }, { status: 400 })

  const { plan } = parsed.data

  try {
    const checkout = await createCheckout(orgId, plan)

    await prisma.pendingCheckout.create({
      data: {
        orgId,
        userId:       session.user.id,
        lsCheckoutId: checkout.checkoutId,
        variantId:    checkout.variantId,
        plan:         plan as 'starter' | 'pro',
      },
    })

    return NextResponse.json({ checkout_url: checkout.url })
  } catch (err) {
    console.error('[billing/checkout]', err)
    return NextResponse.json({ error: 'checkout_failed' }, { status: 502 })
  }
}
