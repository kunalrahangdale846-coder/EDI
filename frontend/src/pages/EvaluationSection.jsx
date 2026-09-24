import { useEffect, useState } from "react";
import { api } from "../services/api.js";

const SCORE_FIELDS = [
  { key: "innovation_score", label: "Innovation", max: 20, color: "bg-purple-500" },
  { key: "technical_score", label: "Technical", max: 20, color: "bg-blue-500" },
  { key: "impact_score", label: "Impact", max: 20, color: "bg-green-500" },
  { key: "feasibility_score", label: "Feasibility", max: 20, color: "bg-yellow-500" },
  { key: "presentation_score", label: "Presentation", max: 20, color: "bg-pink-500" },
];

function StatusBadge({ status }) {
  const map = {
    EVALUATED: "bg-green-100 text-green-700",
    EVALUATION_FAILED: "bg-red-100 text-red-700",
    EVALUATING: "bg-yellow-100 text-yellow-700",
    SUBMITTED: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-slate-100 text-slate-600"}`}>
      {status?.replace("_", " ")}
    </span>
  );
}

function ScoreInput({ label, color, value, onChange }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-xs text-slate-400">/ 20</span>
      </div>
      <input
        type="number"
        min="0"
        max="20"
        value={value ?? ""}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      {value != null && (
        <div className="mt-1 w-full bg-slate-100 rounded-full h-1.5">
          <div className={`${color} h-1.5 rounded-full`} style={{ width: `${(value / 20) * 100}%` }} />
        </div>
      )}
    </label>
  );
}

function EvaluationCard({ row, draft, onUpdate, onSave, saving }) {
  const autoScored = row.functionality_raw != null || row.code_quality_raw != null;
  const [detailsOpen, setDetailsOpen] = useState(false);
  let details = null;
  if (row.details_json) {
    try { details = JSON.parse(row.details_json); } catch { /**/ }
  }

  return (
    <article className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-slate-900">{row.team_name}</h2>
            <StatusBadge status={row.submission_status} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {row.problem_id} · <span className="font-mono">{row.submission_id}</span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{row.hackathon_name}</p>
        </div>
        <div className="text-right">
          {row.total_score != null ? (
            <>
              <p className="text-2xl font-bold text-indigo-700">{Number(row.total_score).toFixed(1)}<span className="text-sm text-slate-400">/100</span></p>
              <p className="text-xs text-slate-400">Total score</p>
            </>
          ) : (
            <p className="text-sm text-slate-400 italic">Not evaluated</p>
          )}
        </div>
      </div>

      {/* Auto-scored section */}
      {autoScored && (
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Auto Evaluation</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">C++ Engine</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {row.functionality_raw != null && (
              <div>
                <p className="text-slate-500">⚡ Functionality</p>
                <p className="font-bold text-green-700 mt-0.5">{Number(row.functionality_raw).toFixed(1)}% raw → {Number(row.functionality_weighted).toFixed(1)}/30</p>
              </div>
            )}
            {row.code_quality_raw != null && (
              <div>
                <p className="text-slate-500">🔍 Code Quality</p>
                <p className="font-bold text-blue-700 mt-0.5">{Number(row.code_quality_raw).toFixed(1)}% raw → {Number(row.code_quality_weighted).toFixed(1)}/15</p>
              </div>
            )}
            <div className="col-span-2">
              <p className="text-slate-500">Feedback</p>
              <p className="text-slate-700 mt-0.5 leading-relaxed">{row.feedback}</p>
            </div>
          </div>

          {details && (
            <button
              onClick={() => setDetailsOpen((v) => !v)}
              className="mt-3 text-xs text-indigo-600 hover:underline"
            >
              {detailsOpen ? "▲ Hide details" : "▼ Show full evaluation details"}
            </button>
          )}

          {detailsOpen && details && (
            <div className="mt-3 grid sm:grid-cols-2 gap-4 text-xs border-t border-slate-200 pt-3">
              {details.functionality && (
                <div>
                  <p className="font-semibold text-slate-700 mb-2">⚡ Functionality Details</p>
                  <p>Tests: {details.functionality.passed_tests}/{details.functionality.total_tests}</p>
                  <p>Feature completion: {details.functionality.feature_completion?.toFixed(1)}%</p>
                  <ul className="mt-2 space-y-0.5">
                    {details.functionality.features?.map((f) => (
                      <li key={f.name} className={f.status ? "text-green-600" : "text-red-400"}>
                        {f.status ? "✓" : "✗"} {f.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {details.code_quality && (
                <div>
                  <p className="font-semibold text-slate-700 mb-2">🔍 Code Quality Details</p>
                  <p>Cyclomatic: {details.code_quality.cyclomatic?.score?.toFixed(1)}%</p>
                  <p>Duplication: {details.code_quality.duplication?.score?.toFixed(1)}%</p>
                  <p>Static analysis: {details.code_quality.static_analysis?.score?.toFixed(1)}% ({details.code_quality.static_analysis?.findings_count} findings)</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Manual scoring */}
      <div className="px-5 py-4">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Manual Scoring (0–20 each)</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {SCORE_FIELDS.map((f) => (
            <ScoreInput
              key={f.key}
              label={f.label}
              color={f.color}
              value={draft?.[f.key] ?? ""}
              onChange={(e) => onUpdate(f.key, e.target.value === "" ? null : Number(e.target.value))}
            />
          ))}
        </div>

        <textarea
          placeholder="Published feedback for the team..."
          value={draft?.feedback || ""}
          onChange={(e) => onUpdate("feedback", e.target.value)}
          className="mt-4 w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-16"
        />
        <textarea
          placeholder="Private judge notes (not visible to team)..."
          value={draft?.private_notes || ""}
          onChange={(e) => onUpdate("private_notes", e.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-12 bg-yellow-50"
        />
        <button
          onClick={onSave}
          disabled={saving}
          className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "💾 Save Evaluation"}
        </button>
      </div>
    </article>
  );
}

function EvaluationSection() {
  const [rows, setRows] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getOrganizerWorkflowEvaluations();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const update = (submissionId, field, value) =>
    setDrafts((prev) => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], [field]: value },
    }));

  const evaluate = async (submissionId) => {
    setSaving((s) => ({ ...s, [submissionId]: true }));
    try {
      await api.evaluateWorkflowSubmission(submissionId, drafts[submissionId] || {});
      setMessage("✅ Evaluation saved successfully.");
      setError("");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving((s) => ({ ...s, [submissionId]: false }));
    }
  };

  const filtered = rows.filter((r) => {
    const matchesSearch = !search || r.team_name?.toLowerCase().includes(search.toLowerCase())
      || r.submission_id?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || r.submission_status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Evaluation Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review auto-scored results and add manual scores for each submission
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search team or submission ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-48 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {["ALL", "SUBMITTED", "EVALUATED", "EVALUATION_FAILED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filter === s
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Alerts */}
        {message && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
            {message}
            <button onClick={() => setMessage("")} className="text-green-500 hover:text-green-700">✕</button>
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
            {error}
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
            Loading evaluations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-400">
            No submissions found.
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((row) => (
              <EvaluationCard
                key={row.id}
                row={row}
                draft={drafts[row.id]}
                onUpdate={(field, value) => update(row.id, field, value)}
                onSave={() => evaluate(row.id)}
                saving={saving[row.id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EvaluationSection;
