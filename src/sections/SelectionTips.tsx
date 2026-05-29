import { motion } from "framer-motion";
import { Zap, Server, Globe, ShieldAlert, Layers } from "lucide-react";

const tips = [
  {
    icon: Zap, title: "性能维度", color: "#3b82f6",
    items: [
      "INT8 TOPS：衡量推理吞吐量的核心指标，视频解析场景优先关注",
      "FP16/BF16 TFLOPS：大模型训练和推理的关键算力参数",
      "FP32 TFLOPS：科学计算和高精度训练的必要参考",
      "显存容量：大模型部署需 64GB+，推理场景 32GB 通常足够",
      "显存带宽：影响数据吞吐效率，HBM2e/HBM3 优于 GDDR6",
    ],
  },
  {
    icon: Server, title: "部署维度", color: "#10b981",
    items: [
      "TDP 功耗：≤75W 适合边缘/高密度，150-300W 需关注散热方案",
      "接口形态：PCIe 卡通用性强，OAM 模组需专用服务器",
      "PCIe 规格：5.0 带宽翻倍，对大模型训练有明显优势",
      "卡尺寸：半高半长适合 1U/2U 机箱，全高全长需 4U 空间",
      "散热方式：被动散热依赖机箱风道，液冷适合高功耗集群",
    ],
  },
  {
    icon: Globe, title: "生态维度", color: "#f59e0b",
    items: [
      "支持操作系统：确认是否兼容目标 OS（openEuler/CentOS/Ubuntu）",
      "驱动/SDK：CANN/MUSA/ROCm/Neuware 各有适配成本",
      "AI 框架：PyTorch 适配度普遍较高，TensorFlow 需单独验证",
      "生态成熟度：高成熟度意味着迁移工具完善、社区支持充足",
      "模型兼容性：确认目标模型是否已完成官方适配和验证",
    ],
  },
  {
    icon: ShieldAlert, title: "风险维度", color: "#ef4444",
    items: [
      "供应风险：受美国制裁的厂商可能存在量产和交付不确定性",
      "数据可信度：优先选择官方可验证的产品参数",
      "适配难度：极高适配难度意味着需要厂商深度技术配合",
      "官方验证：优先选择官方可验证的产品，降低参数偏差风险",
      "制裁影响：壁仞科技等被列入实体清单，供应风险极高",
    ],
  },
  {
    icon: Layers, title: "场景维度", color: "#8b5cf6",
    items: [
      "主要应用场景：核对产品与目标场景的核心匹配度",
      "适合场景标签：综合多个标签判断产品的多场景适配能力",
      "不建议场景：关注明确不适用的场景，避免选型失误",
      "推荐服务器形态：确认与现有或计划采购的服务器兼容",
      "推荐部署方式：单卡/多卡/集群，根据规模选择合适方案",
    ],
  },
];

export default function SelectionTips() {
  return (
    <section id="tips">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#e2e4e9]">产品经理选型提示</h2>
        <p className="text-xs text-[#6b7280] mt-0.5">五维选型方法论</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {tips.map((tip, i) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="panel-hover p-5"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: `${tip.color}12` }}>
                <tip.icon className="w-4 h-4" style={{ color: tip.color }} />
              </div>
              <h3 className="text-sm font-semibold text-[#e2e4e9]">{tip.title}</h3>
            </div>
            <ul className="space-y-2">
              {tip.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: tip.color }} />
                  <span className="text-[11px] text-[#6b7280] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
