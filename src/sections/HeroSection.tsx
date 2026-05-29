import { motion } from "framer-motion";
import { Boxes, Server, Zap, Shield, Award, HardDrive } from "lucide-react";
import type { GPUProduct } from "@/types/gpu";

export default function HeroSection({ products }: { products: GPUProduct[] }) {
  const vendors = new Set(products.map((p) => p.厂商).filter(Boolean));
  const inferenceCards = products.filter((p) => p.产品定位?.includes("推理")).length;
  const trainingCards = products.filter((p) => p.产品定位?.includes("训练") || p.产品定位?.includes("训推")).length;
  const verified = products.filter((p) => p.是否官方可验证?.includes("是")).length;
  const highPri = products.filter((p) => p.展示优先级 === "高").length;

  const stats = [
    { icon: Boxes, label: "产品总数", value: products.length },
    { icon: Server, label: "厂商数量", value: vendors.size },
    { icon: Zap, label: "推理卡", value: inferenceCards },
    { icon: HardDrive, label: "训练/训推卡", value: trainingCards },
    { icon: Shield, label: "官方可验证", value: verified },
    { icon: Award, label: "高优先级", value: highPri },
  ];

  return (
    <section className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl font-bold text-[#e2e4e9] mb-1">
          国产GPU卡选型方案
        </h1>
        <p className="text-sm text-[#6b7280]">
          面向服务器产品经理与售前方案的国产 AI 加速卡横向对比工具
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="panel-hover p-4"
          >
            <stat.icon className="w-4 h-4 text-[#3b82f6] mb-2" />
            <div className="text-2xl font-mono font-bold text-[#e2e4e9]">{stat.value}</div>
            <div className="text-[11px] text-[#6b7280] mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
