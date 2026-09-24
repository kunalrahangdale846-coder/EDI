import { useState } from "react";
import { api } from "../services/api.js";

const initialForm = { name: "", description: "", registration_deadline: "", start_date: "", end_date: "", venue: "", mode: "ONLINE", rules: "" };

function CreateHackathon() {
  const [form, setForm] = useState(initialForm);
  const [problem, setProblem] = useState({ title: "", description: "", domain: "" });
  const [created, setCreated] = useState(null);
  const [problems, setProblems] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingProblem, setSavingProblem] = useState(false);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!(form.registration_deadline < form.start_date && form.start_date < form.end_date)) {
      setError("Registration Deadline must be before Hackathon Start Date, which must be before Hackathon End Date.");
      return;
    }
    setSaving(true);
    try {
      const result = await api.createHackathon({ ...form, status: "DRAFT" });
      setCreated(result);
      setMessage(`Hackathon created. Contest ID: ${result.contest_id}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const createProblem = async (event) => {
    event.preventDefault();
    if (savingProblem || !created) return;
    setSavingProblem(true);
    setError("");
    try {
      const result = await api.createProblemStatement(created.id, problem);
      const freshProblems = await api.getProblemStatements(created.id);
      setProblems(freshProblems);
      setProblem({ title: "", description: "", domain: "" });
      setMessage(`Problem statement created successfully. Problem ID: ${result.problem_id}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingProblem(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold text-slate-900">Create hackathon</h1>
      <p className="mt-2 text-slate-600">The system generates the Contest ID automatically.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <input required name="name" placeholder="Hackathon name" value={form.name} onChange={update} className="w-full rounded border p-3" />
        <label className="block text-sm font-medium text-slate-700">Registration Deadline<input required name="registration_deadline" type="datetime-local" value={form.registration_deadline} onChange={update} className="mt-1 w-full rounded border p-3" /></label>
        <label className="block text-sm font-medium text-slate-700">Hackathon Start Date<input required name="start_date" type="datetime-local" value={form.start_date} onChange={update} className="mt-1 w-full rounded border p-3" /></label>
        <label className="block text-sm font-medium text-slate-700">Hackathon End Date<input required name="end_date" type="datetime-local" value={form.end_date} onChange={update} className="mt-1 w-full rounded border p-3" /></label>
        <input name="venue" placeholder="Venue" value={form.venue} onChange={update} className="w-full rounded border p-3" />
        <select name="mode" value={form.mode} onChange={update} className="w-full rounded border p-3"><option>ONLINE</option><option>OFFLINE</option><option>HYBRID</option></select>
        <textarea name="description" placeholder="Description" value={form.description} onChange={update} className="min-h-24 w-full rounded border p-3" />
        <textarea name="rules" placeholder="Rules" value={form.rules} onChange={update} className="min-h-24 w-full rounded border p-3" />
        <button disabled={saving} className="rounded bg-black px-5 py-3 text-white disabled:opacity-50" type="submit">{saving ? "Creating..." : "Create hackathon"}</button>
      </form>
      {created && <section className="mt-8 border-t pt-6"><h2 className="text-xl font-semibold">Problem Statements</h2><form onSubmit={createProblem} className="mt-4 space-y-4"><input required placeholder="Problem title" value={problem.title} onChange={(event) => setProblem({ ...problem, title: event.target.value })} className="w-full rounded border p-3" /><input required placeholder="Domain" value={problem.domain} onChange={(event) => setProblem({ ...problem, domain: event.target.value })} className="w-full rounded border p-3" /><textarea required placeholder="Problem description" value={problem.description} onChange={(event) => setProblem({ ...problem, description: event.target.value })} className="min-h-24 w-full rounded border p-3" /><button disabled={savingProblem} className="rounded border px-5 py-3 disabled:opacity-50" type="submit">{savingProblem ? "Creating..." : "Create Problem Statement"}</button></form><div className="mt-6 space-y-3">{problems.map((item) => <article key={item.id} className="rounded border p-4"><p className="text-sm text-slate-500">Problem ID: {item.problem_id}</p><h3 className="font-semibold">{item.title}</h3><p className="text-sm text-slate-600">Domain: {item.domain || "Not specified"} · Status: Active</p></article>)}</div><button onClick={() => api.publishHackathon(created.id).then(() => setMessage("Hackathon published and visible to students."))} className="mt-6 rounded border px-5 py-3">Publish hackathon</button></section>}
      {message && <p className="mt-4 text-green-700">{message}</p>}
      {error && <p className="mt-4 text-red-700">{error}</p>}
    </div>
  );
}

export default CreateHackathon;
