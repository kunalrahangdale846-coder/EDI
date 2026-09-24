import { useEffect, useState } from "react";
import { api } from "../services/api.js";

function Leaderboard() {
  const [hackathons, setHackathons] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);

  useEffect(() => {
    api.getHackathons()
      .then((items) => {
        setHackathons(items);
        if (items.length > 0) setSelected(items[0]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoadingRows(true);
    api.getWorkflowLeaderboardByContest(selected.contest_id)
      .then(setRows)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingRows(false));
  }, [selected]);

  const medalColor = (rank) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-slate-400";
    if (rank === 3) return "text-amber-600";
    return "text-slate-400";
  };

  const medalIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const maxScore = rows.reduce((m, r) => Math.max(m, Number(r.total_score || 0)), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">🏆 Leaderboard</h1>
          <p className="text-sm text-slate-500 mt-1">Rankings based on automated + judge scores</p>
        </div>

        {/* Hackathon selector */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm">Loading hackathons...</div>
        ) : hackathons.length > 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-2">Select Hackathon</label>
            <select
              value={selected?.contest_id || ""}
              onChange={(e) => setSelected(hackathons.find((h) => h.contest_id === e.target.value))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {hackathons.map((h) => (
                <option key={h.contest_id} value={h.contest_id}>
                  {h.name} ({h.contest_id}) — {h.status}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-400">
            No hackathons available.
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
        )}

        {/* Leaderboard table */}
        {loadingRows ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-400">Loading rankings...</div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {rows.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p className="text-3xl mb-3">📋</p>
                <p>No published evaluation results yet.</p>
                <p className="text-xs mt-2 text-slate-400">Results appear after the organizer publishes the leaderboard.</p>
              </div>
            ) : (
              <>
                {/* Top 3 podium */}
                {rows.length >= 3 && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-slate-200 px-5 py-6">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-center mb-6">Top 3 Teams</p>
                    <div className="flex items-end justify-center gap-4">
                      {/* 2nd place */}
                      <div className="flex flex-col items-center">
                        <p className="text-2xl mb-1">🥈</p>
                        <div className="bg-slate-200 rounded-t-xl w-24 h-20 flex items-end justify-center pb-2">
                          <p className="text-xs font-bold text-slate-700 text-center px-1">{rows[1]?.team_name}</p>
                        </div>
                        <p className="mt-1 text-sm font-bold text-slate-600">{Number(rows[1]?.total_score || 0).toFixed(1)}</p>
                      </div>
                      {/* 1st place */}
                      <div className="flex flex-col items-center">
                        <p className="text-3xl mb-1">🥇</p>
                        <div className="bg-yellow-400 rounded-t-xl w-28 h-28 flex items-end justify-center pb-2">
                          <p className="text-xs font-bold text-yellow-900 text-center px-1">{rows[0]?.team_name}</p>
                        </div>
                        <p className="mt-1 text-lg font-bold text-yellow-600">{Number(rows[0]?.total_score || 0).toFixed(1)}</p>
                      </div>
                      {/* 3rd place */}
                      <div className="flex flex-col items-center">
                        <p className="text-2xl mb-1">🥉</p>
                        <div className="bg-amber-300 rounded-t-xl w-24 h-14 flex items-end justify-center pb-2">
                          <p className="text-xs font-bold text-amber-900 text-center px-1">{rows[2]?.team_name}</p>
                        </div>
                        <p className="mt-1 text-sm font-bold text-amber-700">{Number(rows[2]?.total_score || 0).toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Table */}
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="px-5 py-3 text-left">Rank</th>
                      <th className="px-5 py-3 text-left">Team</th>
                      <th className="px-5 py-3 text-left">Problem</th>
                      <th className="px-5 py-3 text-left">Score</th>
                      <th className="px-5 py-3 text-left w-48">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const pct = maxScore > 0 ? (Number(row.total_score || 0) / maxScore) * 100 : 0;
                      return (
                        <tr key={`${row.team_id}-${row.problem_id}`} className={`border-t border-slate-100 hover:bg-slate-50 transition-colors ${
                          row.rank_position <= 3 ? "bg-amber-50/30" : ""
                        }`}>
                          <td className="px-5 py-3">
                            <span className={`font-bold text-lg ${medalColor(row.rank_position)}`}>
                              {medalIcon(row.rank_position)}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-medium text-slate-800">{row.team_name}</td>
                          <td className="px-5 py-3 text-xs text-slate-500">{row.problem_id}</td>
                          <td className="px-5 py-3">
                            <span className="font-bold text-indigo-700">{Number(row.total_score || 0).toFixed(1)}</span>
                            <span className="text-slate-400 text-xs"> /100</span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-100 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${row.rank_position === 1 ? "bg-yellow-400" : row.rank_position === 2 ? "bg-slate-400" : row.rank_position === 3 ? "bg-amber-400" : "bg-indigo-400"}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-400 w-8 text-right">{pct.toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
