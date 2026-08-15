import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import Button from "../common/Button.jsx";
import { ROUTES, ROLES } from "../../utils/constants.js";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  return (
    <header className="border-b border-slate-200">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to={ROUTES.HOME} className="font-semibold text-slate-900">
          DevCollab Pro
        </Link>

        <div className="flex items-center gap-5 text-sm text-slate-600">
          {!user && (
            <>
              <Link to={ROUTES.HOME} className="hover:text-slate-900">Home</Link>
              <Link to={ROUTES.LOGIN}>
                <Button variant="secondary">Login</Button>
              </Link>
            </>
          )}

          {user && (
            <>
              <Link to={ROUTES.DASHBOARD} className="hover:text-slate-900">Dashboard</Link>
              <Link to={ROUTES.EVALUATION_SECTION} className="hover:text-slate-900">
                Evaluation
              </Link>

              {user.role === ROLES.ORGANIZER && (
                <Link to={ROUTES.CREATE_HACKATHON} className="hover:text-slate-900">
                  Create Hackathon
                </Link>
              )}

              {user.role === ROLES.STUDENT && (
                <Link to={ROUTES.SUBMIT_PROJECT} className="hover:text-slate-900">
                  Submit Project
                </Link>
              )}

              <Link to={ROUTES.LEADERBOARD} className="hover:text-slate-900">Leaderboard</Link>
              <Link to={ROUTES.PROFILE} className="hover:text-slate-900">Profile</Link>

              <span className="text-slate-400">|</span>
              <span>{user.name} · <span className="capitalize">{user.role}</span></span>
              <Button variant="ghost" onClick={handleLogout}>Logout</Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
