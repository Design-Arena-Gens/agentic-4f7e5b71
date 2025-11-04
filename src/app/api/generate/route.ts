import { NextResponse } from 'next/server';
import { fetchLatestTechAndSpace } from '@/lib/news';
import { generateYouTubeShort } from '@/lib/summarize';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const maxItemsParam = searchParams.get('maxItems');
    const maxItems = Math.max(1, Math.min(3, Number(maxItemsParam) || 3));

    const items = await fetchLatestTechAndSpace(maxItems);
    if (!items.length) {
      return NextResponse.json({ error: 'No news items found' }, { status: 502 });
    }

    const generated = generateYouTubeShort(items);

    return NextResponse.json({
      ...generated,
      // Include citation objects as well
      citations: generated.items.map((it) => ({ title: it.title, url: it.link, source: it.source })),
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate short' }, { status: 500 });
  }
}
