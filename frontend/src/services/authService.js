import { api } from "./api.js";

export function registerUser(user) {
	return api.register(user).then((response) => ({
		...response,
		user: normalizeUser(response.user),
	}));
}

export async function loginUser(credentials) {
	const response = await api.login(credentials);
	return { ...response, user: normalizeUser(response.user) };
}

function normalizeUser(user) {
	return {
		...user,
		role: user.role === "ORGANIZER" ? "organizer" : "student",
	};
}
