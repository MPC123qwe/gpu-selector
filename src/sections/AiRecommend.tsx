import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, CheckCircle, Cpu } from "lucide-react";
import type { GPUProduct } from "@/types/gpu";
import { vendorColors } from "@/lib/gpuUtils";

interface RecommendResult {
  model: string;
  vendor: string;
  reason: string;
  score: number;
  specs: {
    int8?: string;
    fp16?: string;
    vram?: string;
    tdp?: string;
    form?: string;
  };
}

interface Props {
  products: GPUProduct[];
  onViewDetail: (p: GPUProduct) => void;
}

// Build compact product data for API prompt
function buildProductData(products: GPUProduct[]): string {
  return products
    .map(
      (p) =>
        `- ${p.产品型号}(${p.厂商}): ${p.产品定位}, INT8=${p.INT8算力 || "?"}, FP16=${p.FP16算力 || "?"}, 显存=${p.显存容量 || "?"}, 功耗=${p.TDP功耗 || "?"}, 形态=${p.接口形态 || "?"}, 场景=${p.适合场景标签 || ""} ${p.主要应用场景 || ""}, 对标=${p.可参考对标NVIDIA || "?"}, 生态=${p.生态成熟度 || "?"}, 适配=${p.适配难度 || "?"}`
    )
    .join("\n");
}

const API_KEY = "sk-Diat57yDZ3zbVUiCXKgkUNAfe2JWoCVv6a5aA03973Ff43Be9a7e641e9dDb6f79";
const API_URL = "https://api.senseaudio.cn/v1/chat/completions";
const API_MODEL = "deepseek-v4-pro";

export default function AiRecommend({ products, onViewDetail }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendResult[]>([]);
  const [error, setError] = useState("");

  const quickPrompts = [
    "我要做视频编解码和内容审核",
    "大模型推理部署，需要高显存",
    "边缘低功耗场景，预算有限",
    "AI训练集群，8卡互联",
    "企业私有化部署，国产替代",
    "云桌面vGPU虚拟化",
  ];

  const handleRecommend = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const productData = buildProductData(products);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: API_MODEL,
          messages: [
            {
              role: "system",
              content: `你是国产GPU/AI加速卡选型专家。请根据用户需求，从以下产品中推荐3-5款最合适的卡。

可用产品列表：
${productData}

请严格返回JSON数组，格式如下：
[{"model":"产品型号","vendor":"厂商","reason":"推荐理由(80字内)","score":匹配度1-100,"specs":{"int8":"INT8算力","fp16":"FP16算力","vram":"显存","tdp":"功耗","form":"形态"}}]

推荐理由要专业、具体，说明为什么适合该场景。只返回JSON，不要其他文字。`,
            },
            {
              role: "user",
              content: `用户需求：${input.trim()}`,
            },
          ],
          temperature: 0.5,
          max_tokens: 3000,
        }),
      });

      if (!res.ok) {
        throw new Error(`API 请求失败: ${res.status}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("API 返回为空");

      let parsed: RecommendResult[];
      try {
        parsed = JSON.parse(content);
      } catch {
        const match = content.match(/\[.*\]/s);
        if (match) parsed = JSON.parse(match[0]);
        else throw new Error("无法解析推荐结果");
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("未获得有效推荐");
      }

      setResults(parsed);
    } catch (err: any) {
      // CORS blocked - fallback to local matching
      console.log("API failed, using local matching:", err.message);
      const fallback = localRecommend(input.trim(), products);
      if (fallback.length > 0) {
        setResults(fallback);
      } else {
        setError("AI推荐服务暂不可用，请刷新重试或尝试其他关键词。");
      }
    } finally {
      setLoading(false);
    }
  }, [input, products]);

  return (
    <section className="py-6">
      <div className="panel p-6" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)" }}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <div>
            <h2 className="text-base font-semibold" style={{ color: "#1e293b" }}>AI 智能推荐</h2>
            <p className="text-[11px]" style={{ color: "#64748b" }}>描述你的需求，AI 自动推荐合适的加速卡</p>
          </div>
        </div>

        {/* Input */}
        <div className="relative mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleRecommend()}
            placeholder="例如：我要搭建视频编解码服务器，需要低功耗、支持多路1080P解码的卡..."
            className="w-full h-11 pl-4 pr-14 rounded-lg border bg-white text-sm placeholder:text-[#94a3b8]/60 focus:outline-none focus:border-[#3b82f6]/40 focus:ring-1 focus:ring-[#3b82f6]/10 transition-all"
            style={{ borderColor: "#e2e5ea", color: "#334155" }}
          />
          <button
            onClick={handleRecommend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-3 rounded-md text-xs font-medium transition-all disabled:opacity-40 flex items-center gap-1"
            style={{
              backgroundColor: loading ? "rgba(59,130,246,0.06)" : "rgba(59,130,246,0.1)",
              color: "#2563eb",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            {loading ? "分析中" : "推荐"}
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickPrompts.map((p) => (
            <button
              key={p}
              onClick={() => { setInput(p); setResults([]); setError(""); }}
              className="px-3 py-1.5 rounded-full border bg-white text-xs transition-all hover:shadow-sm"
              style={{ borderColor: "#e2e5ea", color: "#64748b" }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-md border mb-4" style={{ backgroundColor: "#fef2f2", borderColor: "#fecaca" }}>
            <p className="text-xs" style={{ color: "#dc2626" }}>{error}</p>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3 pt-3" style={{ borderTop: "1px solid #e2e5ea" }}>
                <CheckCircle className="w-3.5 h-3.5 text-[#22c55e]" />
                <span className="text-xs font-medium" style={{ color: "#15803d" }}>
                  AI 为您推荐以下 {results.length} 款加速卡
                </span>
              </div>

              <div className="space-y-3">
                {results.map((r, i) => {
                  const vc = vendorColors[r.vendor] || "#94a3b8";
                  const product = products.find(
                    (p) => p.产品型号 === r.model || p.产品型号.includes(r.model)
                  );
                  return (
                    <motion.div
                      key={r.model}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="panel p-4 hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => product && onViewDetail(product)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: vc, minHeight: "40px" }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: vc, backgroundColor: `${vc}10` }}>
                              {r.vendor}
                            </span>
                            <span className="text-sm font-semibold" style={{ color: "#1e293b" }}>{r.model}</span>
                            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: r.score >= 80 ? "#dcfce7" : r.score >= 60 ? "#fef9c3" : "#fee2e2", color: r.score >= 80 ? "#15803d" : r.score >= 60 ? "#a16207" : "#dc2626" }}>
                              匹配度 {r.score}%
                            </span>
                          </div>

                          <p className="text-xs leading-relaxed mb-2" style={{ color: "#475569" }}>
                            {r.reason}
                          </p>

                          {/* Specs */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {r.specs.int8 && r.specs.int8 !== "?" && (
                              <span className="text-[10px] font-mono" style={{ color: "#64748b" }}>INT8: {r.specs.int8}</span>
                            )}
                            {r.specs.fp16 && r.specs.fp16 !== "?" && (
                              <span className="text-[10px] font-mono" style={{ color: "#64748b" }}>FP16: {r.specs.fp16}</span>
                            )}
                            {r.specs.vram && r.specs.vram !== "?" && (
                              <span className="text-[10px] font-mono" style={{ color: "#64748b" }}>显存: {r.specs.vram}</span>
                            )}
                            {r.specs.tdp && r.specs.tdp !== "?" && (
                              <span className="text-[10px] font-mono" style={{ color: "#64748b" }}>功耗: {r.specs.tdp}</span>
                            )}
                            {r.specs.form && r.specs.form !== "?" && (
                              <span className="text-[10px] font-mono" style={{ color: "#64748b" }}>形态: {r.specs.form}</span>
                            )}
                          </div>

                          {product && (
                            <div className="mt-2 flex items-center gap-1 text-[10px]" style={{ color: "#3b82f6" }}>
                              <Cpu className="w-2.5 h-2.5" /> 点击查看完整参数
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ---- Local fallback recommendation engine ----
function localRecommend(query: string, products: GPUProduct[]): RecommendResult[] {
  const q = query.toLowerCase();
  const keywords: Record<string, string[]> = {
    "视频": ["视频", "编解码", "解码", "编码", "安防", "内容审核"],
    "推理": ["推理", "大模型推理", "LLM", "边缘推理"],
    "训练": ["训练", "深度学习", "分布式训练", "大模型训练"],
    "边缘": ["边缘", "低功耗", "嵌入式", "终端"],
    "云桌面": ["云桌面", "vGPU", "虚拟化", "VDI"],
    "图形": ["图形", "渲染", "云桌面"],
    "国产": ["国产", "信创", "国产化", "替代"],
    "高密度": ["高密度", "数据中心", "集群"],
    "大模型": ["大模型", "LLM", "Transformer"],
    "hpc": ["HPC", "科学计算"],
  };

  // Score each product
  const scored = products.map((p) => {
    let score = 0;
    const text = `${p.产品定位} ${p.适合场景标签} ${p.主要应用场景} ${p.核心优势} ${p.产品类型}`.toLowerCase();

    // Keyword matching
    for (const [category, words] of Object.entries(keywords)) {
      if (q.includes(category)) {
        for (const w of words) {
          if (text.includes(w)) score += 15;
        }
      }
    }

    // Direct text match
    if (text.includes(q)) score += 20;

    // Boost high priority products
    if (p.展示优先级 === "高") score += 5;
    if (p.是否官方可验证?.includes("是")) score += 3;

    return { product: p, score };
  });

  // Sort and take top 5
  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter((s) => s.score > 0).slice(0, 5);

  return top.map((s) => {
    const p = s.product;
    return {
      model: p.产品型号,
      vendor: p.厂商,
      reason: p.推荐理由短句 || `${p.产品定位}，适合${p.适合场景标签 || p.主要应用场景 || "多种场景"}`,
      score: Math.min(95, Math.max(50, s.score + 40)),
      specs: {
        int8: p.INT8算力 || "?",
        fp16: p.FP16算力 || "?",
        vram: p.显存容量 || "?",
        tdp: p.TDP功耗 || "?",
        form: p.接口形态 || "?",
      },
    };
  });
}
