#!/usr/bin/env node
/**
 * 抓取国产 GPU / AI 加速卡热点新闻
 * 用法: node scripts/fetch-news.mjs
 * 输出: public/news_api.json
 */

import { writeFileSync, existsSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_KEY = "sk-Diat57yDZ3zbVUiCXKgkUNAfe2JWoCVv6a5aA03973Ff43Be9a7e641e9dDb6f79";
const BASE_URL = "https://api.senseaudio.cn/v1";
const MODEL = "deepseek-v4-flash";

// Load existing news to preserve
function loadExisting() {
  const paths = [
    join(__dirname, "../public/news_api.json"),
    join(__dirname, "../public/news_data.json"),
  ];
  const all = [];
  for (const p of paths) {
    if (existsSync(p)) {
      try {
        const data = JSON.parse(readFileSync(p, "utf-8"));
        if (Array.isArray(data)) all.push(...data);
      } catch { /* ignore */ }
    }
  }
  return all;
}

async function fetchNews() {
  console.log("[fetch-news] Calling API...");

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "你是国产GPU/AI芯片行业资深分析师。请严格返回JSON数组，不要有任何其他文字。",
        },
        {
          role: "user",
          content: `请列出2024-2025年国产GPU/NPU/AI加速卡领域的8-10条最新热点新闻。
涉及厂商：华为昇腾、摩尔线程、寒武纪、海光信息、天数智芯、壁仞科技、燧原科技、沐曦科技、昆仑芯。
每条严格JSON格式：
{"id":数字,"vendor":"厂商","model":"型号","title":"标题(30字内)","summary":"摘要(100字内)","date":"时间如2025年","credibility":"高/中/低","source":"来源"}
id从4001开始递增。只输出JSON数组，不要任何其他文字。`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!res.ok) {
    throw new Error(`API HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response content");

  // Parse JSON
  let news;
  try {
    news = JSON.parse(content);
  } catch {
    const match = content.match(/\[.*\]/s);
    if (match) news = JSON.parse(match[0]);
    else throw new Error("Cannot parse JSON from response");
  }

  if (!Array.isArray(news) || news.length === 0) {
    throw new Error("Invalid news array");
  }

  // Clean
  return news
    .filter((n) => n.title && n.vendor)
    .map((n) => ({
      id: n.id || Math.floor(Math.random() * 100000),
      vendor: n.vendor,
      model: n.model || "",
      title: n.title,
      summary: n.summary || "",
      date: n.date || "2025年",
      credibility: n.credibility || "中",
      source: n.source || "网络",
      link: n.link || "",
    }));
}

async function main() {
  try {
    // 1. Fetch fresh news from API
    const freshNews = await fetchNews();
    console.log(`[fetch-news] Fetched ${freshNews.length} items from API`);
    for (const n of freshNews) {
      console.log(`  - [${n.vendor}] ${n.title}`);
    }

    // 2. Load existing news
    const existing = loadExisting();
    console.log(`[fetch-news] Loaded ${existing.length} existing items`);

    // 3. Merge: fresh first, then existing deduped
    const seen = new Set();
    const merged = [];

    for (const n of freshNews) {
      const key = `${n.vendor}|${n.title}`;
      if (!seen.has(key)) {
        merged.push(n);
        seen.add(key);
      }
    }
    for (const n of existing) {
      const key = `${n.vendor}|${n.title}`;
      if (!seen.has(key)) {
        merged.push(n);
        seen.add(key);
      }
    }

    // 4. Save
    const outputPath = join(__dirname, "../public/news_api.json");
    writeFileSync(outputPath, JSON.stringify(merged, null, 2), "utf-8");
    console.log(`[fetch-news] Saved ${merged.length} items to ${outputPath}`);
    console.log("[fetch-news] Done!");
  } catch (err) {
    console.error(`[fetch-news] Error: ${err.message}`);
    // If fetch fails, keep existing file
    console.log("[fetch-news] Keeping existing news file.");
    process.exit(0); // Don't fail the build
  }
}

main();
