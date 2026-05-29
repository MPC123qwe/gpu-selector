import { useState, useEffect, useCallback } from "react";
import type { GPUProduct, FilterState } from "@/types/gpu";
import { getEcosystemLevel, getDifficultyLevel, getCoolingMethod, getProductStatus } from "@/lib/gpuUtils";
import type { SceneCategory } from "@/lib/gpuUtils";

const initialFilters: FilterState = {
  search: "",
  vendor: "",
  productType: "",
  position: "",
  sceneTag: "",
  sceneCategory: "",
  serverForm: "",
  status: "",
  credibility: "",
  verified: "",
  videoCodec: "",
  virtualization: "",
  ecosystem: "",
  difficulty: "",
  cooling: "",
  sortBy: "priority",
  quickFilters: {
    onlyVerified: false,
    onlyHighCredibility: false,
    onlyHighPriority: false,
    onlyVideoCodec: false,
    onlyVirtualization: false,
  },
};

export function useGpuData() {
  const [products, setProducts] = useState<GPUProduct[]>([]);
  const [filtered, setFiltered] = useState<GPUProduct[]>([]);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [compareList, setCompareList] = useState<GPUProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<GPUProduct | null>(null);
  const [activeSceneTag, setActiveSceneTag] = useState<string>("");

  useEffect(() => {
    fetch("/gpu_data.json")
      .then((r) => r.json())
      .then((data: GPUProduct[]) => {
        setProducts(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const applyFilters = useCallback(() => {
    let result = [...products];

    // Search
    if (filters.search) {
      let s = filters.search.toLowerCase().trim();
      // Extract core keyword: remove common suffixes/prefixes
      const coreKeyword = s
        .replace(/替代$/, "")
        .replace(/^对标/, "")
        .replace(/显卡$/, "")
        .replace(/加速卡$/, "")
        .replace(/芯片$/, "")
        .replace(/^(NVIDIA|nvidia)\s*/, "")
        .trim();
      // Use core keyword for matching if different from original
      const searchTerms = coreKeyword && coreKeyword !== s ? [s, coreKeyword] : [s];

      // Priority 1: exact model name match
      const modelExact = result.filter((p) => {
        const model = p.产品型号?.toLowerCase() || "";
        return searchTerms.some((term) => model.includes(term));
      });
      // Priority 2: vendor/type/position/scene match
      const otherMatch = result.filter((p) => {
        if (modelExact.includes(p)) return false;
        const text = `${p.厂商 || ""} ${p.产品类型 || ""} ${p.产品定位 || ""} ${p.适合场景标签 || ""}`.toLowerCase();
        return searchTerms.some((term) => text.includes(term));
      });
      // Priority 3: benchmark match (NVIDIA对标)
      const isPureNumeric = /^\d+$/.test(s);
      const benchmarkMatch = !isPureNumeric
        ? result.filter((p) => {
            if (modelExact.includes(p) || otherMatch.includes(p)) return false;
            const benchmark = p.可参考对标NVIDIA?.toLowerCase() || "";
            return searchTerms.some((term) => benchmark.includes(term));
          })
        : [];
      result = [...modelExact, ...otherMatch, ...benchmarkMatch];
    }

    // Dropdown filters
    if (filters.vendor) result = result.filter((p) => p.厂商 === filters.vendor);
    if (filters.productType) result = result.filter((p) => p.产品类型 === filters.productType);
    if (filters.position) result = result.filter((p) => p.产品定位 === filters.position);
    if (filters.sceneTag) {
      result = result.filter(
        (p) =>
          p.适合场景标签?.includes(filters.sceneTag) ||
          p.主要应用场景?.includes(filters.sceneTag) ||
          p.产品定位?.includes(filters.sceneTag)
      );
    }
    // Scene category filter — search across multiple fields using keyword list
    if (filters.sceneCategory) {
      const sceneCatKeywords: Record<string, string[]> = {
        "大模型训练": ["大模型训练", "大规模训练", "超大模型训练", "千卡集群", "万卡集群"],
        "大模型推理": ["大模型推理", "AIGC", "生成式AI", "文生图", "搜广推"],
        "AI训练": ["AI训练", "训练", "深度学习", "中小模型训练"],
        "AI推理": ["AI推理", "推理", "图像识别", "语音识别", "NLP"],
        "图形渲染": ["图形渲染", "云渲染", "游戏", "内容创作", "数字孪生"],
        "视频编解码": ["视频编解码", "视频分析", "视频解析", "内容审核", "智能安防"],
        "云桌面 / 虚拟化": ["云桌面", "vGPU", "虚拟化", "远程图形", "安卓云"],
        "边缘推理": ["边缘推理", "边缘计算", "低功耗", "物联网", "智能视觉"],
        "国产替代 / 信创": ["国产替代", "信创", "国产化", "全国产"],
        "HPC / 科学计算": ["HPC", "科学计算", "高性能计算"],
        "智能驾驶": ["智能驾驶", "自动驾驶", "ADAS", "NOA", "Robotaxi"],
      };
      const keywords = sceneCatKeywords[filters.sceneCategory];
      if (keywords) {
        result = result.filter((p) => {
          const text = `${p.适合场景标签 || ""} ${p.主要应用场景 || ""} ${p.产品定位 || ""}`;
          return keywords.some((k) => text.includes(k));
        });
      }
    }
    if (filters.serverForm)
      result = result.filter((p) => p.推荐服务器形态?.includes(filters.serverForm));
    // Status — use normalized matching
    if (filters.status) {
      result = result.filter((p) => getProductStatus(p) === filters.status);
    }
    if (filters.credibility) result = result.filter((p) => (p.数据可信度 || "").startsWith(filters.credibility));
    if (filters.verified) result = result.filter((p) => p.是否官方可验证?.includes("是"));
    if (filters.videoCodec)
      result = result.filter((p) => p.是否支持视频编解码?.includes("是"));
    if (filters.virtualization)
      result = result.filter((p) => p["是否支持虚拟化/vGPU"]?.includes("支持"));
    // Ecosystem — use normalized level matching
    if (filters.ecosystem) {
      result = result.filter((p) => getEcosystemLevel(p) === filters.ecosystem);
    }
    // Difficulty — use normalized level matching
    if (filters.difficulty) {
      result = result.filter((p) => getDifficultyLevel(p) === filters.difficulty);
    }
    // Cooling — use normalized method matching
    if (filters.cooling) {
      result = result.filter((p) => getCoolingMethod(p) === filters.cooling);
    }

    // Quick filters
    if (filters.quickFilters.onlyVerified)
      result = result.filter((p) => p.是否官方可验证?.includes("是"));
    if (filters.quickFilters.onlyHighCredibility)
      result = result.filter((p) => p.数据可信度 === "高");
    if (filters.quickFilters.onlyHighPriority)
      result = result.filter((p) => p.展示优先级 === "高");
    if (filters.quickFilters.onlyVideoCodec)
      result = result.filter((p) => p.是否支持视频编解码?.includes("是"));
    if (filters.quickFilters.onlyVirtualization)
      result = result.filter((p) => p["是否支持虚拟化/vGPU"]?.includes("支持"));

    // Sort
    switch (filters.sortBy) {
      case "priority":
        const priorityOrder: Record<string, number> = { 高: 3, 中: 2, 低: 1 };
        result.sort((a, b) => (priorityOrder[b.展示优先级] || 0) - (priorityOrder[a.展示优先级] || 0));
        break;
      case "vendor":
        result.sort((a, b) => (a.厂商 || "").localeCompare(b.厂商 || ""));
        break;
      case "type":
        result.sort((a, b) => (a.产品类型 || "").localeCompare(b.产品类型 || ""));
        break;
      case "tdp":
        result.sort((a, b) => (b._tdp_w || 0) - (a._tdp_w || 0));
        break;
      case "vram":
        result.sort((a, b) => (b._vram_gb || 0) - (a._vram_gb || 0));
        break;
      case "int8":
        result.sort((a, b) => (b._int8_tops || 0) - (a._int8_tops || 0));
        break;
      case "fp16":
        result.sort((a, b) => (b._fp16_tflops || 0) - (a._fp16_tflops || 0));
        break;
    }

    setFiltered(result);
  }, [filters, products]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const updateQuickFilter = (key: string, value: boolean) => {
    setFilters((prev) => ({
      ...prev,
      quickFilters: { ...prev.quickFilters, [key]: value },
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setActiveSceneTag("");
  };

  const toggleCompare = (product: GPUProduct) => {
    setCompareList((prev) => {
      const exists = prev.find((p) => p.产品型号 === product.产品型号);
      if (exists) return prev.filter((p) => p.产品型号 !== product.产品型号);
      if (prev.length >= 4) return prev;
      return [...prev, product];
    });
  };

  const removeFromCompare = (model: string) => {
    setCompareList((prev) => prev.filter((p) => p.产品型号 !== model));
  };

  const clearCompare = () => setCompareList([]);

  // Scene tag filtering
  const filterBySceneTag = (tag: string) => {
    if (activeSceneTag === tag) {
      setActiveSceneTag("");
      setFilters((prev) => ({ ...prev, sceneTag: "" }));
    } else {
      setActiveSceneTag(tag);
      setFilters((prev) => ({ ...prev, sceneTag: tag }));
    }
  };

  return {
    products,
    filtered,
    filters,
    loading,
    compareList,
    selectedProduct,
    activeSceneTag,
    setSelectedProduct,
    updateFilter,
    updateQuickFilter,
    resetFilters,
    toggleCompare,
    removeFromCompare,
    clearCompare,
    filterBySceneTag,
  };
}
