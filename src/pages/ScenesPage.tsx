import { motion } from "framer-motion";
import { Target, CheckCircle, Server, GitCompare, Eye } from "lucide-react";
import type { GPUProduct } from "@/types/gpu";
import { vendorColors } from "@/lib/gpuUtils";

interface Props {
  products: GPUProduct[];
  onViewDetail: (p: GPUProduct) => void;
  onToggleCompare: (p: GPUProduct) => void;
  compareList: GPUProduct[];
}

interface SceneDef {
  id: string;
  title: string;
  subtitle: string;
  keywords: string[];
  keyParams: string[];
  serverTip: string;
}

const scenes: SceneDef[] = [
  {
    id: "llm-inference",
    title: "大模型推理",
    subtitle: "面向 LLM、大语言模型、生成式 AI 的推理部署",
    keywords: ["大模型推理", "LLM", "推理", "Transformer", "生成式"],
    keyParams: ["显存容量 >= 32GB", "INT8 算力 >= 100 TOPS", "HBM 显存优先", "支持 FP16/BF16"],
    serverTip: "4U 服务器，8 卡互联，需关注显存带宽和卡间互联能力",
  },
  {
    id: "edge-inference",
    title: "边缘推理",
    subtitle: "面向边缘设备、智能终端、低功耗场景的推理部署",
    keywords: ["边缘推理", "低功耗", "边缘", "终端", "嵌入式"],
    keyParams: ["TDP <= 75W", "半高半长形态", "被动散热", "紧凑尺寸"],
    serverTip: "1U-2U 边缘服务器，或嵌入式设备直接部署",
  },
  {
    id: "video",
    title: "视频编解码",
    subtitle: "面向视频分析、内容审核、智能安防等视频密集场景",
    keywords: ["视频", "编解码", "安防", "内容审核", "视频分析"],
    keyParams: ["支持视频编解码", "多路视频并发", "低功耗推理", "视频结构化"],
    serverTip: "2U 视频分析服务器，关注 PCIe 带宽和存储扩展",
  },
  {
    id: "cloud-desktop",
    title: "图形云 / 云桌面",
    subtitle: "面向云桌面、vGPU、图形虚拟化、VDI 场景",
    keywords: ["云桌面", "vGPU", "虚拟化", "图形", "渲染"],
    keyParams: ["支持 vGPU/虚拟化", "图形渲染能力", "视频编码输出", "SR-IOV 支持"],
    serverTip: "2U-4U GPU 服务器，需支持 GPU 直通和虚拟化软件栈",
  },
  {
    id: "training",
    title: "训练与训推一体",
    subtitle: "面向 AI 模型训练、分布式训练、训推混合场景",
    keywords: ["训练", "训推一体", "分布式", "大模型训练", "深度学习"],
    keyParams: ["FP16/BF16 算力高", "显存 >= 32GB", "卡间互联带宽高", "支持分布式训练框架"],
    serverTip: "4U-8U AI 训练服务器，需支持高速互联，关注散热和供电",
  },
  {
    id: "private",
    title: "企业私有化部署",
    subtitle: "面向企业私有化、信创、国产替代场景",
    keywords: ["国产替代", "信创", "私有化", "企业"],
    keyParams: ["国产芯片", "生态成熟度高", "软件栈完善", "支持国产 OS"],
    serverTip: "兼容国产 CPU 和 OS 的服务器，关注软件生态和迁移成本",
  },
  {
    id: "high-density",
    title: "高密度服务器部署",
    subtitle: "面向数据中心大规模、高密度推理集群部署",
    keywords: ["高密度", "数据中心", "大规模", "集群"],
    keyParams: ["低功耗", "单槽或双槽", "被动散热", "PCIe 标准卡"],
    serverTip: "2U-4U 高密度服务器，单节点 8-16 卡，关注整机功耗和散热设计",
  },
];

function SceneCard({
  scene, matches, onViewDetail, onToggleCompare, compareList,
}: {
  scene: SceneDef;
  matches: GPUProduct[];
  onViewDetail: (p: GPUProduct) => void;
  onToggleCompare: (p: GPUProduct) => void;
  compareList: GPUProduct[];
}) {
  const isInCompare = (model: string) => compareList.some((c) => c.产品型号 === model);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="panel p-5"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#eff6ff] flex items-center justify-center shrink-0">
          <Target className="w-4 h-4 text-[#3b82f6]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "#1e293b" }}>{scene.title}</h3>
          <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>{scene.subtitle}</p>
        </div>
        <span className="ml-auto text-[10px] shrink-0" style={{ color: "#94a3b8" }}>{matches.length} 款匹配</span>
      </div>

      <div className="mb-4">
        <div className="text-[10px] mb-1.5" style={{ color: "#94a3b8" }}>场景关注参数</div>
        <div className="flex flex-wrap gap-1.5">
          {scene.keyParams.map((p) => (
            <span key={p} className="px-2 py-0.5 rounded-md border text-[10px]" style={{ backgroundColor: "#f8f9fa", borderColor: "#eef0f2", color: "#64748b" }}>
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-1.5 p-2.5 rounded-md border mb-4" style={{ backgroundColor: "#eff6ff", borderColor: "#dbeafe" }}>
        <Server className="w-3 h-3 text-[#3b82f6] shrink-0 mt-0.5" />
        <p className="text-[11px]" style={{ color: "#475569" }}>{scene.serverTip}</p>
      </div>

      {matches.length > 0 ? (
        <div className="space-y-2">
          {matches.slice(0, 4).map((p) => {
            const vc = vendorColors[p.厂商] || "#94a3b8";
            return (
              <div key={`${p.厂商}_${p.产品型号}`} className="flex items-center gap-3 p-2.5 rounded-md border" style={{ backgroundColor: "#f8f9fa", borderColor: "#eef0f2" }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: vc, backgroundColor: `${vc}10` }}>
                      {p.厂商}
                    </span>
                    <span className="text-xs font-medium truncate" style={{ color: "#334155" }}>{p.产品型号}</span>
                  </div>
                  {p.推荐理由短句 && (
                    <p className="text-[10px] mt-1 line-clamp-1" style={{ color: "#94a3b8" }}>{p.推荐理由短句}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => onViewDetail(p)} className="p-1.5 rounded hover:bg-black/5" style={{ color: "#94a3b8" }} title="查看详情">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onToggleCompare(p)}
                    className="p-1.5 rounded transition-colors"
                    style={isInCompare(p.产品型号) ? { backgroundColor: "#dcfce7", color: "#15803d" } : { color: "#94a3b8" }}
                    title="加入对比"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {matches.length > 4 && (
            <p className="text-[10px] pl-2.5" style={{ color: "#94a3b8" }}>还有 {matches.length - 4} 款匹配产品...</p>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-md text-center" style={{ backgroundColor: "#f8f9fa" }}>
          <p className="text-[11px]" style={{ color: "#94a3b8" }}>当前数据不足，建议补充生态、功耗、形态、显存带宽等字段</p>
        </div>
      )}
    </motion.div>
  );
}

export default function ScenesPage({ products, onViewDetail, onToggleCompare, compareList }: Props) {
  const sceneMatches = scenes.map((scene) => {
    const matches = products.filter((p) => {
      const text = `${p.适合场景标签} ${p.主要应用场景} ${p.产品定位} ${p.核心优势} ${p.推荐理由短句}`;
      return scene.keywords.some((k) => text.includes(k));
    });
    return { scene, matches };
  });

  return (
    <div className="max-w-[1400px] mx-auto px-6 pb-16">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#1e293b" }}>按场景选卡</h1>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>基于产品参数和应用场景匹配推荐</p>
          </div>
        </div>

        <div className="panel p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-[#22c55e] shrink-0" />
          <p className="text-xs" style={{ color: "#64748b" }}>
            推荐逻辑基于"主要应用场景"、"适合场景标签"、"产品定位"、"核心优势"等字段自动匹配。建议结合服务器功耗、散热和 PCIe 拓扑综合判断。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sceneMatches.map(({ scene, matches }) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              matches={matches}
              onViewDetail={onViewDetail}
              onToggleCompare={onToggleCompare}
              compareList={compareList}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
