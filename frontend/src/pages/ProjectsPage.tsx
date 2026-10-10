import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  Plus,
  Search,
  Trash2,
  Edit2,
  FileCode,
  Calendar,
  ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { api } from "../lib/api";
import { Project } from "../types";

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("python");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.getProjects();
      setProjects(res);
    } catch (err) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please provide a project name");
      return;
    }
    try {
      await api.createProject(name, description, language);
      toast.success("Project created successfully");
      setCreateModalOpen(false);
      setName("");
      setDescription("");
      fetchProjects();
    } catch (err) {
      toast.error("Failed to create project");
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.deleteProject(deleteTargetId);
      toast.success("Project deleted");
      setDeleteTargetId(null);
      fetchProjects();
    } catch (err) {
      toast.error("Failed to delete project");
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Projects & Saved Analyses
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize codebases, track complexity regressions, and review historical runs.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          <span>New Project</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <Search className="h-4 w-4 text-slate-400 ml-1" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects by name or description..."
          className="text-sm w-full bg-transparent focus:outline-none text-slate-800"
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          Loading projects...
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((proj) => (
            <Card key={proj.id} hover className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                      <FolderKanban className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900 truncate max-w-[180px]">
                      {proj.name}
                    </h3>
                  </div>
                  <Badge variant="brand" size="sm">
                    {proj.language}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {proj.description || "No project description provided."}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(proj.updated_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/analyze?project=${proj.id}`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                      <span>Open</span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTargetId(proj.id)}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-16 text-center text-slate-400">
          <FolderKanban className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 text-sm">No Projects Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search ? "No projects matched your search query." : "Create your first project to save and organize static analysis runs."}
          </p>
        </Card>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Project"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreate}>
              Create Project
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Microservices Core Utility"
              className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief context regarding this repository or module..."
              className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Primary Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="python">Python 3 (AST Engine Supported)</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title="Confirm Project Deletion"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteTargetId(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Delete Project
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete this project? All associated source files and analysis metrics will be removed.
        </p>
      </Modal>
    </div>
  );
};
