import { useEffect, useState } from "react";
import { api } from "../services/api.js";

const fields = ["innovation_score", "technical_score", "impact_score", "feasibility_score", "presentation_score"];

function EvaluationSection() {
  const [rows, setRows] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); return api.getOrganizerWorkflowEvaluations().then(setRows).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const update = (submissionId, field, value) => setDrafts({ ...drafts, [submissionId]: { ...drafts[submissionId], [field]: value } });
  const evaluate = async (submissionId) => {
    try { await api.evaluateWorkflowSubmission(submissionId, drafts[submissionId] || {}); setMessage("Evaluation saved successfully."); setError(""); await load(); } catch (requestError) { setError(requestError.message); }
  };

  return <div className="min-h-full bg-slate-50 px-4 py-10"><div className="mx-auto max-w-6xl"><h1 className="text-3xl font-semibold text-slate-900">Evaluation Dashboard</h1><p className="mt-2 text-slate-600">Scores are stored in MySQL. Each criterion is scored from 0 to 20.</p>{message && <p className="mt-4 text-green-700">{message}</p>}{error && <p className="mt-4 text-red-700">Unable to load evaluations: {error}</p>}{loading && <p className="mt-8 rounded border bg-white p-8 text-center text-slate-500">Loading evaluations...</p>}{!loading && <div className="mt-8 space-y-6">{rows.map((row) => <article key={row.id} className="rounded border bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold">{row.team_name}</h2><p className="text-sm text-slate-500">{row.problem_id} · {row.file_name} · {row.submission_status}</p></div><p className="font-semibold">{row.total_score == null ? "Evaluation pending" : `${row.total_score} / 100`}</p></div><div className="mt-4 grid gap-3 sm:grid-cols-5">{fields.map((field) => <label key={field} className="text-xs text-slate-600">{field.replace("_score", "")} / 20<input type="number" min="0" max="20" value={drafts[row.id]?.[field] ?? ""} onChange={(event) => update(row.id, field, event.target.value === "" ? null : Number(event.target.value))} className="mt-1 w-full rounded border p-2" /></label>)}</div><textarea placeholder="Published feedback" value={drafts[row.id]?.feedback || ""} onChange={(event) => update(row.id, "feedback", event.target.value)} className="mt-4 min-h-20 w-full rounded border p-3" /><textarea placeholder="Private notes" value={drafts[row.id]?.private_notes || ""} onChange={(event) => update(row.id, "private_notes", event.target.value)} className="mt-3 min-h-20 w-full rounded border p-3" /><button onClick={() => evaluate(row.id)} className="mt-4 rounded bg-black px-5 py-3 text-white">Save evaluation</button></article>)}{!rows.length && <p className="rounded border bg-white p-8 text-center text-slate-500">No submissions available for evaluation.</p>}</div>}</div></div>;
}

export default EvaluationSection;
