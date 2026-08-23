import assert from 'node:assert/strict'
import test from 'node:test'

import { isValidNepalPhone, normalizeNepalPhone } from '../src/utils/phone.js'

test('normalizes supported Nepal numbers with +977', () => {
  assert.equal(normalizeNepalPhone('9801234567'), '+9779801234567')
  assert.equal(normalizeNepalPhone('9701234567'), '+9779701234567')
  assert.equal(normalizeNepalPhone('01-1234-5678'), '+9770112345678')
})

test('rejects wrong prefixes and lengths', () => {
  assert.equal(isValidNepalPhone('9601234567'), false)
  assert.equal(isValidNepalPhone('980123456'), false)
  assert.equal(isValidNepalPhone('98012345678'), false)
})
