import test from 'node:test'
import assert from 'node:assert/strict'

import { getAuthHeaders } from './authHeaders.js'

test('returns null until Clerk auth has loaded', async () => {
  let calls = 0

  const headers = await getAuthHeaders({
    isAuthLoaded: false,
    getToken: async () => {
      calls += 1
      return 'token'
    },
  })

  assert.equal(headers, null)
  assert.equal(calls, 0)
})

test('retries once with a fresh token when the cached token is missing', async () => {
  const calls = []

  const headers = await getAuthHeaders({
    isAuthLoaded: true,
    getToken: async (options) => {
      calls.push(options ?? null)
      return calls.length === 1 ? null : 'fresh-token'
    },
  })

  assert.deepEqual(headers, { Authorization: 'Bearer fresh-token' })
  assert.deepEqual(calls, [null, { skipCache: true }])
})

test('returns null when Clerk cannot provide a token', async () => {
  const calls = []

  const headers = await getAuthHeaders({
    isAuthLoaded: true,
    getToken: async (options) => {
      calls.push(options ?? null)
      return null
    },
  })

  assert.equal(headers, null)
  assert.deepEqual(calls, [null, { skipCache: true }])
})
