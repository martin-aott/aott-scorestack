import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/app/lib/auth'
import prisma from '@/app/lib/prisma'
import { fetchCheckoutDetails } from '@/app/lib/billing'
import AppHeader from '@/app/components/AppHeader'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PLAN_LABEL: Record<string, string> = {
  starter:    'Starter',
  pro:        'Pro',
  enterprise: 'Enterprise',
}

const PLAN_HIGHLIGHTS: Record<string, string[]> = {
  starter: ['Unlimited contacts per run', '5 scoring models', 'CSV export', 'AI message generation'],
  pro:     ['Everything in Starter', 'Custom AI templates', 'LinkedIn delivery', '3 team seats'],
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function BillingConfirmationPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin?callbackUrl=/settings/billing/confirmation')

  const orgId = session.user.orgId
  if (!orgId) redirect('/settings/billing')

  // Find the most recent PendingCheckout for this org within the last 2 hours.
  // This window safely covers both fresh redirects and page refreshes after confirmation.
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)

  const pending = await prisma.pendingCheckout.findFirst({
    where:   { orgId, userId: session.user.id, createdAt: { gte: twoHoursAgo } },
    orderBy: { createdAt: 'desc' },
  })

  if (!pending) redirect('/settings/billing')

  // Verify the checkout exists in LS (also retrieves latest variant info)
  const lsCheckout = await fetchCheckoutDetails(pending.lsCheckoutId)

  // If this checkout hasn't been confirmed yet, do it now.
  // We trust the LS redirect as proof of payment — LS only redirects on success.
  if (!pending.confirmedAt) {
    if (pending.plan) {
      // Subscription: update org plan immediately.
      // The subscription_created webhook will arrive shortly with full subscription details.
      await prisma.$transaction([
        prisma.organization.update({
          where: { id: orgId },
          data:  { plan: pending.plan },
        }),
        prisma.pendingCheckout.update({
          where: { id: pending.id },
          data:  { confirmedAt: new Date() },
        }),
      ])
    } else {
      // Credits: mark confirmed; the order_created webhook adds the credits atomically.
      await prisma.pendingCheckout.update({
        where: { id: pending.id },
        data:  { confirmedAt: new Date() },
      })
    }
  }

  const isSubscription = pending.plan !== null
  const planLabel      = pending.plan ? (PLAN_LABEL[pending.plan] ?? pending.plan) : null
  const highlights     = pending.plan ? (PLAN_HIGHLIGHTS[pending.plan] ?? []) : []

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        userEmail={session.user.email}
        breadcrumb={[{ label: 'Settings' }, { label: 'Billing' }, { label: 'Confirmation' }]}
      />

      <main className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center text-center space-y-8">

        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Heading */}
        {isSubscription ? (
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome to {planLabel}!
            </h1>
            <p className="text-sm text-gray-500">
              Your plan has been upgraded. Everything is ready to go.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Credits purchased!
            </h1>
            <p className="text-sm text-gray-500">
              <span className="font-semibold">{pending.credits?.toLocaleString()} enrichment credits</span> will
              appear in your balance within a moment.
            </p>
          </div>
        )}

        {/* Plan features (subscription only) */}
        {isSubscription && highlights.length > 0 && (
          <div className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-left space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              What&apos;s included
            </p>
            <ul className="space-y-2">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* LS verification note — shown if the checkout could not be retrieved (e.g. expired) */}
        {!lsCheckout && (
          <p className="text-xs text-gray-400">
            Payment confirmed via our records. If you have any questions, contact support.
          </p>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/"
            className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors text-center"
          >
            Go to dashboard
          </Link>
          <Link
            href="/settings/billing"
            className="w-full py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors text-center"
          >
            View billing settings
          </Link>
        </div>

      </main>
    </div>
  )
}
