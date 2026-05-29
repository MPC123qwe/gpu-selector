import { motion } from "framer-motion";
import { RotateCcw, SlidersHorizontal, Search, X } from "lucide-react";
import type { GPUProduct, FilterState } from "@/types/gpu";
import ProductGrid from "@/sections/ProductGrid";
import {
  getVendors, getProductTypes,
  sceneCategories, getSceneCategoryCount,
  ecosystemLevels, countByEcosystem,
  difficultyLevels, countByDifficulty,
  coolingMethods, countByCooling,
  productStatuses, countByStatus,
} from "@/lib/gpuUtils";

interface Props {
  products: GPUProduct[];
  filtered: GPUProduct[];
  filters: FilterState;
  compareList: GPUProduct[];
  onUpdateFilter: (key: keyof FilterState, value: string) => void;
  onQuickFilter: (key: string, value: boolean) => void;
  onResetFilters: () => void;
  onToggleCompare: (p: GPUProduct) => void;
  onViewDetail: (p: GPUProduct) => void;
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: "#94a3b8" }}>{title}</h4>
      {children}
    </div>
  );
}

function FilterCheckbox({
  label, checked, onChange,
}: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 py-1 cursor-pointer group">
      <div
        className={`w-3.5 h-3.5 rounded border transition-all flex items-center justify-center ${
          checked ? "bg-[#3b82f6] border-[#3b82f6]" : "border-[#d1d5db] group-hover:border-[#9ca3af]"
        }`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span className={`text-xs ${checked ? "text-[#334155]" : "text-[#94a3b8] group-hover:text-[#64748b]"}`}>{label}</span>
    </label>
  );
}

export default function DatabasePage({
  products,
  filtered,
  filters,
  compareList,
  onUpdateFilter,
  onQuickFilter,
  onResetFilters,
  onToggleCompare,
  onViewDetail,
}: Props) {
  const vendors = getVendors(products);
  const types = getProductTypes(products);

  const activeCount = [
    filters.vendor, filters.productType, filters.position, filters.sceneTag,
    filters.sceneCategory, filters.search, filters.serverForm, filters.status,
    filters.ecosystem, filters.difficulty, filters.cooling,
  ].filter(Boolean).length + Object.values(filters.quickFilters).filter(Boolean).length;

  return (
    <div className="max-w-[1400px] mx-auto px-6 pb-16">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#1e293b" }}>产品选型</h1>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
              共 {filtered.length} 款 / 总计 {products.length} 款
              {activeCount > 0 && <span className="ml-2" style={{ color: "#b45309" }}>({activeCount} 个筛选条件生效)</span>}
            </p>
          </div>
          {activeCount > 0 && (
            <button onClick={onResetFilters} className="flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs transition-all" style={{ borderColor: "#e2e5ea", color: "#64748b" }}>
              <RotateCcw className="w-3 h-3" /> 清空筛选
            </button>
          )}
        </div>

        <div className="flex gap-6">
          {/* LEFT: Filter Panel */}
          <aside className="hidden lg:block w-[240px] shrink-0">
            <div className="panel p-4 sticky top-[72px] max-h-[calc(100vh-80px)] overflow-y-auto">
              <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid #e2e5ea" }}>
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span className="text-xs font-semibold" style={{ color: "#334155" }}>筛选条件</span>
              </div>

              <FilterSection title="搜索">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: "#94a3b8" }} />
                  <input
                    value={filters.search}
                    onChange={(e) => onUpdateFilter("search", e.target.value)}
                    placeholder="型号 / 厂商 / 场景..."
                    className="w-full h-8 pl-7 pr-2 rounded-md border bg-[#f8f9fa] text-xs placeholder:text-[#94a3b8]/50 focus:outline-none focus:border-[#3b82f6]/40"
                    style={{ borderColor: "#e2e5ea", color: "#334155" }}
                  />
                  {filters.search && (
                    <button onClick={() => onUpdateFilter("search", "")} className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }}>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </FilterSection>

              <FilterSection title="厂商">
                <div className="space-y-0.5">
                  {vendors.map((v) => (
                    <FilterCheckbox key={v} label={v} checked={filters.vendor === v} onChange={(c) => onUpdateFilter("vendor", c ? v : "")} />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="产品类型">
                <div className="space-y-0.5">
                  {types.slice(0, 10).map((t) => (
                    <FilterCheckbox key={t} label={t} checked={filters.productType === t} onChange={(c) => onUpdateFilter("productType", c ? t : "")} />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="应用场景">
                <div className="space-y-0.5">
                  {sceneCategories.map((cat) => {
                    const count = getSceneCategoryCount(products, cat);
                    if (count === 0) return null;
                    return (
                      <FilterCheckbox
                        key={cat.label}
                        label={`${cat.label} (${count})`}
                        checked={filters.sceneCategory === cat.label}
                        onChange={(c) => onUpdateFilter("sceneCategory", c ? cat.label : "")}
                      />
                    );
                  })}
                </div>
              </FilterSection>

              <FilterSection title="其他条件">
                <div className="space-y-0.5">
                  <FilterCheckbox label="仅官方可验证" checked={filters.quickFilters.onlyVerified} onChange={(v) => onQuickFilter("onlyVerified", v)} />
                  <FilterCheckbox label="仅高优先级" checked={filters.quickFilters.onlyHighPriority} onChange={(v) => onQuickFilter("onlyHighPriority", v)} />
                  <FilterCheckbox label="支持视频编解码" checked={filters.quickFilters.onlyVideoCodec} onChange={(v) => onQuickFilter("onlyVideoCodec", v)} />
                  <FilterCheckbox label="支持虚拟化/vGPU" checked={filters.quickFilters.onlyVirtualization} onChange={(v) => onQuickFilter("onlyVirtualization", v)} />
                </div>
              </FilterSection>

              <FilterSection title="生态成熟度">
                <div className="space-y-0.5">
                  {countByEcosystem(products).map(({ label, count }) => (
                    <FilterCheckbox
                      key={label}
                      label={`${label} (${count})`}
                      checked={filters.ecosystem === label}
                      onChange={(c) => onUpdateFilter("ecosystem", c ? label : "")}
                    />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="适配难度">
                <div className="space-y-0.5">
                  {countByDifficulty(products).map(({ label, count }) => (
                    <FilterCheckbox
                      key={label}
                      label={`${label} (${count})`}
                      checked={filters.difficulty === label}
                      onChange={(c) => onUpdateFilter("difficulty", c ? label : "")}
                    />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="产品状态">
                <div className="space-y-0.5">
                  {countByStatus(products).map(({ label, count }) => (
                    <FilterCheckbox
                      key={label}
                      label={`${label} (${count})`}
                      checked={filters.status === label}
                      onChange={(c) => onUpdateFilter("status", c ? label : "")}
                    />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="排序">
                <select
                  value={filters.sortBy}
                  onChange={(e) => onUpdateFilter("sortBy", e.target.value)}
                  className="w-full h-8 px-2 rounded-md border bg-[#f8f9fa] text-xs focus:outline-none"
                  style={{ borderColor: "#e2e5ea", color: "#64748b" }}
                >
                  <option value="priority">默认排序</option>
                  <option value="vram">显存从高到低</option>
                  <option value="tdp">功耗从低到高</option>
                  <option value="int8">INT8算力从高到低</option>
                  <option value="fp16">FP16算力从高到低</option>
                </select>
              </FilterSection>
            </div>
          </aside>

          {/* RIGHT: Results */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter */}
            <div className="lg:hidden mb-4">
              <div className="panel p-3 flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
                  <input
                    value={filters.search}
                    onChange={(e) => onUpdateFilter("search", e.target.value)}
                    placeholder="搜索型号、厂商、场景..."
                    className="w-full h-9 pl-9 pr-3 rounded-md border bg-[#f8f9fa] text-sm placeholder:text-[#94a3b8]/40 focus:outline-none focus:border-[#3b82f6]/40"
                    style={{ borderColor: "#e2e5ea", color: "#334155" }}
                  />
                </div>
                <select
                  value={filters.vendor}
                  onChange={(e) => onUpdateFilter("vendor", e.target.value)}
                  className="h-9 px-2 rounded-md border bg-[#f8f9fa] text-xs"
                  style={{ borderColor: "#e2e5ea", color: "#64748b" }}
                >
                  <option value="">厂商</option>
                  {vendors.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="panel p-10 text-center">
                <p className="text-sm mb-2" style={{ color: "#64748b" }}>当前筛选条件下暂无匹配卡型</p>
                <p className="text-xs mb-4" style={{ color: "#94a3b8" }}>请尝试减少筛选条件</p>
                <button onClick={onResetFilters} className="btn-primary">重置筛选</button>
              </div>
            ) : (
              <ProductGrid products={filtered} compareList={compareList} onViewDetail={onViewDetail} onToggleCompare={onToggleCompare} />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
