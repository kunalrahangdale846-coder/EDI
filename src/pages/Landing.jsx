import { Link } from "react-router-dom";
import Button from "../components/common/Button.jsx";
import Card from "../components/common/Card.jsx";
import { ROUTES } from "../utils/constants.js";

const CRITERIA = [
  { name: "Functionality", weight: "30%" },
  { name: "Code Quality", weight: "15%" },
  { name: "Performance", weight: "10%" },
  { name: "Database Design", weight: "10%" },
  { name: "Documentation", weight: "10%" },
  { name: "Innovation", weight: "10%" },
  { name: "Security", weight: "5%" },
  { name: "UI/UX", weight: "5%" },
  { name: "Presentation", weight: "5%" },
];

const WORKFLOW = [
  "Hackathon Created",
  "Team Registers",
  "Project Submitted",
  "Validation & Build",
  "Automated Evaluation",
  "Judge Evaluation",
  "Leaderboard",
];

function Landing() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <section className="max-w-2xl">
        <h1 className="text-3xl font-semibold text-slate-900">DevCollab Pro</h1>
        <p className="mt-3 text-slate-600">
          An automated evaluation platform for hackathon software submissions.
          Teams submit a full project, the platform validates, builds and scores
          it, and combines that with judge scoring for a transparent
          leaderboard.
        </p>
        <div className="mt-6 flex gap-3">
          <Link to={ROUTES.HACKATHONS}>
            <Button variant="primary">View Hackathons</Button>
          </Link>

          <Link to={ROUTES.LOGIN}>
            <Button variant="secondary">Get Started</Button>
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-lg font-semibold text-slate-900">How it works</h2>
        <ol className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
          {WORKFLOW.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className="text-slate-400">{i + 1}.</span>
              <span>{step}</span>
              {i < WORKFLOW.length - 1 && (
                <span className="text-slate-300">→</span>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16">
        <h2 className="text-lg font-semibold text-slate-900">
          Evaluation criteria
        </h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CRITERIA.map((c) => (
            <Card key={c.name}>
              <p className="font-medium text-slate-900">{c.name}</p>
              <p className="text-sm text-slate-500">
                {c.weight} of final score
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Landing;
