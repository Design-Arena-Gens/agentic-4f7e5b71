import { NewsItem } from './news';

function trimToSentence(text: string, maxChars: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxChars) return clean;
  // Try cutting at punctuation before the limit
  const slice = clean.slice(0, maxChars);
  const lastPunct = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '));
  if (lastPunct > 40) return slice.slice(0, lastPunct + 1).trim();
  return slice.replace(/[,:;\-]+$/,'').trim() + '?';
}

function shortSource(url?: string, source?: string): string | undefined {
  if (source && typeof source === 'string') return source;
  if (!url) return undefined;
  try {
    const u = new URL(url);
    return u.hostname.replace('www.', '');
  } catch {
    return undefined;
  }
}

export type GeneratedShort = {
  title: string;
  script: string;
  hashtags: string[];
  thumbnailText: string;
  visuals: string[];
  items: Array<{ title: string; link: string; source?: string; summary: string }>;
  sources: string[];
};

export function generateYouTubeShort(items: NewsItem[]): GeneratedShort {
  // Generate concise summaries per item
  const perItem = items.map((it) => {
    const base = it.contentSnippet || it.title || '';
    const summary = trimToSentence(base, 180);
    return {
      title: it.title,
      link: it.link,
      source: shortSource(it.link, it.source),
      summary,
    };
  });

  // Build script under ~120-150 words (~50-65s narrated)
  const intro = 'Did you know? Here are the hottest tech and space updates in under a minute!';
  const bullets = perItem.map((p, i) => `#${i + 1}: ${p.title.replace(/\s+/g, ' ').trim()} ? ${p.summary}`);
  const outro = 'Follow for daily TechSpace AI shorts!';

  const script = [intro, ...bullets, outro]
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Title from first item, fallback
  const baseTitle = perItem[0]?.title || 'Today\'s Tech & Space in 60s';
  const title = trimToSentence(baseTitle, 70);

  // Hashtags
  const tagPool = ['#TechSpaceAI', '#TechNews', '#Space', '#AI', '#Science', '#NASA', '#SpaceX', '#Innovation', '#Shorts'];
  const hashtags = tagPool.slice(0, 7);

  // Thumbnail text (bold, 3-5 words)
  const keyWord = perItem[0]?.title?.split(' ').slice(0, 3).join(' ') || 'Tech & Space';
  const thumbnailText = `${keyWord} TODAY`.
    toUpperCase().slice(0, 22);

  // Visual prompts
  const visuals = perItem.map((p) => `Dynamic 9:16 montage: headline '${p.title}', kinetic type over relevant b-roll (e.g., rockets, labs, circuit boards). Subtle HUD lines, neon accents, deep-space background.`);

  return {
    title,
    script,
    hashtags,
    thumbnailText,
    visuals,
    items: perItem,
    sources: perItem.map((p) => p.link),
  };
}
