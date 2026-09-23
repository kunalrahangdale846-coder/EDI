const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("devcollab_token");
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.error || "Request failed");
  }
  return data;
}

export const api = {
  health: () => apiRequest("/health"),
  createUser: (user) => apiRequest("/users", {
    method: "POST",
    body: JSON.stringify(user),
  }),
  register: (user) => apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(user),
  }),
  login: (credentials) => apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  }),
  getUsers: () => apiRequest("/users"),
  getContests: () => apiRequest("/contests"),
  createContest: (contest) => apiRequest("/contests", {
    method: "POST",
    body: JSON.stringify(contest),
  }),
  getProblems: (contestId) => apiRequest(`/contests/${contestId}/problems`),
  createProblem: (problem) => apiRequest("/problems", {
    method: "POST",
    body: JSON.stringify(problem),
  }),
  createSubmission: (submission) => apiRequest("/submissions", {
    method: "POST",
    body: JSON.stringify(submission),
  }),
  evaluateSubmission: (submissionId) => apiRequest(`/submissions/${submissionId}/evaluate`, { method: "POST" }),
  getEvaluation: (submissionId) => apiRequest(`/submissions/${submissionId}/evaluation`),
  getCriterionEvaluations: (submissionId) => apiRequest(`/submissions/${submissionId}/evaluations`),
  getLeaderboard: (contestId) => apiRequest(`/contests/${contestId}/leaderboard`),
  getMyTeams: () => apiRequest("/teams/my"),
  createTeam: (team) => apiRequest("/teams", { method: "POST", body: JSON.stringify(team) }),
  addTeamMember: (teamId, userId) => apiRequest(`/teams/${teamId}/members`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  }),
  uploadSubmission: (formData) => apiRequest("/submissions", { method: "POST", body: formData }),
  getMySubmissions: () => apiRequest("/submissions/my"),
  getMyEvaluations: () => apiRequest("/student/evaluations"),
  getOrganizerEvaluations: () => apiRequest("/organizer/evaluations"),
  getOrganizerWorkflowEvaluations: () => apiRequest("/organizer/workflow-evaluations"),
  getOrganizerContestEvaluations: (contestId) => apiRequest(`/organizer/contests/${contestId}/evaluations`),
  getHackathons: () => apiRequest("/hackathons"),
  getHackathon: (id) => apiRequest(`/hackathons/${id}`),
  createHackathon: (hackathon) => apiRequest("/hackathons", { method: "POST", body: JSON.stringify(hackathon) }),
  publishHackathon: (id) => apiRequest(`/hackathons/${id}/publish`, { method: "POST" }),
  getProblemStatements: (id) => apiRequest(`/hackathons/${id}/problem-statements`),
  createProblemStatement: (id, problem) => apiRequest(`/hackathons/${id}/problems`, { method: "POST", body: JSON.stringify(problem) }),
  registerForHackathon: (id) => apiRequest(`/hackathons/${id}/register`, { method: "POST", body: JSON.stringify({}) }),
  getStudentHackathons: () => apiRequest("/student/hackathons"),
  getStudentProfile: () => apiRequest("/student/profile"),
  getPublicProfile: (userId) => apiRequest(`/users/${userId}/public-profile`),
  createWorkflowTeam: (hackathonId, team_name) => apiRequest(`/teams/workflow?hackathon_id=${hackathonId}`, { method: "POST", body: JSON.stringify({ team_name }) }),
  selectTeamProblem: (teamId, problem_statement_id) => apiRequest(`/teams/${teamId}/problem`, { method: "POST", body: JSON.stringify({ problem_statement_id }) }),
  uploadWorkflowSubmission: (hackathonId, formData) => apiRequest(`/hackathons/${hackathonId}/submissions`, { method: "POST", body: formData }),
  getStudentSubmissions: () => apiRequest("/student/submissions"),
  getStudentWorkflowEvaluation: (submissionId) => apiRequest(`/student/submissions/${submissionId}/evaluation`),
  getOrganizerSubmissions: (hackathonId) => apiRequest(`/organizer/hackathons/${hackathonId}/submissions`),
  evaluateWorkflowSubmission: (submissionId, evaluation) => apiRequest(`/organizer/evaluations/${submissionId}`, { method: "POST", body: JSON.stringify(evaluation) }),
  publishLeaderboard: (id) => apiRequest(`/hackathons/${id}/publish-leaderboard`, { method: "POST" }),
  getWorkflowLeaderboard: (id) => apiRequest(`/hackathons/${id}/leaderboard`),
  getWorkflowLeaderboardByContest: (contestId) => apiRequest(`/hackathons/contest/${encodeURIComponent(contestId)}/leaderboard`),
};