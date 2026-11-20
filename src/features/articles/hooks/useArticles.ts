import { useCallback } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { articleApi } from '@/features/articles/api/articleApi'
import type { ArticleCategory } from '@/features/articles/types'

export function usePublicArticles(category: ArticleCategory) {
  const fetcher = useCallback(() => articleApi.getPublicArticles({ category }), [category])
  return useAsync(fetcher, [category], { queryKey: `articles:public:${category}` })
}

export function useSidebarLearningMaterials(excludeSlug?: string) {
  const fetcher = useCallback(async () => {
    const items = await articleApi.getPublicArticles({
      categories: ['listening-reading', 'exam-review', 'student'],
    })
    // Ưu tiên bài nổi bật trước, sau đó đến ngày đăng mới nhất
    const sorted = [...items].sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1
      return b.publishedDate.localeCompare(a.publishedDate)
    })
    return excludeSlug ? sorted.filter((item) => item.slug !== excludeSlug).slice(0, 5) : sorted.slice(0, 5)
  }, [excludeSlug])

  return useAsync(fetcher, [excludeSlug], {
    queryKey: `articles:sidebar:${excludeSlug ?? 'all'}`,
  })
}

export function usePublicArticleDetail(slug: string, category: ArticleCategory) {
  const fetcher = useCallback(
    () => articleApi.getPublicArticleBySlug(slug, category),
    [slug, category],
  )

  return useAsync(fetcher, [slug, category], {
    queryKey: `articles:detail:${category}:${slug}`,
    enabled: Boolean(slug),
  })
}
