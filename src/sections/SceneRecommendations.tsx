import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Server, Target } from "lucide-react";
import type { GPUProduct } from "@/types/gpu";
import { getSceneRecommendations, vendorColors } from "@/lib/gpuUtils";

export default function SceneRecommendations({ products }: { products: GPUProduct[] }) {
  const recommendations = getSceneRecommendations(products);

  return (
    <section id="scenes">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#e2e4e9]">按场景推荐</h2>
        <p className="text-xs text-[#6b7280] mt-0.5">根据应用场景自动归类推荐</p>
      </div>

      <div className="space-y-6">
        {recommendations.map((scene, si) => {
          if (scene.products.length === 0) return null;
          return (
            <motion.div
              key={scene.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: si * 0.05 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-3.5 h-3.5 text-[#3b82f6]" />
                <h3 className="text-sm font-semibold text-[#e2e4e9]">{scene.name}</h3>
                <span className="text-[10px] text-[#6b7280]">{scene.products.length} 款</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {scene.products.slice(0, 6).map((p, i) => {
                  const vc = vendorColors[p.厂商] || "#6b7280";
                  return (
                    <motion.div
                      key={`${p.厂商}_${p.产品型号}_${i}`}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                      className="panel-hover p-3.5"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: vc, backgroundColor: `${vc}12` }}>
                          {p.厂商}
                        </span>
                        <span className="text-xs font-semibold text-[#e2e4e9]">{p.产品型号}</span>
                      </div>

                      {p.推荐理由短句 && (
                        <div className="flex items-start gap-1.5 mb-1.5">
                          <CheckCircle className="w-3 h-3 text-[#22c55e] shrink-0 mt-0.5" />
                          <p className="text-[11px] text-[#6b7280] line-clamp-2">{p.推荐理由短句}</p>
                        </div>
                      )}
                      {p.风险提示短句 && (
                        <div className="flex items-start gap-1.5 mb-1.5">
                          <AlertTriangle className="w-3 h-3 text-[#ef4444] shrink-0 mt-0.5" />
                          <p className="text-[11px] text-[#ef4444]/60 line-clamp-2">{p.风险提示短句}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[10px] text-[#6b7280]">
                        {p.推荐服务器形态 && <span className="flex items-center gap-1"><Server className="w-2.5 h-2.5" />{p.推荐服务器形态}</span>}
                        {p.可参考对标NVIDIA && <span className="text-[#3b82f6]">对标 {p.可参考对标NVIDIA.split("/")[0].split("(")[0].trim()}</span>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
