import { Link } from "react-router-dom";
import { ROUTES } from "../utils/constants.js";

const CRITERIA = [
  { name: "Functionality", weight: "30%", icon: "⚡", active: true, color: "bg-green-50 border-green-200 text-green-800" },
  { name: "Code Quality", weight: "15%", icon: "🔍", active: true, color: "bg-blue-50 border-blue-200 text-blue-800" },
  { name: "Performance", weight: "10%", icon: "🚀", color: "bg-slate-50 border-slate-200 text-slate-600" },
  { name: "Database Design", weight: "10%", icon: "🗃️", color: "bg-slate-50 border-slate-200 text-slate-600" },
  { name: "Documentation", weight: "10%", icon: "📄", color: "bg-slate-50 border-slate-200 text-slate-600" },
  { name: "Innovation", weight: "10%", icon: "💡", color: "bg-slate-50 border-slate-200 text-slate-600" },
  { name: "Security", weight: "5%", icon: "🔒", color: "bg-slate-50 border-slate-200 text-slate-600" },
  { name: "UI/UX", weight: "5%", icon: "🎨", color: "bg-slate-50 border-slate-200 text-slate-600" },
  { name: "Presentation", weight: "5%", icon: "🎤", color: "bg-slate-50 border-slate-200 text-slate-600" },
];

const WORKFLOW = [
  { label: "Hackathon Created", desc: "Organizers set up hackathons with problem statements" },
  { label: "Team Registers", desc: "Students register and form teams" },
  { label: "Project Submitted", desc: "Teams submit their ZIP project" },
  { label: "Auto Evaluation", desc: "C++ evaluator scores Functionality & Code Quality" },
  { label: "Judge Review", desc: "Organizers review and add manual scores" },
  { label: "Leaderboard", desc: "Results are published transparently" },
];

function Landing() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
          Automated Hackathon Evaluation Platform
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
          Evaluate Hackathon Projects<br />
          <span className="text-indigo-600">Fairly &amp; Automatically</span>
        </h1>
        <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
          DevCollab Pro automates the scoring of hackathon submissions using static analysis algorithms
          for Functionality and Code Quality, combined with judge review.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to={ROUTES.HACKATHONS}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            View Hackathons
          </Link>
          <Link
            to={ROUTES.LOGIN}
            className="border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Get Started →
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg mx-auto text-center">
          {[
            { label: "Criteria Evaluated", value: "9" },
            { label: "Auto-scored", value: "2" },
            { label: "Max Score", value: "100" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-indigo-600">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 text-center">How It Works</h2>
          <p className="mt-2 text-slate-500 text-center text-sm">End-to-end from submission to leaderboard</p>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {WORKFLOW.map((step, i) => (
              <div key={step.label} className="relative flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm mb-3">
                  {i + 1}
                </div>
                <p className="text-sm font-medium text-slate-800">{step.label}</p>
                <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
                {i < WORKFLOW.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-full w-full border-t-2 border-dashed border-indigo-200 -translate-x-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Evaluation Criteria */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-slate-900 text-center">Evaluation Criteria</h2>
        <p className="mt-2 text-slate-500 text-center text-sm">
          Two criteria are <span className="text-green-700 font-medium">automatically evaluated</span> by our C++ engine
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CRITERIA.map((c) => (
            <div key={c.name} className={`border rounded-xl p-5 flex items-start gap-4 ${c.color || "bg-slate-50 border-slate-200"}`}>
              <span className="text-2xl">{c.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{c.name}</p>
                  {c.active && (
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-medium">Auto</span>
                  )}
                </div>
                <p className="text-sm mt-1 opacity-80">{c.weight} of final score</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16 text-center text-white">
        <h2 className="text-2xl font-bold">Ready to participate?</h2>
        <p className="mt-2 text-indigo-200">Register, join a team, and submit your project ZIP today.</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link to={ROUTES.LOGIN} className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
            Sign Up / Login
          </Link>
          <Link to={ROUTES.LEADERBOARD} className="border border-indigo-400 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            View Leaderboard
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Landing;
