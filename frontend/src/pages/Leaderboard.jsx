import { useEffect, useState } from "react";
import { api } from "../services/api.js";

function Leaderboard() {
  const [hackathons, setHackathons] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => { api.getHackathons().then((items) => { setHackathons(items); setSelected(items[0] || null); }).catch((requestError) => setError(requestError.message)); }, []);
  useEffect(() => { if (selected) api.getWorkflowLeaderboardByContest(selected.contest_id).then(setRows).catch((requestError) => setError(requestError.message)); }, [selected]);

  return <div className="max-w-5xl mx-auto px-4 py-12"><h1 className="text-3xl font-semibold text-slate-900">Leaderboard</h1>{hackathons.length ? <select value={selected?.contest_id || ""} onChange={(event) => setSelected(hackathons.find((item) => item.contest_id === event.target.value))} className="mt-6 rounded border p-3">{hackathons.map((item) => <option key={item.contest_id} value={item.contest_id}>{item.name} ({item.contest_id})</option>)}</select> : <p className="mt-6 text-slate-500">No published hackathons available.</p>}{error && <p className="mt-4 text-red-700">{error}</p>}<div className="mt-8 overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b"><th className="p-3">Rank</th><th className="p-3">Team</th><th className="p-3">Problem</th><th className="p-3">Score</th></tr></thead><tbody>{rows.map((row) => <tr className="border-b" key={`${row.team_id}-${row.problem_id}`}><td className="p-3">{row.rank_position}</td><td className="p-3">{row.team_name}</td><td className="p-3">{row.problem_id}</td><td className="p-3">{row.total_score}</td></tr>)}{!rows.length && <tr><td className="p-6 text-center text-slate-500" colSpan="4">No published evaluation results.</td></tr>}</tbody></table></div></div>;
}

export default Leaderboard;
