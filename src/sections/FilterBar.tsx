import { Search, X, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { FilterState } from "@/types/gpu";
import type { GPUProduct } from "@/types/gpu";
import { getVendors, getProductTypes } from "@/lib/gpuUtils";

interface FilterBarProps {
  filters: FilterState;
  products: GPUProduct[];
  filtered: GPUProduct[];
  onUpdate: (key: keyof FilterState, value: string) => void;
  onQuickFilter: (key: string, value: boolean) => void;
  onReset: () => void;
}

export default function FilterBar({
  filters,
  products,
  filtered,
  onUpdate,
  onQuickFilter,
  onReset,
}: FilterBarProps) {
  const vendors = getVendors(products);
  const types = getProductTypes(products);

  const activeCount = [
    filters.vendor, filters.productType, filters.position,
    filters.sceneTag, filters.search,
  ].filter(Boolean).length + Object.values(filters.quickFilters).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search + Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
          <Input
            value={filters.search}
            onChange={(e) => onUpdate("search", e.target.value)}
            placeholder="搜索型号、厂商、场景..."
            className="pl-9 h-9 bg-white/[0.03] border-white/[0.08] text-sm text-[#e2e4e9] placeholder:text-[#6b7280]/50 focus:border-[#3b82f6]/40"
          />
          {filters.search && (
            <button onClick={() => onUpdate("search", "")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#e2e4e9]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) => onUpdate("sortBy", e.target.value)}
            className="h-9 px-3 rounded-md border border-white/[0.08] bg-white/[0.03] text-xs text-[#9ca3af] focus:border-[#3b82f6]/40 focus:outline-none"
          >
            <option value="priority">优先级</option>
            <option value="vendor">厂商</option>
            <option value="tdp">功耗</option>
            <option value="vram">显存</option>
            <option value="int8">INT8</option>
            <option value="fp16">FP16</option>
          </select>

          <button
            onClick={onReset}
            className="h-9 px-3 rounded-md border border-white/[0.08] text-xs text-[#6b7280] hover:text-[#9ca3af] hover:border-white/[0.15] transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            重置
            {activeCount > 0 && (
              <span className="px-1 py-0.5 rounded-full bg-[#3b82f6]/15 text-[#60a5fa] text-[10px]">{activeCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal className="w-3 h-3 text-[#6b7280]" />
        <select value={filters.vendor} onChange={(e) => onUpdate("vendor", e.target.value)} className="h-7 px-2 rounded border border-white/[0.08] bg-white/[0.03] text-[11px] text-[#9ca3af] focus:outline-none">
          <option value="">厂商</option>
          {vendors.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={filters.productType} onChange={(e) => onUpdate("productType", e.target.value)} className="h-7 px-2 rounded border border-white/[0.08] bg-white/[0.03] text-[11px] text-[#9ca3af] focus:outline-none">
          <option value="">类型</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {[
          { key: "onlyVerified", label: "官方验证" },
          { key: "onlyHighPriority", label: "高优先级" },
          { key: "onlyVideoCodec", label: "编解码" },
        ].map((qf) => (
          <button
            key={qf.key}
            onClick={() => onQuickFilter(qf.key, !filters.quickFilters[qf.key as keyof typeof filters.quickFilters])}
            className={`h-7 px-2.5 rounded border text-[11px] transition-all ${
              filters.quickFilters[qf.key as keyof typeof filters.quickFilters]
                ? "border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#60a5fa]"
                : "border-white/[0.08] text-[#6b7280] hover:border-white/[0.15]"
            }`}
          >
            {qf.label}
          </button>
        ))}

        <span className="ml-auto text-[11px] text-[#6b7280]">
          {filtered.length} / {products.length} 款
        </span>
      </div>
    </div>
  );
}
