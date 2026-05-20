import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";

function getInitialToken() {
	const urlToken = new URLSearchParams(window.location.search).get("token");
	if (urlToken) return urlToken;
	try {
		return localStorage.getItem("token");
	} catch (_err) {
		return null;
	}
}

export const tokenStore = createStore((set) => ({
	token: getInitialToken(),
	setToken: (token) => {
		try {
			localStorage.setItem("token", token);
		} catch (_err) {}
		return set({ token });
	},
}));

export const useTokenStore = (selector) => useStore(tokenStore, selector);
