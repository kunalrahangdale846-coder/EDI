import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../../services/api.js";
import { ROUTES } from "../../utils/constants.js";

function HackathonRegister() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [teams, setTeams] = useState([]);
  const [problems, setProblems] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);

  // States
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedProblemId, setSelectedProblemId] = useState("");
  const [mode, setMode] = useState("create"); // "create" | "join"
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [h, t, p, parts] = await Promise.all([
        api.getHackathon(id),
        api.getHackathonTeams(id).catch(() => []),
        api.getProblemStatements(id).catch(() => []),
        api.getStudentHackathons().catch(() => []),
      ]);
      setHackathon(h);
      setTeams(t || []);
      setProblems(p || []);
      setParticipations(parts || []);
    } catch (err) {
      setError(err.message || "Failed to load hackathon");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  const currentParticipation = participations.find((p) => String(p.id) === String(id));
  const isRegistered = Boolean(currentParticipation);
  const myTeamName = currentParticipation?.team_name;
  const myTeamDbId = currentParticipation?.team_db_id;
  const myProblemTitle = currentParticipation?.problem_title;

  // 1. Register for Hackathon
  const handleRegister = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.registerForHackathon(id);
      setMessage("✅ Successfully registered for the hackathon! Now create or join a team below.");
      await loadAll();
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  // 2. Create Team
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const created = await api.createWorkflowTeam(id, newTeamName.trim());
      setMessage(`🎉 Team "${created.team_name}" created successfully! Now select your problem statement below.`);
      setNewTeamName("");
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to create team");
    } finally {
      setBusy(false);
    }
  };

  // 3. Join Team
  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!selectedTeamId) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await api.joinWorkflowTeam(Number(selectedTeamId));
      setMessage(`🤝 ${res.message || "Joined team successfully!"}`);
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to join team");
    } finally {
      setBusy(false);
    }
  };

  // 4. Select Problem Statement
  const handleSelectProblem = async (e) => {
    e.preventDefault();
    if (!myTeamDbId || !selectedProblemId) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.selectTeamProblem(myTeamDbId, Number(selectedProblemId));
      setMessage("🎯 Problem statement assigned to your team successfully! You are now ready to submit.");
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to select problem");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading hackathon & team details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Back Link */}
        <button
          onClick={() => navigate(`/hackathons/${id}`)}
          className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mb-6"
        >
          ← Back to Hackathon Details
        </button>

        {/* Hackathon Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {hackathon.mode || "ONLINE"}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">{hackathon.name}</h1>
              <p className="text-xs text-slate-500 mt-1 font-mono">{hackathon.contest_id}</p>
            </div>
            {isRegistered ? (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span> Registered
              </span>
            ) : (
              <button
                onClick={handleRegister}
                disabled={busy}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {busy ? "Registering..." : "Register Now"}
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-5 py-3.5 rounded-xl text-sm flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="text-green-600 hover:text-green-800">✕</button>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 rounded-xl text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        {/* Step-by-Step Setup */}
        <div className="space-y-6">
          {/* STEP 1: Registration Status */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                isRegistered ? "bg-green-500 text-white" : "bg-slate-200 text-slate-600"
              }`}>
                {isRegistered ? "✓" : "1"}
              </div>
              <h2 className="text-base font-semibold text-slate-900">Step 1: Hackathon Registration</h2>
            </div>
            {isRegistered ? (
              <p className="text-xs text-green-700 ml-11">
                You are registered as a participant for this hackathon.
              </p>
            ) : (
              <div className="ml-11 mt-2">
                <p className="text-xs text-slate-500 mb-3">
                  Click the button below to register your authenticated student account.
                </p>
                <button
                  onClick={handleRegister}
                  disabled={busy}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {busy ? "Registering..." : "Complete Registration"}
                </button>
              </div>
            )}
          </div>

          {/* STEP 2: Team Creation / Joining */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                myTeamName ? "bg-green-500 text-white" : isRegistered ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
              }`}>
                {myTeamName ? "✓" : "2"}
              </div>
              <h2 className="text-base font-semibold text-slate-900">Step 2: Team Setup</h2>
            </div>

            {myTeamName ? (
              <div className="ml-11 mt-1 bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Your Team: {myTeamName}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Role: {currentParticipation?.team_role || "MEMBER"}</p>
                </div>
                <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">Team Active</span>
              </div>
            ) : isRegistered ? (
              <div className="ml-11 mt-3">
                {/* Toggle Create / Join */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl max-w-xs mb-4">
                  <button
                    type="button"
                    onClick={() => setMode("create")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      mode === "create" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    + Create New Team
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("join")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      mode === "join" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🤝 Join Team
                  </button>
                </div>

                {mode === "create" ? (
                  <form onSubmit={handleCreateTeam} className="space-y-3 max-w-md">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Team Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Code Ninjas, Cyber Wolves..."
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={busy || !newTeamName.trim()}
                      className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {busy ? "Creating..." : "Create Team"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleJoinTeam} className="space-y-3 max-w-md">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Select an Existing Team</label>
                      {teams.length > 0 ? (
                        <select
                          required
                          value={selectedTeamId}
                          onChange={(e) => setSelectedTeamId(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                          <option value="">-- Choose a team to join --</option>
                          {teams.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.team_name} ({t.member_count} member{t.member_count > 1 ? "s" : ""}) · Leader: {t.leader_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No teams exist yet. Be the first to create one!</p>
                      )}
                    </div>
                    {teams.length > 0 && (
                      <button
                        type="submit"
                        disabled={busy || !selectedTeamId}
                        className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                      >
                        {busy ? "Joining..." : "Join Selected Team"}
                      </button>
                    )}
                  </form>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic ml-11">Register for the hackathon first to create or join a team.</p>
            )}
          </div>

          {/* STEP 3: Problem Statement Selection */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                myProblemTitle ? "bg-green-500 text-white" : myTeamName ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
              }`}>
                {myProblemTitle ? "✓" : "3"}
              </div>
              <h2 className="text-base font-semibold text-slate-900">Step 3: Problem Statement Selection</h2>
            </div>

            {myProblemTitle ? (
              <div className="ml-11 mt-1 bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Problem: {myProblemTitle}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{currentParticipation?.problem_description || "Assigned to your team"}</p>
                </div>
                <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">Problem Selected</span>
              </div>
            ) : myTeamName ? (
              <div className="ml-11 mt-3 max-w-xl">
                {problems.length > 0 ? (
                  <form onSubmit={handleSelectProblem} className="space-y-4">
                    <p className="text-xs text-slate-500">
                      Choose which challenge problem statement your team will be solving:
                    </p>
                    <div className="space-y-2.5">
                      {problems.map((prob) => (
                        <label
                          key={prob.id}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                            String(selectedProblemId) === String(prob.id)
                              ? "border-indigo-500 bg-indigo-50/50"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="problem"
                            value={prob.id}
                            checked={String(selectedProblemId) === String(prob.id)}
                            onChange={(e) => setSelectedProblemId(e.target.value)}
                            className="mt-1"
                          />
                          <div>
                            <p className="text-xs font-mono text-slate-400">{prob.problem_id}</p>
                            <p className="text-sm font-semibold text-slate-800">{prob.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{prob.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <button
                      type="submit"
                      disabled={busy || !selectedProblemId}
                      className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {busy ? "Saving Selection..." : "Confirm Problem Selection"}
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-slate-400 italic">No problem statements have been posted for this hackathon yet.</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic ml-11">Setup your team in Step 2 to select a problem statement.</p>
            )}
          </div>

          {/* STEP 4: Ready to Submit Project */}
          {myTeamName && myProblemTitle && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 text-center">
              <span className="text-3xl">🚀</span>
              <h3 className="font-bold text-slate-900 text-lg mt-2">You're All Set!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                Your team is registered and your problem statement is locked in. You can now submit your project ZIP archive for automated evaluation.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Link
                  to={ROUTES.SUBMIT_PROJECT}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
                >
                  Go to Submit Project →
                </Link>
                <Link
                  to={ROUTES.DASHBOARD}
                  className="bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  View Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HackathonRegister;
