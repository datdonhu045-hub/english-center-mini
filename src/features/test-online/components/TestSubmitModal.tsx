import SubmissionConfirmModal from '@/components/ui/SubmissionConfirmModal'

interface TestSubmitModalProps {
  open: boolean
  examName: string
  examType?: string
  totalQuestions: number
  answeredCount: number
  flaggedCount: number
  submitting: boolean
  errorMessage?: string | null
  onCancel: () => void
  onConfirmSubmit: () => void
}

export default function TestSubmitModal({
  open,
  examName,
  examType = 'TOEIC Listening & Reading',
  totalQuestions,
  answeredCount,
  flaggedCount,
  submitting,
  errorMessage,
  onCancel,
  onConfirmSubmit,
}: TestSubmitModalProps) {
  return (
    <SubmissionConfirmModal
      open={open}
      variant="exam"
      examName={examName}
      examType={examType}
      totalQuestions={totalQuestions}
      answeredCount={answeredCount}
      markedCount={flaggedCount}
      submitting={submitting}
      errorMessage={errorMessage}
      onCancel={onCancel}
      onConfirm={onConfirmSubmit}
    />
  )
}
