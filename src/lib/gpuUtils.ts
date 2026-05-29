import type { GPUProduct } from "@/types/gpu";

export function getVendors(products: GPUProduct[]): string[] {
  const set = new Set(products.map((p) => p.厂商).filter(Boolean));
  return Array.from(set).sort();
}

export function getProductTypes(products: GPUProduct[]): string[] {
  const set = new Set(products.map((p) => p.产品类型).filter(Boolean));
  return Array.from(set).sort();
}

export function getPositions(products: GPUProduct[]): string[] {
  const set = new Set(products.map((p) => p.产品定位).filter(Boolean));
  return Array.from(set).sort();
}

export function getSceneTags(products: GPUProduct[]): Map<string, number> {
  const tags = new Map<string, number>();
  const commonTags = [
    "大模型推理", "视频分析", "视频解析", "边缘推理", "智能安防",
    "内容审核", "云桌面", "vGPU", "训练", "训推一体",
    "通用AI推理", "图形渲染", "多模态推理", "数据中心", "私有化部署",
    "AI服务器", "HPC", "大模型训练", "国产替代", "千亿参数",
    "智慧城市", "高密度部署", "科学计算",
  ];

  products.forEach((p) => {
    const text = `${p.适合场景标签} ${p.主要应用场景} ${p.产品定位} ${p.推荐理由短句} ${p.核心优势}`;
    commonTags.forEach((tag) => {
      if (text.includes(tag)) {
        tags.set(tag, (tags.get(tag) || 0) + 1);
      }
    });
  });

  return new Map([...tags.entries()].sort((a, b) => b[1] - a[1]));
}

export function getSceneTagProducts(products: GPUProduct[], tag: string): GPUProduct[] {
  return products.filter((p) => {
    const text = `${p.适合场景标签} ${p.主要应用场景} ${p.产品定位} ${p.推荐理由短句}`;
    return text.includes(tag);
  });
}

export function getTypeColor(type: string): string {
  if (type.includes("NPU")) return "#3b82f6";
  if (type.includes("GPU")) return "#10b981";
  if (type.includes("MLU")) return "#f59e0b";
  if (type.includes("DCU")) return "#6366f1";
  if (type.includes("XPU")) return "#8b5cf6";
  if (type.includes("GCU")) return "#f97316";
  if (type.includes("GPGPU")) return "#14b8a6";
  return "#6b7280";
}

export function getEcosystemColor(level: string): string {
  if (level.includes("高")) return "#22c55e";
  if (level.includes("中")) return "#f59e0b";
  if (level.includes("低")) return "#ef4444";
  return "#6b7280";
}

export function getDifficultyColor(level: string): string {
  if (level.includes("极高")) return "#ef4444";
  if (level.includes("高")) return "#f97316";
  if (level.includes("中")) return "#f59e0b";
  if (level.includes("低")) return "#22c55e";
  return "#6b7280";
}

export function getCredibilityColor(level: string): string {
  if (level === "高") return "#22c55e";
  if (level === "中") return "#f59e0b";
  return "#6b7280";
}

export function parseNumberField(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return "暂无数据";
  if (typeof val === "number") return val.toString();
  if (!val || val === "未公开" || val === "推测" || val === "暂无数据") return "暂无数据";
  return String(val);
}

export function countByVendor(products: GPUProduct[]) {
  const counts: Record<string, number> = {};
  products.forEach((p) => {
    const v = p.厂商 || "未知";
    counts[v] = (counts[v] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function countByType(products: GPUProduct[]) {
  const counts: Record<string, number> = {};
  products.forEach((p) => {
    const t = p.产品类型 || "未知";
    counts[t] = (counts[t] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function countByTdpRange(products: GPUProduct[]) {
  const ranges = [
    { label: "≤75W", min: 0, max: 75 },
    { label: "76-150W", min: 76, max: 150 },
    { label: "151-300W", min: 151, max: 300 },
    { label: "301-500W", min: 301, max: 500 },
    { label: ">500W", min: 501, max: Infinity },
    { label: "未知", min: -1, max: -1 },
  ];
  const counts = ranges.map((r) => ({
    name: r.label,
    value:
      r.min === -1
        ? products.filter((p) => !p._tdp_w).length
        : products.filter((p) => {
            const v = p._tdp_w;
            if (!v) return false;
            return v >= r.min && v <= r.max;
          }).length,
  }));
  return counts;
}

export function countByVramRange(products: GPUProduct[]) {
  const ranges = [
    { label: "≤16GB", min: 0, max: 16 },
    { label: "17-32GB", min: 17, max: 32 },
    { label: "33-64GB", min: 33, max: 64 },
    { label: "65-128GB", min: 65, max: 128 },
    { label: ">128GB", min: 129, max: Infinity },
    { label: "未知", min: -1, max: -1 },
  ];
  return ranges.map((r) => ({
    name: r.label,
    value:
      r.min === -1
        ? products.filter((p) => !p._vram_gb).length
        : products.filter((p) => {
            const v = p._vram_gb;
            if (!v) return false;
            return v >= r.min && v <= r.max;
          }).length,
  }));
}

export function countByNvidiaMatch(products: GPUProduct[]) {
  const matches: Record<string, number> = {};
  products.forEach((p) => {
    const match = p.可参考对标NVIDIA;
    if (match && match !== "暂无数据" && match !== "未公开") {
      const key = match.split("/")[0].split("(")[0].trim();
      matches[key] = (matches[key] || 0) + 1;
    }
  });
  return Object.entries(matches)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

export function getSceneRecommendations(products: GPUProduct[]) {
  const scenes = [
    {
      name: "大模型推理",
      keywords: ["大模型推理", "推理", "LLM", "大语言模型", "Transformer"],
      image: "/images/scene-training.jpg",
    },
    {
      name: "视频分析 / 视频解析",
      keywords: ["视频分析", "视频解析", "视频", "编解码", "内容审核"],
      image: "/images/scene-video.jpg",
    },
    {
      name: "边缘推理",
      keywords: ["边缘推理", "边缘", "低功耗", "智能终端"],
      image: "/images/scene-edge.jpg",
    },
    {
      name: "训练 / 训推一体",
      keywords: ["训练", "训推一体", "大模型训练", "深度学习"],
      image: "/images/scene-training.jpg",
    },
    {
      name: "智能安防 / 智慧城市",
      keywords: ["智能安防", "智慧城市", "安防"],
      image: "/images/scene-video.jpg",
    },
    {
      name: "云桌面 / vGPU",
      keywords: ["云桌面", "vGPU", "虚拟化"],
      image: "/images/scene-edge.jpg",
    },
    {
      name: "HPC / 科学计算",
      keywords: ["HPC", "科学计算", "高性能计算"],
      image: "/images/scene-training.jpg",
    },
    {
      name: "国产替代 / 信创",
      keywords: ["国产替代", "信创", "国产化"],
      image: "/images/scene-edge.jpg",
    },
  ];

  return scenes.map((scene) => {
    const matched = products.filter((p) => {
      const text = `${p.适合场景标签} ${p.主要应用场景} ${p.产品定位} ${p.推荐理由短句}`;
      return scene.keywords.some((k) => text.includes(k));
    });
    return { ...scene, products: matched };
  });
}

/* Scene categories for filter panel */
export interface SceneCategory {
  label: string;
  keywords: string[];
}

export const sceneCategories: SceneCategory[] = [
  { label: "大模型训练", keywords: ["大模型训练", "大规模训练", "超大模型训练", "千卡集群", "万卡集群"] },
  { label: "大模型推理", keywords: ["大模型推理", "AIGC", "生成式AI", "文生图", "搜广推"] },
  { label: "AI训练", keywords: ["AI训练", "训练", "深度学习", "中小模型训练"] },
  { label: "AI推理", keywords: ["AI推理", "推理", "图像识别", "语音识别", "NLP"] },
  { label: "图形渲染", keywords: ["图形渲染", "云渲染", "游戏", "内容创作", "数字孪生"] },
  { label: "视频编解码", keywords: ["视频编解码", "视频分析", "视频解析", "内容审核", "智能安防"] },
  { label: "云桌面 / 虚拟化", keywords: ["云桌面", "vGPU", "虚拟化", "远程图形", "安卓云"] },
  { label: "边缘推理", keywords: ["边缘推理", "边缘计算", "低功耗", "物联网", "智能视觉"] },
  { label: "国产替代 / 信创", keywords: ["国产替代", "信创", "国产化", "全国产"] },
  { label: "HPC / 科学计算", keywords: ["HPC", "科学计算", "高性能计算"] },
  { label: "智能驾驶", keywords: ["智能驾驶", "自动驾驶", "ADAS", "NOA", "Robotaxi"] },
];

export function getSceneCategoryCount(products: GPUProduct[], category: SceneCategory): number {
  return products.filter((p) => {
    const text = `${p.适合场景标签 || ""} ${p.主要应用场景 || ""} ${p.产品定位 || ""}`;
    return category.keywords.some((k) => text.includes(k));
  }).length;
}

/* Ecosystem maturity levels */
export const ecosystemLevels = ["高", "中", "低"];

export function getEcosystemLevel(product: GPUProduct): string {
  const val = product.生态成熟度 || "";
  if (val.startsWith("高")) return "高";
  if (val.startsWith("中")) return "中";
  if (val.startsWith("低") || val.startsWith("极低")) return "低";
  return "未知";
}

/* Adaptation difficulty levels */
export const difficultyLevels = ["低", "中", "高", "极高"];

export function getDifficultyLevel(product: GPUProduct): string {
  const val = product.适配难度 || "";
  if (val.startsWith("极高")) return "极高";
  if (val.startsWith("高")) return "高";
  if (val.startsWith("中")) return "中";
  if (val.startsWith("低")) return "低";
  return "未知";
}

/* Cooling methods */
export const coolingMethods = ["被动散热", "风冷", "液冷", "主动散热"];

export function getCoolingMethod(product: GPUProduct): string {
  const val = product.散热方式 || "";
  if (val.includes("液冷")) return "液冷";
  if (val.includes("主动")) return "主动散热";
  if (val.includes("风冷")) return "风冷";
  if (val.includes("被动") || val.includes("自然") || val.includes("无风扇") || val.includes("车规")) return "被动散热";
  return "未知";
}

/* Product status */
export const productStatuses = ["量产/商用", "规划中", "已停产"];

export function getProductStatus(product: GPUProduct): string {
  const val = product.产品状态 || "";
  if (val.includes("已停产")) return "已停产";
  if (val.includes("规划中") || val.includes("研发中") || val.includes("预发布") || val.includes("测试")) return "规划中";
  if (val.includes("量产") || val.includes("商用")) return "量产/商用";
  return "未知";
}

/* Filter count helpers */
export function countByEcosystem(products: GPUProduct[]) {
  const counts: Record<string, number> = {};
  products.forEach((p) => {
    const level = getEcosystemLevel(p);
    if (level !== "未知") counts[level] = (counts[level] || 0) + 1;
  });
  return ecosystemLevels.map((l) => ({ label: l, count: counts[l] || 0 }));
}

export function countByDifficulty(products: GPUProduct[]) {
  const counts: Record<string, number> = {};
  products.forEach((p) => {
    const level = getDifficultyLevel(p);
    if (level !== "未知") counts[level] = (counts[level] || 0) + 1;
  });
  return difficultyLevels.map((l) => ({ label: l, count: counts[l] || 0 }));
}

export function countByCooling(products: GPUProduct[]) {
  const counts: Record<string, number> = {};
  products.forEach((p) => {
    const method = getCoolingMethod(p);
    if (method !== "未知") counts[method] = (counts[method] || 0) + 1;
  });
  return coolingMethods.map((l) => ({ label: l, count: counts[l] || 0 }));
}

export function countByStatus(products: GPUProduct[]) {
  const counts: Record<string, number> = {};
  products.forEach((p) => {
    const status = getProductStatus(p);
    if (status !== "未知") counts[status] = (counts[status] || 0) + 1;
  });
  return productStatuses.map((l) => ({ label: l, count: counts[l] || 0 }));
}

export const vendorColors: Record<string, string> = {
  "华为 (Huawei)": "#3b82f6",
  "摩尔线程 (Moore Threads)": "#10b981",
  "寒武纪 (Cambricon)": "#f59e0b",
  "昆仑芯 (Kunlunxin/百度)": "#8b5cf6",
  "沐曦科技 (MetaX)": "#6366f1",
  "海光 (Hygon)": "#f97316",
  "天数智芯 (Iluvatar)": "#14b8a6",
  "壁仞科技 (BirenTech)": "#ef4444",
  "燧原科技 (Enflame)": "#06b6d4",
};
