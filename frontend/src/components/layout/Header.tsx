import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Plus, Bell, User as UserIcon, Menu } from "lucide-react";
import { Button } from "../ui/Button";

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const location = useLocation();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path === "/analyze") return "Interactive Analyzer";
    if (path === "/projects") return "Projects & History";
    if (path === "/repositories") return "Repository Scanner";
    if (path === "/benchmarks") return "Benchmark Complexity Lab";
    if (path === "/compare") return "Side-by-Side Comparison";
    if (path === "/reports") return "Audit Reports";
    if (path === "/settings") return "Preferences & Configuration";
    if (path === "/docs") return "Documentation & Standards";
    return "";
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        {onToggleMobileMenu && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/dashboard" className="hover:text-slate-900 transition-colors">
            Workspace
          </Link>
          {getBreadcrumb() && (
            <>
              <span>/</span>
              <span className="font-semibold text-slate-900">{getBreadcrumb()}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Analyze CTA */}
        <Link to="/analyze">
          <Button variant="primary" size="sm" className="shadow-sm">
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span>New Analysis</span>
          </Button>
        </Link>

        {/* User profile dropdown pill */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200 text-xs font-medium text-slate-700">
          <div className="h-7 w-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
            CP
          </div>
          <span className="hidden sm:inline">Lead Developer</span>
        </div>
      </div>
    </header>
  );
};
