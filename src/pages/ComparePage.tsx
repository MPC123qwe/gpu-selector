import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GitCompare, X, AlertCircle, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import type { GPUProduct } from "@/types/gpu";
import { getEcosystemColor, getDifficultyColor, vendorColors } from "@/lib/gpuUtils";

interface Props {
  compareList: GPUProduct[];
  onRemove: (model: string) => void;
  onClear: () => void;
}

const fields = [
  { label: "厂商", key: "厂商" as const },
  { label: "产品类型", key: "产品类型" as const },
  { label: "产品定位", key: "产品定位" as const },
  { label: "INT8算力", key: "INT8算力" as const, highlight: true },
  { label: "FP16算力", key: "FP16算力" as const, highlight: true },
  { label: "BF16算力", key: "BF16算力" as const, highlight: true },
  { label: "FP32算力", key: "FP32算力" as const, highlight: true },
  { label: "显存容量", key: "显存容量" as const, highlight: true },
  { label: "显存类型", key: "显存类型" as const },
  { label: "显存带宽", key: "显存带宽" as const, highlight: true },
  { label: "TDP功耗", key: "TDP功耗" as const, highlight: true },
  { label: "接口形态", key: "接口形态" as const },
  { label: "PCIe规格", key: "PCIe规格" as const },
  { label: "散热方式", key: "散热方式" as const },
  { label: "推荐服务器形态", key: "推荐服务器形态" as const },
  { label: "可参考对标NVIDIA", key: "可参考对标NVIDIA" as const, highlight: true },
];

export default function ComparePage({ compareList, onRemove, onClear }: Props) {
  const navigate = useNavigate();

  if (compareList.length < 2) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 pb-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-10 text-center py-20">
          <GitCompare className="w-10 h-10 mx-auto mb-4" style={{ color: "#cbd5e1" }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: "#334155" }}>请选择至少 2 款产品进行对比</h2>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "#94a3b8" }}>
            在产品选型页点击卡片上的"对比"按钮，将产品加入对比栏。最多支持 4 款产品同时对比。
          </p>
          <button onClick={() => navigate("/database")} className="btn-primary">
            前往产品选型 <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </button>

          <div className="mt-12 max-w-lg mx-auto">
            <p className="text-[11px] mb-3" style={{ color: "#94a3b8" }}>热门对比组合</p>
            <div className="grid grid-cols-1 gap-2">
              {[
                ["Atlas 300I A2", "昇腾910B"],
                ["MTT S5000", "Atlas 300T Pro 训练卡"],
                ["MLU590 (思元590)", "云燧 T21"],
                ["昇腾910B", "云燧 T21", "MTT S5000"],
              ].map((group, i) => (
                <button
                  key={i}
                  onClick={() => navigate("/database")}
                  className="panel-hover p-3 text-left flex items-center justify-between"
                >
                  <span className="text-xs" style={{ color: "#64748b" }}>{group.join(" vs ")}</span>
                  <ArrowRight className="w-3 h-3" style={{ color: "#cbd5e1" }} />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 pb-16">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#1e293b" }}>横向对比</h1>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{compareList.length} 款产品 · 差异字段已高亮</p>
          </div>
          <button onClick={onClear} className="flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs transition-all" style={{ borderColor: "#e2e5ea", color: "#64748b" }}>
            <X className="w-3 h-3" /> 清空对比
          </button>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[700px] text-xs border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="py-3 px-3 text-left font-medium w-[140px] sticky left-0 z-10 border-b" style={{ color: "#94a3b8", backgroundColor: "#f1f3f6", borderColor: "#e2e5ea" }}>
                  对比项
                </th>
                {compareList.map((p) => (
                  <th key={`${p.厂商}_${p.产品型号}`} className="py-3 px-3 text-left min-w-[180px] border-b" style={{ borderColor: "#e2e5ea" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: vendorColors[p.厂商] || "#94a3b8", backgroundColor: `${vendorColors[p.厂商] || "#94a3b8"}10` }}>
                          {p.厂商}
                        </span>
                        <div className="text-sm font-bold mt-1" style={{ color: "#1e293b" }}>{p.产品型号}</div>
                      </div>
                      <button onClick={() => onRemove(p.产品型号)} className="p-1 rounded hover:bg-black/5 shrink-0 ml-2" style={{ color: "#94a3b8" }}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((f) => {
                const vals = compareList.map((p) => p[f.key] || "—");
                const isDiff = new Set(vals.filter((v) => v !== "—")).size > 1;
                return (
                  <tr key={f.label}>
                    <td className="py-2.5 px-3 border-b sticky left-0 z-10" style={{ color: "#94a3b8", borderColor: "#f1f3f6", backgroundColor: "#f1f3f6" }}>
                      {f.label}
                    </td>
                    {vals.map((v, i) => (
                      <td key={i} className={`py-2.5 px-3 border-b ${f.highlight ? "font-mono" : ""}`} style={{ borderColor: "#f1f3f6", color: isDiff && f.highlight ? "#b45309" : "#334155" }}>
                        {v}
                      </td>
                    ))}
                  </tr>
                );
              })}

              <tr>
                <td className="py-2.5 px-3 border-b sticky left-0 z-10" style={{ color: "#94a3b8", borderColor: "#f1f3f6", backgroundColor: "#f1f3f6" }}>生态成熟度</td>
                {compareList.map((p, i) => (
                  <td key={i} className="py-2.5 px-3 border-b" style={{ borderColor: "#f1f3f6" }}>
                    <span style={{ color: getEcosystemColor(p.生态成熟度) }}>{p.生态成熟度 || "—"}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 border-b sticky left-0 z-10" style={{ color: "#94a3b8", borderColor: "#f1f3f6", backgroundColor: "#f1f3f6" }}>适配难度</td>
                {compareList.map((p, i) => (
                  <td key={i} className="py-2.5 px-3 border-b" style={{ borderColor: "#f1f3f6" }}>
                    <span style={{ color: getDifficultyColor(p.适配难度) }}>{p.适配难度 || "—"}</span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-3 border-b sticky left-0 z-10" style={{ color: "#94a3b8", borderColor: "#f1f3f6", backgroundColor: "#f1f3f6" }}>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-[#22c55e]" />核心优势</span>
                </td>
                {compareList.map((p, i) => (
                  <td key={i} className="py-2.5 px-3 border-b max-w-[220px]" style={{ color: "#64748b", borderColor: "#f1f3f6" }}>
                    <p className="line-clamp-3">{p.核心优势 || "—"}</p>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 border-b sticky left-0 z-10" style={{ color: "#94a3b8", borderColor: "#f1f3f6", backgroundColor: "#f1f3f6" }}>
                  <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-[#ef4444]" />主要风险</span>
                </td>
                {compareList.map((p, i) => (
                  <td key={i} className="py-2.5 px-3 border-b max-w-[220px]" style={{ color: "#dc2626", borderColor: "#f1f3f6" }}>
                    <p className="line-clamp-3">{p.主要风险 || "—"}</p>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-3 border-b sticky left-0 z-10" style={{ color: "#94a3b8", borderColor: "#f1f3f6", backgroundColor: "#f1f3f6" }}>
                  <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-[#f59e0b]" />推荐理由</span>
                </td>
                {compareList.map((p, i) => (
                  <td key={i} className="py-2.5 px-3 border-b max-w-[220px]" style={{ color: "#15803d", borderColor: "#f1f3f6" }}>
                    <p className="line-clamp-3">{p.推荐理由短句 || "—"}</p>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 sticky left-0 z-10" style={{ color: "#94a3b8", backgroundColor: "#f1f3f6" }}>
                  <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-[#f59e0b]" />风险提示</span>
                </td>
                {compareList.map((p, i) => (
                  <td key={i} className="py-2.5 px-3 max-w-[220px]" style={{ color: "#b45309" }}>
                    <p className="line-clamp-3">{p.风险提示短句 || "—"}</p>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
