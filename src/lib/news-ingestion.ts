import { z } from 'zod'

export const NewsArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  content: z.string().optional(),
  summary: z.string().optional(),
  author: z.string().optional(),
  publishedAt: z.string().datetime(),
  source: z.object({
    name: z.string(),
    domain: z.string(),
  }),
  imageUrl: z.string().url().optional(),
  topics: z.array(z.string()).default([]),
})

export type NewsArticle = z.infer<typeof NewsArticleSchema>

export interface NewsSourceConfig {
  id: string
  name: string
  domain: string
  type: 'api' | 'rss'
  apiKey?: string
  rssUrl?: string
  apiEndpoint?: string
  headers?: Record<string, string>
  transform?: (data: unknown) => NewsArticle[]
}

export const DEFAULT_SOURCES: NewsSourceConfig[] = [
  {
    id: 'financial-times',
    name: 'Financial Times',
    domain: 'ft.com',
    type: 'rss',
    rssUrl: 'https://www.ft.com/rss/home/uk',
  },
  {
    id: 'reuters-world',
    name: 'Reuters World News',
    domain: 'reuters.com',
    type: 'rss',
    rssUrl: 'https://feeds.reuters.com/reuters/worldNews',
  },
  {
    id: 'reuters-business',
    name: 'Reuters Business',
    domain: 'reuters.com',
    type: 'rss',
    rssUrl: 'https://feeds.reuters.com/reuters/businessNews',
  },
  {
    id: 'reuters-technology',
    name: 'Reuters Technology',
    domain: 'reuters.com',
    type: 'rss',
    rssUrl: 'https://feeds.reuters.com/reuters/technologyNews',
  },
  {
    id: 'guardian-world',
    name: 'The Guardian World',
    domain: 'theguardian.com',
    type: 'rss',
    rssUrl: 'https://www.theguardian.com/world/rss',
  },
  {
    id: 'guardian-business',
    name: 'The Guardian Business',
    domain: 'theguardian.com',
    type: 'rss',
    rssUrl: 'https://www.theguardian.com/business/rss',
  },
  {
    id: 'guardian-technology',
    name: 'The Guardian Technology',
    domain: 'theguardian.com',
    type: 'rss',
    rssUrl: 'https://www.theguardian.com/technology/rss',
  },
  {
    id: 'economist',
    name: 'The Economist',
    domain: 'economist.com',
    type: 'rss',
    rssUrl: 'https://www.economist.com/finance-and-economics/rss.xml',
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg',
    domain: 'bloomberg.com',
    type: 'rss',
    rssUrl: 'https://feeds.bloomberg.com/markets/news.rss',
  },
  {
    id: 'wsj',
    name: 'Wall Street Journal',
    domain: 'wsj.com',
    type: 'rss',
    rssUrl: 'https://feeds.wsj.com/wsj/xml/rss/3_7014.xml',
  },
  {
    id: 'nature',
    name: 'Nature',
    domain: 'nature.com',
    type: 'rss',
    rssUrl: 'https://www.nature.com/nature.rss',
  },
  {
    id: 'mit-tech-review',
    name: 'MIT Technology Review',
    domain: 'technologyreview.com',
    type: 'rss',
    rssUrl: 'https://www.technologyreview.com/topnews.rss',
  },
  {
    id: 'arstechnica',
    name: 'Ars Technica',
    domain: 'arstechnica.com',
    type: 'rss',
    rssUrl: 'https://feeds.arstechnica.com/arstechnica/index',
  },
]

async function fetchRSSFeed(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'SIGNAL Intelligence Platform/1.0',
      'Accept': 'application/rss+xml, application/xml, text/xml',
    },
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.status}`)
  }

  return response.text()
}

function parseRSSFeed(xml: string): NewsArticle[] {
  const articles: NewsArticle[] = []

  try {
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1]

      const getTag = (tag: string) => {
        const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
        const result = regex.exec(itemXml)
        return result ? result[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : null
      }

      const title = getTag('title')
      const link = getTag('link')
      const description = getTag('description')
      const pubDate = getTag('pubDate')
      const author = getTag('author') || getTag('dc:creator')
      const guid = getTag('guid')

      if (title && link) {
        articles.push({
          id: guid || link,
          title: title.replace(/&[a-z]+;/g, '').trim(),
          url: link,
          content: description?.replace(/<[^>]+>/g, '').trim(),
          summary: description?.replace(/<[^>]+>/g, '').trim(),
          author: author?.replace(/&[a-z]+;/g, '').trim(),
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          source: { name: '', domain: '' },
          topics: [],
        })
      }
    }
  } catch (error) {
    console.error('Error parsing RSS feed:', error)
  }

  return articles
}

export async function fetchFromSource(config: NewsSourceConfig): Promise<NewsArticle[]> {
  if (config.type === 'rss' && config.rssUrl) {
    try {
      const xml = await fetchRSSFeed(config.rssUrl)
      const articles = parseRSSFeed(xml)
      return articles.map(a => ({
        ...a,
        source: { name: config.name, domain: config.domain },
      }))
    } catch (error) {
      console.error(`Error fetching from ${config.name}:`, error)
      return []
    }
  }

  if (config.type === 'api' && config.apiEndpoint && config.apiKey) {
    try {
      const response = await fetch(config.apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'User-Agent': 'SIGNAL Intelligence Platform/1.0',
          ...config.headers,
        },
        next: { revalidate: 1800 },
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return config.transform ? config.transform(data) : []
    } catch (error) {
      console.error(`Error fetching from ${config.name} API:`, error)
      return []
    }
  }

  return []
}

export async function fetchAllSources(sources: NewsSourceConfig[] = DEFAULT_SOURCES): Promise<NewsArticle[]> {
  const results = await Promise.allSettled(
    sources.map(source => fetchFromSource(source))
  )

  const allArticles: NewsArticle[] = []

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value)
    } else {
      console.error(`Failed to fetch from ${sources[index].name}:`, result.reason)
    }
  })

  return deduplicateArticles(allArticles)
}

function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>()
  const unique: NewsArticle[] = []

  for (const article of articles) {
    const normalizedTitle = article.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    const key = `${normalizedTitle.substring(0, 80)}`

    if (!seen.has(key)) {
      seen.add(key)
      unique.push(article)
    }
  }

  return unique
}

export function classifyTopics(title: string, content: string): string[] {
  const text = `${title} ${content}`.toLowerCase()
  const topics: string[] = []

  const topicKeywords: Record<string, string[]> = {
    economics: ['inflation', 'gdp', 'interest rate', 'central bank', 'federal reserve', 'ecb', 'boe', 'monetary policy', 'recession', 'economy', 'economic', 'fiscal', 'deficit', 'debt', 'bond', 'yield', 'treasury'],
    business: ['earnings', 'revenue', 'profit', 'merger', 'acquisition', 'ipo', 'startup', 'funding', 'venture', 'corporate', 'company', 'ceo', 'executive', 'layoff', 'hiring', 'quarterly'],
    technology: ['software', 'hardware', 'chip', 'semiconductor', 'cloud', 'computing', 'platform', 'app', 'digital', 'tech', 'technology', 'innovation', 'product launch', 'device'],
    ai: ['artificial intelligence', 'machine learning', 'llm', 'gpt', 'generative ai', 'neural network', 'deep learning', 'ai model', 'openai', 'anthropic', 'google ai', 'microsoft ai'],
    geopolitics: ['geopolitical', 'diplomacy', 'treaty', 'sanction', 'conflict', 'war', 'peace', 'alliance', 'nato', 'un security council', 'foreign policy', 'state department', 'ministry of foreign affairs'],
    science: ['research', 'study', 'scientist', 'discovery', 'experiment', 'laboratory', 'university', 'peer review', 'publication', 'breakthrough', 'clinical trial'],
    ecommerce: ['e-commerce', 'ecommerce', 'online retail', 'amazon', 'shopify', 'marketplace', 'digital commerce', 'consumer spending', 'retail sales'],
    global_affairs: ['international', 'global', 'world', 'united nations', 'summit', 'conference', 'agreement', 'protocol', 'declaration'],
  }

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      topics.push(topic)
    }
  }

  return topics.length > 0 ? topics : ['global_affairs']
}

export function calculateImportanceScore(article: NewsArticle, sourceCredibility: number = 0.7): number {
  let score = 5.0

  const title = article.title.toLowerCase()
  const content = (article.content || '').toLowerCase()
  const text = `${title} ${content}`

  const highImpactKeywords = [
    'breaking', 'urgent', 'crisis', 'emergency', 'record', 'historic', 'unprecedented',
    'first time', 'major', 'significant', 'critical', 'pivotal', 'landmark',
  ]

  const mediumImpactKeywords = [
    'announced', 'revealed', 'confirmed', 'launched', 'signed', 'approved',
    'rejected', 'delayed', 'extended', 'expanded', 'reduced', 'increased',
  ]

  if (highImpactKeywords.some(kw => text.includes(kw))) score += 2.5
  if (mediumImpactKeywords.some(kw => text.includes(kw))) score += 1.0

  if (article.source.domain === 'ft.com' || article.source.domain === 'economist.com' || article.source.domain === 'bloomberg.com') {
    score += 1.0
  }

  score *= sourceCredibility

  return Math.min(10, Math.max(0, Math.round(score * 10) / 10))
}
