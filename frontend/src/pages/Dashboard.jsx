import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/common/Card.jsx";
import Button from "../components/common/Button.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { ROLES, ROUTES } from "../utils/constants.js";
import { api } from "../services/api.js";

function OrganizerView() {
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    api.getOrganizerWorkflowEvaluations().then(setEvaluations).catch(() => setEvaluations([]));
  }, []);

  const submittedCount = evaluations.length;

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Your hackathon</h2>
        <Link to={ROUTES.CREATE_HACKATHON}>
          <Button variant="primary">Create Hackathon</Button>
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-slate-500">Registered teams</p>
          <p className="text-2xl font-semibold text-slate-900">{evaluations.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Submitted</p>
          <p className="text-2xl font-semibold text-slate-900">{submittedCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Pending submission</p>
          <p className="text-2xl font-semibold text-slate-900">
            {0}
          </p>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-medium text-slate-700 mb-2">Registered teams</h3>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-2">Team</th>
                <th className="px-4 py-2">Passed</th>
                <th className="px-4 py-2">Pass rate</th>
                <th className="px-4 py-2">Functionality</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((evaluation) => (
                  <tr key={evaluation.submission_id} className="border-t border-slate-200">
                    <td className="px-4 py-2">{evaluation.team_name}</td>
                    <td className="px-4 py-2">{evaluation.passed_tests} / {evaluation.total_tests}</td>
                    <td className="px-4 py-2">{evaluation.pass_rate}%</td>
                    <td className="px-4 py-2">{evaluation.weighted_score} / 30</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function StudentView() {
  const [participations, setParticipations] = useState([]);
  const [problems, setProblems] = useState({});
  const [teamName, setTeamName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.getStudentHackathons().then(async (items) => { setParticipations(items); const entries = await Promise.all(items.map(async (item) => [item.id, await api.getProblemStatements(item.id)])); setProblems(Object.fromEntries(entries)); }).catch(() => setParticipations([]));
  }, []);

  const createTeam = async (hackathonId) => {
    if (!teamName.trim()) return;
    try { await api.createWorkflowTeam(hackathonId, teamName); setMessage("Team created. Select a problem before submitting."); const items = await api.getStudentHackathons(); setParticipations(items); setTeamName(""); } catch (error) { setMessage(error.message); }
  };

  const selectProblem = async (teamId, problemId) => { try { await api.selectTeamProblem(teamId, Number(problemId)); const items = await api.getStudentHackathons(); setParticipations(items); setMessage("Problem selection saved."); } catch (error) { setMessage(error.message); } };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Your hackathons</h2>
        <Link to={ROUTES.SUBMIT_PROJECT}>
          <Button variant="primary">Submit Project</Button>
        </Link>
      </div>

      <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-2">Hackathon</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {participations.map((item) => (
              <tr key={item.id} className="border-t border-slate-200">
                <td className="px-4 py-2">{item.name} ({item.contest_id})</td>
                <td className="px-4 py-2">{item.submission_status || "Registered"}</td>
                <td className="px-4 py-2">{item.functionality_weighted == null ? "Not evaluated yet" : `${item.functionality_weighted} / 30`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {participations.filter((item) => !item.team_id).map((item) => <div key={item.id} className="mt-4 flex gap-2"><input value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder={`Team name for ${item.name}`} className="flex-1 rounded border p-3" /><button onClick={() => createTeam(item.id)} className="rounded bg-black px-4 py-3 text-white">Create team</button></div>)}
      {participations.filter((item) => item.team_id && !item.problem_id).map((item) => <div key={`problem-${item.id}`} className="mt-4 flex gap-2"><select defaultValue="" onChange={(event) => selectProblem(item.team_db_id || item.team_id, event.target.value)} className="flex-1 rounded border p-3"><option value="">Select problem for {item.team_name}</option>{(problems[item.id] || []).map((problem) => <option key={problem.id} value={problem.id}>{problem.problem_id} · {problem.title}</option>)}</select></div>)}
      {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
    </>
  );
}

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <p className="text-sm text-slate-500">
        Welcome back, {user.name} ({user.role === ROLES.ORGANIZER ? "Organizer" : "Student"})
      </p>

      <div className="mt-6">
        {user.role === ROLES.ORGANIZER ? <OrganizerView /> : <StudentView />}
      </div>
    </div>
  );
}

export default Dashboard;