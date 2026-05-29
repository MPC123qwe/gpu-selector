import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ScatterChart, Scatter, ZAxis,
} from "recharts";
import type { GPUProduct } from "@/types/gpu";
import {
  countByVendor, countByType, countByTdpRange, countByVramRange, countByNvidiaMatch,
} from "@/lib/gpuUtils";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#f97316", "#14b8a6", "#ec4899", "#6366f1"];

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md px-2.5 py-1.5 text-[11px] border shadow-sm" style={{ backgroundColor: "#fff", borderColor: "#e2e5ea" }}>
      <div style={{ color: "#334155" }}>{label || payload[0]?.name}</div>
      <div style={{ color: "#94a3b8" }}>{payload[0]?.value} 款</div>
    </div>
  );
}

export default function ChartsSection({ products, compact }: { products: GPUProduct[]; compact?: boolean }) {
  const vendorData = useMemo(() => countByVendor(products), [products]);
  const typeData = useMemo(() => countByType(products), [products]);
  const tdpData = useMemo(() => countByTdpRange(products), [products]);
  const vramData = useMemo(() => countByVramRange(products), [products]);
  const nvidiaData = useMemo(() => countByNvidiaMatch(products), [products]);

  const matrixData = useMemo(() => {
    interface Entry { eco: string; diff: string; count: number; products: string[]; }
    const map: Record<string, Entry> = {};
    const ecoLevels = ["高", "中", "低", "极低"];
    const diffLevels = ["低", "中", "高", "极高"];

    products.forEach((p) => {
      const eco = p.生态成熟度?.replace(/[（(].*?[）)]/g, "").trim() || "未知";
      const diff = p.适配难度?.replace(/[（(].*?[/）)]/g, "").trim() || "未知";
      let ek = "未知", dk = "未知";
      for (const l of ecoLevels) if (eco.includes(l)) { ek = l; break; }
      for (const l of diffLevels) if (diff.includes(l)) { dk = l; break; }
      const key = `${ek}-${dk}`;
      if (!map[key]) map[key] = { eco: ek, diff: dk, count: 0, products: [] };
      map[key].count++;
      map[key].products.push(p.产品型号);
    });

    return Object.values(map).map((d) => ({
      x: ["低", "中", "高", "极高"].indexOf(d.diff),
      y: ["高", "中", "低", "极低"].indexOf(d.eco),
      z: d.count * 80 + 40,
      name: `${d.eco}生态 / ${d.diff}适配`,
      count: d.count,
    }));
  }, [products]);

  const Card = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5 }} className={`panel p-4 ${className}`}>
      <h3 className="text-xs font-semibold mb-3" style={{ color: "#334155" }}>{title}</h3>
      {children}
    </motion.div>
  );

  if (compact) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="厂商分布">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={vendorData} cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3} dataKey="value" nameKey="name" stroke="none">
                {vendorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card title="功耗区间">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tdpData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>{tdpData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="显存分布">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={vramData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>{vramData.map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    );
  }

  return (
    <section id="charts">
      <div className="mb-6">
        <h2 className="text-lg font-bold" style={{ color: "#1e293b" }}>数据可视化分析</h2>
        <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>基于筛选结果动态生成的多维分析</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card title="厂商产品数量">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={vendorData} cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3} dataKey="value" nameKey="name" stroke="none">
                {vendorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="产品类型分布">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={typeData.slice(0, 8)} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={90} tick={{ fill: "#94a3b8", fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={(v: string) => v.length > 10 ? v.slice(0, 10) + "..." : v} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="value" radius={[0, 3, 3, 0]}>{typeData.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="功耗区间">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={tdpData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>{tdpData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="显存容量">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={vramData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>{vramData.map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="生态 x 适配矩阵" className="md:col-span-2 xl:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" />
              <XAxis type="number" dataKey="x" domain={[-0.5, 3.5]} ticks={[0, 1, 2, 3]}
                tickFormatter={(v) => ["低", "中", "高", "极高"][v] || ""}
                tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false}
                label={{ value: "适配难度 ->", position: "bottom", fill: "#94a3b8", fontSize: 9 }} />
              <YAxis type="number" dataKey="y" domain={[-0.5, 3.5]} ticks={[0, 1, 2, 3]}
                tickFormatter={(v) => ["高", "中", "低", "极低"][v] || ""}
                tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false}
                label={{ value: "生态 ->", angle: -90, position: "left", fill: "#94a3b8", fontSize: 9 }} />
              <ZAxis dataKey="z" range={[40, 280]} />
              <Tooltip content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return <div className="rounded-md px-2.5 py-1.5 text-[11px] border shadow-sm max-w-[220px]" style={{ backgroundColor: "#fff", borderColor: "#e2e5ea" }}>
                  <div style={{ color: "#334155" }}>{d?.name}</div>
                  <div style={{ color: "#94a3b8" }}>{d?.count} 款</div>
                </div>;
              }} />
              <Scatter data={matrixData} fill="#3b82f6" fillOpacity={0.6}>
                {matrixData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </Card>

        <Card title="NVIDIA 对标">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={nvidiaData} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={70} tick={{ fill: "#94a3b8", fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={(v: string) => v.length > 10 ? v.slice(0, 10) + "..." : v} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="value" radius={[0, 3, 3, 0]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </section>
  );
}
