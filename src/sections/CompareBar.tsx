import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { GitCompare, X } from "lucide-react";
import type { GPUProduct } from "@/types/gpu";

interface Props {
  compareList: GPUProduct[];
  onRemove: (model: string) => void;
  onClear: () => void;
  onOpenPanel: () => void;
}

export default function CompareBar({ compareList, onRemove, onClear }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  if (compareList.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{ backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderColor: "#e2e5ea" }}
    >
      <div className="max-w-[1400px] mx-auto px-6 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm shrink-0" style={{ color: "#334155" }}>
            <GitCompare className="w-4 h-4 text-[#3b82f6]" />
            <span>对比</span>
            <span className="text-xs" style={{ color: "#94a3b8" }}>({compareList.length}/4)</span>
          </div>

          <div className="flex-1 flex items-center gap-1.5 overflow-x-auto">
            {compareList.map((p) => (
              <div key={`${p.厂商}_${p.产品型号}`} className="flex items-center gap-1 px-2.5 py-1 rounded border text-xs shrink-0" style={{ backgroundColor: "#f8f9fa", borderColor: "#e2e5ea", color: "#334155" }}>
                <span className="truncate max-w-[140px]">{p.产品型号}</span>
                <button onClick={() => onRemove(p.产品型号)} className="hover:text-[#ef4444]" style={{ color: "#94a3b8" }}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {location.pathname !== "/compare" && (
              <button
                onClick={() => navigate("/compare")}
                disabled={compareList.length < 2}
                className="h-7 px-3 rounded text-xs font-medium transition-colors border disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ backgroundColor: "rgba(59,130,246,0.08)", color: "#2563eb", borderColor: "rgba(59,130,246,0.15)" }}
              >
                查看对比
              </button>
            )}
            <button onClick={onClear} className="h-7 px-2 text-xs" style={{ color: "#94a3b8" }}>清空</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
