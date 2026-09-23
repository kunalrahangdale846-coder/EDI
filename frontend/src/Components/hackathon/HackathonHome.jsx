import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api.js";

function HackathonHome() {
  const [hackathons, setHackathons] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.getHackathons().then(setHackathons).catch(() => setHackathons([]));
  }, []);

  const visible = hackathons.filter((hackathon) => `${hackathon.name} ${hackathon.description || ""}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-white text-black">
      <section className="border-b border-black/10"><div className="mx-auto max-w-7xl px-6 py-14 md:px-10"><p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-gray-500">DevCollab Pro</p><h1 className="text-4xl font-bold tracking-tight md:text-5xl">Hackathons</h1><p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">Discover, build and participate in published hackathons.</p></div></section>
      <section><div className="mx-auto max-w-7xl px-6 py-8 md:px-10"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search hackathons..." className="w-full rounded-lg border border-black/20 px-4 py-3 text-sm outline-none focus:border-black" /></div></section>
      <section><div className="mx-auto max-w-7xl px-6 pb-16 md:px-10"><div className="mb-8"><h2 className="text-2xl font-semibold tracking-tight">Available Hackathons</h2><p className="mt-2 text-sm text-gray-500">{visible.length} published hackathons</p></div>{visible.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{visible.map((hackathon) => <article key={hackathon.id} className="flex flex-col rounded-xl border border-black/15 bg-white p-6 transition hover:border-black"><div className="mb-6 flex items-center justify-between"><span className="rounded-full border border-black px-3 py-1 text-xs font-medium">{hackathon.status}</span><span className="text-xs text-gray-500">{hackathon.contest_id}</span></div><h3 className="text-xl font-semibold tracking-tight">{hackathon.name}</h3><p className="mt-3 flex-1 text-sm leading-6 text-gray-600">{hackathon.description}</p><div className="mt-6 space-y-3 border-t border-black/10 pt-5 text-sm"><div className="flex justify-between"><span className="text-gray-500">Registration closes</span><span className="font-medium">{new Date(hackathon.registration_deadline).toLocaleDateString()}</span></div><div className="flex justify-between"><span className="text-gray-500">Mode</span><span className="font-medium">{hackathon.mode}</span></div></div><button onClick={() => navigate(`/hackathons/${hackathon.id}`)} className="mt-6 w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800">View Details</button></article>)}</div> : <div className="rounded-xl border border-black/10 py-16 text-center"><h3 className="text-lg font-semibold">No published hackathons found</h3><p className="mt-2 text-sm text-gray-500">Organizers will appear here after publishing.</p></div>}</div></section>
    </div>
  );
}

export default HackathonHome;
