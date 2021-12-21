import api from "./index";

const BASE_URL = "/locations";

export function getLocations() {
  return api.get(`${BASE_URL}`);
}
