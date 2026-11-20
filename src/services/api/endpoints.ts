/** Chỉ các endpoint công khai mà website người dùng sử dụng. Endpoint quản trị thuộc dự án Admin. */
export const API_ENDPOINTS = {
  courses: {
    publicList: '/public/courses',
    publicDetailBySlug: (slug: string) => `/public/courses/${encodeURIComponent(slug)}`,
  },
  branches: {
    publicList: '/public/branches',
  },
  schedules: {
    publicList: '/public/schedules',
  },
  news: {
    publicList: '/public/news',
    publicDetail: (id: string) => `/public/news/${encodeURIComponent(id)}`,
  },
  articles: {
    publicList: '/public/articles',
    publicDetailBySlug: (slug: string) => `/public/articles/${encodeURIComponent(slug)}`,
  },
  careers: {
    publicList: '/public/careers',
    publicDetail: (id: string) => `/public/careers/${encodeURIComponent(id)}`,
  },
  studyZone: {
    topicsList: '/public/study-zone/topics',
    topicDetailBySlug: (slug: string) => `/public/study-zone/topics/${encodeURIComponent(slug)}`,
    exerciseDetail: (exerciseId: string) => `/public/study-zone/exercises/${encodeURIComponent(exerciseId)}`,
    submitExercise: (exerciseId: string) => `/public/study-zone/exercises/${encodeURIComponent(exerciseId)}/submit`,
  },
  testOnline: {
    testsList: '/public/tests',
    testDetailBySlug: (slug: string) => `/public/tests/${encodeURIComponent(slug)}`,
    startAttempt: '/public/test-attempts/start',
    attemptDetail: (attemptId: string) => `/public/test-attempts/${encodeURIComponent(attemptId)}`,
    saveProgress: (attemptId: string) =>
      `/public/test-attempts/${encodeURIComponent(attemptId)}/progress`,
    submitAttempt: (attemptId: string) =>
      `/public/test-attempts/${encodeURIComponent(attemptId)}/submit`,
    attemptResult: (attemptId: string) =>
      `/public/test-attempts/${encodeURIComponent(attemptId)}/result`,
    historyList: '/public/test-history',
    historyDetail: (attemptId: string) =>
      `/public/test-history/${encodeURIComponent(attemptId)}`,
  },
  consultations: {
    submit: '/public/consultations',
  },
} as const
