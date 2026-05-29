export interface GPUProduct {
  厂商: string;
  产品型号: string;
  产品系列: string;
  产品类型: string;
  产品定位: string;
  主要应用场景: string;
  适合场景标签: string;
  不建议场景: string;
  核心优势: string;
  主要风险: string;
  INT8算力: string;
  FP16算力: string;
  BF16算力: string;
  FP32算力: string;
  显存容量: string;
  显存类型: string;
  显存带宽: string;
  TDP功耗: string;
  接口形态: string;
  PCIe规格: string;
  卡尺寸: string;
  散热方式: string;
  支持操作系统: string;
  "驱动/SDK/工具链": string;
  支持AI框架: string;
  支持模型类型: string;
  "是否支持虚拟化/vGPU": string;
  是否支持视频编解码: string;
  推荐服务器形态: string;
  推荐部署方式: string;
  适配注意事项: string;
  可参考对标NVIDIA: string;
  对标依据: string;
  资料来源链接: string;
  来源类型: string;
  发布时间: string;
  数据可信度: string;
  最新新闻: string;
  产品状态: string;
  是否官方可验证: string;
  展示优先级: string;
  生态成熟度: string;
  适配难度: string;
  推荐理由短句: string;
  风险提示短句: string;
  "参考价格 (元)": string;
  // Parsed numeric fields
  _int8_tops: number | null;
  _fp16_tflops: number | null;
  _bf16_tflops: number | null;
  _fp32_tflops: number | null;
  _vram_gb: number | null;
  _tdp_w: number | null;
}

export interface FilterState {
  search: string;
  vendor: string;
  productType: string;
  position: string;
  sceneTag: string;
  sceneCategory: string;
  serverForm: string;
  status: string;
  credibility: string;
  verified: string;
  videoCodec: string;
  virtualization: string;
  ecosystem: string;
  difficulty: string;
  cooling: string;
  sortBy: string;
  quickFilters: {
    onlyVerified: boolean;
    onlyHighCredibility: boolean;
    onlyHighPriority: boolean;
    onlyVideoCodec: boolean;
    onlyVirtualization: boolean;
  };
}

export interface SceneRecommendation {
  name: string;
  keywords: string[];
  image: string;
}
