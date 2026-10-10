import React from "react";
import { NavLink } from "react-router-dom";
import {
  Activity,
  Code2,
  FolderKanban,
  GitBranch,
  Timer,
  GitCompare,
  FileText,
  Settings,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: Activity },
    { label: "Analyze Code", path: "/analyze", icon: Code2, badge: "Live" },
    { label: "Projects", path: "/projects", icon: FolderKanban },
    { label: "Repositories", path: "/repositories", icon: GitBranch },
    { label: "Benchmarks", path: "/benchmarks", icon: Timer },
    { label: "Compare Center", path: "/compare", icon: GitCompare },
    { label: "Reports", path: "/reports", icon: FileText },
  ];

  const secondaryItems = [
    { label: "Documentation", path: "/docs", icon: BookOpen },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 select-none",
        className
      )}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-sm font-mono font-bold text-lg">
            ?
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-slate-900 leading-tight">
              CodePulse
            </div>
            <div className="text-[11px] font-medium text-slate-400">
              Complexity Intelligence
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Platform
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold bg-brand-600 text-white px-1.5 py-0.2 rounded">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Secondary & Footer */}
      <div className="px-3 py-4 border-t border-slate-100 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Preferences
        </div>
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Status indicator */}
        <div className="mt-4 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Static Engine v1.0.0</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            AST / Radon Active
          </div>
        </div>
      </div>
    </aside>
  );
};
