import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  Clock,
  BarChart3,
  Save,
  X,
  Timer as TimerIcon
} from "lucide-react";
// shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// ---------- Types ----------

type Project = { id: string; name: string };
type Entry = {
  id: string;
  projectId: string;
  start: string; // ISO
  end: string | null; // ISO or null when running
  note?: string;
};

// ---------- Utilities ----------

const LS_PROJECTS = "gt_projects_v1";
const LS_ENTRIES = "gt_entries_v1";

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

const fmtMs = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}h ${m}m ${s}s`;
};

const toLocalInputValue = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
};

const fromLocalInputValue = (val: string) => {
  // treat as local time, convert to ISO
  const d = new Date(val);
  return d.toISOString();
};

const sumDurationsByProject = (entries: Entry[], now: number) => {
  const map = new Map<string, number>();
  for (const e of entries) {
    const start = new Date(e.start).getTime();
    const end = e.end ? new Date(e.end).getTime() : now;
    const dur = Math.max(0, end - start);
    map.set(e.projectId, (map.get(e.projectId) || 0) + dur);
  }
  return map; // projectId -> ms
};

const greenBtn = "bg-green-600 hover:bg-green-700 text-white";

// ---------- Component ----------

export default function GreenTimeTracker() {
  const [projects, setProjects] = useState<Project[]>(() => {
    const raw = localStorage.getItem(LS_PROJECTS);
    if (raw) return JSON.parse(raw);
    // seed with a default project
    return [{ id: uid(), name: "General" }];
  });

  const [entries, setEntries] = useState<Entry[]>(() => {
    const raw = localStorage.getItem(LS_ENTRIES);
    if (raw) return JSON.parse(raw);
    return [];
  });

  const [nowTick, setNowTick] = useState<number>(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // persist
  useEffect(() => localStorage.setItem(LS_PROJECTS, JSON.stringify(projects)), [projects]);
  useEffect(() => localStorage.setItem(LS_ENTRIES, JSON.stringify(entries)), [entries]);

  const runningEntry = useMemo(() => entries.find((e) => e.end === null) || null, [entries]);
  const runningProjectId = runningEntry?.projectId || null;

  const projectById = useMemo(() => {
    const m = new Map(projects.map((p) => [p.id, p] as const));
    return (id: string) => m.get(id);
  }, [projects]);

  // ---- Actions ----
  const addProject = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setProjects((ps) => [...ps, { id: uid(), name: trimmed }]);
  };

  const startTimer = (projectId: string) => {
    setEntries((prev) => {
      // stop any running entry
      const out = prev.map((e) => (e.end === null ? { ...e, end: new Date().toISOString() } : e));
      // start new
      return [
        ...out,
        {
          id: uid(),
          projectId,
          start: new Date().toISOString(),
          end: null,
          note: ""
        }
      ];
    });
  };

  const stopTimer = () => {
    setEntries((prev) => prev.map((e) => (e.end === null ? { ...e, end: new Date().toISOString() } : e)));
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const saveEntry = (edited: Entry) => {
    setEntries((prev) => prev.map((e) => (e.id === edited.id ? edited : e)));
  };

  const totalsMap = useMemo(() => sumDurationsByProject(entries, nowTick), [entries, nowTick]);

  const totalsData = useMemo(
    () =>
      projects.map((p) => ({
        name: p.name,
        hours: Number((totalsMap.get(p.id) || 0) / 3_600_000).toFixed(2)
      })),
    [projects, totalsMap]
  );

  return (
    <div className="min-h-screen bg-green-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-green-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-green-600 grid place-items-center text-white shadow">
              <TimerIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold text-green-700">Project Time Tracker</h1>
          </div>
          <Badge className="bg-green-100 text-green-700 border border-green-300">Focused • Fresh</Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sidebar: Projects */}
        <section className="lg:col-span-1">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-green-800">Projects</span>
                <AddProject onAdd={addProject} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[360px] pr-2">
                <div className="space-y-2">
                  {projects.map((p) => {
                    const active = runningProjectId === p.id;
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between rounded-xl border border-green-200 bg-white p-3"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${active ? "bg-green-600" : "bg-green-300"}`} />
                          <span className="font-medium text-slate-800">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {active ? (
                            <Button size="sm" className={greenBtn} onClick={stopTimer}>
                              <Pause className="w-4 h-4 mr-1" /> Stop
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="border-green-300 text-green-700" onClick={() => startTimer(p.id)}>
                              <Play className="w-4 h-4 mr-1" /> Start
                            </Button>
                          )}
                          <span className="text-xs text-slate-500">
                            {fmtMs(totalsMap.get(p.id) || 0)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="mt-4 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <BarChart3 className="w-5 h-5" /> Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={totalsData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(val: any) => `${val}h`} />
                    <Bar dataKey="hours" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Main: Timer + Entries */}
        <section className="lg:col-span-2 space-y-4">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Clock className="w-5 h-5" /> Timer
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1">
                <Label className="text-slate-600">Active project</Label>
                <div className="mt-1">
                  <Select
                    value={runningProjectId || (projects[0]?.id ?? "")}
                    onValueChange={(v) => {
                      if (!runningProjectId) return; // when a timer is running, this disable changing directly
                    }}
                  >
                    <SelectTrigger className="w-full bg-white border-green-300">
                      <SelectValue placeholder="Choose project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {runningEntry ? (
                  <Button className={greenBtn} onClick={stopTimer}>
                    <Pause className="w-4 h-4 mr-2" /> Stop {projectById(runningEntry.projectId)?.name}
                  </Button>
                ) : (
                  <StartFirstTimer projects={projects} onStart={startTimer} />
                )}

                <div className="rounded-xl border border-green-300 bg-white px-4 py-2 text-center">
                  <div className="text-xs text-slate-500">Elapsed</div>
                  <div className="font-mono text-lg text-green-800">
                    {runningEntry
                      ? fmtMs(nowTick - new Date(runningEntry.start).getTime())
                      : "0h 0m 0s"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <EntriesSection
            projects={projects}
            entries={entries}
            onDelete={deleteEntry}
            onSave={saveEntry}
            projectById={projectById}
          />
        </section>
      </main>

      <footer className="max-w-6xl mx-auto p-6 text-center text-xs text-slate-500">
        Built with ❤️ for focus. Your data stays in your browser (localStorage).
      </footer>
    </div>
  );
}

// ---------- Subcomponents ----------

function AddProject({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="New project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-white border-green-300 h-9 w-40"
      />
      <Button
        size="sm"
        className={greenBtn}
        onClick={() => {
          onAdd(name);
          setName("");
        }}
      >
        <Plus className="w-4 h-4 mr-1" /> Add
      </Button>
    </div>
  );
}

function StartFirstTimer({
  projects,
  onStart
}: {
  projects: Project[];
  onStart: (projectId: string) => void;
}) {
  const [selected, setSelected] = useState<string>(projects[0]?.id || "");
  useEffect(() => {
    if (projects.length && !selected) setSelected(projects[0].id);
  }, [projects, selected]);
  return (
    <div className="flex items-center gap-2">
      <Select value={selected} onValueChange={setSelected}>
        <SelectTrigger className="w-48 bg-white border-green-300">
          <SelectValue placeholder="Choose project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button className={greenBtn} onClick={() => selected && onStart(selected)}>
        <Play className="w-4 h-4 mr-2" /> Start
      </Button>
    </div>
  );
}

function EntriesSection({
  projects,
  entries,
  onDelete,
  onSave,
  projectById
}: {
  projects: Project[];
  entries: Entry[];
  onDelete: (id: string) => void;
  onSave: (entry: Entry) => void;
  projectById: (id: string) => Project | undefined;
}) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Entry | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries.slice().sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
    return entries
      .filter((e) => {
        const p = projectById(e.projectId)?.name.toLowerCase() || "";
        const note = (e.note || "").toLowerCase();
        return p.includes(q) || note.includes(q);
      })
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
  }, [entries, query, projectById]);

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-green-800">Time Entries</span>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search notes or project…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-white border-green-300 h-9 w-64"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-green-200 overflow-clip bg-white">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-green-50">
                <TableHead>Project</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="text-center text-sm text-slate-500 py-8">No entries yet.</div>
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((e) => {
                const dur = (new Date(e.end || new Date().toISOString()).getTime() - new Date(e.start).getTime());
                return (
                  <TableRow key={e.id} className="hover:bg-green-50/60">
                    <TableCell className="font-medium">{projectById(e.projectId)?.name || "—"}</TableCell>
                    <TableCell>{new Date(e.start).toLocaleString()}</TableCell>
                    <TableCell>{e.end ? new Date(e.end).toLocaleString() : <span className="text-green-700">Running…</span>}</TableCell>
                    <TableCell className="font-mono">{fmtMs(dur)}</TableCell>
                    <TableCell className="max-w-[320px] truncate" title={e.note || ""}>{e.note}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="outline" className="border-green-300" onClick={() => setEditing(e)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="border-green-300" onClick={() => onDelete(e.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <EditEntryDialog
        open={!!editing}
        entry={editing}
        projects={projects}
        onOpenChange={(v) => !v && setEditing(null)}
        onSave={(en) => {
          onSave(en);
          setEditing(null);
        }}
      />
    </Card>
  );
}

function EditEntryDialog({
  open,
  entry,
  projects,
  onOpenChange,
  onSave
}: {
  open: boolean;
  entry: Entry | null;
  projects: Project[];
  onOpenChange: (open: boolean) => void;
  onSave: (entry: Entry) => void;
}) {
  const [local, setLocal] = useState<Entry | null>(entry);
  useEffect(() => setLocal(entry), [entry]);
  if (!local) return null;

  const startLocal = toLocalInputValue(local.start);
  const endLocal = local.end ? toLocalInputValue(local.end) : "";

  const valid = (() => {
    const s = new Date(local.start).getTime();
    const e = local.end ? new Date(local.end).getTime() : Date.now();
    return e >= s;
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-green-800">Edit Entry</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-2">
            <Label className="text-right">Project</Label>
            <div className="col-span-3">
              <Select
                value={local.projectId}
                onValueChange={(v) => setLocal({ ...local, projectId: v })}
              >
                <SelectTrigger className="w-full bg-white border-green-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-2">
            <Label className="text-right">Start</Label>
            <Input
              type="datetime-local"
              value={startLocal}
              onChange={(e) => setLocal({ ...local, start: fromLocalInputValue(e.target.value) })}
              className="col-span-3 bg-white border-green-300"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-2">
            <Label className="text-right">End</Label>
            <Input
              type="datetime-local"
              value={endLocal}
              onChange={(e) => setLocal({ ...local, end: e.target.value ? fromLocalInputValue(e.target.value) : null })}
              className="col-span-3 bg-white border-green-300"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-2">
            <Label className="text-right">Note</Label>
            <Input
              placeholder="optional"
              value={local.note || ""}
              onChange={(e) => setLocal({ ...local, note: e.target.value })}
              className="col-span-3 bg-white border-green-300"
            />
          </div>
          {!valid && (
            <div className="text-red-600 text-sm -mt-2">End time cannot be before start time.</div>
          )}
        </div>
        <DialogFooter className="flex gap-2 justify-end">
          <Button variant="outline" className="border-green-300" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          <Button
            className={greenBtn}
            disabled={!valid}
            onClick={() => local && onSave(local)}
          >
            <Save className="w-4 h-4 mr-2" /> Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
