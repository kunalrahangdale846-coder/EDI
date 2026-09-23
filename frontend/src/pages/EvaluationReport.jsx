import { useState } from "react";
import { api } from "../services/api.js";

function EvaluationReport() {
	const [submissionId, setSubmissionId] = useState("");
	const [result, setResult] = useState(null);
	const [error, setError] = useState("");

	const loadResult = async (event) => {
		event.preventDefault();
		setError("");
		try {
			setResult(await api.getEvaluation(Number(submissionId)));
		} catch (requestError) {
			setError(requestError.message);
		}
	};

	return (
		<div className="max-w-3xl mx-auto px-4 py-12">
			<h1 className="text-3xl font-semibold text-slate-900">Evaluation report</h1>
			<form onSubmit={loadResult} className="mt-8 flex gap-3">
				<input required type="number" placeholder="Submission ID" value={submissionId} onChange={(event) => setSubmissionId(event.target.value)} className="flex-1 rounded border p-3" />
				<button className="rounded bg-black px-5 py-3 text-white" type="submit">Load result</button>
			</form>
			{error && <p className="mt-4 text-red-700">{error}</p>}
			{result && (
				<div className="mt-8 grid gap-4 sm:grid-cols-3">
					  <div className="rounded border p-5"><p className="text-sm text-slate-500">Passed tests</p><p className="text-3xl font-semibold">{result.passed_tests} / {result.total_tests}</p></div>
					  <div className="rounded border p-5"><p className="text-sm text-slate-500">Test pass rate</p><p className="text-3xl font-semibold">{result.pass_rate}%</p></div>
					  <div className="rounded border p-5"><p className="text-sm text-slate-500">Functionality</p><p className="text-3xl font-semibold">{result.weighted_score} / {result.max_score}</p></div>
				</div>
			)}
		</div>
	);
}

export default EvaluationReport;
