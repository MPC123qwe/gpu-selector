import { Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-6 border-t" style={{ backgroundColor: "#f1f3f6", borderColor: "#e2e5ea" }}>
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#3b82f6]" />
            <span className="text-sm font-medium" style={{ color: "#334155" }}>GPU Selector</span>
            <span className="text-[10px]" style={{ color: "#94a3b8" }}>国产GPU卡选型方案</span>
          </div>
          <div className="text-[10px]" style={{ color: "#94a3b8" }}>
            数据来源：厂商官网 / 京东 / 行业渠道 / 公开评测 · 仅供参考，以厂商最新规格为准
          </div>
        </div>
      </div>
    </footer>
  );
}
