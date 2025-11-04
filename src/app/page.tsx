"use client";

import { useState } from 'react';
import CopyButton from '@/components/CopyButton';

type ApiResult = {
  title: string;
  script: string;
  hashtags: string[];
  thumbnailText: string;
  visuals: string[];
  items: Array<{ title: string; link: string; source?: string; summary: string }>;
  sources: string[];
  citations: Array<{ title: string; url: string; source?: string }>;
};

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate?maxItems=3', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setData(json);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <div className="title">TechSpace AI</div>
          <div className="subtitle">Autonomous news curator and YouTube Short script generator</div>
        </div>
        <span className="badge">9:16 Short ? under 60s</span>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="row">
          <div className="col">
            <div className="sectionTitle">Step 1</div>
            <p>Fetch latest technology and space news from Google News (past 24h) and generate a concise, narrated script.</p>
            <button className="button" onClick={generate} disabled={loading}>
              {loading ? 'Generating?' : 'Generate Now'}
            </button>
          </div>
          <div className="col">
            <div className="sectionTitle">Tip</div>
            <p className="small">All items cite original sources. Use the copy buttons to paste into your editor or uploader.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginTop: 16, borderColor: '#7b2d2d' }}>
          <div className="sectionTitle">Error</div>
          <div className="code">{error}</div>
        </div>
      )}

      {data && (
        <div className="row" style={{ marginTop: 16 }}>
          <div className="col">
            <div className="card">
              <div className="sectionTitle">YouTube Title</div>
              <div className="code">{data.title}</div>
              <div className="copyRow">
                <CopyButton text={data.title} />
              </div>

              <div className="sectionTitle">Script (under 60s)</div>
              <div className="code" style={{ minHeight: 120 }}>{data.script}</div>
              <div className="copyRow">
                <CopyButton text={data.script} />
              </div>

              <div className="sectionTitle">Hashtags</div>
              <div className="code">{data.hashtags.join(' ')}</div>
              <div className="copyRow">
                <CopyButton text={data.hashtags.join(' ')} />
              </div>

              <div className="sectionTitle">Thumbnail Text</div>
              <div className="code">{data.thumbnailText}</div>
              <div className="copyRow">
                <CopyButton text={data.thumbnailText} />
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card">
              <div className="sectionTitle">News Items & Citations</div>
              {data.items.map((it, idx) => (
                <div key={idx} style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700 }}>{it.title}</div>
                  <div className="small" style={{ margin: '4px 0' }}>{it.summary}</div>
                  <a className="link small" href={data.citations[idx]?.url} target="_blank" rel="noreferrer">
                    Source: {data.citations[idx]?.source || 'link'}
                  </a>
                </div>
              ))}

              <div className="sectionTitle">Visual Prompts (Optional)</div>
              <ul>
                {data.visuals.map((v, i) => (
                  <li key={i} className="small">{v}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="small" style={{ marginTop: 24 }}>
        Sources are cited from Google News results. Uses only public information.
      </div>
    </div>
  );
}
