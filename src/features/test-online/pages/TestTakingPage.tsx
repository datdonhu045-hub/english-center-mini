import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useBlocker, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  LayoutGrid,
  Lock,
  Send,
  X,
} from 'lucide-react'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/StateViews'
import { useTestAttemptSession } from '@/features/test-online/hooks/useTestAttempt'
import { useTestTimer } from '@/features/test-online/hooks/useTestTimer'
import { attemptApi } from '@/features/test-online/api/attemptApi'
import TestTimer from '@/features/test-online/components/TestTimer'
import PartIntroduction from '@/features/test-online/components/PartIntroduction'
import TestQuestionRenderer from '@/features/test-online/components/TestQuestionRenderer'
import QuestionNavigator from '@/features/test-online/components/QuestionNavigator'
import TestSubmitModal from '@/features/test-online/components/TestSubmitModal'
import ExitExamConfirmModal from '@/features/test-online/components/ExitExamConfirmModal'
import type {
  QuestionGroup,
  TestAttempt,
  TestPart,
  TestQuestion,
  ToeicPartNumber,
} from '@/features/test-online/types/test.types'

interface ExamStepCursor {
  part: TestPart
  group: QuestionGroup
  /** Nếu là bài theo từng câu đơn (Part 1, Part 2, Part 5) thì mỗi bước là 1 câu riêng lẻ */
  singleQuestion?: TestQuestion
  firstQuestionId: string
  stepLabel: string
}

export default function TestTakingPage() {
  const { attemptId = '' } = useParams<{ attemptId: string }>()
  const navigate = useNavigate()
  const { data: session, loading, error, retry } = useTestAttemptSession(attemptId)

  const [localAttempt, setLocalAttempt] = useState<TestAttempt | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [submitModalOpen, setSubmitModalOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [exitModalOpen, setExitModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [navDrawerOpen, setNavDrawerOpen] = useState(false)

  // Dùng useRef để cờ cho phép thoát có hiệu lực tức thì trước khi navigate() kích hoạt useBlocker (tránh phải bấm Thoát 2 lần)
  const allowLeaveRef = useRef(false)

  const attempt =
    localAttempt && localAttempt.id === session?.attempt.id
      ? localAttempt
      : (session?.attempt ?? null)
  const test = session?.test ?? null

  const isExamInProgress = Boolean(
    attempt && attempt.status === 'in_progress' && !submitting,
  )

  // Chặn người dùng bấm nút Back của trình duyệt hoặc điều hướng rời trang khi đang làm dở bài thi
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isExamInProgress &&
      !allowLeaveRef.current &&
      currentLocation.pathname !== nextLocation.pathname &&
      !nextLocation.pathname.startsWith('/test-online/result/'),
  )

  // Cảnh báo trình duyệt khi người dùng đóng tab hoặc F5
  useEffect(() => {
    if (!isExamInProgress) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isExamInProgress])

  // Nếu lượt thi đã nộp hoặc đã hết giờ trước đó -> chuyển sang trang kết quả
  useEffect(() => {
    if (attempt && attempt.status !== 'in_progress') {
      navigate(`/test-online/result/${attempt.id}`, { replace: true })
    }
  }, [attempt, navigate])

  const activeParts = useMemo(() => {
    if (!test || !attempt) return []
    const set = new Set(attempt.selectedParts)
    return test.parts
      .filter((p) => set.has(p.partNumber))
      .sort((a, b) => a.partNumber - b.partNumber)
  }, [test, attempt])

  /**
   * Chuỗi bước làm bài:
   * - Với các Part câu đơn (không có đoạn văn/audio dùng chung cho nhiều câu như Part 1, Part 2, Part 5):
   *   chuyển từng câu 1 (Câu 1 -> Câu 2... hoặc Câu 101 -> Câu 102 -> Câu 103).
   * - Với các Part dùng chung đoạn hội thoại / bài nói / đoạn văn (Part 3, Part 4, Part 6, Part 7):
   *   hiển thị theo cụm câu hỏi gắn với đoạn đó.
   */
  const examSteps = useMemo<ExamStepCursor[]>(() => {
    const steps: ExamStepCursor[] = []
    for (const part of activeParts) {
      for (const group of part.questionGroups) {
        const isSharedMultiQuestionStimulus =
          group.stimulus.length > 0 && group.questions.length > 1

        if (!isSharedMultiQuestionStimulus) {
          for (const q of group.questions) {
            steps.push({
              part,
              group,
              singleQuestion: q,
              firstQuestionId: q.id,
              stepLabel: `Câu ${q.questionNumber}`,
            })
          }
        } else {
          const firstNum = group.questions[0]?.questionNumber ?? 1
          const lastNum =
            group.questions[group.questions.length - 1]?.questionNumber ?? firstNum
          steps.push({
            part,
            group,
            firstQuestionId: group.questions[0]?.id ?? '',
            stepLabel: `Câu ${firstNum} – ${lastNum}`,
          })
        }
      }
    }
    return steps
  }, [activeParts])

  const totalQuestions = useMemo(
    () =>
      activeParts.reduce(
        (sum, p) =>
          sum + p.questionGroups.reduce((gSum, g) => gSum + g.questions.length, 0),
        0,
      ),
    [activeParts],
  )

  const answeredCount = useMemo(
    () => (attempt ? Object.keys(attempt.answers).length : 0),
    [attempt],
  )

  // Tự động thu bài khi đồng hồ đếm ngược chạm 00:00:00
  const handleAutoExpire = useCallback(async () => {
    if (!attempt || attempt.status !== 'in_progress' || submitting) return
    setSubmitting(true)
    allowLeaveRef.current = true
    try {
      await attemptApi.submitAttempt(attempt.id, 'expired')
      navigate(`/test-online/result/${attempt.id}`, { replace: true })
    } catch {
      allowLeaveRef.current = false
      setSubmitting(false)
    }
  }, [attempt, submitting, navigate])

  const timer = useTestTimer(
    attempt?.deadlineAt,
    Boolean(
      attempt &&
        attempt.status === 'in_progress' &&
        attempt.currentStage === 'questions',
    ),
    handleAutoExpire,
    attempt?.currentStage === 'part_intro'
      ? (attempt.timerPausedAt ?? attempt.startedAt)
      : undefined,
  )

  const currentPart = useMemo(() => {
    if (!attempt) return activeParts[0]
    return (
      activeParts.find((p) => p.partNumber === attempt.currentPartNumber) ?? activeParts[0]
    )
  }, [activeParts, attempt])

  const currentGroup = useMemo(() => {
    if (!currentPart) return undefined
    if (selectedGroupId) {
      const found = currentPart.questionGroups.find((g) => g.id === selectedGroupId)
      if (found) return found
    }
    return currentPart.questionGroups[0]
  }, [currentPart, selectedGroupId])

  const activeQuestionId =
    selectedQuestionId ??
    attempt?.currentQuestionId ??
    currentGroup?.questions[0]?.id ??
    ''

  // Chuyển sang một Part / Nhóm / Câu hỏi cụ thể
  const moveToPartAndGroup = useCallback(
    async (
      targetPart: TestPart,
      targetGroup: QuestionGroup,
      targetQuestionId?: string,
      withListeningDoneNotice = false,
      overrideAttempt?: TestAttempt,
    ) => {
      const effectiveAttempt = overrideAttempt ?? attempt
      if (!effectiveAttempt) return

      // Quy tắc khóa Reading khi chưa hoàn thành toàn bộ audio Listening
      if (targetPart.section === 'reading' && !effectiveAttempt.listeningCompleted) {
        return
      }

      const hasSeenIntro = effectiveAttempt.introducedParts.includes(targetPart.partNumber)
      const nextStage: TestAttempt['currentStage'] = hasSeenIntro ? 'questions' : 'part_intro'
      const qId = targetQuestionId ?? targetGroup.questions[0]?.id ?? ''

      setSelectedGroupId(targetGroup.id)
      setSelectedQuestionId(qId)

      const updated = await attemptApi.saveAttemptProgress(effectiveAttempt.id, {
        currentPartNumber: targetPart.partNumber,
        currentStage: nextStage,
        currentQuestionId: qId,
        listeningCompleted: effectiveAttempt.listeningCompleted,
        listeningJustCompletedNotice: withListeningDoneNotice,
      })
      setLocalAttempt(updated)
    },
    [attempt],
  )

  // Khi nhấn "Bắt đầu Part" ở màn hình giới thiệu Part
  const handleConfirmPartIntro = async () => {
    if (!attempt || !currentPart) return
    const firstGroup = currentPart.questionGroups[0]
    const firstQId = firstGroup?.questions[0]?.id
    if (firstGroup) {
      setSelectedGroupId(firstGroup.id)
      setSelectedQuestionId(firstQId ?? '')
    }
    const updated = await attemptApi.confirmPartIntroduction(
      attempt.id,
      currentPart.partNumber,
      firstQId,
    )
    setLocalAttempt(updated)
  }

  // Ghi nhận đáp án học viên chọn
  const handleSelectAnswer = async (questionId: string, optionId: string) => {
    if (!attempt || attempt.status !== 'in_progress') return
    const nextAnswers = {
      ...attempt.answers,
      [questionId]: optionId,
    }
    setSelectedQuestionId(questionId)
    const updated = await attemptApi.saveAttemptProgress(attempt.id, {
      answers: nextAnswers,
      currentQuestionId: questionId,
    })
    setLocalAttempt(updated)
  }

  // Đánh dấu / bỏ đánh dấu câu cần xem lại
  const handleToggleFlag = async (questionId: string) => {
    if (!attempt || attempt.status !== 'in_progress') return
    const exists = attempt.flaggedQuestionIds.includes(questionId)
    const nextFlags = exists
      ? attempt.flaggedQuestionIds.filter((id) => id !== questionId)
      : [...attempt.flaggedQuestionIds, questionId]

    const updated = await attemptApi.saveAttemptProgress(attempt.id, {
      flaggedQuestionIds: nextFlags,
    })
    setLocalAttempt(updated)
  }

  // Khi 1 nhóm audio Listening bắt đầu phát
  const handleAudioPlayStarted = useCallback(
    async (audioGroupId: string) => {
      if (!attempt) return
      const updated = await attemptApi.updateAudioStatus(attempt.id, audioGroupId, 'PLAYING')
      if (updated) setLocalAttempt(updated)
    },
    [attempt],
  )

  // Tìm vị trí bước hiện tại trong examSteps
  const currentStepIndex = useMemo(() => {
    if (!currentGroup) return 0
    const byQuestion = examSteps.findIndex(
      (step) =>
        step.group.id === currentGroup.id &&
        (step.singleQuestion ? step.singleQuestion.id === activeQuestionId : true),
    )
    if (byQuestion >= 0) return byQuestion
    return Math.max(
      0,
      examSteps.findIndex((step) => step.group.id === currentGroup.id),
    )
  }, [examSteps, currentGroup, activeQuestionId])

  const currentStep = examSteps[currentStepIndex]

  // Chỉ cuộn về đầu trang khi thực sự chuyển Bước làm bài (chuyển cụm câu hỏi / chuyển câu đơn), chuyển Part hoặc chuyển màn hình giới thiệu.
  // Tuyệt đối KHÔNG cuộn lên đầu trang khi học viên đang bấm chọn đáp án của các câu thứ 2, thứ 3 bên dưới trong cùng một cụm câu hỏi.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [
    attemptId,
    attempt?.currentPartNumber,
    attempt?.currentStage,
    currentStepIndex,
  ])

  // Khi 1 nhóm audio Listening phát xong -> Khóa vĩnh viễn nhóm audio đó & tự động chuyển theo trình tự đề thi
  const handleAudioPlayCompleted = async (audioGroupId: string) => {
    if (!attempt || !currentPart || !currentGroup) return
    const updated = await attemptApi.updateAudioStatus(attempt.id, audioGroupId, 'LOCKED')
    if (!updated) return
    setLocalAttempt(updated)

    const nextStep = examSteps[currentStepIndex + 1]
    if (!nextStep) {
      if (updated.listeningCompleted) {
        setSubmitModalOpen(true)
      }
      return
    }

    const isTransitionToReading =
      currentPart.section === 'listening' && nextStep.part.section === 'reading'

    await moveToPartAndGroup(
      nextStep.part,
      nextStep.group,
      nextStep.firstQuestionId,
      isTransitionToReading,
      updated,
    )
  }

  const canGoPrevStep = useMemo(() => {
    if (!attempt || currentStepIndex <= 0) return false
    const prevStep = examSteps[currentStepIndex - 1]
    if (!prevStep) return false
    if (!attempt.listeningCompleted && prevStep.part.section === 'listening') {
      return false
    }
    return true
  }, [attempt, currentStepIndex, examSteps])

  const canGoNextStep = useMemo(() => {
    if (!attempt || currentStepIndex >= examSteps.length - 1) return false
    const nextStep = examSteps[currentStepIndex + 1]
    if (!nextStep) return false
    if (nextStep.part.section === 'reading' && !attempt.listeningCompleted) {
      return false
    }
    if (currentPart?.section === 'listening' && currentGroup && !attempt.listeningCompleted) {
      const audioKey = currentGroup.audioGroupId ?? currentGroup.id
      const audioStatus = attempt.audioStates[audioKey]?.status
      if (audioStatus && audioStatus !== 'LOCKED' && audioStatus !== 'COMPLETED') {
        return false
      }
    }
    return true
  }, [attempt, currentStepIndex, examSteps, currentPart, currentGroup])

  const handleGoPrevStep = () => {
    if (!canGoPrevStep) return
    const prev = examSteps[currentStepIndex - 1]
    if (prev) {
      void moveToPartAndGroup(prev.part, prev.group, prev.firstQuestionId)
    }
  }

  const handleGoNextStep = () => {
    if (!canGoNextStep) return
    const next = examSteps[currentStepIndex + 1]
    if (next) {
      void moveToPartAndGroup(next.part, next.group, next.firstQuestionId)
    }
  }

  const handleJumpToQuestion = (
    partNumber: ToeicPartNumber,
    groupId: string,
    questionId: string,
  ) => {
    const targetPart = activeParts.find((p) => p.partNumber === partNumber)
    const targetGroup = targetPart?.questionGroups.find((g) => g.id === groupId)
    if (!targetPart || !targetGroup) return
    setNavDrawerOpen(false)
    const isSameMultiQuestionGroup =
      currentGroup?.id === targetGroup.id &&
      targetGroup.stimulus.length > 0 &&
      targetGroup.questions.length > 1
    void moveToPartAndGroup(targetPart, targetGroup, questionId)
    if (isSameMultiQuestionGroup) {
      window.setTimeout(() => {
        const el = document.getElementById(`test-question-${questionId}`)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 40)
    }
  }

  const handleConfirmSubmit = async () => {
    if (!attempt || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    allowLeaveRef.current = true
    try {
      await attemptApi.submitAttempt(attempt.id, 'submitted')
      navigate(`/test-online/result/${attempt.id}`, { replace: true })
    } catch (err) {
      setSubmitting(false)
      allowLeaveRef.current = false
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Không thể nộp bài lúc này. Bài làm của bạn vẫn được giữ nguyên, hãy thử lại.',
      )
    }
  }

  const handleConfirmExitExam = () => {
    allowLeaveRef.current = true
    setExitModalOpen(false)
    if (blocker.state === 'blocked') {
      blocker.proceed()
      return
    }
    if (test) {
      navigate(`/test-online/${test.slug}`)
    } else {
      navigate('/test-online')
    }
  }

  const handleCancelExitExam = () => {
    if (blocker.state === 'blocked') {
      blocker.reset()
    }
    setExitModalOpen(false)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <LoadingBlock label="Đang tải phòng thi TOEIC trực tuyến..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <ErrorBlock message={error} onRetry={retry} />
      </div>
    )
  }

  if (!test || !attempt || !currentPart) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <EmptyBlock
          title="Không tìm thấy phiên làm bài"
          description="Mã lượt thi không hợp lệ hoặc đã bị xóa."
        />
      </div>
    )
  }

  const currentPartOrderIdx =
    activeParts.findIndex((p) => p.partNumber === currentPart.partNumber) + 1
  const currentAudioKey = currentGroup ? currentGroup.audioGroupId ?? currentGroup.id : ''
  const currentAudioState = currentAudioKey ? attempt.audioStates[currentAudioKey] : undefined

  return (
    <div className="ec-reading-font min-h-screen bg-[#F5FAFE] pb-16">
      {/* Thanh thông tin cố định phía trên cùng của phòng thi */}
      <div className="sticky top-0 z-30 border-b border-[#DCEAF3] bg-[#75BDEB] text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          {/* Nút thoát có xác nhận & Tên đề thi */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setExitModalOpen(true)}
              title="Rời phòng thi về trang thiết lập đề (có xác nhận)"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/40 bg-white/15 text-white transition hover:bg-white/25"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold uppercase tracking-wide text-white ec-shadow-text sm:text-base">
                HỆ THỐNG THI TRỰC TUYẾN
              </span>
              <span className="hidden text-white/60 sm:inline">•</span>
              <h1 className="hidden text-sm font-extrabold uppercase text-white ec-shadow-text sm:inline">
                {test.title}
              </h1>
            </div>
          </div>

          {/* Góc phải: NỘP BÀI + Đồng hồ + Nút mở Bảng điều hướng câu hỏi thu gọn trên góc */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setSubmitModalOpen(true)}
              className="inline-flex items-center justify-center rounded-lg bg-[#F26522] px-4 py-2 text-xs font-black uppercase tracking-wide text-white shadow-xs transition hover:bg-[#d95314] sm:px-5"
            >
              <span>NỘP BÀI</span>
            </button>

            <TestTimer timer={timer} />

            {/* Nút biểu tượng lưới ở góc phải trên cùng: bấm vào mới mở các câu hỏi ra */}
            <button
              type="button"
              onClick={() => setNavDrawerOpen((v) => !v)}
              title="Mở bảng danh sách câu hỏi"
              aria-expanded={navDrawerOpen}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                navDrawerOpen
                  ? 'bg-[#F26522] text-white shadow-sm'
                  : 'bg-[#2878B8] text-white hover:bg-[#1f5f94]'
              }`}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bảng điều hướng câu hỏi thu gọn: chỉ mở ra từ góc phải trên cùng khi học viên nhấn nút */}
      {navDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-[1px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setNavDrawerOpen(false)
          }}
        >
          <div className="fixed right-4 top-16 z-50 w-[calc(100vw-2rem)] max-w-sm">
            <div className="relative">
              <button
                type="button"
                onClick={() => setNavDrawerOpen(false)}
                aria-label="Đóng bảng câu hỏi"
                className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-[#F5FAFE] text-[#718096] transition hover:bg-[#EAF6FD] hover:text-[#243B53]"
              >
                <X className="h-4 w-4" />
              </button>

              <QuestionNavigator
                activeParts={activeParts}
                currentPartNumber={currentPart.partNumber}
                activeQuestionId={activeQuestionId}
                answers={attempt.answers}
                flaggedQuestionIds={attempt.flaggedQuestionIds}
                audioStates={attempt.audioStates}
                listeningCompleted={attempt.listeningCompleted}
                mode="exam"
                onJumpToQuestion={handleJumpToQuestion}
              />
            </div>
          </div>
        </div>
      )}

      {/* Khu vực nội dung chính của phòng thi */}
      <div className="mx-auto max-w-7xl px-4 pt-6 lg:px-6">
        {attempt.currentStage === 'part_intro' ? (
          <PartIntroduction
            part={currentPart}
            currentPartOrderIndex={currentPartOrderIdx}
            totalSelectedParts={activeParts.length}
            formattedRemainingTime={timer.formattedTime}
            listeningJustCompletedNotice={attempt.listeningJustCompletedNotice}
            onStartPart={handleConfirmPartIntro}
          />
        ) : (
          <div className="flex flex-col gap-5">
            {/* Khung trắng có thanh điều khiển chuyển câu đặt ngay phía trên câu hỏi */}
            <div className="rounded-xl border border-[#DCEAF3] bg-white p-5 shadow-xs sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#EAF6FD] pb-3.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl font-black uppercase tracking-tight text-[#2878B8] sm:text-2xl">
                    {currentPart.title}
                  </h2>

                  {currentStep && (
                    <span className="rounded-lg bg-[#EAF6FD] px-3 py-1 text-xs font-extrabold text-[#2878B8]">
                      {currentStep.stepLabel}
                    </span>
                  )}

                  {/* Các nút chuyển Part nhỏ gọn */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {activeParts.map((part) => {
                      const isCurrentPart = part.partNumber === currentPart.partNumber
                      const isReadingLocked =
                        part.section === 'reading' && !attempt.listeningCompleted
                      const isUnreachedListeningPart =
                        !attempt.listeningCompleted &&
                        part.section === 'listening' &&
                        !attempt.introducedParts.includes(part.partNumber) &&
                        !isCurrentPart
                      const isDisabled = isReadingLocked || isUnreachedListeningPart

                      return (
                        <button
                          key={part.id}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            const firstGroup = part.questionGroups[0]
                            if (firstGroup) {
                              void moveToPartAndGroup(
                                part,
                                firstGroup,
                                firstGroup.questions[0]?.id,
                              )
                            }
                          }}
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-extrabold transition ${
                            isCurrentPart
                              ? 'bg-[#2878B8] text-white'
                              : isDisabled
                                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                                : 'bg-[#EAF6FD] text-[#2878B8] hover:bg-[#75BDEB] hover:text-white'
                          }`}
                        >
                          {isReadingLocked && <Lock className="h-3 w-3" />}
                          <span>P{part.partNumber}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Thanh chuyển CÂU TRƯỚC / CÂU TIẾP đặt ngay phía trên cùng bên phải + Ô cam tiến độ 0/N */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={!canGoPrevStep}
                    onClick={handleGoPrevStep}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCEAF3] bg-[#F5FAFE] px-3.5 py-2 text-xs font-extrabold uppercase text-[#243B53] transition hover:border-[#75BDEB] hover:bg-[#EAF6FD] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>CÂU TRƯỚC</span>
                  </button>

                  {currentStepIndex < examSteps.length - 1 ? (
                    <button
                      type="button"
                      disabled={!canGoNextStep}
                      onClick={handleGoNextStep}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#2878B8] px-4 py-2 text-xs font-extrabold uppercase text-white shadow-2xs transition hover:bg-[#1e639c] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span>CÂU TIẾP</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSubmitModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26522] px-4 py-2 text-xs font-black uppercase text-white shadow-xs transition hover:bg-[#d95314]"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>NỘP BÀI</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setNavDrawerOpen(true)}
                    title="Mở bảng danh sách câu hỏi"
                    className="rounded-lg bg-[#F26522] px-4 py-2 text-xs font-black text-white shadow-xs transition hover:bg-[#d95314] sm:text-sm"
                  >
                    {answeredCount}/{totalQuestions}
                  </button>
                </div>
              </div>

              {currentGroup && (
                <TestQuestionRenderer
                  part={currentPart}
                  group={currentGroup}
                  activeQuestionId={activeQuestionId}
                  singleQuestionId={currentStep?.singleQuestion?.id}
                  answers={attempt.answers}
                  flaggedQuestionIds={attempt.flaggedQuestionIds}
                  audioGroupState={currentAudioState}
                  mode="exam"
                  onSelectAnswer={handleSelectAnswer}
                  onToggleFlag={handleToggleFlag}
                  onAudioPlayStarted={handleAudioPlayStarted}
                  onAudioPlayCompleted={handleAudioPlayCompleted}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal xác nhận nộp bài thi */}
      <TestSubmitModal
        open={submitModalOpen}
        examName={test.title}
        examType={
          attempt.practiceMode === 'full'
            ? 'TOEIC Listening & Reading'
            : `Luyện theo Part (${attempt.selectedParts.map((p) => `Part ${p}`).join(', ')})`
        }
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        flaggedCount={attempt.flaggedQuestionIds.length}
        submitting={submitting}
        errorMessage={submitError}
        onCancel={() => {
          setSubmitError(null)
          setSubmitModalOpen(false)
        }}
        onConfirmSubmit={handleConfirmSubmit}
      />

      {/* Modal xác nhận khi đang làm bài dở mà bấm thoát ra ngoài */}
      <ExitExamConfirmModal
        open={exitModalOpen || blocker.state === 'blocked'}
        title="Xác nhận rời khỏi phòng thi"
        description="Bạn đang trong thời gian làm bài thi TOEIC và chưa nộp bài. Bạn có chắc chắn muốn thoát khỏi phòng thi không?"
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
        onCancel={handleCancelExitExam}
        onConfirmExit={handleConfirmExitExam}
      />
    </div>
  )
}
