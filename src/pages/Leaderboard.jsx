import RankCard from "../components/leadearboard/RankCard.jsx";
import LeaderboardTable from "../components/leadearboard/LeaderboardTable.jsx";

const MOCK_LEADERBOARD = [
  {
    RankPosition: 1,
    UserID: 101,
    ContestID: 101,
    TotalScore: 92.0,
  },
  {
    RankPosition: 2,
    UserID: 102,
    ContestID: 101,
    TotalScore: 88.0,
  },
  {
    RankPosition: 3,
    UserID: 103,
    ContestID: 101,
    TotalScore: 84.0,
  },
  {
    RankPosition: 4,
    UserID: 104,
    ContestID: 101,
    TotalScore: 79.0,
  },
];

function Leaderboard() {
  const topThree = MOCK_LEADERBOARD.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Leaderboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View the current hackathon rankings and scores.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {topThree.map((entry) => (
          <RankCard
            key={`${entry.ContestID}-${entry.UserID}`}
            rank={entry.RankPosition}
            userId={entry.UserID}
            score={entry.TotalScore}
          />
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Rankings
        </h2>

        <LeaderboardTable leaderboard={MOCK_LEADERBOARD} />
      </div>
    </div>
  );
}

export default Leaderboard;
