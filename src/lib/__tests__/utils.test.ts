import { describe, it, expect } from 'vitest'
import { cn, slugify, formatDuration, estimateReadingTime, wordCount } from '../utils'

describe('cn()', () => {
  it('TC-U-001: merges class names correctly', () => {
    expect(cn('text-sm', 'font-bold')).toBe('text-sm font-bold')
  })

  it('TC-U-002: handles conditional classes', () => {
    expect(cn('base', true && 'active', false && 'hidden')).toBe('base active')
  })

  it('TC-U-003: resolves Tailwind conflicts via tailwind-merge', () => {
    const result = cn('px-4 py-2', 'px-6')
    expect(result).toContain('py-2')
    expect(result).toContain('px-6')
    expect(result).not.toContain('px-4')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
  })

  it('handles undefined and null values', () => {
    expect(cn('base', undefined, null, 'extra')).toBe('base extra')
  })
})

describe('slugify()', () => {
  it('TC-U-004: converts "Hello World" to "hello-world"', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('TC-U-005: handles special characters', () => {
    expect(slugify('What is Claude? (An Overview)')).toBe('what-is-claude-an-overview')
  })

  it('TC-U-006: handles empty string', () => {
    expect(slugify('')).toBe('')
  })

  it('handles multiple spaces and underscores', () => {
    expect(slugify('Hello   World__Test')).toBe('hello-world-test')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  --Hello World--  ')).toBe('hello-world')
  })

  it('handles all-special-character strings', () => {
    expect(slugify('!@#$%^&*()')).toBe('')
  })
})

describe('formatDuration()', () => {
  it('TC-U-007: formats 5 minutes as "5 min"', () => {
    expect(formatDuration(5)).toBe('5 min')
  })

  it('TC-U-008: formats 90 minutes as "1h 30m"', () => {
    expect(formatDuration(90)).toBe('1h 30m')
  })

  it('TC-U-009: formats 0 minutes as "0 min"', () => {
    expect(formatDuration(0)).toBe('0 min')
  })

  it('TC-U-010: formats exact hours (120 minutes) as "2h"', () => {
    expect(formatDuration(120)).toBe('2h')
  })

  it('formats 59 minutes as "59 min"', () => {
    expect(formatDuration(59)).toBe('59 min')
  })

  it('formats 60 minutes as "1h"', () => {
    expect(formatDuration(60)).toBe('1h')
  })

  it('formats 61 minutes as "1h 1m"', () => {
    expect(formatDuration(61)).toBe('1h 1m')
  })
})

describe('estimateReadingTime()', () => {
  it('returns 1 min for very short content', () => {
    expect(estimateReadingTime('Hello world')).toBe(1)
  })

  it('returns correct estimate for 200-word text (1 min)', () => {
    const words = Array(200).fill('word').join(' ')
    expect(estimateReadingTime(words)).toBe(1)
  })

  it('returns correct estimate for 400-word text (2 min)', () => {
    const words = Array(400).fill('word').join(' ')
    expect(estimateReadingTime(words)).toBe(2)
  })

  it('returns correct estimate for 1000-word text (5 min)', () => {
    const words = Array(1000).fill('word').join(' ')
    expect(estimateReadingTime(words)).toBe(5)
  })

  it('returns 1 for empty content', () => {
    expect(estimateReadingTime('')).toBe(1)
  })
})

describe('wordCount()', () => {
  it('counts words in a simple sentence', () => {
    expect(wordCount('Hello world foo bar')).toBe(4)
  })

  it('handles multiple whitespace', () => {
    expect(wordCount('Hello   world  foo')).toBe(3)
  })

  it('returns 0 for empty string', () => {
    expect(wordCount('')).toBe(0)
  })

  it('handles leading/trailing whitespace', () => {
    expect(wordCount('  Hello world  ')).toBe(2)
  })
})
