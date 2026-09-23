import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../utils/constants.js";
import HackathonHome from "../Components/hackathon/HackathonHome.jsx";
import HackathonDetails from "../Components/hackathon/HackathonDetails.jsx";
import HackathonRegister from "../Components/hackathon/HackathonRegister.jsx";
import Landing from "../pages/Landing.jsx";
import Login from "../pages/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import EvaluationSection from "../pages/EvaluationSection.jsx";
import CreateHackathon from "../pages/CreateHackathon.jsx";
import SubmitProject from "../pages/SubmitProject.jsx";
import EvaluationReport from "../pages/EvaluationReport.jsx";
import Leaderboard from "../pages/Leaderboard.jsx";
import Profile from "../pages/Profile.jsx";
import OrganizerProfile from "../pages/OrganizerProfile.jsx";

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

      <Route path="/hackathons" element={<HackathonHome />} />
      <Route path="/hackathons/:id" element={<HackathonDetails />} />
      <Route path="/hackathons/:id/register" element={<HackathonRegister />} />
      <Route path="/organizers/:userId" element={<OrganizerProfile />} />

      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.EVALUATION_SECTION}
        element={
          <ProtectedRoute>
            <EvaluationSection />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.CREATE_HACKATHON}
        element={<ProtectedRoute><CreateHackathon /></ProtectedRoute>}
      />
      <Route
        path={ROUTES.SUBMIT_PROJECT}
        element={<ProtectedRoute><SubmitProject /></ProtectedRoute>}
      />
      <Route
        path={ROUTES.EVALUATION_REPORT}
        element={<ProtectedRoute><EvaluationReport /></ProtectedRoute>}
      />
      <Route
        path={ROUTES.LEADERBOARD}
        element={<Leaderboard />}
      />
      <Route path={ROUTES.PROFILE} element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}

export default AppRoutes;
