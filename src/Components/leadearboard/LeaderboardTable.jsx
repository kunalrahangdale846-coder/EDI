function LeaderboardTable({ leaderboard = [] }) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-4 py-2">Rank</th>
            <th className="px-4 py-2">User ID</th>
            <th className="px-4 py-2">Contest ID</th>
            <th className="px-4 py-2">Total Score</th>
          </tr>
        </thead>

        <tbody>
          {leaderboard.length === 0 ? (
            <tr>
              <td
                colSpan="4"
                className="px-4 py-6 text-center text-slate-500"
              >
                No leaderboard data available.
              </td>
            </tr>
          ) : (
            leaderboard.map((entry) => (
              <tr
                key={`${entry.ContestID}-${entry.UserID}`}
                className="border-t border-slate-200"
              >
                <td className="px-4 py-2">{entry.RankPosition}</td>
                <td className="px-4 py-2">{entry.UserID}</td>
                <td className="px-4 py-2">{entry.ContestID}</td>
                <td className="px-4 py-2 font-medium">
                  {entry.TotalScore}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LeaderboardTable;
