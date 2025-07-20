import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  test('should combine class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  test('should handle conditional classes', () => {
    expect(cn('base', true && 'conditional')).toBe('base conditional')
    expect(cn('base', false && 'conditional')).toBe('base')
  })

  test('should handle undefined and null values', () => {
    expect(cn('base', undefined, 'other')).toBe('base other')
    expect(cn('base', null, 'other')).toBe('base other')
  })

  test('should merge Tailwind classes correctly', () => {
    // This tests the tailwind-merge functionality
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  test('should handle empty input', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
  })

  test('should handle arrays and objects', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2')
    expect(cn({ 'class1': true, 'class2': false })).toBe('class1')
  })
})