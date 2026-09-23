import { useEffect, useState } from "react";
import { api } from "../services/api.js";

function SubmitProject() {
  const [participations, setParticipations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { api.getStudentHackathons().then((items) => { setParticipations(items); setSelected(items[0] || null); }).catch((requestError) => setError(requestError.message)); }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!selected || !file) { setError("Register, join a team, select a problem, and choose a ZIP file first."); return; }
    try { const body = new FormData(); body.append("file", file); const result = await api.uploadWorkflowSubmission(selected.id, body); const fresh = await api.getStudentHackathons(); setParticipations(fresh); setSelected(fresh.find((item) => item.id === selected.id) || selected); setMessage(`Project submitted successfully. Status: ${result.submission_status}.`); setError(""); } catch (requestError) { setError(requestError.message); }
  };

  return <div className="max-w-3xl mx-auto px-4 py-12"><h1 className="text-3xl font-semibold text-slate-900">Submit project</h1><p className="mt-2 text-slate-600">Your hackathon, team, and problem are loaded from your participation.</p>{participations.length ? <><select value={selected?.id || ""} onChange={(event) => setSelected(participations.find((item) => String(item.id) === event.target.value))} className="mt-8 w-full rounded border p-3">{participations.map((item) => <option key={item.id} value={item.id}>{item.name} | {item.team_name || "No team"} | {item.problem_id || "No problem"}</option>)}</select>{selected && <div className="mt-4 rounded border p-5 text-sm"><p>Contest ID: <strong>{selected.contest_id}</strong></p><p>Team: <strong>{selected.team_name || "Not selected"}</strong></p><p>Team ID: <strong>{selected.team_id || "Not created"}</strong></p><p>Problem: <strong>{selected.problem_id || "Not selected"}</strong></p></div>}<form onSubmit={submit} className="mt-6 space-y-4"><input required type="file" accept=".zip,application/zip" onChange={(event) => setFile(event.target.files[0])} className="w-full rounded border p-3" /><button className="rounded bg-black px-5 py-3 text-white" type="submit">Submit Project ZIP</button></form></> : <p className="mt-8 text-gray-500">No registered hackathon with a selected team problem is ready for submission.</p>}{message && <p className="mt-4 text-green-700">{message}</p>}{error && <p className="mt-4 text-red-700">{error}</p>}</div>;
}

export default SubmitProject;
