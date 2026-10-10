import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Save,
  Check,
  Moon,
  Sun,
  Shield,
  Sliders,
  Sparkles,
  Info
} from "lucide-react";
import toast from "react-hot-toast";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { api } from "../lib/api";
import { UserPreferences } from "../types";

export const SettingsPage: React.FC = () => {
  const [prefs, setPrefs] = useState<UserPreferences>({
    theme: "light",
    editor_font_size: 14,
    editor_tab_size: 4,
    default_language: "python",
    cc_warning_threshold: 10,
    cc_critical_threshold: 20,
    ai_explanations_enabled: false,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSettings().then((res) => {
      setPrefs(res);
    }).catch(() => {
      // Keep local defaults
    });
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.updateSettings(prefs);
      setPrefs(res);
      toast.success("Preferences updated successfully");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            System Preferences & Configuration
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Customize analysis thresholds, editor preferences, and platform defaults.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving}>
          <Save className="h-4 w-4 mr-1.5" />
          <span>Save Changes</span>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Editor Preferences */}
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Sliders className="h-4 w-4 text-brand-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Code Editor Preferences
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Editor Font Size (px)
              </label>
              <input
                type="number"
                min={10}
                max={24}
                value={prefs.editor_font_size}
                onChange={(e) =>
                  setPrefs({ ...prefs, editor_font_size: parseInt(e.target.value) || 14 })
                }
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Tab Indentation Width (spaces)
              </label>
              <select
                value={prefs.editor_tab_size}
                onChange={(e) =>
                  setPrefs({ ...prefs, editor_tab_size: parseInt(e.target.value) || 4 })
                }
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces (PEP 8 standard)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Complexity Warning Thresholds */}
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Shield className="h-4 w-4 text-brand-600" />
            <h3 className="font-bold text-sm text-slate-900">
              McCabe Complexity Warning Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Warning Threshold (CC)
              </label>
              <input
                type="number"
                min={5}
                max={20}
                value={prefs.cc_warning_threshold}
                onChange={(e) =>
                  setPrefs({ ...prefs, cc_warning_threshold: parseInt(e.target.value) || 10 })
                }
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Functions with cyclomatic complexity &gt;= this value emit a warning.
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Critical Threshold (CC)
              </label>
              <input
                type="number"
                min={15}
                max={50}
                value={prefs.cc_critical_threshold}
                onChange={(e) =>
                  setPrefs({ ...prefs, cc_critical_threshold: parseInt(e.target.value) || 20 })
                }
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Functions with cyclomatic complexity &gt;= this value emit an error.
              </span>
            </div>
          </div>
        </Card>

        {/* AI Explanations Toggle */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-indigo-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Optional AI Explanations Integration
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  Enable optional advisory AI narrative explanations. Deterministic AST metrics remain the primary ground truth. No external telemetry is transmitted without user action.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.ai_explanations_enabled}
                onChange={(e) =>
                  setPrefs({ ...prefs, ai_explanations_enabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>
        </Card>

        {/* System Info */}
        <Card>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <Info className="h-4 w-4 text-slate-400" />
            <h3 className="font-bold text-sm text-slate-900">
              System Runtime Information
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Version:</span>
              <span className="font-mono font-bold text-slate-800">1.0.0</span>
            </div>
            <div>
              <span className="text-slate-400 block">Parser Core:</span>
              <span className="font-mono font-bold text-slate-800">Python 3 AST</span>
            </div>
            <div>
              <span className="text-slate-400 block">Metrics Engine:</span>
              <span className="font-mono font-bold text-slate-800">Radon 6.0</span>
            </div>
            <div>
              <span className="text-slate-400 block">Database:</span>
              <span className="font-mono font-bold text-slate-800">SQLite Local</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
