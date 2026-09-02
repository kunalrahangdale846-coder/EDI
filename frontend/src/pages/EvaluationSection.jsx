import { useState } from "react";
import Card from "../Components/common/Card.jsx";

const SECTION_TABS = [
  { id: "dashboard", label: "Evaluation Dashboard" },
  { id: "report", label: "Report UI" },
];

const DASHBOARD_SUMMARY = [
  { label: "Teams registered", value: "48", detail: "6 new teams joined this week" },
  { label: "Evaluations complete", value: "42", detail: "6 teams still in the review queue" },
  { label: "Average final score", value: "81.6", detail: "Calculated from published evaluations" },
  { label: "Critical review flags", value: "9", detail: "Require manual confirmation before final publish" },
];

const EVALUATION_CRITERIA = [
  { label: "Code quality", score: 22.8, total: 25, tone: "bg-emerald-500" },
  { label: "Algorithm performance", score: 18.7, total: 20, tone: "bg-sky-500" },
  { label: "Repository activity", score: 13.4, total: 15, tone: "bg-indigo-500" },
  { label: "Innovation", score: 12.9, total: 15, tone: "bg-amber-500" },
  { label: "Team collaboration", score: 8.6, total: 10, tone: "bg-rose-500" },
  { label: "Documentation", score: 8.8, total: 10, tone: "bg-violet-500" },
  { label: "Security", score: 4.1, total: 5, tone: "bg-slate-700" },
];

const RECENT_EVALUATIONS = [
  { team: "Team Alpha", status: "Completed", score: "89.3", updated: "5 min ago" },
  { team: "Team Byte", status: "Completed", score: "86.7", updated: "12 min ago" },
  { team: "Team Matrix", status: "Completed", score: "83.9", updated: "18 min ago" },
  { team: "Null Pointers", status: "Pending review", score: "--", updated: "28 min ago" },
];

const DASHBOARD_HIGHLIGHTS = [
  {
    title: "Fast judging flow",
    detail: "Most teams have already cleared automated evaluation, leaving only a few manual checks.",
  },
  {
    title: "Balanced rubric",
    detail: "The score model spreads weight across quality, performance, innovation, collaboration, docs, and security.",
  },
  {
    title: "Clear bottlenecks",
    detail: "Current blockers are concentrated in final sanitization checks and missing attachments.",
  },
];

const TEAM_REPORTS = [
  {
    id: "team-alpha",
    teamName: "Team Alpha",
    projectName: "DevCollab Pro",
    finalScore: 89.3,
    rank: 1,
    status: "Evaluation complete",
    evaluatedOn: "August 10, 2026",
    summary:
      "A strong overall submission with balanced results across code quality, performance, and repository discipline.",
    criteria: EVALUATION_CRITERIA,
    strengths: [
      "Consistent repository activity with clean commit history.",
      "Runtime benchmark outperformed the baseline across larger inputs.",
      "Documentation quality supported a smooth judging flow.",
    ],
    concerns: [
      "One input-sanitization issue still needs fixing.",
      "A few larger methods would benefit from refactoring before final demo.",
    ],
    nextSteps: [
      "Patch the remaining sanitization issue.",
      "Refactor the longest methods into smaller units.",
      "Capture final screenshots for the appendix.",
    ],
  },
  {
    id: "team-byte",
    teamName: "Team Byte",
    projectName: "CodeSentry Lite",
    finalScore: 86.7,
    rank: 2,
    status: "Evaluation complete",
    evaluatedOn: "August 10, 2026",
    summary:
      "A reliable submission with excellent documentation quality and good stability across the weighted rubric.",
    criteria: [
      { label: "Code quality", score: 22.1, total: 25, tone: "bg-emerald-500" },
      { label: "Algorithm performance", score: 17.9, total: 20, tone: "bg-sky-500" },
      { label: "Repository activity", score: 12.8, total: 15, tone: "bg-indigo-500" },
      { label: "Innovation", score: 12.1, total: 15, tone: "bg-amber-500" },
      { label: "Team collaboration", score: 8.4, total: 10, tone: "bg-rose-500" },
      { label: "Documentation", score: 9.2, total: 10, tone: "bg-violet-500" },
      { label: "Security", score: 4.2, total: 5, tone: "bg-slate-700" },
    ],
    strengths: [
      "Documentation is one of the best in the cohort.",
      "Repository workflow shows clear collaboration.",
      "No critical security issue remains in the final pass.",
    ],
    concerns: [
      "Innovation score trails the leading team.",
      "Performance evidence can be presented more clearly.",
    ],
    nextSteps: [
      "Improve the feature differentiation story.",
      "Add one more performance comparison chart.",
      "Tighten commit naming consistency.",
    ],
  },
  {
    id: "team-matrix",
    teamName: "Team Matrix",
    projectName: "AlgoPro Visualizer",
    finalScore: 83.9,
    rank: 3,
    status: "Evaluation complete",
    evaluatedOn: "August 10, 2026",
    summary:
      "A technically promising build with strong performance analysis, but some weaker finishing polish in documentation and coordination signals.",
    criteria: [
      { label: "Code quality", score: 20.7, total: 25, tone: "bg-emerald-500" },
      { label: "Algorithm performance", score: 18.4, total: 20, tone: "bg-sky-500" },
      { label: "Repository activity", score: 12.3, total: 15, tone: "bg-indigo-500" },
      { label: "Innovation", score: 12.6, total: 15, tone: "bg-amber-500" },
      { label: "Team collaboration", score: 7.8, total: 10, tone: "bg-rose-500" },
      { label: "Documentation", score: 7.5, total: 10, tone: "bg-violet-500" },
      { label: "Security", score: 4.6, total: 5, tone: "bg-slate-700" },
    ],
    strengths: [
      "Strong runtime comparison and tracing output.",
      "Security posture is better than average.",
      "Innovation score reflects a good technical idea.",
    ],
    concerns: [
      "Documentation quality reduces presentation readiness.",
      "Collaboration signals are less polished than top teams.",
    ],
    nextSteps: [
      "Expand setup documentation for judges.",
      "Clarify branch ownership in the repo workflow.",
      "Polish report wording and UI labels.",
    ],
  },
];

function SmoothCard({ children, className = "" }) {
  return (
    <Card
      className={`rounded-[24px] border-white/70 bg-white/80 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_-34px_rgba(15,23,42,0.42)] ${className}`}
    >
      {children}
    </Card>
  );
}

function SummaryCard({ label, value, detail }) {
  return (
    <SmoothCard>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
    </SmoothCard>
  );
}

function ProgressRow({ label, score, total, tone }) {
  const width = Math.max(0, Math.min(100, (score / total) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-slate-800">{label}</span>
        <span className="text-slate-500">
          {score} / {total}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-200/80">
        <div
          className={`h-2.5 rounded-full ${tone} transition-all duration-700 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function SectionHero({ eyebrow, title, body, side }) {
  return (
    <div className="grid gap-6 rounded-[30px] border border-slate-200/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.97),rgba(30,41,59,0.94)_52%,rgba(51,65,85,0.92))] px-6 py-8 text-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.85)] transition-all duration-500 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-sky-200">{eyebrow}</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">{body}</p>
      </div>
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur transition-all duration-300 hover:bg-white/[0.08]">
        {side}
      </div>
    </div>
  );
}

function EvaluationDashboardSection() {
  return (
    <div className="space-y-8">
      <SectionHero
        eyebrow="Evaluation Dashboard"
        title="HackArena judging control center"
        body="Track team submissions, evaluation progress, weighted criteria, and blockers from one smoother frontend section with clearer hierarchy and softer card transitions."
        side={
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Dashboard pulse</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs text-slate-300">Published</p>
                <p className="mt-2 text-2xl font-semibold">42</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs text-slate-300">Pending</p>
                <p className="mt-2 text-2xl font-semibold">6</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              Most teams have cleared automated checks, so the remaining work is concentrated in manual verification and final approval.
            </p>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {DASHBOARD_SUMMARY.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {DASHBOARD_HIGHLIGHTS.map((item) => (
          <SmoothCard key={item.title}>
            <p className="text-sm font-medium text-slate-500">{item.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{item.detail}</p>
          </SmoothCard>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SmoothCard>
          <p className="text-sm font-medium text-slate-500">Weighted evaluation</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Scoring breakdown</h3>
          <div className="mt-6 space-y-5">
            {EVALUATION_CRITERIA.map((criterion) => (
              <ProgressRow key={criterion.label} {...criterion} />
            ))}
          </div>
        </SmoothCard>

        <SmoothCard>
          <p className="text-sm font-medium text-slate-500">Recent evaluation activity</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Team review status</h3>
          <div className="mt-6 overflow-hidden rounded-[20px] border border-slate-200/80">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/90 text-slate-500">
                <tr>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_EVALUATIONS.map((row) => (
                  <tr key={row.team} className="border-t border-slate-200/80 bg-white/70">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.team}</td>
                    <td className="px-4 py-3 text-slate-600">{row.status}</td>
                    <td className="px-4 py-3 text-slate-600">{row.score}</td>
                    <td className="px-4 py-3 text-slate-600">{row.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SmoothCard>
      </div>
    </div>
  );
}

function ReportUiSection() {
  const [selectedTeamId, setSelectedTeamId] = useState(TEAM_REPORTS[0].id);
  const selectedTeam = TEAM_REPORTS.find((team) => team.id === selectedTeamId) ?? TEAM_REPORTS[0];

  return (
    <div className="space-y-8">
      <SectionHero
        eyebrow="Report UI"
        title="Multi-team evaluation report"
        body="Switch between teams to review detailed scores, strengths, concerns, and next steps inside one smoother report experience."
        side={
          <div>
            <label htmlFor="team-report-select" className="block text-sm font-medium text-slate-200">
              Select team
            </label>
            <div className="relative mt-3">
              <select
                id="team-report-select"
                value={selectedTeamId}
                onChange={(event) => setSelectedTeamId(event.target.value)}
                className="w-full appearance-none rounded-[22px] border border-slate-200 bg-white px-4 py-3.5 pr-12 text-sm font-medium text-slate-900 shadow-[0_14px_30px_-20px_rgba(15,23,42,0.65)] transition-all duration-300 hover:border-sky-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
              >
                {TEAM_REPORTS.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.teamName} - {team.projectName}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-lg text-slate-500 transition-transform duration-300">
                ▾
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              The report updates immediately when a different team is selected, so the section can display more than one evaluation cleanly.
            </p>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Selected team" value={selectedTeam.teamName} detail={selectedTeam.status} />
        <SummaryCard label="Project" value={selectedTeam.projectName} detail={`Evaluated on ${selectedTeam.evaluatedOn}`} />
        <SummaryCard label="Final score" value={`${selectedTeam.finalScore} / 100`} detail="Weighted overall result" />
        <SummaryCard label="Rank" value={`#${selectedTeam.rank}`} detail="Current leaderboard position" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <SmoothCard>
          <p className="text-sm font-medium text-slate-500">Available evaluations</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Team list</h3>
          <div className="mt-6 space-y-3">
            {TEAM_REPORTS.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => setSelectedTeamId(team.id)}
                className={`w-full rounded-[20px] border px-4 py-4 text-left transition-all duration-300 ${
                  team.id === selectedTeamId
                    ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                    : "border-slate-200 bg-white/80 text-slate-800 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium">{team.teamName}</span>
                  <span className="text-sm">#{team.rank}</span>
                </div>
                <p className={`mt-2 text-sm ${team.id === selectedTeamId ? "text-slate-300" : "text-slate-500"}`}>
                  {team.finalScore} / 100
                </p>
              </button>
            ))}
          </div>
        </SmoothCard>

        <SmoothCard>
          <p className="text-sm font-medium text-slate-500">Team overview</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{selectedTeam.projectName}</h3>
          <p className="mt-4 text-sm leading-7 text-slate-700">{selectedTeam.summary}</p>
          <div className="mt-6 space-y-5">
            {selectedTeam.criteria.map((criterion) => (
              <ProgressRow key={`${selectedTeam.id}-${criterion.label}`} {...criterion} />
            ))}
          </div>
        </SmoothCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SmoothCard>
          <p className="text-sm font-medium text-slate-500">Strengths</p>
          <div className="mt-4 space-y-3">
            {selectedTeam.strengths.map((item) => (
              <div key={item} className="rounded-[18px] bg-emerald-50/80 px-4 py-3 text-sm leading-6 text-emerald-900">
                {item}
              </div>
            ))}
          </div>
        </SmoothCard>

        <SmoothCard>
          <p className="text-sm font-medium text-slate-500">Concerns</p>
          <div className="mt-4 space-y-3">
            {selectedTeam.concerns.map((item) => (
              <div key={item} className="rounded-[18px] bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-900">
                {item}
              </div>
            ))}
          </div>
        </SmoothCard>

        <SmoothCard>
          <p className="text-sm font-medium text-slate-500">Next steps</p>
          <div className="mt-4 space-y-3">
            {selectedTeam.nextSteps.map((item) => (
              <div key={item} className="rounded-[18px] bg-sky-50/80 px-4 py-3 text-sm leading-6 text-sky-900">
                {item}
              </div>
            ))}
          </div>
        </SmoothCard>
      </div>
    </div>
  );
}

function EvaluationSection() {
  const [activeTab, setActiveTab] = useState(SECTION_TABS[0].id);

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_24%),radial-gradient(circle_at_right,_rgba(168,85,247,0.10),_transparent_22%),linear-gradient(180deg,_#f8fbff_0%,_#f8fafc_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="inline-flex flex-wrap gap-3 rounded-full border border-slate-200/80 bg-white/80 p-2 shadow-sm backdrop-blur">
          {SECTION_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-600 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {activeTab === "dashboard" && <EvaluationDashboardSection />}
          {activeTab === "report" && <ReportUiSection />}
        </div>
      </div>
    </div>
  );
}

export default EvaluationSection;
