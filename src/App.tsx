import { Routes, Route } from "react-router-dom";
import { useGpuData } from "@/hooks/useGpuData";
import Navigation from "@/sections/Navigation";
import CompareBar from "@/sections/CompareBar";
import ProductDrawer from "@/sections/ProductDrawer";
import HomePage from "@/pages/HomePage";
import DatabasePage from "@/pages/DatabasePage";

import ScenesPage from "@/pages/ScenesPage";
import NewsPage from "@/pages/NewsPage";
import AiChatPage from "@/pages/AiChatPage";
import KnowledgePage from "@/pages/KnowledgePage";
import Footer from "@/sections/Footer";

export default function App() {
  const gpu = useGpuData();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f1f3f6", color: "#1e293b" }}>
      <Navigation />

      <main className="pt-14">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                products={gpu.products}
                onUpdateFilter={(k: string, v: string) => gpu.updateFilter(k as any, v)}
              />
            }
          />
          <Route
            path="/database"
            element={
              <DatabasePage
                products={gpu.products}
                filtered={gpu.filtered}
                filters={gpu.filters}
                compareList={gpu.compareList}
                onUpdateFilter={gpu.updateFilter}
                onQuickFilter={gpu.updateQuickFilter}
                onResetFilters={gpu.resetFilters}
                onToggleCompare={gpu.toggleCompare}
                onViewDetail={gpu.setSelectedProduct}
              />
            }
          />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route
            path="/scenes"
            element={
              <ScenesPage
                products={gpu.products}
                onViewDetail={gpu.setSelectedProduct}
                onToggleCompare={gpu.toggleCompare}
                compareList={gpu.compareList}
              />
            }
          />
          <Route
            path="/ai-recommend"
            element={
              <AiChatPage
                products={gpu.products}
                onViewDetail={gpu.setSelectedProduct}
              />
            }
          />
        </Routes>
      </main>

      <ProductDrawer
        product={gpu.selectedProduct}
        onClose={() => gpu.setSelectedProduct(null)}
      />

      <CompareBar
        compareList={gpu.compareList}
        onRemove={gpu.removeFromCompare}
        onClear={gpu.clearCompare}
        onOpenPanel={() => {}}
      />

      <Footer />
    </div>
  );
}
