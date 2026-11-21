import SubmissionConfirmModal from '@/components/ui/SubmissionConfirmModal'

interface SubmissionModalProps {
  open: boolean
  exerciseTitle: string
  totalQuestions: number
  answeredCount: number
  submitting: boolean
  errorMessage?: string | null
  onCancel: () => void
  onConfirm: () => void
}

export default function SubmissionModal({
  open,
  exerciseTitle,
  totalQuestions,
  answeredCount,
  submitting,
  errorMessage,
  onCancel,
  onConfirm,
}: SubmissionModalProps) {
  return (
    <SubmissionConfirmModal
      open={open}
      variant="study"
      examName={exerciseTitle}
      totalQuestions={totalQuestions}
      answeredCount={answeredCount}
      submitting={submitting}
      errorMessage={errorMessage}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
