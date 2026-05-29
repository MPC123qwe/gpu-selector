import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  User,
  Bot,
  Lightbulb,
  ArrowRight,
  Cpu,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { GPUProduct } from "@/types/gpu";
import { vendorColors } from "@/lib/gpuUtils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  cards?: RecommendCard[];
}

interface RecommendCard {
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

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const API_KEY =
  "sk-Diat57yDZ3zbVUiCXKgkUNAfe2JWoCVv6a5aA03973Ff43Be9a7e641e9dDb6f79";
const API_URL = "https://api.senseaudio.cn/v1/chat/completions";
const API_MODEL = "deepseek-v4-pro";

const WELCOME_MSG: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "你好！我是国产GPU选型助手。请告诉我你的应用场景和需求，比如：\n\n• 我要搭建大模型推理服务器\n• 需要视频编解码+内容审核，低功耗\n• AI训练集群，8卡互联\n\n我会根据你的需求推荐最合适的加速卡，并给出详细的选型理由。",
};

const SUGGESTIONS = [
  "我要做视频编解码和内容审核",
  "大模型推理部署，需要高显存",
  "边缘低功耗场景，预算有限",
  "AI训练集群，8卡互联",
  "企业私有化部署，国产替代",
  "云桌面vGPU虚拟化",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
/* Build product list — all products with key fields */
function buildProductData(products: GPUProduct[]): string {
  return products
    .map(
      (p) =>
        `- ${p.产品型号}(${p.厂商}): ${p.产品定位}, INT8=${p.INT8算力 || "?"}, FP16=${p.FP16算力 || "?"}, 显存=${p.显存容量 || "?"}, 功耗=${p.TDP功耗 || "?"}, 场景=${p.适合场景标签 || ""}, 对标=${p.可参考对标NVIDIA || "?"}`
    )
    .join("\n");
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ------------------------------------------------------------------ */
/*  Local fallback                                                     */
/* ------------------------------------------------------------------ */
function localRecommend(query: string, products: GPUProduct[]): RecommendCard[] {
  const q = query.toLowerCase();
  const keywords: Record<string, string[]> = {
    视频: ["视频", "编解码", "解码", "编码", "安防", "内容审核"],
    推理: ["推理", "大模型推理", "LLM", "边缘推理"],
    训练: ["训练", "深度学习", "分布式训练", "大模型训练"],
    边缘: ["边缘", "低功耗", "嵌入式", "终端"],
    云桌面: ["云桌面", "vGPU", "虚拟化", "VDI"],
    图形: ["图形", "渲染", "云桌面"],
    国产: ["国产", "信创", "国产化", "替代"],
    高密度: ["高密度", "数据中心", "集群"],
    大模型: ["大模型", "LLM", "Transformer"],
    hpc: ["HPC", "科学计算"],
  };

  const scored = products.map((p) => {
    let score = 0;
    const text = `${p.产品定位} ${p.适合场景标签} ${p.主要应用场景} ${p.核心优势} ${p.产品类型}`.toLowerCase();

    for (const [category, words] of Object.entries(keywords)) {
      if (q.includes(category)) {
        for (const w of words) {
          if (text.includes(w)) score += 15;
        }
      }
    }

    if (text.includes(q)) score += 20;
    if (p.展示优先级 === "高") score += 5;
    if (p.是否官方可验证?.includes("是")) score += 3;

    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter((s) => s.score > 0).slice(0, 5);

  return top.map((s) => {
    const p = s.product;
    return {
      model: p.产品型号,
      vendor: p.厂商,
      reason:
        p.推荐理由短句 ||
        `${p.产品定位}，适合${p.适合场景标签 || p.主要应用场景 || "多种场景"}`,
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

/* ------------------------------------------------------------------ */
/*  SSE Parser                                                         */
/* ------------------------------------------------------------------ */
async function* streamSSE(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") return;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        /* ignore parse errors */
      }
    }
  }

  if (buffer.trim()) {
    const trimmed = buffer.trim();
    if (trimmed.startsWith("data: ")) {
      const data = trimmed.slice(6);
      if (data !== "[DONE]") {
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          /* ignore */
        }
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Extract cards from text                                            */
/* ------------------------------------------------------------------ */
function extractCards(text: string): { displayText: string; cards: RecommendCard[] } {
  const jsonMatch = text.match(/\[\[JSON_START\]\](.*?)\[\[JSON_END\]\]/s);
  if (!jsonMatch) return { displayText: text, cards: [] };

  try {
    const cards: RecommendCard[] = JSON.parse(jsonMatch[1].trim());
    const displayText = text.replace(/\[\[JSON_START\]\].*?\[\[JSON_END\]\]/s, "").trim();
    return { displayText, cards };
  } catch {
    return { displayText: text, cards: [] };
  }
}



/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function AiChatPage({ products, onViewDetail }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState(""); // real-time streaming text
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, streamText]);

  /* auto-resize textarea */
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  /* ---------------------------------------------------------------- */
  /*  Send message (streaming)                                          */
  /* ---------------------------------------------------------------- */
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { id: uid(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setStreamText("");

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
              content: `你是国产GPU/AI加速卡选型资深专家，熟悉华为昇腾、摩尔线程、寒武纪、海光、壁仞、天数智芯、燧原、沐曦、昆仑芯、芯动科技、平头哥、砺算科技等所有国产GPU厂商的产品和技术特点。请结合你的行业知识、最新市场动态，以及以下产品参考数据，为用户推荐最合适的国产加速卡。

参考产品数据（共${products.length}款）：
${productData}

## 回复要求

### 第一部分：产品推荐
对每款产品，请按以下结构详细说明：

**产品名**（厂商）
- **匹配度分析**：为什么这款卡适合用户的需求？从技术角度详细分析（2-3句话）
- **核心优势**：该卡最突出的2-3个技术亮点
- **关键参数**：INT8/FP16算力、显存、功耗
- **局限性**：需要注意的问题（1-2句话）
- **部署建议**：单卡/4卡/8卡/集群

### 第二部分：总结建议（1-2句）
给出综合选型优先级建议

### 第三部分：推荐卡片JSON（最后输出）
[[JSON_START]]
[{"model":"产品型号","vendor":"厂商","reason":"推荐理由(100字内)","score":匹配度1-100,"specs":{"int8":"INT8算力","fp16":"FP16算力","vram":"显存","tdp":"功耗","form":"形态"}}]
[[JSON_END]]

注意：
- 产品推荐部分必须详细，每款产品至少5-6行分析
- 匹配度分析要具体到技术参数，不要泛泛而谈
- 可以推荐列表外的知名国产GPU
- JSON必须严格符合格式，放在所有文字内容之后
- score根据匹配度给合理分数`,
            },
            { role: "user", content: `需求：${text}` },
          ],
          temperature: 0.5,
          max_tokens: 4000,
          stream: true,
        }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);

      /* ---- SSE streaming ---- */
      let fullText = "";
      for await (const chunk of streamSSE(res)) {
        fullText += chunk;
        setStreamText(fullText);
      }

      /* ---- Extract cards from final text ---- */
      const { displayText, cards } = extractCards(fullText);

      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: displayText || fullText,
        cards: cards.length > 0 ? cards : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setStreamText("");
    } catch (err: any) {
      console.log("API failed, fallback:", err.message);
      const fallback = localRecommend(text, products);

      if (fallback.length > 0) {
        const intro = `根据你的需求「${text}」，我从${products.length}款国产加速卡中筛选了以下${fallback.length}款最匹配的产品：`;
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            content: intro,
            cards: fallback,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            content:
              "抱歉，没有找到完全匹配的产品。请尝试用不同的关键词描述你的需求，比如「推理」「训练」「视频编解码」「低功耗」等。",
          },
        ]);
      }
      setStreamText("");
    } finally {
      setLoading(false);
    }
  }, [input, loading, products]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 h-[calc(100vh-3.5rem)] flex flex-col">
      {/* ---- Chat area ---- */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              msg={msg}
              products={products}
              onViewDetail={onViewDetail}
            />
          ))}
        </AnimatePresence>

        {/* Streaming message (real-time) */}
        {streamText && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-[#10b981]" />
            </div>
            <div
              className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed max-w-[80%]"
              style={{ backgroundColor: "#f1f5f9", color: "#475569" }}
            >
              <MarkdownRender text={streamText} isUser={false} />
              <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-[#3b82f6] animate-pulse rounded-sm" />
            </div>
          </motion.div>
        )}

        {loading && !streamText && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center shrink-0 mt-0.5">
              <Loader2 className="w-4 h-4 text-[#3b82f6] animate-spin" />
            </div>
            <div
              className="px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[80%]"
              style={{ backgroundColor: "#f1f5f9", color: "#475569" }}
            >
              正在分析你的需求，匹配最合适的加速卡…
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ---- Suggestions ---- */}
      {messages.length === 1 && (
        <div className="pb-3">
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Lightbulb className="w-3 h-3" style={{ color: "#94a3b8" }} />
            <span className="text-[11px]" style={{ color: "#94a3b8" }}>
              试试以下需求
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setInput(s);
                  inputRef.current?.focus();
                }}
                className="px-3 py-1.5 rounded-full border bg-white text-xs transition-all hover:shadow-sm hover:border-[#3b82f6]/30"
                style={{ borderColor: "#e2e5ea", color: "#64748b" }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- Input bar ---- */}
      <div className="pb-4 pt-2">
        <div
          className="flex items-end gap-2 p-2 rounded-xl border bg-white transition-all focus-within:ring-1 focus-within:ring-[#3b82f6]/10 focus-within:border-[#3b82f6]/40"
          style={{ borderColor: "#e2e5ea" }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入 GPU 型号 / 厂商 / 场景 / 对标卡，例如：S4000、Atlas 300I、A10替代、视频编解码"
            rows={1}
            className="flex-1 resize-none bg-transparent px-3 py-2 text-sm placeholder:text-[#94a3b8]/60 focus:outline-none max-h-[120px]"
            style={{ color: "#334155" }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
            style={{
              backgroundColor:
                loading || !input.trim()
                  ? "rgba(59,130,246,0.06)"
                  : "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 text-[#3b82f6] animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-[#2563eb]" />
            )}
          </button>
        </div>
        <p
          className="text-center mt-1.5"
          style={{ color: "#94a3b8", fontSize: "10px" }}
        >
          AI推荐结果基于产品数据库和智能匹配算法，仅供参考
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ChatBubble sub-component                                           */
/* ------------------------------------------------------------------ */
function ChatBubble({
  msg,
  products,
  onViewDetail,
}: {
  msg: ChatMessage;
  products: GPUProduct[];
  onViewDetail: (p: GPUProduct) => void;
}) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{
          backgroundColor: isUser
            ? "rgba(59,130,246,0.1)"
            : "rgba(16,185,129,0.1)",
        }}
      >
        {isUser ? (
          <User className="w-4 h-4 text-[#3b82f6]" />
        ) : (
          <Bot className="w-4 h-4 text-[#10b981]" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser ? "rounded-tr-sm" : "rounded-tl-sm"
          }`}
          style={{
            backgroundColor: isUser ? "rgba(59,130,246,0.08)" : "#f1f5f9",
            color: isUser ? "#1e40af" : "#475569",
          }}
        >
          <MarkdownRender text={msg.content} isUser={isUser} />
        </div>

        {/* Recommendation cards */}
        {!isUser && msg.cards && msg.cards.length > 0 && (
          <div className="mt-3 space-y-2.5">
            {msg.cards.map((card, i) => {
              const vc = vendorColors[card.vendor] || "#94a3b8";
              const product = products.find(
                (p) =>
                  p.产品型号 === card.model ||
                  p.产品型号.includes(card.model)
              );

              return (
                <motion.div
                  key={card.model + i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="panel p-4 hover:shadow-md transition-all cursor-pointer border-l-[3px]"
                  style={{ borderLeftColor: vc }}
                  onClick={() => product && onViewDetail(product)}
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{
                        color: vc,
                        backgroundColor: `${vc}15`,
                      }}
                    >
                      {card.vendor}
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "#1e293b" }}
                    >
                      {card.model}
                    </span>
                    <span
                      className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor:
                          card.score >= 80
                            ? "#dcfce7"
                            : card.score >= 60
                              ? "#fef9c3"
                              : "#fee2e2",
                        color:
                          card.score >= 80
                            ? "#15803d"
                            : card.score >= 60
                              ? "#a16207"
                              : "#dc2626",
                      }}
                    >
                      匹配度 {card.score}%
                    </span>
                  </div>

                  {/* Reason */}
                  <p
                    className="text-xs leading-relaxed mb-2.5"
                    style={{ color: "#475569" }}
                  >
                    {card.reason}
                  </p>

                  {/* Specs row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {card.specs.int8 && card.specs.int8 !== "?" && (
                      <span
                        className="text-[10px] font-mono"
                        style={{ color: "#64748b" }}
                      >
                        INT8: {card.specs.int8}
                      </span>
                    )}
                    {card.specs.fp16 && card.specs.fp16 !== "?" && (
                      <span
                        className="text-[10px] font-mono"
                        style={{ color: "#64748b" }}
                      >
                        FP16: {card.specs.fp16}
                      </span>
                    )}
                    {card.specs.vram && card.specs.vram !== "?" && (
                      <span
                        className="text-[10px] font-mono"
                        style={{ color: "#64748b" }}
                      >
                        显存: {card.specs.vram}
                      </span>
                    )}
                    {card.specs.tdp && card.specs.tdp !== "?" && (
                      <span
                        className="text-[10px] font-mono"
                        style={{ color: "#64748b" }}
                      >
                        功耗: {card.specs.tdp}
                      </span>
                    )}
                    {card.specs.form && card.specs.form !== "?" && (
                      <span
                        className="text-[10px] font-mono"
                        style={{ color: "#64748b" }}
                      >
                        形态: {card.specs.form}
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  {product && (
                    <div
                      className="mt-2.5 flex items-center gap-1 text-[10px] font-medium"
                      style={{ color: "#3b82f6" }}
                    >
                      <Cpu className="w-3 h-3" />
                      查看完整参数
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Markdown Renderer                                                  */
/* ------------------------------------------------------------------ */
function MarkdownRender({ text, isUser }: { text: string; isUser: boolean }) {
  const baseColor = isUser ? "#1e40af" : "#475569";
  const strongColor = isUser ? "#1e3a5f" : "#1e293b";
  const liMarker = isUser ? "#60a5fa" : "#94a3b8";

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        /* Headings */
        h1: ({ children }) => (
          <h1 className="text-base font-bold mt-3 mb-2" style={{ color: strongColor }}>
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-bold mt-3 mb-1.5" style={{ color: strongColor }}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold mt-2.5 mb-1" style={{ color: strongColor }}>
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-xs font-semibold mt-2 mb-1 uppercase tracking-wide" style={{ color: "#64748b" }}>
            {children}
          </h4>
        ),
        /* Bold / Strong */
        strong: ({ children }) => (
          <strong style={{ color: strongColor, fontWeight: 600 }}>{children}</strong>
        ),
        /* Paragraph */
        p: ({ children }) => (
          <p className="mb-2 last:mb-0" style={{ color: baseColor }}>{children}</p>
        ),
        /* Lists */
        ul: ({ children }) => (
          <ul className="mb-2 space-y-0.5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 space-y-0.5 list-decimal list-inside">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="flex items-start gap-2 text-xs leading-relaxed">
            <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: liMarker }} />
            <span style={{ color: baseColor }}>{children}</span>
          </li>
        ),
        /* Code (inline) */
        code: ({ children }) => (
          <code
            className="px-1 py-0.5 rounded text-[11px] font-mono"
            style={{
              backgroundColor: isUser ? "rgba(59,130,246,0.1)" : "rgba(100,116,139,0.1)",
              color: isUser ? "#2563eb" : "#64748b",
            }}
          >
            {children}
          </code>
        ),
        /* Horizontal rule */
        hr: () => <hr className="my-3 border-t" style={{ borderColor: isUser ? "rgba(59,130,246,0.15)" : "#e2e8f0" }} />,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
