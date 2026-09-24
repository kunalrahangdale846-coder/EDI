import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { api } from "../services/api.js";
import { ROLES } from "../utils/constants.js";

const ALL_CRITERIA = [
  { name: "Functionality", weight: 30, key: "functionality_weighted", rawKey: "functionality_raw", icon: "⚡", active: true },
  { name: "Code Quality", weight: 15, key: "code_quality_weighted", rawKey: "code_quality_raw", icon: "🔍", active: true },
  { name: "Performance", weight: 10, icon: "🚀" },
  { name: "Database Design", weight: 10, icon: "🗃️" },
  { name: "Documentation", weight: 10, icon: "📄" },
  { name: "Innovation", weight: 10, icon: "💡" },
  { name: "Security", weight: 5, icon: "🔒" },
  { name: "UI/UX", weight: 5, icon: "🎨" },
  { name: "Presentation", weight: 5, icon: "🎤" },
];

function StudentProfile({ user }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getStudentProfile()
      .then(setProfile)
      .catch((e) => setError(e.message));
  }, []);

  const best = profile?.participations?.filter((p) => p.final_score != null)
    .sort((a, b) => Number(b.final_score) - Number(a.final_score))[0];

  if (error) return <div className="text-red-600 text-sm">{error}</div>;
  if (!profile) return <div className="text-slate-400 text-sm">Loading profile...</div>;

  return (
    <div className="space-y-6">
      {/* Score summary */}
      {best && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Best Evaluation Score</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-indigo-700">{Number(best.final_score).toFixed(1)}</p>
              <p className="text-xs text-indigo-500 mt-1">Total /100</p>
            </div>
            {best.functionality_weighted != null && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{Number(best.functionality_weighted).toFixed(1)}</p>
                <p className="text-xs text-green-500 mt-1">Functionality /30</p>
              </div>
            )}
            {best.code_quality_weighted != null && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">{Number(best.code_quality_weighted).toFixed(1)}</p>
                <p className="text-xs text-blue-500 mt-1">Code Quality /15</p>
              </div>
            )}
          </div>

          {/* Criteria bars */}
          <div className="mt-5 space-y-3">
            {ALL_CRITERIA.map((c) => {
              const weighted = c.key ? Number(best[c.key] ?? 0) : null;
              const pct = weighted != null && c.weight > 0 ? (weighted / c.weight) * 100 : 0;
              return (
                <div key={c.name} className="flex items-center gap-3 text-xs">
                  <span className="w-4 shrink-0">{c.icon}</span>
                  <span className="w-32 shrink-0 text-slate-600">{c.name}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    {c.active && weighted != null ? (
                      <div
                        className={`h-2 rounded-full ${c.name === "Functionality" ? "bg-green-500" : "bg-blue-500"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    ) : (
                      <div className="h-2 rounded-full bg-slate-200 w-0" />
                    )}
                  </div>
                  <span className="w-16 text-right text-slate-500 shrink-0">
                    {c.active && weighted != null ? `${weighted.toFixed(1)}/${c.weight}` : `—/${c.weight}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Participation history */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">Hackathon History</h3>
        </div>
        {profile.participations.length === 0 ? (
          <p className="px-5 py-8 text-center text-slate-400 text-sm">No hackathon participation yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {profile.participations.map((p, idx) => (
              <div key={idx} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{p.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{p.contest_id}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-600">
                      <span>Team: <strong>{p.team_name || "—"}</strong></span>
                      <span>Role: <strong className="capitalize">{(p.team_role || "—").toLowerCase().replace("_", " ")}</strong></span>
                      <span>Problem: <strong>{p.problem_title || "—"}</strong></span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {p.final_score != null ? (
                      <p className="font-bold text-indigo-700">{Number(p.final_score).toFixed(1)}<span className="text-slate-400 font-normal text-xs">/100</span></p>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.submission_status === "EVALUATED" ? "bg-green-100 text-green-600"
                          : p.submission_status === "EVALUATION_FAILED" ? "bg-red-100 text-red-600"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {p.submission_status || "Not submitted"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrganizerProfile({ user }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getPublicProfile(user.user_id)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [user.user_id]);

  if (error) return <div className="text-red-600 text-sm">{error}</div>;
  if (!data) return <div className="text-slate-400 text-sm">Loading...</div>;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800 text-sm">Hackathons Organized</h3>
      </div>
      {data.hackathons.length === 0 ? (
        <p className="px-5 py-8 text-center text-slate-400 text-sm">No hackathons organized yet.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {data.hackathons.map((h) => (
            <div key={h.id} className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800 text-sm">{h.name}</p>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{h.contest_id}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                h.status === "PUBLISHED" ? "bg-green-100 text-green-700" :
                h.status === "CLOSED" ? "bg-slate-100 text-slate-600" : "bg-yellow-100 text-yellow-700"
              }`}>
                {h.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Profile() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* User card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-indigo-700">{user.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
              {user.college && <p className="text-xs text-slate-400 mt-0.5">🏫 {user.college}</p>}
              <span className={`mt-2 inline-block text-xs px-3 py-1 rounded-full font-medium ${
                user.role === ROLES.ORGANIZER ? "bg-purple-100 text-purple-700" : "bg-indigo-100 text-indigo-700"
              }`}>
                {user.role === ROLES.ORGANIZER ? "🎯 Organizer" : "🎓 Student"}
              </span>
            </div>
          </div>
        </div>

        {/* Role-specific content */}
        {user.role === ROLES.ORGANIZER ? (
          <OrganizerProfile user={user} />
        ) : (
          <StudentProfile user={user} />
        )}
      </div>
    </div>
  );
}

export default Profile;
