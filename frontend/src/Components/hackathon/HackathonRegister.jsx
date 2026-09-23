import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api.js";

function HackathonRegister() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { api.getHackathon(id).then(setHackathon).catch((requestError) => setError(requestError.message)); }, [id]);

  const register = async (event) => {
    event.preventDefault();
    try { await api.registerForHackathon(id); setMessage("Registration successful. You can now create a team from your dashboard."); } catch (requestError) { setError(requestError.message); }
  };

  if (error) return <div className="mx-auto max-w-3xl px-6 py-16 text-center text-red-700">{error}</div>;
  if (!hackathon) return <div className="mx-auto max-w-3xl px-6 py-16 text-center">Loading hackathon...</div>;
  return <div className="mx-auto max-w-3xl px-6 py-12"><button onClick={() => navigate(`/hackathons/${id}`)} className="mb-6 text-sm underline">Back to Hackathon</button><h1 className="text-3xl font-bold">{hackathon.name}</h1><p className="mt-3 text-gray-600">Contest ID: {hackathon.contest_id}</p><form onSubmit={register} className="mt-8 rounded-xl border border-black/15 p-6"><p className="text-gray-600">Register your authenticated student account for this hackathon.</p><button className="mt-6 rounded bg-black px-5 py-3 text-white" type="submit">Register / Participate</button>{message && <p className="mt-4 text-green-700">{message}</p>}</form></div>;
}

export default HackathonRegister;
