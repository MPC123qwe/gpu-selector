import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Shield, Filter, X, ExternalLink } from "lucide-react";
import { useNews } from "@/hooks/useNews";
import { vendorColors } from "@/lib/gpuUtils";

export default function NewsPage() {
  const [searchParams] = useSearchParams();
  const targetNewsId = searchParams.get("newsId");
  const { filtered, loading, vendors, vendorFilter, setVendorFilter } = useNews();

  /* Scroll to target news after load */
  useEffect(() => {
    if (!loading && targetNewsId) {
      const el = document.getElementById(`news-${targetNewsId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Highlight temporarily
        el.style.transition = "background-color 0.3s";
        el.style.backgroundColor = "#eff6ff";
        setTimeout(() => {
          el.style.backgroundColor = "";
        }, 2000);
      }
    }
  }, [loading, targetNewsId]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 pb-16">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#1e293b" }}>GPU热点</h1>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
              {loading ? "加载中..." : `共 ${filtered.length} 条热点信息`}
              {vendorFilter && ` · 厂商: ${vendorFilter}`}
            </p>
          </div>
        </div>

        {/* API Notice */}
        <div className="panel p-3 mb-4 flex items-center gap-3" style={{ backgroundColor: "#eff6ff", borderColor: "#dbeafe" }}>
          <Shield className="w-4 h-4 text-[#3b82f6] shrink-0" />
          <p className="text-[11px]" style={{ color: "#475569" }}>
            当前展示基于公开渠道整理的行业动态。如需接入实时新闻API，请在代码中配置 API_CONFIG。
          </p>
        </div>

        {/* Vendor Filter */}
        <div className="panel p-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
            <button
              onClick={() => setVendorFilter("")}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{
                backgroundColor: !vendorFilter ? "rgba(59,130,246,0.08)" : "transparent",
                color: !vendorFilter ? "#2563eb" : "#64748b",
                border: !vendorFilter ? "1px solid rgba(59,130,246,0.15)" : "1px solid transparent",
              }}
            >
              全部
            </button>
            {vendors.map((v) => (
              <button
                key={v}
                onClick={() => setVendorFilter(vendorFilter === v ? "" : v)}
                className="px-3 py-1.5 rounded-md text-xs transition-all"
                style={{
                  backgroundColor: vendorFilter === v ? `${vendorColors[v] || "#3b82f6"}10` : "transparent",
                  color: vendorFilter === v ? (vendorColors[v] || "#2563eb") : "#64748b",
                  border: vendorFilter === v ? `1px solid ${vendorColors[v] || "#3b82f6"}25` : "1px solid transparent",
                }}
              >
                {v}
              </button>
            ))}
            {vendorFilter && (
              <button onClick={() => setVendorFilter("")} className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs" style={{ color: "#94a3b8" }}>
                <X className="w-3 h-3" /> 清除
              </button>
            )}
          </div>
        </div>

        {/* News List */}
        {loading ? (
          <div className="panel p-10 text-center">
            <div className="w-6 h-6 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel p-10 text-center">
            <p className="text-sm" style={{ color: "#64748b" }}>暂无新闻数据</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item, i) => {
              const vc = vendorColors[item.vendor] || "#94a3b8";
              const hasSummary = item.summary && item.summary.trim().length > 0;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.01, 0.3) }}
                  id={`news-${item.id}`}
                  className="panel p-4 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: vc, minHeight: "40px" }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: vc, backgroundColor: `${vc}10` }}>
                          {item.vendor}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "#f1f3f6", color: "#64748b" }}>
                          {item.model}
                        </span>
                        {item.credibility === "高" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#dcfce7] flex items-center gap-0.5" style={{ color: "#15803d" }}>
                            <Shield className="w-2.5 h-2.5" />高可信度
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-medium leading-relaxed" style={{ color: "#1e293b" }}>
                        {item.title}
                      </p>

                      {hasSummary && (
                        <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#64748b" }}>
                          {item.summary}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-[10px]" style={{ color: "#94a3b8" }}>
                          <Clock className="w-2.5 h-2.5" />
                          {item.date || "时间未标注"}
                        </span>
                        {item.source && (
                          <span className="text-[10px]" style={{ color: "#94a3b8" }}>来源: {item.source}</span>
                        )}
                        {item.link && (
                          <a href={item.link.split("|")[0]?.trim() || item.link} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] hover:underline" style={{ color: "#3b82f6" }}
                            onClick={(e) => e.stopPropagation()}>
                            <ExternalLink className="w-2.5 h-2.5" />查看来源
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
