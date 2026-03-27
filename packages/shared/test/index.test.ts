import { describe, expect, it } from 'vitest'
import { clamp, noop, notNullish, toArray } from '../src/index'

describe('toArray', () => {
  it('should wrap a single value in an array', () => {
    expect(toArray(1)).toEqual([1])
    expect(toArray('hello')).toEqual(['hello'])
  })

  it('should return the same array if already an array', () => {
    const arr = [1, 2, 3]
    expect(toArray(arr)).toBe(arr)
  })
})

describe('noop', () => {
  it('should return undefined', () => {
    expect(noop()).toBeUndefined()
  })
})

describe('notNullish', () => {
  it('should return true for non-nullish values', () => {
    expect(notNullish(0)).toBe(true)
    expect(notNullish('')).toBe(true)
    expect(notNullish(false)).toBe(true)
  })

  it('should return false for null and undefined', () => {
    expect(notNullish(null)).toBe(false)
    expect(notNullish(undefined)).toBe(false)
  })
})

describe('clamp', () => {
  it('should clamp values within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
  })
})
