import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Cpu, Database, LayoutDashboard, Layers, Newspaper, Sparkles, BookOpen } from "lucide-react";

const links = [
  { to: "/", label: "首页", icon: LayoutDashboard },
  { to: "/ai-recommend", label: "AI推荐", icon: Sparkles },
  { to: "/database", label: "产品选型", icon: Database },
  { to: "/knowledge", label: "选型指南", icon: BookOpen },
  { to: "/scenes", label: "场景", icon: Layers },
  { to: "/news", label: "热点", icon: Newspaper },
];

export default function Navigation() {
  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b"
      style={{ borderColor: "#e2e5ea" }}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
          <Cpu className="w-5 h-5 text-[#3b82f6]" />
          <span className="text-sm font-semibold" style={{ color: "#1e293b" }}>GPU Selector</span>
        </NavLink>

        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "text-[#1e293b]"
                      : "text-[#94a3b8] hover:text-[#64748b]"
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? "rgba(0,0,0,0.04)" : "transparent",
                })}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="text-[10px] shrink-0" style={{ color: "#94a3b8" }}>
          国产加速卡选型工具
        </div>
      </div>
    </motion.header>
  );
}
