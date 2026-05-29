import { motion, AnimatePresence } from "framer-motion";
import { X, GitCompare, AlertTriangle, CheckCircle } from "lucide-react";
import type { GPUProduct } from "@/types/gpu";
import { getTypeColor, getEcosystemColor, getDifficultyColor, vendorColors } from "@/lib/gpuUtils";

interface ComparePanelProps {
  products: GPUProduct[];
  isOpen: boolean;
  onClose: () => void;
}

function CompareField({ label, values, highlight = false }: { label: string; values: string[]; highlight?: boolean }) {
  const isDifferent = new Set(values).size > 1;
  return (
    <tr className="border-b border-white/[0.04]">
      <td className="py-2.5 px-4 text-[10px] text-[#A1A1AA] whitespace-nowrap sticky left-0 bg-[#0A0A0C] z-10 w-[140px]">
        {label}
      </td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`py-2.5 px-4 text-xs ${highlight ? "font-mono font-medium" : ""} ${
            isDifferent && highlight ? "text-[#FFB800]" : "text-[#F4F4F5]"
          }`}
        >
          {v && v !== "" ? v : "暂无数据"}
        </td>
      ))}
    </tr>
  );
}

export default function ComparePanel({ products, isOpen, onClose }: ComparePanelProps) {
  if (products.length === 0) return null;

  const colWidth = Math.min(280, 100 / products.length);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-[#0A0A0C] border border-white/[0.08] rounded-xl z-[90] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0A0A0C]">
              <div className="flex items-center gap-3">
                <GitCompare className="w-5 h-5 text-[#00D4AA]" />
                <h2 className="text-lg font-bold text-[#F4F4F5]">横向对比</h2>
                <span className="text-xs text-[#A1A1AA]">{products.length} 款产品</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-white/10 text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="py-3 px-4 text-left text-[10px] text-[#A1A1AA] font-medium sticky left-0 bg-[#0A0A0C] z-10 w-[140px]">
                      对比项
                    </th>
                    {products.map((p) => {
                      const vc = vendorColors[p.厂商] || "#A1A1AA";
                      return (
                        <th
                          key={`${p.厂商}_${p.产品型号}`}
                          className="py-3 px-4 text-left min-w-[200px]"
                          style={{ width: `${colWidth}%` }}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded"
                              style={{ color: vc, backgroundColor: `${vc}15` }}
                            >
                              {p.厂商}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-[#F4F4F5] mt-1">{p.产品型号}</div>
                          <div
                              className="text-[10px] mt-0.5"
                              style={{ color: getTypeColor(p.产品类型) }}
                            >
                              {p.产品类型}
                            </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <CompareField label="厂商" values={products.map((p) => p.厂商)} />
                  <CompareField label="产品类型" values={products.map((p) => p.产品类型)} />
                  <CompareField label="产品定位" values={products.map((p) => p.产品定位)} />
                  <CompareField label="INT8算力" values={products.map((p) => p.INT8算力)} highlight />
                  <CompareField label="FP16算力" values={products.map((p) => p.FP16算力)} highlight />
                  <CompareField label="BF16算力" values={products.map((p) => p.BF16算力)} highlight />
                  <CompareField label="FP32算力" values={products.map((p) => p.FP32算力)} highlight />
                  <CompareField label="显存容量" values={products.map((p) => p.显存容量)} highlight />
                  <CompareField label="显存类型" values={products.map((p) => p.显存类型)} />
                  <CompareField label="显存带宽" values={products.map((p) => p.显存带宽)} highlight />
                  <CompareField label="TDP功耗" values={products.map((p) => p.TDP功耗)} highlight />
                  <CompareField label="接口形态" values={products.map((p) => p.接口形态)} />
                  <CompareField label="PCIe规格" values={products.map((p) => p.PCIe规格)} />
                  <CompareField label="散热方式" values={products.map((p) => p.散热方式)} />
                  <CompareField label="推荐服务器形态" values={products.map((p) => p.推荐服务器形态)} />
                  <CompareField label="推荐部署方式" values={products.map((p) => p.推荐部署方式)} />
                  <CompareField label="可参考对标NVIDIA" values={products.map((p) => p.可参考对标NVIDIA)} highlight />

                  {/* Ecological maturity */}
                  <tr className="border-b border-white/[0.04]">
                    <td className="py-2.5 px-4 text-[10px] text-[#A1A1AA] sticky left-0 bg-[#0A0A0C] z-10">生态成熟度</td>
                    {products.map((p, i) => (
                      <td key={i} className="py-2.5 px-4">
                        <span
                          className="text-xs font-medium"
                          style={{ color: getEcosystemColor(p.生态成熟度) }}
                        >
                          {p.生态成熟度 || "暂无数据"}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Difficulty */}
                  <tr className="border-b border-white/[0.04]">
                    <td className="py-2.5 px-4 text-[10px] text-[#A1A1AA] sticky left-0 bg-[#0A0A0C] z-10">适配难度</td>
                    {products.map((p, i) => (
                      <td key={i} className="py-2.5 px-4">
                        <span
                          className="text-xs font-medium"
                          style={{ color: getDifficultyColor(p.适配难度) }}
                        >
                          {p.适配难度 || "暂无数据"}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Advantages */}
                  <tr className="border-b border-white/[0.04]">
                    <td className="py-2.5 px-4 text-[10px] text-[#A1A1AA] sticky left-0 bg-[#0A0A0C] z-10">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5 text-[#00D4AA]" />
                        核心优势
                      </div>
                    </td>
                    {products.map((p, i) => (
                      <td key={i} className="py-2.5 px-4 text-xs text-[#A1A1AA] max-w-[240px]">
                        <p className="line-clamp-3">{p.核心优势 || "暂无数据"}</p>
                      </td>
                    ))}
                  </tr>

                  {/* Risks */}
                  <tr className="border-b border-white/[0.04]">
                    <td className="py-2.5 px-4 text-[10px] text-[#A1A1AA] sticky left-0 bg-[#0A0A0C] z-10">
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5 text-[#FF3366]" />
                        主要风险
                      </div>
                    </td>
                    {products.map((p, i) => (
                      <td key={i} className="py-2.5 px-4 text-xs text-[#FF3366]/80 max-w-[240px]">
                        <p className="line-clamp-3">{p.主要风险 || "暂无数据"}</p>
                      </td>
                    ))}
                  </tr>

                  {/* Recommendation */}
                  <tr className="border-b border-white/[0.04]">
                    <td className="py-2.5 px-4 text-[10px] text-[#A1A1AA] sticky left-0 bg-[#0A0A0C] z-10">推荐理由</td>
                    {products.map((p, i) => (
                      <td key={i} className="py-2.5 px-4 text-xs text-[#00D4AA]/80 max-w-[240px]">
                        <p className="line-clamp-3">{p.推荐理由短句 || "暂无数据"}</p>
                      </td>
                    ))}
                  </tr>

                  {/* Risk hint */}
                  <tr>
                    <td className="py-2.5 px-4 text-[10px] text-[#A1A1AA] sticky left-0 bg-[#0A0A0C] z-10">风险提示</td>
                    {products.map((p, i) => (
                      <td key={i} className="py-2.5 px-4 text-xs text-[#FFB800]/80 max-w-[240px]">
                        <p className="line-clamp-3">{p.风险提示短句 || "暂无数据"}</p>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
