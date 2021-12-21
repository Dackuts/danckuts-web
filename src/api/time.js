import api from "./index";

const BASE_URL = "/time";

export function getAvailability(dates, location) {
  return api.get(`${BASE_URL}/availability`, { params: { dates, location } });
}
