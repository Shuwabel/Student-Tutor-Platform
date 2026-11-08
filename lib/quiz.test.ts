import { describe, expect, it } from 'vitest'
import { averageScore, bestScore, formatClock, isHttpsUrl, moveItem, scoreAnswers, secondsLeft, validateQuestions } from './quiz'

describe('quiz helpers', () => {
  it('scores answers and treats blanks as wrong', () => {
    const qs = [{ answerIndex: 1 }, { answerIndex: 0 }, { answerIndex: 2 }]
    expect(scoreAnswers(qs, [1, -1, 2])).toEqual({ correct: 2, total: 3, score: 67 })
    expect(scoreAnswers([], [])).toEqual({ correct: 0, total: 0, score: 0 })
  })
  it('formats the clock', () => {
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(65)).toBe('1:05')
    expect(formatClock(600)).toBe('10:00')
    expect(formatClock(-3)).toBe('0:00')
  })
  it('counts seconds left', () => {
    expect(secondsLeft(10_000, 4_500)).toBe(6)
    expect(secondsLeft(10_000, 12_000)).toBe(0)
  })
  it('best and average', () => {
    expect(bestScore([])).toBeNull()
    expect(bestScore([{ score: 40 }, { score: 80 }])).toBe(80)
    expect(averageScore([{ score: 40 }, { score: 81 }])).toBe(61)
  })
  it('validates links', () => {
    expect(isHttpsUrl('https://example.com/a')).toBe(true)
    expect(isHttpsUrl('http://example.com')).toBe(false)
    expect(isHttpsUrl('javascript:alert(1)')).toBe(false)
    expect(isHttpsUrl('nope')).toBe(false)
  })
  it('moves items', () => {
    expect(moveItem([1, 2, 3], 0, 1)).toEqual([2, 1, 3])
    expect(moveItem([1, 2, 3], 0, -1)).toEqual([1, 2, 3])
  })
  it('validates questions', () => {
    expect(validateQuestions([])).toHaveLength(1)
    const ok = { id: 'a', prompt: 'Q', options: ['a', 'b'], answerIndex: 0, explanation: '' }
    expect(validateQuestions([ok])).toEqual([])
    expect(validateQuestions([{ ...ok, options: ['a', ' '] }])).toHaveLength(1)
  })
})
