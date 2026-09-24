import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../../services/api.js";

function HackathonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [problems, setProblems] = useState([]);
  const [teams, setTeams] = useState([]);
  const [organizer, setOrganizer] = useState(null);
  const [participations, setParticipations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getHackathon(id),
      api.getProblemStatements(id).catch(() => []),
      api.getHackathonTeams(id).catch(() => []),
      api.getStudentHackathons().catch(() => []),
    ])
      .then(async ([nextHackathon, nextProblems, nextTeams, nextParts]) => {
        setHackathon(nextHackathon);
        setProblems(nextProblems || []);
        setTeams(nextTeams || []);
        setParticipations(nextParts || []);
        try {
          const publicProfile = await api.getPublicProfile(nextHackathon.organizer_id);
          setOrganizer(publicProfile.user);
        } catch {
          // Profile may not be available
        }
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id]);

  const currentParticipation = participations.find((p) => String(p.id) === String(id));
  const isRegistered = Boolean(currentParticipation);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md w-full text-center">
          <p className="text-3xl mb-2">⚠️</p>
          <p className="font-semibold text-red-700">{error}</p>
          <button onClick={() => navigate("/hackathons")} className="mt-4 text-xs text-indigo-600 hover:underline">
            ← Back to Hackathons
          </button>
        </div>
      </div>
    );
  }

  if (loading || !hackathon) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading hackathon details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate("/hackathons")}
          className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mb-6"
        >
          ← All Hackathons
        </button>

        {/* Hero Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-wider">
                  {hackathon.mode || "ONLINE"}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  hackathon.status === "PUBLISHED" ? "bg-green-100 text-green-700" :
                  hackathon.status === "CLOSED" ? "bg-slate-100 text-slate-600" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {hackathon.status}
                </span>
                <span className="text-xs text-slate-400 font-mono">{hackathon.contest_id}</span>
              </div>

              <h1 className="text-3xl font-extrabold text-slate-900 mt-3">{hackathon.name}</h1>
              <p className="text-slate-600 text-sm mt-3 leading-relaxed">{hackathon.description}</p>

              {organizer && (
                <p className="text-xs text-slate-500 mt-4">
                  Organized by <strong className="text-slate-700">{organizer.name}</strong>
                  {organizer.college && ` (${organizer.college})`}
                </p>
              )}
            </div>

            {/* Action Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 min-w-[240px] text-center">
              {isRegistered ? (
                <div>
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full inline-block mb-3">
                    ✓ You're Registered
                  </span>
                  {currentParticipation.team_name && (
                    <p className="text-xs text-slate-600 mb-3">
                      Team: <strong>{currentParticipation.team_name}</strong>
                    </p>
                  )}
                  <Link
                    to={`/hackathons/${id}/register`}
                    className="block w-full bg-indigo-600 text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Manage Team &amp; Setup →
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-slate-500 mb-3">Registration is currently open</p>
                  <Link
                    to={`/hackathons/${id}/register`}
                    className="block w-full bg-indigo-600 text-white py-3 px-6 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-100"
                  >
                    Register / Join Team →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Schedule & Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-medium">Registration Deadline</p>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {new Date(hackathon.registration_deadline).toLocaleDateString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {new Date(hackathon.registration_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-medium">Hackathon Starts</p>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {new Date(hackathon.start_date).toLocaleDateString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {new Date(hackathon.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-medium">Hackathon Ends</p>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {new Date(hackathon.end_date).toLocaleDateString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {new Date(hackathon.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-medium">Venue / Format</p>
            <p className="text-sm font-bold text-slate-800 mt-1">{hackathon.venue || "Virtual / Remote"}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{hackathon.mode || "ONLINE"}</p>
          </div>
        </div>

        {/* Problem Statements */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Problem Statements ({problems.length})</h2>
            <Link
              to={`/hackathons/${id}/register`}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              Select a Problem for Your Team →
            </Link>
          </div>

          {problems.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-400 text-sm">
              No problem statements published yet.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {problems.map((p) => (
                <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {p.problem_id}
                      </span>
                      {p.domain && (
                        <span className="text-xs text-slate-500 font-medium">{p.domain}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{p.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{p.description}</p>
                  </div>
                  {p.requirements && (
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <strong className="text-slate-700">Requirements:</strong> {p.requirements}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Existing Teams in Hackathon */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Participating Teams ({teams.length})</h2>
            <Link
              to={`/hackathons/${id}/register`}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              + Create or Join a Team
            </Link>
          </div>

          {teams.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 text-sm">
              No teams created yet. Register now and create the first team!
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {teams.map((t) => (
                <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-sm">{t.team_name}</h4>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {t.member_count} member{t.member_count > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">{t.team_id}</p>
                  <p className="text-xs text-slate-500 mt-2">Leader: {t.leader_name}</p>
                  {t.problem_title && (
                    <p className="text-xs text-indigo-600 font-medium mt-1 truncate">
                      🎯 {t.problem_title}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HackathonDetails;
