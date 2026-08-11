import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../utils/constants.js";

import Landing from "../pages/Landing.jsx";
import Login from "../pages/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Leaderboard from "../pages/Leaderboard.jsx";

// TODO(teammates): swap these placeholders for the real page components
// as CreateHackathon.jsx, SubmitProject.jsx, EvaluationReport.jsx,
// Leaderboard.jsx and Profile.jsx get built. Keep the paths as-is so
// the Navbar links keep working.
function ComingSoon({ title }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500">
      <p className="text-lg font-medium text-slate-700">{title}</p>
      <p className="text-sm mt-1">This page is still being built.</p>
    </div>
  );
}

// Wrap any page that should only be visible to a logged-in user.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Landing />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />

      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path={ROUTES.CREATE_HACKATHON} element={<ComingSoon title="Create Hackathon" />} />
      <Route path={ROUTES.SUBMIT_PROJECT} element={<ComingSoon title="Submit Project" />} />
      <Route path={ROUTES.EVALUATION_REPORT} element={<ComingSoon title="Evaluation Report" />} />
      <Route
  path={ROUTES.LEADERBOARD}
  element={
    <ProtectedRoute>
      <Leaderboard />
    </ProtectedRoute>
  }
/>
      <Route path={ROUTES.PROFILE} element={<ComingSoon title="Profile" />} />

      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}

export default AppRoutes;
