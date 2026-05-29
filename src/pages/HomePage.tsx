import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  Cpu,
  MemoryStick,
  Zap,
  Scale,
  Server,
  Layers,
  Wifi,
  Shield,
  Monitor,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import type { GPUProduct } from "@/types/gpu";

/* ------------------------------------------------------------------ */
interface Props {
  products: GPUProduct[];
  onUpdateFilter: (k: string, v: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Knowledge base articles                                            */
/* ------------------------------------------------------------------ */
interface KnowledgeItem {
  id: number;
  icon: React.ElementType;
  title: string;
  summary: string;
  detail: string;
  searchKeyword?: string;
  searchScene?: string;
}

const knowledgeItems: KnowledgeItem[] = [
  {
    id: 1,
    icon: Cpu,
    title: "如何判断一张 GPU 是否适合大模型推理？",
    summary: "看显存容量、INT8/FP16算力、带宽和框架适配四个核心指标",
    detail: "大模型推理选型核心看四点：\n\n1. 显存容量 — 模型参数决定最低显存需求，70B模型INT8量化需约80GB显存，建议留20%余量\n2. INT8/FP16算力 — 推理主要看INT8 TOPS，越高吞吐越大，关注实际业务batch size下的延迟\n3. 显存带宽 — 决定数据搬运速度，高带宽对Transformer类模型至关重要\n4. 框架适配 — 确认支持vLLM/TensorRT-LLM等推理引擎，以及目标模型（Llama/Qwen/DeepSeek等）的优化版本\n\n选型建议：显存 > 算力 > 带宽 > 生态适配，按此优先级评估。",
    searchKeyword: "推理",
  },
  {
    id: 2,
    icon: MemoryStick,
    title: "显存、带宽、功耗在选型中分别怎么看？",
    summary: "三个指标决定性能天花板、运行成本和部署可行性",
    detail: "显存、带宽、功耗是GPU选型的铁三角：\n\n• 显存容量 — 决定能跑多大的模型，计算公式：参数量×精度字节数÷压缩率。HBM2e/HBM3比GDDR6带宽高3-5倍\n• 显存带宽 — 决定数据吞吐，Transformer推理瓶颈往往在带宽而非算力。目标≥1TB/s for大模型\n• TDP功耗 — 决定散热方案和电费成本。300W+需液冷，150W以下可风冷。8卡集群年电费差异可达数万元\n\n三者关系：显存够大但带宽低 → 算力利用率低；带宽够但显存小 → 跑不了大模型；功耗高 → 机房成本增加。",
  },
  {
    id: 3,
    icon: Zap,
    title: "AI 训练卡和推理卡有什么区别？",
    summary: "训练追求高算力+大显存+互联带宽，推理追求低延迟+高能效比+虚拟化",
    detail: "训练卡 vs 推理卡的核心差异：\n\n训练卡特点：\n• 高BF16/FP32算力（训练主力精度）\n• 大显存（64GB+ HBM2e/HBM3）\n• 高速互联（HCCS/NVLink，400GB/s+）\n• 支持多卡并行和checkpoint大文件\n• 典型：昇腾910B、壁砺106M\n\n推理卡特点：\n• 高INT8/FP16算力（推理精度）\n• 中低显存（16-48GB）\n• 支持虚拟化/vGPU\n• 低功耗、高能效比（TOPS/W）\n• 典型：Atlas 300I、云燧i20、MLU370-S4\n\n部分卡训推一体（如910B、L600），但训练性能通常不如专用训练卡。",
    searchKeyword: "训练",
  },
  {
    id: 4,
    icon: Scale,
    title: "国产 GPU 替代 NVIDIA 时要注意什么？",
    summary: "生态适配、精度支持、互联方案、软件栈成熟度是四大关键挑战",
    detail: "国产GPU替代NVIDIA的 checklist：\n\n1. 软件生态 — CUDA兼容层（MUSA/ixUCA/MXMACA）能否跑通现有代码？是否需要改算子？\n2. 精度支持 — 是否支持BF16/FP8？训练场景BF16是刚需\n3. 互联方案 — 多卡训练需要高速互联（HCCS/MLU-Link/MetaXLink），PCIe带宽不够\n4. 模型适配 — 目标模型（LLaMA/Qwen/DeepSeek）是否有官方优化版本？\n5. 工具链 —  profiling、调试、部署工具是否完善？\n6. 长期支持 — 厂商是否有持续迭代计划？社区活跃度如何？\n\n建议：先用推理场景切入，积累适配经验后再扩展到训练。",
  },
  {
    id: 5,
    icon: Server,
    title: "服务器适配 GPU 时要看哪些参数？",
    summary: "PCIe版本、供电、散热、物理尺寸、CPU匹配五项缺一不可",
    detail: "服务器适配GPU的关键检查项：\n\n• PCIe版本 — GPU是PCIe 4.0/5.0，主板需匹配，否则带宽受限\n• 供电能力 — 单卡功耗（TDP）×卡数 ≤ 电源冗余设计，910B 400W×8 = 3.2kW\n• 散热方式 — 被动风冷/主动风冷/液冷，需确认机箱风道设计\n• 物理尺寸 — 全高全长(FHFL) vs 半高半长(HHHL)，确认机箱深度和槽位\n• CPU匹配 — GPU密集型任务CPU瓶颈不明显，但数据预处理需要足够核数\n• 网络 — 多机训练需要RDMA/RoCE，确认网卡规格\n\n建议：优先选经过厂商认证的服务器整机方案（如Atlas 800T）。",
  },
  {
    id: 6,
    icon: Layers,
    title: "INT8 / FP16 / BF16 精度怎么选？",
    summary: "训练用BF16，推理用INT8/FP16，不同精度影响速度和准确率",
    detail: "精度选型指南：\n\n• INT8 — 量化推理首选，速度最快（2-4× FP16），显存减半。适合部署阶段，需确认量化后精度损失可接受\n• FP16 — 训练和推理通用，NVIDIA V100/A100主力精度。国产卡普遍支持\n• BF16 — 训练推荐，动态范围与FP32相同，训练稳定性好。昇腾910B/壁砺106等主力训练精度\n• FP32 — 高精度科学计算，AI训练已逐步被BF16替代\n• FP8 — 新一代低精度（H100/910C/L600支持），推理速度再翻倍，生态仍在成熟中\n\n选型建议：推理优先INT8，训练优先BF16，科研HPC需FP32/FP64。",
  },
  {
    id: 7,
    icon: Wifi,
    title: "多卡互联（HCCS / NVLink / PCIe）选型要点",
    summary: "多卡训练必须高速互联，PCIe带宽是瓶颈，专用互联方案决定扩展效率",
    detail: "多卡互联方案对比：\n\n• NVLink — NVIDIA专用，900GB/s（H100），业界标杆\n• HCCS — 华为自研，392GB/s（910B），支持8卡Full Mesh\n• MLU-Link — 寒武纪，200GB/s（思元370），支持POD内全互联\n• MetaXLink — 沐曦自研，对标NVLink\n• PCIe 5.0 x16 — 64GB/s，远低于专用互联，仅适合推理\n\n关键指标：互联带宽决定多卡扩展效率。8卡训练时，PCIe互联效率约60-70%，HCCS/NVLink可达90%+。\n\n选型建议：千卡集群必须专用互联，单机8卡训练HCCS/NVLink是刚需。",
  },
  {
    id: 8,
    icon: Shield,
    title: "信创 / 国产化场景 GPU 选型指南",
    summary: "优先海光、华为、寒武纪等信创目录产品，关注适配难度和生态成熟度",
    detail: "信创场景GPU选型要点：\n\n• 信创目录 — 优先选入信创目录的产品：海光DCU、华为昇腾、寒武纪MLU、景嘉微JM9\n• 国产OS适配 — 确认支持麒麟V10/统信UOS/方德等国产操作系统\n• 安全合规 — 是否支持国密算法、可信计算、安全虚拟化\n• 供应链 — 全国产供应链优先（中芯国际代工+长电封测）\n• 生态成熟度 — 信创场景生态比性能更重要，选有完整工具链的\n\n推荐方案：海光DCU（x86生态兼容好）+ 华为昇腾（生态全）+ 寒武纪（云端成熟）。",
    searchKeyword: "信创",
  },
  {
    id: 9,
    icon: Monitor,
    title: "边缘推理低功耗 GPU 怎么选？",
    summary: "功耗<30W优先，看能效比（TOPS/W）、散热方式、封装尺寸三个指标",
    detail: "边缘低功耗GPU选型指南：\n\n• 功耗 — 无风扇被动散热≤15W，有风扇≤30W，工业级宽温-40~85°C\n• 能效比 — TOPS/W越高越好，思元220达2 TOPS/W，Atlas 500 A2约0.6 TOPS/W\n• 算力 — 边缘推理16-100 TOPS INT8足够，不需要训练能力\n• 视频编解码 — 边缘多路摄像头场景需硬解支持，关注路数和分辨率\n• 接口 — M.2/PCIe/MXM哪种形态适合目标设备？\n• 工具链 — 边缘部署需轻量SDK，模型转换是否方便？\n\n推荐：思元220（M.2/16TOPS）、Atlas 500 A2（20TOPS无风扇）、RK3588（6TOPS/8K视频）。",
    searchKeyword: "边缘",
  },
  {
    id: 10,
    icon: BookOpen,
    title: "云桌面 vGPU 虚拟化方案选型",
    summary: "SR-IOV直通、时间片分时、软件虚拟化三种方案各有适用场景",
    detail: "vGPU虚拟化三种技术路线：\n\n• SR-IOV硬件直通 — 性能损失<5%，隔离性好，支持16路分割。需GPU硬件支持（S2000/JM11）\n• 时间片分时 — 灵活性高，可动态调整配额，性能损失10-20%。MUSA/ixUCA支持\n• 软件虚拟化（API层拦截） — 兼容性最好，支持任意GPU，性能损失20-40%\n\n选型考量：\n• 图形设计类 — 选SR-IOV直通，低延迟要求高\n• 办公云桌面 — 时间片分时足够，成本低\n• 混合负载 — 软件虚拟化最灵活\n\n国产支持vGPU的产品：摩尔线程S2000（硬件级16路）、海光DCU（虚拟化）、象帝先X1900（SR-IOV）。",
    searchKeyword: "云桌面",
  },
];

/* ================================================================== */
export default function HomePage({ products, onUpdateFilter }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleSearch = () => {
    if (query.trim()) {
      onUpdateFilter("search", query.trim());
      navigate("/database");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleTagSearch = (keyword: string) => {
    onUpdateFilter("search", keyword);
    navigate("/database");
  };

  const hotModels = [
    { label: "昇腾910B" },
    { label: "S4000" },
    { label: "S5000" },
    { label: "L600" },
  ];
  const hotScenes = [
    { label: "大模型推理" },
    { label: "视频编解码" },
    { label: "图形云" },
    { label: "国产化替代" },
  ];
  const hotBenchmarks = [
    { label: "T4替代" },
    { label: "A10替代" },
    { label: "L4替代" },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center pt-16 pb-8">
      {/* ===== LOGO ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-5xl font-bold tracking-tight" style={{ color: "#2932e1" }}>
          GPU选型
        </h1>
        <p className="text-center text-sm mt-1 tracking-wider" style={{ color: "#999" }}>
          国产GPU/AI加速卡智能选型平台
        </p>
      </motion.div>

      {/* ===== SEARCH BOX ===== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-[640px] px-4"
      >
        <div
          className="relative flex items-center rounded-2xl bg-white transition-all duration-200 focus-within:shadow-lg focus-within:ring-2"
          style={{
            boxShadow: "inset 0 0 0 2px #c4c7ce",
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索GPU型号、厂商、场景..."
            className="flex-1 px-5 py-3.5 text-base outline-none bg-transparent rounded-2xl"
            style={{ color: "#222" }}
          />
          <button
            onClick={handleSearch}
            className="px-7 flex items-center justify-center text-white text-base font-medium transition-all hover:opacity-90 rounded-r-2xl rounded-l-none"
            style={{
              backgroundColor: "#4e6ef2",
              alignSelf: "stretch",
              margin: 0,
              paddingTop: "14px",
              paddingBottom: "14px",
            }}
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* 热门型号 */}
        <div className="flex flex-wrap items-center gap-2 mt-3 px-1">
          <span className="text-xs font-medium w-14 text-right shrink-0" style={{ color: "#9195a3" }}>热门型号:</span>
          <div className="flex flex-wrap gap-2">
            {hotModels.map((tag) => (
              <button
                key={tag.label}
                onClick={() => { setQuery(tag.label); handleTagSearch(tag.label); }}
                className="text-xs px-2.5 py-1 rounded-full transition-colors hover:bg-[#eef0ff]"
                style={{ color: "#4e6ef2", backgroundColor: "#f0f2ff" }}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
        {/* 热门场景 */}
        <div className="flex flex-wrap items-center gap-2 mt-2 px-1">
          <span className="text-xs font-medium w-14 text-right shrink-0" style={{ color: "#9195a3" }}>热门场景:</span>
          <div className="flex flex-wrap gap-2">
            {hotScenes.map((tag) => (
              <button
                key={tag.label}
                onClick={() => { setQuery(tag.label); handleTagSearch(tag.label); }}
                className="text-xs px-2.5 py-1 rounded-full transition-colors hover:bg-[#e6f7e6]"
                style={{ color: "#10b981", backgroundColor: "#eefcf3" }}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
        {/* 对标搜索 */}
        <div className="flex flex-wrap items-center gap-2 mt-2 px-1">
          <span className="text-xs font-medium w-14 text-right shrink-0" style={{ color: "#9195a3" }}>对标搜索:</span>
          <div className="flex flex-wrap gap-2">
            {hotBenchmarks.map((tag) => (
              <button
                key={tag.label}
                onClick={() => { setQuery(tag.label); handleTagSearch(tag.label); }}
                className="text-xs px-2.5 py-1 rounded-full transition-colors hover:bg-[#fff3e6]"
                style={{ color: "#f59e0b", backgroundColor: "#fffbeb" }}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ===== AI BANNER ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-[640px] px-4 mt-5"
      >
        <button
          onClick={() => navigate("/ai-recommend")}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all hover:shadow-md"
          style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">
            AI 智能推荐 - 说出你的需求，自动匹配最合适的GPU
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-white/80" />
        </button>
      </motion.div>

      {/* ===== 选型知识库 ===== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-[640px] px-4 mt-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" style={{ color: "#4e6ef2" }} />
            <span className="text-sm font-semibold" style={{ color: "#222" }}>
              选型知识库
            </span>
          </div>
          <button
            onClick={() => navigate("/knowledge")}
            className="flex items-center gap-1 text-xs transition-colors hover:underline"
            style={{ color: "#9195a3" }}
          >
            查看全部
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Knowledge Cards — 2-column grid */}
        <div className="grid grid-cols-2 gap-3 items-start">
          {knowledgeItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className={`panel transition-all hover:shadow-sm cursor-pointer overflow-hidden ${isExpanded ? "ring-1 ring-[#4e6ef2]/20" : ""}`}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className="flex items-center gap-2.5 p-3">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(78,110,242,0.08)" }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: "#4e6ef2" }} />
                  </div>
                  <p className="flex-1 text-xs font-medium leading-snug" style={{ color: "#1e293b" }}>
                    {item.title}
                  </p>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 shrink-0" style={{ color: "#c4c7ce" }} />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: "#c4c7ce" }} />
                  )}
                </div>

                {/* Expanded detail — inside panel, clicks propagate to close */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="p-3 text-xs leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto border-t"
                        style={{ color: "#475569", backgroundColor: "#fafbfc", borderColor: "#f0f0f0" }}
                      >
                        {item.detail}
                        {item.searchKeyword && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTagSearch(item.searchKeyword!);
                            }}
                            className="mt-2 flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md transition-colors"
                            style={{ color: "#4e6ef2", backgroundColor: "#eef0ff" }}
                          >
                            <Search className="w-2.5 h-2.5" />
                            查看相关产品
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="flex-1" />

      <p className="text-center mt-8" style={{ color: "#bbb", fontSize: "12px" }}>
        覆盖 {products.length}+ 款国产GPU/AI加速卡 · {new Set(products.map((p) => p.厂商)).size} 家厂商
      </p>
    </div>
  );
}


