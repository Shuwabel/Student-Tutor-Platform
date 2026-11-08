import { describe, expect, it } from 'vitest'
import { extractYouTubeId, filterCourses, moveItem, splitLines, splitTags, validateDraft, type CourseDraft } from './courses'
import type { Course } from './types'

const course = (over: Partial<Course>): Course => ({
  id: 'c1', code: 'COMP 101', title: 'Intro', summary: 's', description: 'd', subject: 'Computing', level: 'Beginner',
  tutorId: 't', modules: [], outcomes: [], tags: ['web'], published: true, createdAt: '', ...over,
})

const draft = (over: Partial<CourseDraft> = {}): CourseDraft => ({
  code: 'X 1', title: 'T', subject: 'Data', level: 'Beginner', summary: 's', description: '', outcomesText: '', tagsText: '',
  modules: [{ id: 'm', title: 'M', lessons: [{ id: 'l', title: 'L', minutes: 5, body: '', videoId: '' }] }], ...over,
})

describe('courses helpers', () => {
  it('splits lines and tags', () => {
    expect(splitLines(' a \n\n b\r\nc')).toEqual(['a', 'b', 'c'])
    expect(splitTags('a, b,a\nc')).toEqual(['a', 'b', 'c'])
  })
  it('extracts YouTube ids', () => {
    expect(extractYouTubeId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3')).toBe('dQw4w9WgXcQ')
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYouTubeId('nonsense')).toBe('')
  })
  it('moves items within bounds', () => {
    expect(moveItem([1, 2, 3], 0, 1)).toEqual([2, 1, 3])
    expect(moveItem([1, 2, 3], 0, -1)).toEqual([1, 2, 3])
  })
  it('filters courses', () => {
    const list = [course({}), course({ id: 'c2', code: 'MATH 1', title: 'Algebra', subject: 'Mathematics', level: 'Advanced', tags: [] })]
    expect(filterCourses(list, { query: 'algebra', subject: '', level: '' })).toHaveLength(1)
    expect(filterCourses(list, { query: '', subject: 'Computing', level: '' })).toHaveLength(1)
    expect(filterCourses(list, { query: '', subject: '', level: 'Advanced' })[0].id).toBe('c2')
  })
  it('validates drafts', () => {
    expect(validateDraft(draft(), [], true)).toEqual({})
    expect(validateDraft(draft(), [course({ code: 'x 1' })], false).code).toBeTruthy()
    expect(validateDraft(draft({ modules: [] }), [], true).modules).toBeTruthy()
    expect(validateDraft(draft({ modules: [] }), [], false).modules).toBeUndefined()
  })
})
