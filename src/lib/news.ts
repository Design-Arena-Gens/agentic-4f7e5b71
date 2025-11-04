import Parser from 'rss-parser';

export type NewsItem = {
  title: string;
  link: string;
  source?: string;
  isoDate?: string;
  contentSnippet?: string;
};

const parser = new Parser({
  customFields: {
    item: [ ['source', 'source', { keepArray: false }] ],
  },
});

function googleNewsRssUrl(query: string): string {
  const encoded = encodeURIComponent(`${query} when:1d`);
  return `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;
}

export async function fetchLatestTechAndSpace(maxItems: number = 3): Promise<NewsItem[]> {
  const queries = [
    'technology OR tech OR AI OR artificial intelligence',
    'space exploration OR NASA OR SpaceX OR rocket',
  ];

  const feeds = await Promise.all(
    queries.map(async (q) => {
      const feedUrl = googleNewsRssUrl(q);
      // rss-parser performs its own fetching
      const feed = await parser.parseURL(feedUrl);
      return feed.items || [];
    })
  );

  const merged: NewsItem[] = [];
  for (const items of feeds) {
    for (const it of items) {
      merged.push({
        title: it.title || '',
        link: it.link || '',
        source: (it as any).source || (it as any)["source"] || undefined,
        isoDate: it.isoDate,
        contentSnippet: it.contentSnippet || (it as any).contentSnippet,
      });
    }
  }

  // De-duplicate by title
  const uniqueMap = new Map<string, NewsItem>();
  for (const item of merged) {
    const key = item.title.trim();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  }

  // Sort by isoDate descending, fallback by title
  const unique = Array.from(uniqueMap.values()).sort((a, b) => {
    const da = a.isoDate ? Date.parse(a.isoDate) : 0;
    const db = b.isoDate ? Date.parse(b.isoDate) : 0;
    return db - da || a.title.localeCompare(b.title);
  });

  return unique.slice(0, Math.max(1, Math.min(3, maxItems)));
}
