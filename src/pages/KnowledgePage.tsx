import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  ShieldCheck,
  Cpu,
  HardDrive,
  Layers,
  Monitor,
  Globe,
  Server,
  Settings,
  Package,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Article {
  id: number;
  title: string;
  content: string[];
}

interface Section {
  id: string;
  title: string;
  articles: Article[];
}

/* ------------------------------------------------------------------ */
/*  Section icons                                                      */
/* ------------------------------------------------------------------ */
const sectionIcons: Record<string, React.ElementType> = {
  "section-1": BookOpen,
  "section-2": Cpu,
  "section-3": Layers,
  "section-4": HardDrive,
  "section-5": Monitor,
  "section-6": Server,
  "section-7": Globe,
  "section-8": Settings,
  "section-9": Lightbulb,
  "section-10": ShieldCheck,
  "section-11": Cpu,
  "section-12": Package,
  "section-13": AlertTriangle,
  "section-14": ClipboardCheck,
};

/* ------------------------------------------------------------------ */
/*  Keyword to scene mapping                                           */
/* ------------------------------------------------------------------ */
const keywordToScene: Record<string, string> = {
  "推理": "推理",
  "训练": "训练",
  "视频": "视频编解码",
  "编解码": "视频编解码",
  "云桌面": "图形云/云桌面",
  "图形": "图形云/云桌面",
  "替代": "国产替代NVIDIA",
  "信创": "国产替代NVIDIA",
  "边缘": "边缘推理",
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function KnowledgePage() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("section-1");
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  /* Load data */
  useEffect(() => {
    fetch("/knowledge_base.json")
      .then((r) => r.json())
      .then((data: Section[]) => {
        setSections(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* Search */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results: Article[] = [];
    for (const s of sections) {
      for (const a of s.articles) {
        if (a.title.toLowerCase().includes(q)) {
          results.push(a);
        } else {
          const contentText = a.content.join(" ").toLowerCase();
          if (contentText.includes(q)) {
            results.push(a);
          }
        }
      }
    }
    setSearchResults(results);
    setIsSearching(true);
  }, [searchQuery, sections]);

  /* Scroll to section */
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsSearching(false);
    setSearchQuery("");
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  /* Navigate to scene */
  const handleSceneNavigate = (article: Article) => {
    const text = (article.title + " " + article.content.join(" ")).toLowerCase();
    for (const [kw, scene] of Object.entries(keywordToScene)) {
      if (text.includes(kw)) {
        navigate(`/scenes?scene=${encodeURIComponent(scene)}`);
        return;
      }
    }
    // Default: navigate to database
    navigate("/database");
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8 flex items-center justify-center h-64">
        <div className="text-sm" style={{ color: "#94a3b8" }}>加载知识库...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      {/* ===== Header ===== */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5" style={{ color: "#4e6ef2" }} />
          <h1 className="text-lg font-bold" style={{ color: "#1e293b" }}>
            国产GPU选型知识库
          </h1>
        </div>
        <p className="text-xs" style={{ color: "#94a3b8" }}>
          覆盖大模型推理、AI训练、视频编解码、图形云、国产替代、服务器适配等核心场景的选型判断方法
        </p>
      </div>

      {/* ===== Search Bar ===== */}
      <div className="mb-6">
        <div
          className="flex items-center rounded-xl border bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[#4e6ef2]/20"
          style={{ borderColor: "#e2e5ea" }}
        >
          <Search className="w-4 h-4 ml-3" style={{ color: "#c4c7ce" }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索选型问题，例如：显存、T4替代、PoC..."
            className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
            style={{ color: "#334155" }}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setIsSearching(false); }}
              className="px-3 text-xs"
              style={{ color: "#94a3b8" }}
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* ===== Main Layout ===== */}
      <div className="flex gap-6">
        {/* ===== Left Sidebar ===== */}
        <div className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-20 space-y-0.5">
            {sections.map((s) => {
              const Icon = sectionIcons[s.id] || BookOpen;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-all ${
                    isActive
                      ? "font-medium"
                      : "hover:bg-[#f8f9fa]"
                  }`}
                  style={{
                    color: isActive ? "#4e6ef2" : "#64748b",
                    backgroundColor: isActive ? "#f0f2ff" : "transparent",
                  }}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{s.title}</span>
                  <span className="ml-auto text-[10px] shrink-0" style={{ color: "#c4c7ce" }}>
                    {s.articles.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== Content Area ===== */}
        <div className="flex-1 min-w-0" ref={contentRef}>
          {/* Search Results */}
          {isSearching && searchResults.length > 0 && (
            <div className="mb-6">
              <p className="text-xs mb-3" style={{ color: "#64748b" }}>
                找到 {searchResults.length} 条相关内容
              </p>
              <div className="space-y-2">
                {searchResults.slice(0, 10).map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    expanded={expandedArticle === article.id}
                    onToggle={() => setExpandedArticle(
                      expandedArticle === article.id ? null : article.id
                    )}
                    onSceneNavigate={() => handleSceneNavigate(article)}
                  />
                ))}
              </div>
            </div>
          )}

          {isSearching && searchResults.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm" style={{ color: "#94a3b8" }}>
                未找到相关内容，换个关键词试试
              </p>
            </div>
          )}

          {/* Normal Section View */}
          {!isSearching && sections.map((section) => (
            <div key={section.id} id={section.id} className="mb-8">
              {/* Section Header */}
              <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: "#eef0f2" }}>
                {(() => {
                  const Icon = sectionIcons[section.id] || BookOpen;
                  return <Icon className="w-4 h-4" style={{ color: "#4e6ef2" }} />;
                })()}
                <h2 className="text-sm font-semibold" style={{ color: "#1e293b" }}>
                  {section.title}
                </h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: "#94a3b8", backgroundColor: "#f5f6f9" }}>
                  {section.articles.length}
                </span>
              </div>

              {/* Articles */}
              <div className="space-y-2">
                {section.articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    expanded={expandedArticle === article.id}
                    onToggle={() => setExpandedArticle(
                      expandedArticle === article.id ? null : article.id
                    )}
                    onSceneNavigate={() => handleSceneNavigate(article)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t text-center" style={{ borderColor: "#eef0f2" }}>
            <p className="text-[10px]" style={{ color: "#c4c7ce" }}>
              内容仅供参考，实际选型请以产品官方规格和测试结果为准
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Article Card Sub-component                                         */
/* ------------------------------------------------------------------ */
function ArticleCard({
  article,
  expanded,
  onToggle,
  onSceneNavigate,
}: {
  article: Article;
  expanded: boolean;
  onToggle: () => void;
  onSceneNavigate: () => void;
}) {
  const navigate = useNavigate();
  
  // Extract searchable keywords from content
  const getSearchKeywords = (): string[] => {
    const keywords: string[] = [];
    const text = article.title.toLowerCase();
    
    // Extract NVIDIA card references
    const nvidiaMatch = text.match(/(t4|l4|a10|a16|a100|h100|h800|a800|v100|rtx)/i);
    if (nvidiaMatch) {
      keywords.push(`${nvidiaMatch[0]}替代`);
    }
    
    // Extract scene keywords
    const sceneKeywords: Record<string, string> = {
      "推理": "推理",
      "训练": "训练", 
      "视频": "视频",
      "云桌面": "云桌面",
      "图形": "图形",
      "替代": "国产替代",
      "信创": "信创",
      "边缘": "边缘",
    };
    
    for (const [kw, label] of Object.entries(sceneKeywords)) {
      if (text.includes(kw)) {
        keywords.push(label);
        break;
      }
    }
    
    return keywords;
  };

  const keywords = getSearchKeywords();

  // Format content for display
  const formatContent = (lines: string[]): React.ReactElement[] => {
    const elements: React.ReactElement[] = [];
    let tableBuffer: string[][] = [];
    let codeBuffer: string[] = [];
    let inCode = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Code blocks
      if (line.startsWith("```")) {
        if (inCode) {
          elements.push(
            <pre key={`code-${i}`} className="mt-2 p-3 rounded-lg text-[11px] font-mono whitespace-pre-wrap" style={{ backgroundColor: "#f1f5f9", color: "#475569" }}>
              {codeBuffer.join("\n")}
            </pre>
          );
          codeBuffer = [];
        }
        inCode = !inCode;
        continue;
      }
      
      if (inCode) {
        codeBuffer.push(line);
        continue;
      }
      
      // Skip table separator lines
      if (line.includes("---") && line.includes("|")) continue;
      
      // Tables
      if (line.includes("|") && line.trim().startsWith("|")) {
        const cells = line.split("|").filter((c) => c.trim()).map((c) => c.trim());
        if (cells.length >= 2) {
          tableBuffer.push(cells);
        }
        continue;
      } else if (tableBuffer.length > 0) {
        // Render table
        elements.push(
          <div key={`table-${i}`} className="mt-2 overflow-x-auto">
            <table className="w-full text-[11px]" style={{ borderColor: "#eef0f2" }}>
              <tbody>
                {tableBuffer.map((row, ri) => (
                  <tr key={ri} style={{ borderBottom: ri < tableBuffer.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="py-1.5 pr-4"
                        style={{
                          color: ri === 0 ? "#1e293b" : "#64748b",
                          fontWeight: ri === 0 ? 600 : 400,
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableBuffer = [];
      }
      
      // Bold text
      if (line.startsWith("**") && line.endsWith("**")) {
        elements.push(
          <p key={`bold-${i}`} className="mt-2 text-xs font-semibold" style={{ color: "#1e293b" }}>
            {line.replace(/\*\*/g, "")}
          </p>
        );
        continue;
      }
      
      // Bullet points
      if (line.startsWith("- ")) {
        elements.push(
          <div key={`bullet-${i}`} className="flex items-start gap-2 mt-1">
            <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "#94a3b8" }} />
            <span className="text-xs leading-relaxed" style={{ color: "#475569" }}>
              {line.replace(/^-\s*/, "").replace(/\*\*/g, "")}
            </span>
          </div>
        );
        continue;
      }
      
      // Regular text
      if (line.trim()) {
        elements.push(
          <p key={`text-${i}`} className="mt-1 text-xs leading-relaxed" style={{ color: "#475569" }}>
            {line.replace(/\*\*/g, "")}
          </p>
        );
      }
    }
    
    // Render remaining table
    if (tableBuffer.length > 0) {
      elements.push(
        <div key="table-final" className="mt-2 overflow-x-auto">
          <table className="w-full text-[11px]">
            <tbody>
              {tableBuffer.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-1.5 pr-4" style={{ color: ri === 0 ? "#1e293b" : "#64748b", fontWeight: ri === 0 ? 600 : 400 }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    return elements;
  };

  return (
    <div
      className="panel transition-all hover:shadow-sm cursor-pointer"
      style={{ backgroundColor: expanded ? "#fafbfc" : "#fff" }}
      onClick={onToggle}
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
      >
        <span
          className="text-[10px] font-mono w-6 text-center shrink-0"
          style={{ color: "#94a3b8" }}
        >
          #{article.id}
        </span>
        <span className="flex-1 text-sm font-medium truncate" style={{ color: "#334155" }}>
          {article.title}
        </span>
        {expanded ? (
          <ChevronDown className="w-4 h-4 shrink-0" style={{ color: "#c4c7ce" }} />
        ) : (
          <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#c4c7ce" }} />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: "#f1f5f9" }}>
              <div className="pt-3">
                {formatContent(article.content)}
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-4">
                {keywords.map((kw) => (
                  <button
                    key={kw}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/database?search=${encodeURIComponent(kw)}`);
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-md font-medium transition-colors hover:opacity-80"
                    style={{ color: "#4e6ef2", backgroundColor: "#f0f2ff" }}
                  >
                    查看{kw}产品
                  </button>
                ))}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSceneNavigate();
                  }}
                  className="text-[10px] px-2.5 py-1 rounded-md font-medium transition-colors hover:opacity-80"
                  style={{ color: "#10b981", backgroundColor: "#eefcf3" }}
                >
                  场景选型
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
