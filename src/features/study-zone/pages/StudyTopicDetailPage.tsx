import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  Headphones,
  Search,
  Sparkles,
  Volume2,
} from 'lucide-react'
import PageBanner from '@/components/ui/PageBanner'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/StateViews'
import { useStudyTopicDetail } from '@/features/study-zone/hooks/useStudyZone'
import StudyZoneTabs from '@/features/study-zone/components/StudyZoneTabs'
import AudioPlayer from '@/features/study-zone/components/AudioPlayer'
import ImageViewer from '@/features/study-zone/components/ImageViewer'
import {
  STUDY_CATEGORY_LABELS,
  STUDY_CATEGORY_PATHS,
  type GrammarTheorySection,
  type ListeningTrack,
  type StudyZoneCategory,
  type VocabularyWord,
} from '@/features/study-zone/types'
import { matchText } from '@/utils/format'

interface StudyTopicDetailPageProps {
  category: StudyZoneCategory
}

function GrammarTheoryView({ sections }: { sections: GrammarTheorySection[] }) {
  if (sections.length === 0) {
    return (
      <EmptyBlock
        title="Nội dung lý thuyết đang cập nhật"
        description="Bạn có thể bắt đầu làm ngay các bài TEST thực hành bên dưới."
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {sections.map((sec, idx) => (
        <section
          key={sec.id}
          className="rounded-2xl border border-[#DCEAF3] bg-white p-6 shadow-xs sm:p-8"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF6FD] text-sm font-extrabold text-[#2878B8]">
              {idx + 1}
            </span>
            <h2 className="text-lg font-extrabold text-[#243B53] sm:text-xl">{sec.heading}</h2>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-[#243B53] sm:text-base">
            {sec.paragraphs.map((p, pIdx) => (
              <p key={pIdx}>{p}</p>
            ))}
          </div>

          {sec.formulas && sec.formulas.length > 0 && (
            <div className="mt-5 rounded-xl border border-[#75BDEB] bg-[#EAF6FD]/70 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#2878B8]">
                Công thức & Cấu trúc ghi nhớ
              </p>
              <ul className="mt-2.5 flex flex-col gap-2">
                {sec.formulas.map((f, fIdx) => (
                  <li
                    key={fIdx}
                    className="rounded-lg bg-white px-3.5 py-2 font-mono text-sm font-bold text-[#243B53] shadow-2xs"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sec.imageUrl && (
            <div className="mt-5">
              <ImageViewer
                src={sec.imageUrl}
                alt={sec.heading}
                caption={sec.imageCaption}
              />
            </div>
          )}

          {sec.examples && sec.examples.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#718096]">
                Ví dụ minh họa chuẩn TOEIC
              </p>
              <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {sec.examples.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className="rounded-xl border border-[#DCEAF3] bg-[#F5FAFE] p-3.5 text-sm"
                  >
                    <p className="font-bold text-[#243B53]">{ex.en}</p>
                    <p className="mt-1 text-xs text-[#718096]">→ {ex.vi}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  )
}

function VocabularyStudyView({ words }: { words: VocabularyWord[] }) {
  const [searchWord, setSearchWord] = useState('')
  const [hideMeaning, setHideMeaning] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const filteredWords = useMemo(
    () =>
      words.filter((w) =>
        matchText(`${w.word} ${w.meaningVi} ${w.partOfSpeech} ${w.exampleEn}`, searchWord),
      ),
    [words, searchWord],
  )

  const currentFlashcard = words[activeIndex] ?? words[0]

  const playWordAudio = (wordItem: VocabularyWord) => {
    if (wordItem.audioUrl) {
      const audio = new Audio(wordItem.audioUrl)
      void audio.play().catch(() => {
        // Fallback sang Web Speech API nếu trình duyệt chặn
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(wordItem.word)
          utterance.lang = 'en-US'
          window.speechSynthesis.speak(utterance)
        }
      })
      return
    }
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(wordItem.word)
      utterance.lang = 'en-US'
      window.speechSynthesis.speak(utterance)
    }
  }

  if (words.length === 0) {
    return (
      <EmptyBlock
        title="Danh sách từ vựng đang cập nhật"
        description="Bạn có thể làm ngay các bài TEST từ vựng ở phần luyện tập bên dưới."
      />
    )
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Khu vực Flashcard tương tác Chuyển từ trước / từ tiếp theo */}
      {currentFlashcard && (
        <section className="rounded-2xl border border-[#75BDEB] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAF6FD] pb-4">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#2878B8]">
              <Sparkles className="h-4 w-4" />
              <span>
                Flashcard Từ vựng ({activeIndex + 1}/{words.length})
              </span>
            </div>

            <button
              type="button"
              onClick={() => setHideMeaning((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCEAF3] bg-[#F5FAFE] px-3 py-1.5 text-xs font-bold text-[#243B53] transition hover:border-[#75BDEB] hover:bg-[#EAF6FD]"
            >
              {hideMeaning ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span>{hideMeaning ? 'Hiện nghĩa tiếng Việt' : 'Ẩn nghĩa tiếng Việt để tự nhẩm'}</span>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 items-center gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-black tracking-tight text-[#243B53] sm:text-3xl">
                  {currentFlashcard.word}
                </h3>
                <span className="rounded-md bg-[#EAF6FD] px-2.5 py-1 font-mono text-sm font-semibold text-[#2878B8]">
                  {currentFlashcard.ipa}
                </span>
                <span className="rounded-full border border-[#DCEAF3] bg-[#F5FAFE] px-2.5 py-0.5 text-xs font-bold text-[#718096]">
                  {currentFlashcard.partOfSpeech}
                </span>
                <button
                  type="button"
                  onClick={() => playWordAudio(currentFlashcard)}
                  aria-label={`Phát âm từ ${currentFlashcard.word}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#2878B8] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#1e639c]"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Nghe phát âm</span>
                </button>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#718096]">
                  Nghĩa tiếng Việt:
                </p>
                {hideMeaning ? (
                  <button
                    type="button"
                    onClick={() => setHideMeaning(false)}
                    className="mt-1 rounded-lg border border-dashed border-[#75BDEB] bg-[#F5FAFE] px-3 py-1.5 text-xs font-bold text-[#2878B8]"
                  >
                    Nhấn để xem nghĩa tiếng Việt
                  </button>
                ) : (
                  <p className="mt-1 text-lg font-extrabold text-[#2878B8]">
                    {currentFlashcard.meaningVi}
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-xl border border-[#DCEAF3] bg-[#F5FAFE] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#718096]">
                  Ví dụ trong ngữ cảnh TOEIC:
                </p>
                <p className="mt-1 text-sm font-bold text-[#243B53]">{currentFlashcard.exampleEn}</p>
                {!hideMeaning && (
                  <p className="mt-1 text-xs text-[#718096]">→ {currentFlashcard.exampleVi}</p>
                )}
              </div>

              {currentFlashcard.audioUrl && (
                <div className="mt-4">
                  <AudioPlayer
                    key={currentFlashcard.id}
                    src={currentFlashcard.audioUrl}
                    title={`Audio phát âm: ${currentFlashcard.word}`}
                  />
                </div>
              )}
            </div>

            {currentFlashcard.imageUrl && (
              <div>
                <ImageViewer
                  src={currentFlashcard.imageUrl}
                  alt={currentFlashcard.word}
                  caption={`Hình minh họa: ${currentFlashcard.word}`}
                />
              </div>
            )}
          </div>

          {/* Điều hướng Từ trước / Từ tiếp theo */}
          <div className="mt-6 flex items-center justify-between border-t border-[#EAF6FD] pt-4">
            <button
              type="button"
              disabled={activeIndex === 0}
              onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCEAF3] bg-white px-4 py-2 text-xs font-extrabold text-[#243B53] transition hover:border-[#75BDEB] hover:bg-[#EAF6FD] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Từ trước</span>
            </button>

            <div className="flex flex-wrap items-center gap-1.5">
              {words.map((w, idx) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`h-7 w-7 rounded-full text-xs font-extrabold transition ${
                    idx === activeIndex
                      ? 'bg-[#2878B8] text-white'
                      : 'bg-[#EAF6FD] text-[#2878B8] hover:bg-[#A7D8F5]'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={activeIndex === words.length - 1}
              onClick={() => setActiveIndex((i) => Math.min(words.length - 1, i + 1))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCEAF3] bg-white px-4 py-2 text-xs font-extrabold text-[#243B53] transition hover:border-[#75BDEB] hover:bg-[#EAF6FD] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <span>Từ tiếp theo</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {/* Bảng danh sách toàn bộ từ vựng trong chủ đề có tìm kiếm nhanh */}
      <section className="rounded-2xl border border-[#DCEAF3] bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-extrabold text-[#243B53] sm:text-lg">
            Danh sách từ vựng trong bài ({filteredWords.length} từ)
          </h3>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718096]" />
            <input
              type="text"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              placeholder="Tìm từ vựng trong bài..."
              className="w-full rounded-xl border border-[#DCEAF3] bg-[#F5FAFE] py-2 pl-9 pr-3 text-xs font-medium text-[#243B53] outline-none transition focus:border-[#75BDEB] focus:bg-white"
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {filteredWords.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-[#DCEAF3] bg-[#F5FAFE]/70 p-4 transition hover:border-[#75BDEB] hover:bg-white"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-base font-extrabold text-[#243B53]">{item.word}</span>
                    <span className="ml-2 font-mono text-xs text-[#2878B8]">{item.ipa}</span>
                    <span className="ml-2 rounded bg-[#EAF6FD] px-1.5 py-0.5 text-[11px] font-bold text-[#2878B8]">
                      {item.partOfSpeech}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => playWordAudio(item)}
                    title="Nghe phát âm"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF6FD] text-[#2878B8] transition hover:bg-[#2878B8] hover:text-white"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>

                {!hideMeaning && (
                  <p className="mt-1.5 text-sm font-bold text-[#2878B8]">{item.meaningVi}</p>
                )}

                <p className="mt-2 text-xs font-medium text-[#243B53]">“{item.exampleEn}”</p>
                {!hideMeaning && <p className="mt-0.5 text-xs text-[#718096]">{item.exampleVi}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function ListeningStudyView({ track }: { track?: ListeningTrack }) {
  const [showTranscript, setShowTranscript] = useState(true)

  if (!track) {
    return (
      <EmptyBlock
        title="Bản ghi âm mẫu đang cập nhật"
        description="Bạn có thể vào trực tiếp các bài TEST 1, TEST 2 bên dưới để luyện nghe theo từng câu hỏi."
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-[#75BDEB] bg-white p-6 shadow-xs sm:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF6FD] px-3.5 py-1 text-xs font-extrabold text-[#2878B8]">
            <Headphones className="h-4 w-4" />
            <span>{track.partLabel}</span>
            <span>•</span>
            <span>Thời lượng {track.durationLabel}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowTranscript((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCEAF3] bg-[#F5FAFE] px-3 py-1.5 text-xs font-bold text-[#243B53] transition hover:border-[#75BDEB]"
          >
            {showTranscript ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{showTranscript ? 'Ẩn Transcript song ngữ' : 'Hiện Transcript song ngữ'}</span>
          </button>
        </div>

        <AudioPlayer
          src={track.audioUrl}
          title={`File nghe mẫu – ${track.partLabel}`}
        />

        {showTranscript && track.transcript.length > 0 && (
          <div className="mt-6 rounded-xl border border-[#DCEAF3] bg-[#F5FAFE] p-5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#2878B8]">
              Transcript & Dịch nghĩa song ngữ
            </h3>
            <div className="mt-3 flex flex-col gap-3">
              {track.transcript.map((line, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[#DCEAF3] bg-white p-3.5 text-sm shadow-2xs"
                >
                  <p className="font-bold text-[#243B53]">
                    {line.speaker && (
                      <span className="mr-2 rounded bg-[#EAF6FD] px-2 py-0.5 text-xs font-extrabold text-[#2878B8]">
                        {line.speaker}
                      </span>
                    )}
                    {line.en}
                  </p>
                  <p className="mt-1 text-xs text-[#718096]">→ {line.vi}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default function StudyTopicDetailPage({ category }: StudyTopicDetailPageProps) {
  const { slug = '' } = useParams<{ slug: string }>()
  const { data: topic, loading, error, retry } = useStudyTopicDetail(slug, category)

  const categoryLabel = STUDY_CATEGORY_LABELS[category]
  const categoryPath = STUDY_CATEGORY_PATHS[category]

  return (
    <div className="ec-font min-h-screen bg-[#F5FAFE] pb-16">
      {/* Breadcrumb */}
      <div className="border-b border-[#DCEAF3] bg-white py-2 text-xs text-[#718096]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1.5 px-4 lg:px-6">
          <Link to="/" className="hover:text-[#2878B8] hover:underline">
            Trang chủ
          </Link>
          <span>»</span>
          <Link to={categoryPath} className="hover:text-[#2878B8] hover:underline">
            Study Zone ({categoryLabel})
          </Link>
          <span>»</span>
          <span className="font-bold text-[#243B53]">{topic?.title ?? slug}</span>
        </div>
      </div>

      <PageBanner
        title={topic?.title ?? 'STUDY ZONE'}
        badge={`${categoryLabel} • ${topic?.level ?? 'TOEIC'}`}
        subtitle={
          topic?.shortDescription ??
          'Nội dung bài học và hệ thống bài tập thực hành chấm điểm tự động.'
        }
        image={topic?.thumbnail}
      />

      <div className="mx-auto max-w-7xl px-4 pt-8 lg:px-6">
        <StudyZoneTabs activeCategory={category} />

        <div className="mt-6">
          <Link
            to={categoryPath}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#2878B8] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại danh sách {categoryLabel}</span>
          </Link>
        </div>

        <div className="mt-5">
          {loading && <LoadingBlock label="Đang tải nội dung bài học..." />}

          {!loading && error && <ErrorBlock message={error} onRetry={retry} />}

          {!loading && !error && !topic && (
            <EmptyBlock
              title="Không tìm thấy chủ đề học tập"
              description="Chủ đề này có thể đã được cập nhật hoặc thay đổi đường dẫn."
            />
          )}

          {!loading && !error && topic && (
            <div className="flex flex-col gap-8">
              {/* Khu vực 1: Danh sách các bài TEST tương tác của chuyên đề */}
              <section className="rounded-2xl border border-[#75BDEB] bg-white p-6 shadow-xs sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#2878B8]">
                      Bài tập thực hành tương tác
                    </span>
                    <h2 className="mt-0.5 text-lg font-extrabold text-[#243B53] sm:text-xl">
                      Danh sách bài TEST – {topic.title}
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF6FD] px-3 py-1 text-xs font-bold text-[#2878B8]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Chấm điểm & Giải thích chi tiết ngay sau khi nộp
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {topic.exercises.map((ex) => (
                    <Link
                      key={ex.id}
                      to={`/study-zone/practice/${ex.id}`}
                      className="group flex flex-col justify-between rounded-xl border border-[#75BDEB] bg-[#F5FAFE] p-4 transition hover:-translate-y-0.5 hover:border-[#2878B8] hover:bg-white hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-black uppercase text-[#243B53] group-hover:text-[#2878B8]">
                            {ex.title}
                          </span>
                          <FileCheck2 className="h-5 w-5 text-[#2878B8]" />
                        </div>
                        <p className="mt-1 text-xs font-semibold text-[#718096]">{ex.subtitle}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-[#DCEAF3] pt-2.5 text-xs font-extrabold text-[#2878B8]">
                        <span>
                          {ex.questionCount} câu hỏi
                          {ex.durationMinutes ? ` • ${ex.durationMinutes} phút` : ''}
                        </span>
                        <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5">
                          Làm bài <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Khu vực 2: Nội dung kiến thức chuyên sâu theo từng phân hệ */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#2878B8]" />
                  <h2 className="text-lg font-extrabold text-[#243B53] sm:text-xl">
                    {category === 'grammar' && 'Kiến thức Ngữ pháp & Công thức trọng tâm'}
                    {category === 'vocabulary' && 'Hệ thống Flashcard & Từ vựng kèm Audio'}
                    {category === 'listening' && 'Bản ghi âm mẫu & Transcript song ngữ'}
                  </h2>
                </div>

                {category === 'grammar' && (
                  <GrammarTheoryView sections={topic.grammarSections ?? []} />
                )}

                {category === 'vocabulary' && (
                  <VocabularyStudyView words={topic.vocabularyWords ?? []} />
                )}

                {category === 'listening' && (
                  <ListeningStudyView track={topic.listeningTrack} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
