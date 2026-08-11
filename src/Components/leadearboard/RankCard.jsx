function RankCard({ rank, userId, score }) {
  return (
    <div className="border border-slate-200 rounded-lg p-5 text-center">
      <p className="text-sm text-slate-500">Rank</p>

      <p className="text-3xl font-semibold text-slate-900 mt-1">
        #{rank}
      </p>

      <p className="text-sm text-slate-600 mt-3">
        User ID: {userId}
      </p>

      <p className="text-lg font-semibold text-slate-900 mt-2">
        {score}
      </p>
    </div>
  );
}

export default RankCard;
