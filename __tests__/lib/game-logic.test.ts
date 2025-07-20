import { calculateBullsAndCows, isValidNumber, generateLobbyCode } from '@/lib/game-logic'

describe('calculateBullsAndCows', () => {
  test('should calculate correct bulls and cows for exact match', () => {
    const result = calculateBullsAndCows('1234', '1234')
    expect(result).toEqual({ bulls: 4, cows: 0 })
  })

  test('should calculate correct bulls and cows for no match', () => {
    const result = calculateBullsAndCows('1234', '5678')
    expect(result).toEqual({ bulls: 0, cows: 0 })
  })

  test('should calculate correct bulls and cows for partial match', () => {
    const result = calculateBullsAndCows('1234', '1324')
    expect(result).toEqual({ bulls: 2, cows: 2 })
  })

  test('should calculate correct bulls only', () => {
    const result = calculateBullsAndCows('1234', '1567')
    expect(result).toEqual({ bulls: 1, cows: 0 })
  })

  test('should calculate correct cows only', () => {
    const result = calculateBullsAndCows('1234', '4321')
    expect(result).toEqual({ bulls: 0, cows: 4 })
  })

  test('should handle mixed bulls and cows correctly', () => {
    // '1234' vs '1342': 1 matches position 0, 4 matches position 3, 3 and 2 are in wrong positions
    const result = calculateBullsAndCows('1234', '1342')
    expect(result).toEqual({ bulls: 1, cows: 3 })
  })

  test('should handle 3-digit numbers', () => {
    const result = calculateBullsAndCows('123', '132')
    expect(result).toEqual({ bulls: 1, cows: 2 })
  })

  test('should handle 5-digit numbers', () => {
    // '12345' vs '15342': positions that match: 0(1), 2(3), 3(4) = 3 bulls; 5 and 2 are in wrong positions = 2 cows
    const result = calculateBullsAndCows('12345', '15342')
    expect(result).toEqual({ bulls: 3, cows: 2 })
  })

  test('should handle 6-digit numbers', () => {
    const result = calculateBullsAndCows('123456', '654321')
    expect(result).toEqual({ bulls: 0, cows: 6 })
  })

  test('should throw error for different lengths', () => {
    expect(() => calculateBullsAndCows('123', '1234')).toThrow('Guess and secret must be the same length')
  })

  test('should handle complex case with duplicate processing', () => {
    const result = calculateBullsAndCows('1234', '2143')
    expect(result).toEqual({ bulls: 0, cows: 4 })
  })

  test('should handle case with some digits not in secret', () => {
    const result = calculateBullsAndCows('1250', '1234')
    expect(result).toEqual({ bulls: 2, cows: 0 })
  })
})

describe('isValidNumber', () => {
  test('should accept valid 4-digit number with unique digits', () => {
    expect(isValidNumber('1234', 4)).toBe(true)
    expect(isValidNumber('5678', 4)).toBe(true)
    expect(isValidNumber('9012', 4)).toBe(true)
  })

  test('should reject number with duplicate digits', () => {
    expect(isValidNumber('1123', 4)).toBe(false)
    expect(isValidNumber('1111', 4)).toBe(false)
    expect(isValidNumber('1221', 4)).toBe(false)
  })

  test('should reject number with wrong length', () => {
    expect(isValidNumber('123', 4)).toBe(false)
    expect(isValidNumber('12345', 4)).toBe(false)
    expect(isValidNumber('', 4)).toBe(false)
  })

  test('should reject non-numeric strings', () => {
    expect(isValidNumber('abc4', 4)).toBe(false)
    expect(isValidNumber('12a4', 4)).toBe(false)
    expect(isValidNumber('!@#$', 4)).toBe(false)
  })

  test('should work with different number lengths', () => {
    expect(isValidNumber('123', 3)).toBe(true)
    expect(isValidNumber('12345', 5)).toBe(true)
    expect(isValidNumber('123456', 6)).toBe(true)
  })

  test('should reject numbers with wrong length for different target lengths', () => {
    expect(isValidNumber('1234', 3)).toBe(false)
    expect(isValidNumber('1234', 5)).toBe(false)
    expect(isValidNumber('1234', 6)).toBe(false)
  })

  test('should accept valid 3-digit numbers', () => {
    expect(isValidNumber('123', 3)).toBe(true)
    expect(isValidNumber('098', 3)).toBe(true)
  })

  test('should accept valid 5-digit numbers', () => {
    expect(isValidNumber('12345', 5)).toBe(true)
    expect(isValidNumber('09876', 5)).toBe(true)
  })

  test('should accept valid 6-digit numbers', () => {
    expect(isValidNumber('123456', 6)).toBe(true)
    expect(isValidNumber('098765', 6)).toBe(true)
  })

  test('should handle numbers starting with 0', () => {
    expect(isValidNumber('0123', 4)).toBe(true)
    expect(isValidNumber('0987', 4)).toBe(true)
  })
})

describe('generateLobbyCode', () => {
  test('should generate 6-character code', () => {
    const code = generateLobbyCode()
    expect(code).toHaveLength(6)
  })

  test('should generate code with only alphanumeric characters', () => {
    const code = generateLobbyCode()
    expect(code).toMatch(/^[A-Z0-9]+$/)
  })

  test('should generate unique codes', () => {
    const codes = new Set()
    for (let i = 0; i < 100; i++) {
      codes.add(generateLobbyCode())
    }
    // With 36^6 possible combinations, 100 codes should be unique
    expect(codes.size).toBe(100)
  })

  test('should generate different codes on multiple calls', () => {
    const code1 = generateLobbyCode()
    const code2 = generateLobbyCode()
    const code3 = generateLobbyCode()
    
    expect(code1).not.toBe(code2)
    expect(code2).not.toBe(code3)
    expect(code1).not.toBe(code3)
  })
})