import test from 'node:test'
import assert from 'node:assert/strict'

test('blocks checkout on the hosted public demo before reaching payment', async () => {
  const checkoutAccess = await import('./checkoutAccess.js').catch(() => null)

  assert.notEqual(checkoutAccess, null)
  assert.equal(
    checkoutAccess.getCheckoutBlockReason({
      authFeaturesEnabled: false,
      user: { id: 'user_123' },
      selectedTime: { showId: 'show_123' },
      selectedSeats: ['A1'],
    }),
    'Ticket checkout is disabled on this public demo. Use local development for booking and payments.',
  )
})

test('allows checkout when auth features are enabled and the selection is complete', async () => {
  const checkoutAccess = await import('./checkoutAccess.js').catch(() => null)

  assert.notEqual(checkoutAccess, null)
  assert.equal(
    checkoutAccess.getCheckoutBlockReason({
      authFeaturesEnabled: true,
      user: { id: 'user_123' },
      selectedTime: { showId: 'show_123' },
      selectedSeats: ['A1'],
    }),
    null,
  )
})
