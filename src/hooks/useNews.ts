import { useState, useEffect } from "react";

export interface NewsItem {
  id: number;
  vendor: string;
  model: string;
  title: string;
  summary?: string;
  date: string;
  credibility: string;
  source: string;
  link: string;
}

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorFilter, setVendorFilter] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Load both news files in parallel
        const [apiRes, dataRes] = await Promise.all([
          fetch("/news_api.json").then((r) => (r.ok ? r.json() : [])).catch(() => []),
          fetch("/news_data.json").then((r) => (r.ok ? r.json() : [])).catch(() => []),
        ]);

        const apiNews: NewsItem[] = Array.isArray(apiRes) ? apiRes : [];
        const tableNews: NewsItem[] = Array.isArray(dataRes) ? dataRes : [];

        // Merge: API news first (has summaries), then table news deduped
        const seen = new Set<string>();
        const combined: NewsItem[] = [];

        for (const n of apiNews) {
          if (n.title && !seen.has(n.title)) {
            combined.push(n);
            seen.add(n.title);
          }
        }
        for (const n of tableNews) {
          if (n.title && !seen.has(n.title)) {
            combined.push(n);
            seen.add(n.title);
          }
        }

        if (!cancelled) {
          setNews(combined);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }

      // Check sessionStorage for vendor filter passed from HomePage
      if (!cancelled) {
        const savedVendor = sessionStorage.getItem("newsVendorFilter");
        if (savedVendor) {
          setVendorFilter(savedVendor);
          sessionStorage.removeItem("newsVendorFilter");
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = vendorFilter
    ? news.filter((n) => n.vendor === vendorFilter)
    : news;

  const vendors = [...new Set(news.map((n) => n.vendor))].sort();

  return { news, filtered, loading, vendors, vendorFilter, setVendorFilter };
}
