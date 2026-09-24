import { useEffect, useState } from "react";
import { api } from "../services/api.js";

// ─── Submit Form Modal ─────────────────────────────────────────────────────
const CRITERIA = [
  { name: "Functionality", weight: "30%", icon: "⚡", active: true },
  { name: "Code Quality", weight: "15%", icon: "🔍", active: true },
  { name: "Performance", weight: "10%", icon: "🚀" },
  { name: "Database Design", weight: "10%", icon: "🗃️" },
  { name: "Documentation", weight: "10%", icon: "📄" },
  { name: "Innovation", weight: "10%", icon: "💡" },
  { name: "Security", weight: "5%", icon: "🔒" },
  { name: "UI/UX", weight: "5%", icon: "🎨" },
  { name: "Presentation", weight: "5%", icon: "🎤" },
];

function SubmitModal({ hackathon, onClose, onSubmit, submitting, result, error }) {
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    onSubmit(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Submit Project</h2>
            <p className="text-xs text-slate-500 mt-0.5">{hackathon?.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl font-light">✕</button>
        </div>

        {/* Submission Details */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-slate-400">Team</p>
              <p className="font-medium text-slate-700">{hackathon?.team_name || "No team yet"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Problem</p>
              <p className="font-medium text-slate-700 text-xs">{hackathon?.problem_title || "No problem selected"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Contest ID</p>
              <p className="font-medium text-slate-700 font-mono text-xs">{hackathon?.contest_id}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Status</p>
              <p className="font-medium text-slate-700">{hackathon?.submission_status || "Not submitted"}</p>
            </div>
          </div>
        </div>

        {/* Evaluation Criteria */}
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Evaluation Criteria</p>
          <div className="space-y-2">
            {CRITERIA.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span>{c.icon}</span>
                  <span className="text-slate-700">{c.name}</span>
                  {c.active && (
                    <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded text-xs">Auto</span>
                  )}
                </div>
                <span className="text-slate-500 font-medium">{c.weight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upload form */}
        {!result ? (
          <form onSubmit={handleSubmit} className="px-6 py-5">
            <p className="text-sm font-medium text-slate-700 mb-3">Upload your project ZIP file</p>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                file ? "border-green-300 bg-green-50" : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
            >
              {file ? (
                <div>
                  <p className="text-2xl mb-2">✅</p>
                  <p className="font-medium text-green-700 text-sm">{file.name}</p>
                  <p className="text-xs text-green-600 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button type="button" onClick={() => setFile(null)} className="mt-2 text-xs text-red-500 hover:underline">Remove</button>
                </div>
              ) : (
                <div>
                  <p className="text-3xl mb-2">📦</p>
                  <p className="text-sm text-slate-600">Drag & drop your ZIP here</p>
                  <p className="text-xs text-slate-400 mt-1">or</p>
                  <label className="mt-2 inline-block cursor-pointer text-indigo-600 font-medium text-sm hover:underline">
                    Browse file
                    <input
                      type="file"
                      accept=".zip,application/zip"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                  </label>
                  <p className="text-xs text-slate-400 mt-2">ZIP only, max 50 MB</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-xs">{error}</div>
            )}

            <button
              type="submit"
              disabled={!file || submitting}
              className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "⏳ Submitting & Evaluating..." : "🚀 Submit Project"}
            </button>
          </form>
        ) : (
          /* Success Result */
          <div className="px-6 py-6">
            <div className="text-center mb-6">
              <p className="text-4xl mb-2">🎉</p>
              <h3 className="font-bold text-green-700 text-lg">Submission Successful!</h3>
              <p className="text-xs text-slate-500 mt-1">Your project was evaluated automatically</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-indigo-700">{result.total_score?.toFixed(1)}</p>
                <p className="text-xs text-indigo-600 mt-1">Total Score</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{result.functionality_weighted?.toFixed(1)}</p>
                <p className="text-xs text-green-600 mt-1">Functionality /30</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">{result.code_quality_weighted?.toFixed(1)}</p>
                <p className="text-xs text-blue-600 mt-1">Code Quality /15</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">{result.feedback}</p>
            <button
              onClick={onClose}
              className="mt-5 w-full bg-slate-900 text-white py-3 rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main SubmitProject Page ────────────────────────────────────────────────
function SubmitProject() {
  const [participations, setParticipations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStudentHackathons()
      .then((items) => {
        setParticipations(items);
        setSelected(items[0] || null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (file) => {
    if (!selected || !file) return;
    setSubmitting(true);
    setResult(null);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await api.uploadWorkflowSubmission(selected.id, body);
      const fresh = await api.getStudentHackathons();
      setParticipations(fresh);
      const freshSelected = fresh.find((item) => item.id === selected.id) || selected;
      setSelected(freshSelected);
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (p) => {
    setSelected(p);
    setResult(null);
    setError("");
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Submit Project</h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload your project ZIP — it will be auto-evaluated for Functionality and Code Quality
          </p>
        </div>

        {/* Info box */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4 mb-6 flex gap-3">
          <span className="text-xl shrink-0">💡</span>
          <div className="text-sm text-indigo-800">
            <p className="font-semibold">What happens when you submit?</p>
            <p className="mt-1 text-indigo-600">
              Your ZIP is extracted and analyzed by our C++ evaluator. It scores your project on
              <strong> Functionality (30%)</strong> and <strong>Code Quality (15%)</strong> automatically.
              Organizers then add manual scores for the remaining criteria.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && !modalOpen && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">Loading your hackathons...</div>
        ) : participations.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-500">
            No registered hackathons with a team and problem selected.
          </div>
        ) : (
          <div className="space-y-4">
            {participations.map((p, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base">{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-mono">{p.contest_id}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-400">Team</p>
                        <p className="text-slate-700 font-medium">{p.team_name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Problem</p>
                        <p className="text-slate-700 text-xs">{p.problem_title || "Not selected"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Status</p>
                        <p className={`text-xs font-medium ${
                          p.submission_status === "EVALUATED" ? "text-green-600" :
                          p.submission_status === "EVALUATION_FAILED" ? "text-red-500" : "text-slate-600"
                        }`}>
                          {p.submission_status || "Not submitted"}
                        </p>
                      </div>
                      {p.final_score != null && (
                        <div>
                          <p className="text-xs text-slate-400">Score</p>
                          <p className="text-indigo-700 font-bold">{Number(p.final_score).toFixed(1)} / 100</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => openModal(p)}
                    disabled={!p.team_name || !p.problem_title}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {p.submission_status ? "Re-submit" : "📤 Submit Project"}
                  </button>
                </div>

                {!p.team_name && (
                  <p className="text-xs text-amber-600 mt-3 bg-amber-50 px-3 py-2 rounded-lg">⚠️ Join a team to enable submission</p>
                )}
                {p.team_name && !p.problem_title && (
                  <p className="text-xs text-amber-600 mt-3 bg-amber-50 px-3 py-2 rounded-lg">⚠️ Your team needs to select a problem statement first</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <SubmitModal
          hackathon={selected}
          onClose={() => { setModalOpen(false); setResult(null); setError(""); }}
          onSubmit={handleSubmit}
          submitting={submitting}
          result={result}
          error={error}
        />
      )}
    </div>
  );
}

export default SubmitProject;
