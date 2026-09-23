import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api.js";

function HackathonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [problems, setProblems] = useState([]);
  const [organizer, setOrganizer] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.getHackathon(id), api.getProblemStatements(id)]).then(async ([nextHackathon, nextProblems]) => { setHackathon(nextHackathon); setProblems(nextProblems); const publicProfile = await api.getPublicProfile(nextHackathon.organizer_id); setOrganizer(publicProfile.user); }).catch((requestError) => setError(requestError.message));
  }, [id]);

  if (error) return <div className="mx-auto max-w-4xl px-6 py-16 text-center text-red-700">{error}</div>;
  if (!hackathon) return <div className="mx-auto max-w-4xl px-6 py-16 text-center">Loading hackathon...</div>;
  return <div className="min-h-screen bg-white text-black"><section className="border-b border-black/10"><div className="mx-auto max-w-6xl px-6 py-12 md:px-10"><button onClick={() => navigate("/hackathons")} className="mb-8 text-sm underline">Back to Hackathons</button><span className="rounded-full border border-black px-3 py-1 text-xs">{hackathon.status}</span><h1 className="mt-5 text-4xl font-bold">{hackathon.name}</h1><p className="mt-4 max-w-2xl leading-7 text-gray-600">{hackathon.description}</p><p className="mt-4 text-sm text-gray-500">Contest ID: <span className="font-medium text-black">{hackathon.contest_id}</span></p>{organizer && <p className="mt-3 text-sm text-gray-600">Created by <button onClick={() => navigate(`/organizers/${organizer.user_id}`)} className="font-medium text-black underline">{organizer.name}</button> · {organizer.role}</p>}<button onClick={() => navigate(`/hackathons/${id}/register`)} className="mt-6 rounded-lg bg-black px-8 py-3 text-sm font-medium text-white">Register Now</button></div></section><section className="mx-auto max-w-6xl px-6 py-10 md:px-10"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-lg border p-5"><p className="text-sm text-gray-500">Registration Deadline</p><p className="mt-2 font-semibold">{new Date(hackathon.registration_deadline).toLocaleString()}</p></div><div className="rounded-lg border p-5"><p className="text-sm text-gray-500">Hackathon Start</p><p className="mt-2 font-semibold">{new Date(hackathon.start_date).toLocaleString()}</p></div><div className="rounded-lg border p-5"><p className="text-sm text-gray-500">Hackathon End</p><p className="mt-2 font-semibold">{new Date(hackathon.end_date).toLocaleString()}</p></div><div className="rounded-lg border p-5"><p className="text-sm text-gray-500">Mode</p><p className="mt-2 font-semibold">{hackathon.mode}</p></div></div><h2 className="mt-12 text-2xl font-semibold">Problem Statements</h2><div className="mt-5 space-y-4">{problems.length ? problems.map((problem) => <article key={problem.id} className="rounded-lg border p-5"><p className="text-xs text-gray-500">{problem.problem_id}</p><h3 className="mt-2 text-lg font-semibold">{problem.title}</h3><p className="mt-2 text-gray-600">{problem.description}</p></article>) : <p className="mt-4 text-gray-500">Problem statements will be published by the organizer.</p>}</div></section></div>;
}

export default HackathonDetails;
