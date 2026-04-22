import test from 'node:test'
import assert from 'node:assert/strict'

import { canUseProtectedAuthFeatures, isHostedDemoAuthMode } from './demoMode.js'

test('treats a vercel.app deployment with Clerk test keys as hosted demo mode', () => {
  assert.equal(
    isHostedDemoAuthMode({
      hostname: 'movie-mood-zeta.vercel.app',
      publishableKey: 'pk_test_123',
    }),
    true,
  )
})

test('allows protected auth features on localhost with Clerk test keys', () => {
  assert.equal(
    canUseProtectedAuthFeatures({
      hostname: 'localhost',
      publishableKey: 'pk_test_123',
    }),
    true,
  )
})

test('allows protected auth features on vercel.app when using Clerk live keys', () => {
  assert.equal(
    canUseProtectedAuthFeatures({
      hostname: 'movie-mood-zeta.vercel.app',
      publishableKey: 'pk_live_123',
    }),
    true,
  )
})
