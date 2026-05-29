import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Newspaper, ArrowRight, Clock, Shield } from "lucide-react";
import { useNews } from "@/hooks/useNews";
import { vendorColors } from "@/lib/gpuUtils";

export default function NewsSection() {
  const navigate = useNavigate();
  const { news, loading } = useNews();
  const latest = news.slice(0, 8);

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-[#3b82f6]" />
          <h2 className="text-base font-semibold" style={{ color: "#1e293b" }}>GPU卡实时热点</h2>
        </div>
        <button
          onClick={() => navigate("/news")}
          className="flex items-center gap-1 text-xs transition-colors"
          style={{ color: "#3b82f6" }}
        >
          查看全部 <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {loading ? (
        <div className="panel p-6 text-center">
          <div className="w-5 h-5 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : latest.length === 0 ? (
        <div className="panel p-6 text-center text-sm" style={{ color: "#94a3b8" }}>
          暂无新闻数据
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {latest.map((item, i) => {
            const vc = vendorColors[item.vendor] || "#94a3b8";
            const hasSummary = item.summary && item.summary.trim().length > 0;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="panel p-4 cursor-pointer hover:shadow-md transition-all duration-200 flex flex-col"
                onClick={() => navigate("/news")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: vc, backgroundColor: `${vc}10` }}>
                    {item.vendor}
                  </span>
                  {item.credibility === "高" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#dcfce7] flex items-center gap-0.5" style={{ color: "#15803d" }}>
                      <Shield className="w-2.5 h-2.5" />高可信
                    </span>
                  )}
                </div>

                <p className="text-xs font-medium leading-relaxed flex-1" style={{ color: "#1e293b" }}>
                  {item.title}
                </p>

                {hasSummary && (
                  <p className="text-[11px] mt-1.5 line-clamp-2" style={{ color: "#94a3b8" }}>
                    {item.summary}
                  </p>
                )}

                <div className="flex items-center gap-1 mt-2 pt-2" style={{ borderTop: "1px solid #f1f3f6" }}>
                  <Clock className="w-2.5 h-2.5" style={{ color: "#94a3b8" }} />
                  <span className="text-[10px]" style={{ color: "#94a3b8" }}>
                    {item.date || "时间未标注"} · {item.model}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
