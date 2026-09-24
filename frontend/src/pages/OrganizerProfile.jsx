import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api.js";

function OrganizerProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { api.getPublicProfile(userId).then(setProfile).catch((requestError) => setError(requestError.message)); }, [userId]);
  if (error) return <div className="mx-auto max-w-3xl px-4 py-12 text-red-700">{error}</div>;
  if (!profile) return <div className="mx-auto max-w-3xl px-4 py-12">Loading organizer profile...</div>;
  return <div className="mx-auto max-w-3xl px-4 py-12"><h1 className="text-3xl font-semibold">{profile.user.name}</h1><p className="mt-2 text-slate-600">{profile.user.role} · {profile.user.college || "Organization not provided"}</p><h2 className="mt-10 text-xl font-semibold">Public hackathons</h2><div className="mt-4 space-y-3">{profile.hackathons.length ? profile.hackathons.map((hackathon) => <article key={hackathon.id} className="rounded border p-4"><p className="font-semibold">{hackathon.name}</p><p className="mt-1 text-sm text-slate-500">{hackathon.contest_id} · {hackathon.status}</p></article>) : <p className="text-slate-500">No hackathons created yet.</p>}</div></div>;
}

export default OrganizerProfile;