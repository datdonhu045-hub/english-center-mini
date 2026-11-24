import { authSessionStore } from '@/features/auth/services/authService'
import { mockTests } from '@/features/test-online/mocks/testMockData'
import { gradeTestAttempt } from '@/features/test-online/services/scoringService'
import {
  isMultiQuestionSharedGroup,
  normalizeGroupMedia,
  normalizeQuestionMedia,
} from '@/features/test-online/utils/questionMedia'
import type {
  AudioGroupState,
  AudioPlaybackStatus,
  StartAttemptPayload,
  Test,
  TestAttempt,
  TestAttemptResult,
  ToeicPartNumber,
} from '@/features/test-online/types/test.types'

const ATTEMPTS_STORAGE_KEY = 'ec_toeic_test_attempts_v3'
const RESULTS_STORAGE_KEY = 'ec_toeic_test_results_v3'
const SEEDED_FLAG_KEY = 'ec_toeic_test_seeded_v5'

const memoryAttemptsFallback: Record<string, TestAttempt> = {}
const memoryResultsFallback: Record<string, TestAttemptResult> = {}

function safeReadJson<T extends Record<string, unknown>>(
  key: string,
  fallback: T,
  memoryStore: T,
): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return { ...fallback, ...memoryStore }
    const parsed = JSON.parse(raw) as T
    return { ...parsed, ...memoryStore }
  } catch {
    return { ...fallback, ...memoryStore }
  }
}

function safeWriteJson<T extends Record<string, unknown>>(
  key: string,
  value: T,
  memoryStore: T,
): void {
  Object.assign(memoryStore, value)
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    try {
      window.localStorage.removeItem(key)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Đã có memoryStore giữ dữ liệu trong phiên hiện tại
    }
  }
}

function buildInitialAudioStates(
  test: Test,
  selectedParts: ToeicPartNumber[],
  initialStatus: AudioPlaybackStatus = 'NOT_PLAYED',
): Record<string, AudioGroupState> {
  const states: Record<string, AudioGroupState> = {}
  const selectedSet = new Set(selectedParts)

  for (const part of test.parts) {
    if (!selectedSet.has(part.partNumber) || part.section !== 'listening') continue
    for (const group of part.questionGroups) {
      if (isMultiQuestionSharedGroup(group)) {
        const gMedia = normalizeGroupMedia(group)
        if (gMedia.audios.length > 0) {
          const groupId = group.audioGroupId ?? group.id
          states[groupId] = {
            audioGroupId: groupId,
            partNumber: part.partNumber,
            audioUrl: '',
            status: initialStatus,
          }
        }
      } else {
        for (const q of group.questions) {
          const qMedia = normalizeQuestionMedia(q)
          const gMedia = normalizeGroupMedia(group)
          if (qMedia.audios.length > 0 || gMedia.audios.length > 0) {
            const audioKey =
              qMedia.audios.length > 0 && gMedia.audios.length === 0
                ? q.id
                : (group.audioGroupId ?? group.id)
            states[audioKey] = {
              audioGroupId: audioKey,
              partNumber: part.partNumber,
              audioUrl: '',
              status: initialStatus,
            }
          }
        }
      }
    }
  }

  return states
}

function buildSampleAnswers(prefix: string, wrongCount: number): Record<string, string> {
  const correctChoices: Array<[number, string]> = [
    [1, 'b'],
    [2, 'c'],
    [3, 'a'],
    [4, 'b'],
    [5, 'b'],
    [6, 'b'],
    [7, 'a'],
    [8, 'a'],
    [9, 'c'],
    [10, 'b'],
    [11, 'a'],
    [12, 'b'],
    [13, 'b'],
    [14, 'a'],
    [15, 'a'],
    [16, 'b'],
    [17, 'c'],
    [18, 'a'],
    [19, 'a'],
    [20, 'a'],
    [21, 'b'],
    [22, 'c'],
    [23, 'a'],
  ]

  const answers: Record<string, string> = {}
  correctChoices.forEach(([num, rightLetter], index) => {
    const chosen =
      index < wrongCount ? (rightLetter === 'a' ? 'c' : 'a') : rightLetter
    answers[`${prefix}-q${num}`] = `${prefix}-q${num}-${chosen}`
  })
  return answers
}

function ensureSeededSampleHistory(): void {
  if (typeof window === 'undefined') return
  const alreadySeeded = window.localStorage.getItem(SEEDED_FLAG_KEY)
  if (alreadySeeded) return

  const test1 = mockTests[0]
  const test2 = mockTests[1]
  const test3 = mockTests[2]
  const test4 = mockTests[3]
  if (!test1) return

  const existingAttempts = safeReadJson<Record<string, TestAttempt>>(
    ATTEMPTS_STORAGE_KEY,
    {},
    memoryAttemptsFallback,
  )
  const existingResults = safeReadJson<Record<string, TestAttemptResult>>(
    RESULTS_STORAGE_KEY,
    {},
    memoryResultsFallback,
  )

  const seedSpecs: Array<{
    id: string
    studentId: string
    test: Test
    prefix: string
    startedAt: string
    deadlineAt: string
    submittedAt: string
    wrongCount: number
  }> = [
    {
      id: 'ATT-20261112-101',
      studentId: 'stu-001',
      test: test1,
      prefix: 't01',
      startedAt: '2026-11-12T14:00:00+07:00',
      deadlineAt: '2026-11-12T16:00:00+07:00',
      submittedAt: '2026-11-12T15:55:00+07:00',
      wrongCount: 6,
    },
    {
      id: 'ATT-20261120-202',
      studentId: 'stu-001',
      test: test1,
      prefix: 't01',
      startedAt: '2026-11-20T09:00:00+07:00',
      deadlineAt: '2026-11-20T11:00:00+07:00',
      submittedAt: '2026-11-20T10:50:00+07:00',
      wrongCount: 2,
    },
  ]

  if (test2) {
    seedSpecs.push(
      {
        id: 'ATT-20261118-301',
        studentId: 'stu-001',
        test: test2,
        prefix: 't02',
        startedAt: '2026-11-18T14:00:00+07:00',
        deadlineAt: '2026-11-18T16:00:00+07:00',
        submittedAt: '2026-11-18T15:45:00+07:00',
        wrongCount: 4,
      },
      {
        id: 'ATT-20261119-601',
        studentId: 'stu-002',
        test: test2,
        prefix: 't02',
        startedAt: '2026-11-19T19:00:00+07:00',
        deadlineAt: '2026-11-19T21:00:00+07:00',
        submittedAt: '2026-11-19T20:50:00+07:00',
        wrongCount: 3,
      },
    )
  }

  if (test3) {
    seedSpecs.push({
      id: 'ATT-20261115-401',
      studentId: 'stu-001',
      test: test3,
      prefix: 't03',
      startedAt: '2026-11-15T08:30:00+07:00',
      deadlineAt: '2026-11-15T10:30:00+07:00',
      submittedAt: '2026-11-15T10:30:00+07:00',
      wrongCount: 8,
    })
  }

  if (test4) {
    seedSpecs.push({
      id: 'ATT-20261110-501',
      studentId: 'stu-001',
      test: test4,
      prefix: 't04',
      startedAt: '2026-11-10T19:00:00+07:00',
      deadlineAt: '2026-11-10T21:00:00+07:00',
      submittedAt: '2026-11-10T20:50:00+07:00',
      wrongCount: 6,
    })
  }

  for (const spec of seedSpecs) {
    const allParts: ToeicPartNumber[] = [1, 2, 3, 4, 5, 6, 7]
    const att: TestAttempt = {
      id: spec.id,
      studentId: spec.studentId,
      testId: spec.test.id,
      testSlug: spec.test.slug,
      testCode: spec.test.code,
      testTitle: spec.test.title,
      practiceMode: 'full',
      selectedParts: allParts,
      selectedDuration: 120,
      startedAt: spec.startedAt,
      deadlineAt: spec.deadlineAt,
      submittedAt: spec.submittedAt,
      status: 'submitted',
      answers: buildSampleAnswers(spec.prefix, spec.wrongCount),
      flaggedQuestionIds: [],
      audioStates: buildInitialAudioStates(spec.test, allParts, 'LOCKED'),
      introducedParts: allParts,
      currentPartNumber: 7,
      currentStage: 'questions',
      listeningCompleted: true,
    }
    existingAttempts[spec.id] = att
    existingResults[spec.id] = gradeTestAttempt(
      spec.test,
      att,
      'submitted',
      spec.submittedAt,
    )
  }

  safeWriteJson(ATTEMPTS_STORAGE_KEY, existingAttempts, memoryAttemptsFallback)
  safeWriteJson(RESULTS_STORAGE_KEY, existingResults, memoryResultsFallback)
  try {
    window.localStorage.setItem(SEEDED_FLAG_KEY, '1')
  } catch {
    // ignore
  }
}

export const attemptStorageService = {
  getAllAttemptsMap(): Record<string, TestAttempt> {
    ensureSeededSampleHistory()
    const rawMap = safeReadJson<Record<string, TestAttempt>>(
      ATTEMPTS_STORAGE_KEY,
      {},
      memoryAttemptsFallback,
    )
    let cleaned = false
    for (const att of Object.values(rawMap)) {
      if (att.audioStates) {
        for (const st of Object.values(att.audioStates)) {
          if (st.audioUrl && st.audioUrl.length > 200) {
            st.audioUrl = ''
            cleaned = true
          }
        }
      }
    }
    if (cleaned) {
      safeWriteJson(ATTEMPTS_STORAGE_KEY, rawMap, memoryAttemptsFallback)
    }
    return rawMap
  },

  getAllResultsMap(): Record<string, TestAttemptResult> {
    ensureSeededSampleHistory()
    return safeReadJson<Record<string, TestAttemptResult>>(
      RESULTS_STORAGE_KEY,
      {},
      memoryResultsFallback,
    )
  },

  getAttemptById(attemptId: string): TestAttempt | null {
    const map = this.getAllAttemptsMap()
    return map[attemptId] ?? null
  },

  saveAttempt(attempt: TestAttempt): TestAttempt {
    const map = this.getAllAttemptsMap()
    map[attempt.id] = attempt
    safeWriteJson(ATTEMPTS_STORAGE_KEY, map, memoryAttemptsFallback)
    return attempt
  },

  createNewAttempt(test: Test, payload: StartAttemptPayload): TestAttempt {
    ensureSeededSampleHistory()
    const sortedParts = [...payload.selectedParts].sort((a, b) => a - b) as ToeicPartNumber[]
    const firstPart = sortedParts[0] ?? 1
    const hasListening = sortedParts.some((p) => p <= 4)

    const now = new Date()
    const startedAt = now.toISOString()
    const deadlineAt = new Date(now.getTime() + payload.selectedDuration * 60 * 1000).toISOString()

    const randomSuffix = Math.floor(100 + Math.random() * 900)
    const dateStamp = startedAt.slice(0, 10).replace(/-/g, '')
    const attemptId = `ATT-${dateStamp}-${randomSuffix}`

    const currentUser = authSessionStore.getCurrentUser()
    const attempt: TestAttempt = {
      id: attemptId,
      studentId: currentUser?.id ?? 'guest',
      testId: test.id,
      testSlug: test.slug,
      testCode: test.code,
      testTitle: test.title,
      practiceMode: payload.practiceMode,
      selectedParts: sortedParts,
      selectedDuration: payload.selectedDuration,
      startedAt,
      deadlineAt,
      timerPausedAt: startedAt,
      status: 'in_progress',
      answers: {},
      flaggedQuestionIds: [],
      audioStates: buildInitialAudioStates(test, sortedParts, 'NOT_PLAYED'),
      introducedParts: [],
      currentPartNumber: firstPart,
      currentStage: 'part_intro',
      listeningCompleted: !hasListening,
      listeningJustCompletedNotice: false,
    }

    return this.saveAttempt(attempt)
  },

  updateAudioGroupStatus(
    attemptId: string,
    audioGroupId: string,
    nextStatus: AudioPlaybackStatus,
  ): TestAttempt | null {
    const attempt = this.getAttemptById(attemptId)
    if (!attempt || attempt.status !== 'in_progress') return attempt

    const currentGroup = attempt.audioStates[audioGroupId]
    if (!currentGroup) return attempt

    if (
      (currentGroup.status === 'LOCKED' || currentGroup.status === 'COMPLETED') &&
      (nextStatus === 'PLAYING' || nextStatus === 'NOT_PLAYED')
    ) {
      return attempt
    }

    const nowIso = new Date().toISOString()
    const updatedGroup: AudioGroupState = {
      ...currentGroup,
      status: nextStatus === 'COMPLETED' ? 'LOCKED' : nextStatus,
      startedAt:
        nextStatus === 'PLAYING' && !currentGroup.startedAt ? nowIso : currentGroup.startedAt,
      completedAt:
        nextStatus === 'COMPLETED' || nextStatus === 'LOCKED'
          ? currentGroup.completedAt ?? nowIso
          : currentGroup.completedAt,
    }

    const nextAudioStates = {
      ...attempt.audioStates,
      [audioGroupId]: updatedGroup,
    }

    const allListeningGroups = Object.values(nextAudioStates)
    const allDone =
      allListeningGroups.length === 0 ||
      allListeningGroups.every((g) => g.status === 'LOCKED' || g.status === 'COMPLETED')

    const nextAttempt: TestAttempt = {
      ...attempt,
      audioStates: nextAudioStates,
      listeningCompleted: attempt.listeningCompleted || allDone,
    }

    return this.saveAttempt(nextAttempt)
  },

  finalizeAttempt(
    test: Test,
    attemptId: string,
    finalStatus: 'submitted' | 'expired',
  ): TestAttemptResult {
    const map = this.getAllAttemptsMap()
    const attempt = map[attemptId]
    if (!attempt) {
      throw new Error('Không tìm thấy lượt thi để chấm điểm.')
    }

    const existingResults = this.getAllResultsMap()
    if (attempt.status !== 'in_progress' && existingResults[attemptId]) {
      return existingResults[attemptId]
    }

    const submittedAtIso = new Date().toISOString()
    const lockedAudioStates: Record<string, AudioGroupState> = {}
    for (const [k, v] of Object.entries(attempt.audioStates)) {
      lockedAudioStates[k] = { ...v, status: 'LOCKED' }
    }

    const finalizedAttempt: TestAttempt = {
      ...attempt,
      status: finalStatus,
      submittedAt: submittedAtIso,
      audioStates: lockedAudioStates,
    }
    map[attemptId] = finalizedAttempt
    safeWriteJson(ATTEMPTS_STORAGE_KEY, map, memoryAttemptsFallback)

    const result = gradeTestAttempt(test, finalizedAttempt, finalStatus, submittedAtIso)
    existingResults[attemptId] = result
    safeWriteJson(RESULTS_STORAGE_KEY, existingResults, memoryResultsFallback)

    return result
  },

  getResultByAttemptId(attemptId: string): TestAttemptResult | null {
    const results = this.getAllResultsMap()
    return results[attemptId] ?? null
  },
}
