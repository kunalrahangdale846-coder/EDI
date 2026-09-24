import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROLES, ROUTES } from "../utils/constants.js";
import { api } from "../services/api.js";

// ─────────────────────────────────────────────
// Evaluation criteria with weights
// ─────────────────────────────────────────────
const ALL_CRITERIA = [
  { name: "Functionality", weight: 30, key: "functionality_weighted", rawKey: "functionality_raw", active: true, icon: "⚡" },
  { name: "Code Quality", weight: 15, key: "code_quality_weighted", rawKey: "code_quality_raw", active: true, icon: "🔍" },
  { name: "Performance", weight: 10, active: false, icon: "🚀" },
  { name: "Database Design", weight: 10, active: false, icon: "🗃️" },
  { name: "Documentation", weight: 10, active: false, icon: "📄" },
  { name: "Innovation", weight: 10, active: false, icon: "💡" },
  { name: "Security", weight: 5, active: false, icon: "🔒" },
  { name: "UI/UX", weight: 5, active: false, icon: "🎨" },
  { name: "Presentation", weight: 5, active: false, icon: "🎤" },
];

// ─────────────────────────────────────────────
// Organizer Dashboard
// ─────────────────────────────────────────────
function StatCard({ label, value, sub, color = "text-indigo-600" }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function OrganizerView() {
  const [hackathons, setHackathons] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHackathons()
      .then(setHackathons)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalSubmissions = hackathons.reduce((s, h) => s + (h.submission_count || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Organizer Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your hackathons and evaluate submissions</p>
        </div>
        <Link
          to={ROUTES.CREATE_HACKATHON}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <span>+</span> Create Hackathon
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Hackathons Created" value={hackathons.length} sub="Total organized" />
        <StatCard
          label="Evaluation Panel"
          value={
            <Link to={ROUTES.EVALUATION_SECTION} className="text-indigo-600 hover:underline text-base font-semibold">
              View All Evaluations →
            </Link>
          }
          sub="Score submissions"
        />
        <StatCard
          label="Leaderboard"
          value={
            <Link to={ROUTES.LEADERBOARD} className="text-purple-600 hover:underline text-base font-semibold">
              View Rankings →
            </Link>
          }
          sub="Published results"
        />
      </div>

      {/* Hackathons Table */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-400 text-sm">
          Loading hackathons...
        </div>
      ) : hackathons.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm">Your Hackathons</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Contest ID</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Start Date</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hackathons.map((h) => (
                <tr key={h.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{h.name}</td>
                  <td className="px-5 py-3 text-slate-500 font-mono text-xs">{h.contest_id}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      h.status === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : h.status === "CLOSED"
                        ? "bg-slate-100 text-slate-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {h.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {h.start_date ? new Date(h.start_date).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      to={ROUTES.EVALUATION_SECTION}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-xs"
                    >
                      Evaluate Submissions →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !error && (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
            <p className="text-slate-500">No hackathons yet.</p>
            <Link to={ROUTES.CREATE_HACKATHON} className="mt-3 inline-block text-indigo-600 font-medium text-sm hover:underline">
              Create your first hackathon →
            </Link>
          </div>
        )
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Student Dashboard
// ─────────────────────────────────────────────
function ScoreBar({ label, raw, weighted, maxWeighted, color = "bg-indigo-500" }) {
  const pct = maxWeighted > 0 ? Math.round((weighted / maxWeighted) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="text-slate-500">{weighted?.toFixed(1) ?? "—"} / {maxWeighted}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {raw != null && (
        <p className="text-xs text-slate-400 mt-0.5">Raw score: {raw?.toFixed(1)}%</p>
      )}
    </div>
  );
}

function StudentView() {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getStudentHackathons()
      .then(setParticipations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const latestEval = participations.find((p) => p.final_score != null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Hackathons</h2>
          <p className="text-sm text-slate-500 mt-1">Track your submissions and evaluation results</p>
        </div>
        <Link
          to={ROUTES.SUBMIT_PROJECT}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          📤 Submit Project
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {/* Hackathon participation table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">Registered Hackathons</h3>
        </div>
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Hackathon</th>
                <th className="px-5 py-3 text-left">Team</th>
                <th className="px-5 py-3 text-left">Problem</th>
                <th className="px-5 py-3 text-left">Submission</th>
                <th className="px-5 py-3 text-left">Total Score</th>
                <th className="px-5 py-3 text-left">Report</th>
              </tr>
            </thead>
            <tbody>
              {participations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    No registrations.{" "}
                    <Link to={ROUTES.HACKATHONS} className="text-indigo-600 hover:underline">Browse hackathons</Link>
                  </td>
                </tr>
              ) : (
                participations.map((p, idx) => (
                  <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800">{p.name}</td>
                    <td className="px-5 py-3 text-slate-600">{p.team_name || <span className="text-slate-400 italic">No team</span>}</td>
                    <td className="px-5 py-3 text-slate-600 text-xs">
                      {p.problem_title || <span className="text-slate-400 italic">Not selected</span>}
                    </td>
                    <td className="px-5 py-3">
                      {p.submission_status ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.submission_status === "EVALUATED"
                            ? "bg-green-100 text-green-700"
                            : p.submission_status === "EVALUATION_FAILED"
                            ? "bg-red-100 text-red-700"
                            : p.submission_status === "EVALUATING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {p.submission_status}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Not submitted</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {p.final_score != null ? (
                        <span className="font-bold text-indigo-700">{Number(p.final_score).toFixed(1)} / 100</span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Pending</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {p.latest_submission_id ? (
                        <Link
                          to={ROUTES.EVALUATION_REPORT}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-xs hover:underline flex items-center gap-1"
                        >
                          View Report →
                        </Link>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Evaluation Criteria Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 text-sm">Evaluation Criteria Breakdown</h3>
          {latestEval && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Latest: {Number(latestEval.final_score).toFixed(1)} / 100
            </span>
          )}
        </div>
        <div className="p-5 space-y-5">
          {ALL_CRITERIA.map((c) => {
            const weighted = latestEval && c.key ? Number(latestEval[c.key] ?? 0) : null;
            const raw = latestEval && c.rawKey ? Number(latestEval[c.rawKey] ?? 0) : null;

            return (
              <div key={c.name} className="flex items-start gap-4">
                <span className="text-xl mt-0.5 shrink-0">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-700">{c.name}</span>
                    <span className="text-xs text-slate-400">{c.weight}%</span>
                    {c.active && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">Auto</span>
                    )}
                  </div>
                  {c.active && latestEval ? (
                    <ScoreBar
                      label=""
                      raw={raw}
                      weighted={weighted}
                      maxWeighted={c.weight}
                      color={c.name === "Functionality" ? "bg-green-500" : "bg-blue-500"}
                    />
                  ) : c.active ? (
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-slate-200 h-2 rounded-full w-0" />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Manual evaluation — not evaluated yet</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Evaluation Details (if available) */}
      {latestEval?.details_json && (() => {
        try {
          const details = JSON.parse(latestEval.details_json);
          const func = details?.functionality;
          const cq = details?.code_quality;
          return (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800 text-sm">Detailed Evaluation Report</h3>
                <p className="text-xs text-slate-500 mt-0.5">Language: {details.detected_language} · Files: {details.total_files}</p>
              </div>
              <div className="p-5 grid sm:grid-cols-2 gap-6">
                {/* Functionality */}
                {func && (
                  <div>
                    <h4 className="font-semibold text-sm text-slate-700 mb-3 flex items-center gap-2">
                      ⚡ Functionality
                      <span className="ml-auto font-bold text-green-700">{func.score?.toFixed(1)}%</span>
                    </h4>
                    <div className="space-y-2 text-xs text-slate-600">
                      <p>Test pass rate: <strong>{func.test_pass_rate?.toFixed(1)}%</strong> ({func.passed_tests}/{func.total_tests} tests)</p>
                      <p>Feature completion: <strong>{func.feature_completion?.toFixed(1)}%</strong></p>
                      <div className="mt-3 space-y-1">
                        {func.features?.map((f) => (
                          <div key={f.name} className="flex items-center gap-2">
                            <span className={f.status ? "text-green-500" : "text-red-400"}>
                              {f.status ? "✓" : "✗"}
                            </span>
                            <span className={f.status ? "text-slate-700" : "text-slate-400"}>{f.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {/* Code Quality */}
                {cq && (
                  <div>
                    <h4 className="font-semibold text-sm text-slate-700 mb-3 flex items-center gap-2">
                      🔍 Code Quality
                      <span className="ml-auto font-bold text-blue-700">{cq.score?.toFixed(1)}%</span>
                    </h4>
                    <div className="space-y-2 text-xs text-slate-600">
                      <p>Cyclomatic complexity: <strong>{cq.cyclomatic?.score?.toFixed(1)}%</strong></p>
                      <p>Duplication: <strong>{cq.duplication?.score?.toFixed(1)}%</strong> ({cq.duplication?.duplication_percentage?.toFixed(1)}% dups)</p>
                      <p>Static analysis: <strong>{cq.static_analysis?.score?.toFixed(1)}%</strong> ({cq.static_analysis?.findings_count} findings)</p>
                      <p className="text-slate-400 italic mt-2">Formula: {cq.formula}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        } catch { return null; }
      })()}
    </div>
  );
}

// ─────────────────────────────────────────────
// Dashboard root
// ─────────────────────────────────────────────
function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Welcome bar */}
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 mb-8 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-700 font-bold">{user.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Welcome back, {user.name}!</p>
            <p className="text-xs text-slate-500 capitalize">
              {user.role === ROLES.ORGANIZER ? "Organizer Account" : "Student Account"} · {user.email}
            </p>
          </div>
        </div>

        {user.role === ROLES.ORGANIZER ? <OrganizerView /> : <StudentView />}
      </div>
    </div>
  );
}

export default Dashboard;