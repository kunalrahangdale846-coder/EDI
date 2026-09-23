import { useEffect, useState } from "react";
import { api } from "../services/api.js";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { api.getStudentProfile().then(setProfile).catch((requestError) => setError(requestError.message)); }, []);
  if (error) return <div className="mx-auto max-w-5xl px-4 py-12 text-red-700">{error}</div>;
  if (!profile) return <div className="mx-auto max-w-5xl px-4 py-12">Loading profile...</div>;
  return <div className="mx-auto max-w-5xl px-4 py-12"><h1 className="text-3xl font-semibold text-slate-900">Profile</h1><div className="mt-6 rounded border p-5"><p>Name: <strong>{profile.user.name}</strong></p><p className="mt-2">Email: <strong>{profile.user.email}</strong></p><p className="mt-2">College: <strong>{profile.user.college || "Not provided"}</strong></p></div><h2 className="mt-10 text-xl font-semibold">Hackathon participation</h2><div className="mt-4 space-y-4">{profile.participations.length ? profile.participations.map((item) => <article key={item.id} className="rounded border p-5"><h3 className="font-semibold">{item.name}</h3><p className="mt-2 text-sm text-gray-600">Contest ID: {item.contest_id}</p><p className="mt-2 text-sm">Team: {item.team_name || "Not created"} {item.team_id && `(${item.team_id})`} · Role: {item.team_role || "Not assigned"}</p><p className="mt-2 text-sm">Problem: {item.problem_title || "Not selected"} {item.problem_id && `(${item.problem_id})`}</p><p className="mt-2 text-sm">Submission: {item.submission_status || "Not submitted"}</p><p className="mt-2 text-sm">Final score: {item.final_score == null ? "Not evaluated yet" : `${item.final_score} / 100`}</p></article>) : <p className="text-gray-500">No hackathon participation yet.</p>}</div></div>;
}

export default Profile;
