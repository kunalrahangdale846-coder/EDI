import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { ROUTES, ROLES } from "../../utils/constants.js";
import { useState } from "react";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <span className="font-bold text-slate-900 text-lg">DevCollab <span className="text-indigo-600">Pro</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
          {!user && (
            <>
              <Link to={ROUTES.HOME} className="hover:text-indigo-600 transition-colors">Home</Link>
              <Link to={ROUTES.HACKATHONS} className="hover:text-indigo-600 transition-colors">Hackathons</Link>
              <Link to={ROUTES.LEADERBOARD} className="hover:text-indigo-600 transition-colors">Leaderboard</Link>
              <Link
                to={ROUTES.LOGIN}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Sign In
              </Link>
            </>
          )}

          {user && (
            <>
              <Link to={ROUTES.DASHBOARD} className="hover:text-indigo-600 transition-colors">Dashboard</Link>
              {user.role === ROLES.ORGANIZER && (
                <>
                  <Link to={ROUTES.EVALUATION_SECTION} className="hover:text-indigo-600 transition-colors">Evaluate</Link>
                  <Link to={ROUTES.CREATE_HACKATHON} className="hover:text-indigo-600 transition-colors">Create Hackathon</Link>
                </>
              )}
              {user.role === ROLES.STUDENT && (
                <>
                  <Link to={ROUTES.SUBMIT_PROJECT} className="hover:text-indigo-600 transition-colors">Submit Project</Link>
                  <Link to={ROUTES.EVALUATION_REPORT} className="hover:text-indigo-600 transition-colors">Evaluation Report</Link>
                </>
              )}
              <Link to={ROUTES.LEADERBOARD} className="hover:text-indigo-600 transition-colors">Leaderboard</Link>
              <Link to={ROUTES.PROFILE} className="hover:text-indigo-600 transition-colors">Profile</Link>

              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-indigo-700">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-slate-700 font-medium">{user.name?.split(" ")[0]}</span>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full capitalize">
                    {user.role === ROLES.ORGANIZER ? "Organizer" : "Student"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-red-600 text-xs border border-slate-200 px-3 py-1.5 rounded-lg hover:border-red-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </nav>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 text-sm">
          {!user && (
            <>
              <Link to={ROUTES.HOME} className="block py-2 text-slate-600 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to={ROUTES.HACKATHONS} className="block py-2 text-slate-600 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Hackathons</Link>
              <Link to={ROUTES.LEADERBOARD} className="block py-2 text-slate-600 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Leaderboard</Link>
              <Link to={ROUTES.LOGIN} className="block py-2 text-indigo-600 font-medium" onClick={() => setMenuOpen(false)}>Sign In →</Link>
            </>
          )}
          {user && (
            <>
              <Link to={ROUTES.DASHBOARD} className="block py-2 text-slate-600 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              {user.role === ROLES.ORGANIZER && (
                <>
                  <Link to={ROUTES.EVALUATION_SECTION} className="block py-2 text-slate-600 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Evaluate</Link>
                  <Link to={ROUTES.CREATE_HACKATHON} className="block py-2 text-slate-600 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Create Hackathon</Link>
                </>
              )}
              {user.role === ROLES.STUDENT && (
                <Link to={ROUTES.SUBMIT_PROJECT} className="block py-2 text-slate-600 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Submit Project</Link>
              )}
              <Link to={ROUTES.LEADERBOARD} className="block py-2 text-slate-600 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Leaderboard</Link>
              <Link to={ROUTES.PROFILE} className="block py-2 text-slate-600 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600">Logout</button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
