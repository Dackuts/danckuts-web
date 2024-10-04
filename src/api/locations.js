import api from "./index";

const BASE_URL = "/locations";

export function getAllLocations() {
	return api.get(`${BASE_URL}/hidden`);
}
