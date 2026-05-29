import { useMemo } from "react";
import { motion } from "framer-motion";
import { getSceneTags } from "@/lib/gpuUtils";
import type { GPUProduct } from "@/types/gpu";
import { Tag } from "lucide-react";

const tagColors: Record<string, string> = {
  "大模型推理": "#3b82f6", "视频分析": "#f59e0b", "视频解析": "#d97706",
  "边缘推理": "#10b981", "智能安防": "#6366f1", "内容审核": "#8b5cf6",
  "云桌面": "#06b6d4", "vGPU": "#14b8a6", "训练": "#ef4444",
  "训推一体": "#f59e0b", "通用AI推理": "#10b981", "图形渲染": "#3b82f6",
  "多模态推理": "#8b5cf6", "数据中心": "#06b6d4", "私有化部署": "#14b8a6",
  "AI服务器": "#f97316", "HPC": "#ef4444", "大模型训练": "#f59e0b",
  "国产替代": "#10b981", "千亿参数": "#3b82f6", "智慧城市": "#6366f1",
  "高密度部署": "#06b6d4", "科学计算": "#14b8a6",
};

export default function SceneCloud({
  products,
  activeTag,
  onTagClick,
}: {
  products: GPUProduct[];
  activeTag: string;
  onTagClick: (tag: string) => void;
}) {
  const tags = useMemo(() => getSceneTags(products), [products]);
  const sorted = useMemo(() => [...tags.entries()].slice(0, 24), [tags]);
  const maxCount = useMemo(() => Math.max(...[...tags.values()], 1), [tags]);

  return (
    <section className="panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-4 h-4 text-[#3b82f6]" />
        <h2 className="text-sm font-semibold text-[#e2e4e9]">应用场景</h2>
        {activeTag && (
          <span className="text-xs text-[#f59e0b] ml-2">
            已选: {activeTag}
            <button
              onClick={() => onTagClick(activeTag)}
              className="ml-1.5 text-[#6b7280] hover:text-[#e2e4e9] underline"
            >
              清除
            </button>
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {sorted.map(([tag, count], i) => {
          const size = Math.max(0.8, Math.min(1.15, (count / maxCount) * 0.5 + 0.75));
          const isActive = activeTag === tag;
          const color = tagColors[tag] || "#6b7280";

          return (
            <motion.button
              key={tag}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.015 }}
              onClick={() => onTagClick(tag)}
              className={`px-3 py-1.5 rounded-md text-xs border transition-all duration-200 ${
                isActive
                  ? "border-current bg-current/10"
                  : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]"
              }`}
              style={{
                fontSize: `${size}rem`,
                color: isActive ? color : "#9ca3af",
                borderColor: isActive ? `${color}40` : undefined,
              }}
              title={`${count} 款产品`}
            >
              {tag}
              <span className="ml-1 opacity-50">{count}</span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
