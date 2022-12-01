import api from "./index";

const BASE_URL = "/appointments";

export function getAppointments() {
  return api.get(`${BASE_URL}/recent`);
}

export function postCancelAppointment(appointmentId) {
  return api.post(`${BASE_URL}/cancel`, { appointmentId });
}

export function postCreateAppointment({ location, time, dependent = null }) {
  return api.post(`${BASE_URL}/schedule`, {
    location,
    time,
    ...(dependent != null && { dependent }),
  });
}

export function postRescheduleAppointment({ appointmentId, location, time }) {
  return api.post(`${BASE_URL}/reschedule`, { appointmentId, location, time });
}
