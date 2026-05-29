import { motion } from "framer-motion";
import { Eye, GitCompare, Zap, Award, CheckCircle } from "lucide-react";
import type { GPUProduct } from "@/types/gpu";
import { getTypeColor, vendorColors } from "@/lib/gpuUtils";

interface Props {
  products: GPUProduct[];
  compareList: GPUProduct[];
  onViewDetail: (p: GPUProduct) => void;
  onToggleCompare: (p: GPUProduct) => void;
}

function fmt(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

export default function ProductGrid({ products, compareList, onViewDetail, onToggleCompare }: Props) {
  const isCompared = (model: string) => compareList.some((c) => c.产品型号 === model);

  if (products.length === 0) {
    return (
      <div className="panel p-10 text-center">
        <p className="text-sm" style={{ color: "#64748b" }}>当前筛选条件下暂无匹配卡型，请尝试减少筛选条件。</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {products.map((p, i) => {
        const vc = vendorColors[p.厂商] || "#94a3b8";
        const tc = getTypeColor(p.产品类型);
        const compared = isCompared(p.产品型号);
        const isHigh = p.展示优先级 === "高";
        const isVer = p.是否官方可验证?.includes("是");
        const hasRisk = p.风险提示短句 && p.风险提示短句 !== "暂无数据";

        return (
          <motion.div
            key={`${p.厂商}_${p.产品型号}_${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
            className="group panel hover:shadow-sm transition-all duration-200"
          >
            {/* Vendor stripe */}
            <div className="h-[2px] rounded-t-lg" style={{ backgroundColor: vc }} />

            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    {isHigh && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f59e0b]/10 flex items-center gap-0.5" style={{ color: "#b45309" }}>
                        <Award className="w-2.5 h-2.5" />重点
                      </span>
                    )}
                    {isVer && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#22c55e]/10 flex items-center gap-0.5" style={{ color: "#15803d" }}>
                        <CheckCircle className="w-2.5 h-2.5" />官方
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold truncate" style={{ color: "#1e293b" }}>{p.产品型号}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px]" style={{ color: "#64748b" }}>{p.厂商}</span>
                    <span className="text-[10px]" style={{ color: "#cbd5e1" }}>·</span>
                    <span className="text-[10px]" style={{ color: tc }}>{p.产品类型}</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded border shrink-0 ml-2" style={{ color: "#64748b", borderColor: "#e2e5ea" }}>
                  {p.产品定位.slice(0, 10)}
                </span>
              </div>

              {/* Specs blocks */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: "INT8", value: fmt(p.INT8算力) },
                  { label: "FP16", value: fmt(p.FP16算力) },
                  { label: "显存", value: fmt(p.显存容量) },
                  { label: "功耗", value: fmt(p.TDP功耗) },
                  { label: "形态", value: fmt(p.接口形态) },
                  { label: "服务器", value: fmt(p.推荐服务器形态) },
                ].map((s) => (
                  <div key={s.label} className="p-2 rounded border" style={{ backgroundColor: "#f8f9fa", borderColor: "#eef0f2" }}>
                    <div className="text-[9px] mb-0.5" style={{ color: "#94a3b8" }}>{s.label}</div>
                    <div className="text-[11px] font-mono truncate" style={{ color: "#334155" }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Scene tags */}
              {p.适合场景标签 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.适合场景标签.split(/[;；]/).slice(0, 4).map((t) => (
                    <span key={t} className="px-1.5 py-0.5 rounded text-[9px]" style={{ backgroundColor: "#f1f3f6", color: "#64748b" }}>
                      {t.trim()}
                    </span>
                  ))}
                </div>
              )}

              {p.推荐理由短句 && p.推荐理由短句 !== "暂无数据" && (
                <p className="text-[11px] mb-2 line-clamp-2" style={{ color: "#64748b" }}>{p.推荐理由短句}</p>
              )}

              {hasRisk && (
                <div className="flex items-center gap-1.5 p-2 rounded border mb-3" style={{ backgroundColor: "#fef2f2", borderColor: "#fecaca" }}>
                  <Zap className="w-2.5 h-2.5 shrink-0" style={{ color: "#ef4444" }} />
                  <p className="text-[10px] truncate" style={{ color: "#b91c1c" }}>{p.风险提示短句}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewDetail(p)}
                  className="flex-1 h-7 rounded text-[11px] flex items-center justify-center gap-1.5 transition-colors border"
                  style={{ backgroundColor: "#f8f9fa", borderColor: "#e2e5ea", color: "#475569" }}
                >
                  <Eye className="w-3 h-3" />查看详情
                </button>
                <button
                  onClick={() => onToggleCompare(p)}
                  className="h-7 px-2.5 rounded text-[11px] border transition-all flex items-center gap-1"
                  style={
                    compared
                      ? { backgroundColor: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" }
                      : { backgroundColor: "#f8f9fa", color: "#64748b", borderColor: "#e2e5ea" }
                  }
                >
                  <GitCompare className="w-3 h-3" />
                  {compared ? "已选" : "对比"}
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
