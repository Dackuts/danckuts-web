import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";

export const tokenStore = createStore((set) => ({
	token: null,
	setToken: (token) => {
		try {
			localStorage.setItem("token", token);
		} catch (_err) {}
		return set({ token });
	},
}));

export const useTokenStore = (selector) => useStore(tokenStore, selector);
