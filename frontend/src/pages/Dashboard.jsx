import { Link } from "react-router-dom";
import Card from "../components/common/Card.jsx";
import Button from "../components/common/Button.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { ROLES, ROUTES } from "../utils/constants.js";

// Mock data for the static-frontend stage. Replace with calls to
// hackathonService.js / submissionService.js once the backend exists.
const MOCK_TEAMS = [
  { team: "Byte Busters", members: 4, registered: true, submitted: true },
  { team: "Null Pointers", members: 3, registered: true, submitted: false },
  { team: "Stack Overflow", members: 4, registered: true, submitted: true },
  { team: "Kernel Panic", members: 2, registered: true, submitted: false },
];

const MOCK_STUDENT_HACKATHONS = [
  { hackathon: "CampusHacks 2026", status: "Submitted", score: "82 / 100" },
  { hackathon: "InnovateX", status: "Not submitted", score: "—" },
];

function OrganizerView() {
  const submittedCount = MOCK_TEAMS.filter((t) => t.submitted).length;

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
          <p className="text-2xl font-semibold text-slate-900">{MOCK_TEAMS.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Submitted</p>
          <p className="text-2xl font-semibold text-slate-900">{submittedCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Pending submission</p>
          <p className="text-2xl font-semibold text-slate-900">
            {MOCK_TEAMS.length - submittedCount}
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
                <th className="px-4 py-2">Members</th>
                <th className="px-4 py-2">Registered</th>
                <th className="px-4 py-2">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TEAMS.map((t) => (
                <tr key={t.team} className="border-t border-slate-200">
                  <td className="px-4 py-2">{t.team}</td>
                  <td className="px-4 py-2">{t.members}</td>
                  <td className="px-4 py-2">{t.registered ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">{t.submitted ? "Yes" : "No"}</td>
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
            {MOCK_STUDENT_HACKATHONS.map((h) => (
              <tr key={h.hackathon} className="border-t border-slate-200">
                <td className="px-4 py-2">{h.hackathon}</td>
                <td className="px-4 py-2">{h.status}</td>
                <td className="px-4 py-2">{h.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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