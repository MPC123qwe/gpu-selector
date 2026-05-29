import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Zap, HardDrive, Cpu, Globe, Layers, Target, AlertTriangle, CheckCircle, BookOpen, Server } from "lucide-react";
import type { GPUProduct } from "@/types/gpu";
import { getEcosystemColor, getDifficultyColor, vendorColors } from "@/lib/gpuUtils";

interface Props {
  product: GPUProduct | null;
  onClose: () => void;
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2.5 pb-2 border-b" style={{ borderColor: "#e2e5ea" }}>
        <Icon className="w-3.5 h-3.5 text-[#3b82f6]" />
        <h4 className="text-xs font-semibold" style={{ color: "#334155" }}>{title}</h4>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const display = value && value !== "" ? value : "—";
  return (
    <div className="py-1.5 border-b" style={{ borderColor: "#f1f3f6" }}>
      <div className="text-[10px] mb-0.5" style={{ color: "#94a3b8" }}>{label}</div>
      <div className={`text-[11px] ${mono ? "font-mono" : ""}`} style={{ color: "#334155" }}>{display}</div>
    </div>
  );
}

export default function ProductDrawer({ product, onClose }: Props) {
  if (!product) return null;
  const vc = vendorColors[product.厂商] || "#94a3b8";
  const links = product.资料来源链接?.split("|").map((l) => l.trim()).filter(Boolean) || [];

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/30 z-[60]" />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[520px] bg-white border-l z-[70] overflow-y-auto"
            style={{ borderColor: "#e2e5ea" }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 backdrop-blur border-b px-5 py-3.5" style={{ backgroundColor: "rgba(255,255,255,0.95)", borderColor: "#e2e5ea" }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-[2px] w-12 rounded mb-2" style={{ backgroundColor: vc }} />
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: vc, backgroundColor: `${vc}10` }}>
                      {product.厂商}
                    </span>
                    {product.是否官方可验证?.includes("是") && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#dcfce7]" style={{ color: "#15803d" }}>官方验证</span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: "#1e293b" }}>{product.产品型号}</h2>
                  <p className="text-[11px]" style={{ color: "#94a3b8" }}>{product.产品系列} · {product.产品定位}</p>
                </div>
                <button onClick={onClose} className="p-1.5 rounded hover:bg-black/5" style={{ color: "#94a3b8" }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-5 py-5">
              {product.核心优势 && (
                <div className="p-2.5 rounded-md border mb-4" style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}>
                  <div className="flex items-center gap-1 mb-1">
                    <CheckCircle className="w-3 h-3 text-[#22c55e]" />
                    <span className="text-[10px] font-medium" style={{ color: "#15803d" }}>核心优势</span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: "#475569" }}>{product.核心优势}</p>
                </div>
              )}
              {product.主要风险 && (
                <div className="p-2.5 rounded-md border mb-4" style={{ backgroundColor: "#fef2f2", borderColor: "#fecaca" }}>
                  <div className="flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3 h-3 text-[#ef4444]" />
                    <span className="text-[10px] font-medium" style={{ color: "#dc2626" }}>主要风险</span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: "#991b1b" }}>{product.主要风险}</p>
                </div>
              )}

              {(product.推荐服务器形态 || product.推荐部署方式) && (
                <div className="p-2.5 rounded-md border mb-4" style={{ backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }}>
                  <div className="flex items-center gap-1 mb-1">
                    <Server className="w-3 h-3 text-[#3b82f6]" />
                    <span className="text-[10px] font-medium" style={{ color: "#2563eb" }}>服务器适配建议</span>
                  </div>
                  {product.推荐服务器形态 && <p className="text-[11px]" style={{ color: "#475569" }}>推荐服务器形态：{product.推荐服务器形态}</p>}
                  {product.推荐部署方式 && <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>部署方式：{product.推荐部署方式}</p>}
                </div>
              )}

              <Section title="基础信息" icon={Cpu}>
                <div className="grid grid-cols-2 gap-x-3">
                  <Field label="厂商" value={product.厂商} />
                  <Field label="产品型号" value={product.产品型号} mono />
                  <Field label="产品系列" value={product.产品系列} />
                  <Field label="产品类型" value={product.产品类型} />
                  <Field label="产品定位" value={product.产品定位} />
                  <Field label="产品状态" value={product.产品状态} />
                  <Field label="发布时间" value={product.发布时间} />
                  <Field label="优先级" value={product.展示优先级} />
                </div>
              </Section>

              <Section title="算力与显存" icon={Zap}>
                <div className="grid grid-cols-2 gap-x-3">
                  <Field label="INT8算力" value={product.INT8算力} mono />
                  <Field label="FP16算力" value={product.FP16算力} mono />
                  <Field label="BF16算力" value={product.BF16算力} mono />
                  <Field label="FP32算力" value={product.FP32算力} mono />
                  <Field label="显存容量" value={product.显存容量} mono />
                  <Field label="显存类型" value={product.显存类型} />
                  <Field label="显存带宽" value={product.显存带宽} mono />
                  <Field label="TDP功耗" value={product.TDP功耗} mono />
                </div>
              </Section>

              <Section title="物理形态" icon={HardDrive}>
                <div className="grid grid-cols-2 gap-x-3">
                  <Field label="接口形态" value={product.接口形态} />
                  <Field label="PCIe规格" value={product.PCIe规格} />
                  <Field label="卡尺寸" value={product.卡尺寸} />
                  <Field label="散热方式" value={product.散热方式} />
                </div>
              </Section>

              <Section title="软件生态" icon={Globe}>
                <div className="grid grid-cols-1 gap-x-3">
                  <Field label="支持操作系统" value={product.支持操作系统} />
                  <Field label="驱动/SDK/工具链" value={product["驱动/SDK/工具链"]} />
                  <Field label="支持AI框架" value={product.支持AI框架} />
                  <Field label="支持模型类型" value={product.支持模型类型} />
                  <Field label="虚拟化/vGPU" value={product["是否支持虚拟化/vGPU"]} />
                  <Field label="视频编解码" value={product.是否支持视频编解码} />
                </div>
              </Section>

              <Section title="场景适配" icon={Layers}>
                <div className="grid grid-cols-1 gap-x-3">
                  <Field label="主要应用场景" value={product.主要应用场景} />
                  <Field label="适合场景标签" value={product.适合场景标签} />
                  <Field label="不建议场景" value={product.不建议场景} />
                  <Field label="适配注意事项" value={product.适配注意事项} />
                </div>
              </Section>

              <Section title="竞品对标" icon={Target}>
                <div className="grid grid-cols-1 gap-x-3">
                  <Field label="可参考对标NVIDIA" value={product.可参考对标NVIDIA} mono />
                  <Field label="对标依据" value={product.对标依据} />
                </div>
              </Section>

              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2.5 pb-2 border-b" style={{ borderColor: "#e2e5ea" }}>
                  <AlertTriangle className="w-3.5 h-3.5 text-[#3b82f6]" />
                  <h4 className="text-xs font-semibold" style={{ color: "#334155" }}>评估建议</h4>
                </div>
                <div className="grid grid-cols-2 gap-x-3">
                  <div className="py-1.5 border-b" style={{ borderColor: "#f1f3f6" }}>
                    <div className="text-[10px] mb-0.5" style={{ color: "#94a3b8" }}>生态成熟度</div>
                    <span className="text-[11px] font-medium" style={{ color: getEcosystemColor(product.生态成熟度) }}>{product.生态成熟度 || "—"}</span>
                  </div>
                  <div className="py-1.5 border-b" style={{ borderColor: "#f1f3f6" }}>
                    <div className="text-[10px] mb-0.5" style={{ color: "#94a3b8" }}>适配难度</div>
                    <span className="text-[11px] font-medium" style={{ color: getDifficultyColor(product.适配难度) }}>{product.适配难度 || "—"}</span>
                  </div>
                </div>
                {product.推荐理由短句 && (
                  <div className="mt-2 p-2 rounded-md border" style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}>
                    <span className="text-[10px]" style={{ color: "#15803d" }}>推荐理由: </span>
                    <span className="text-[11px]" style={{ color: "#475569" }}>{product.推荐理由短句}</span>
                  </div>
                )}
                {product.风险提示短句 && (
                  <div className="mt-1.5 p-2 rounded-md border" style={{ backgroundColor: "#fef2f2", borderColor: "#fecaca" }}>
                    <span className="text-[10px]" style={{ color: "#dc2626" }}>风险提示: </span>
                    <span className="text-[11px]" style={{ color: "#991b1b" }}>{product.风险提示短句}</span>
                  </div>
                )}
              </div>

              <Section title="资料来源" icon={BookOpen}>
                <Field label="来源类型" value={product.来源类型} />
                <Field label="数据可信度" value={product.数据可信度} />
                <Field label="参考价格" value={product["参考价格 (元)"]} mono />
                {product.最新新闻 && <Field label="最新动态" value={product.最新新闻} />}
                {links.length > 0 && (
                  <div className="py-1.5">
                    <div className="text-[10px] mb-1" style={{ color: "#94a3b8" }}>资料链接</div>
                    <div className="space-y-1">
                      {links.map((link, i) => (
                        <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] truncate hover:underline" style={{ color: "#3b82f6" }}>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{link}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
