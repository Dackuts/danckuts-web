import api from "./index";

const BASE_URL = "/appointments";

export function getAppointments() {
  // return api.get(`${BASE_URL}/recent`);
  return {
    future: [
      {
        id: "31886888-54c1-4291-bc2d-c4bcd7bc2d0c",
        location: "Irvine",
        date: "2022-04-19T05:00:00.000Z",
        type: "hairKut",
        checkedin: false,
      },
      {
        id: "31886888-54c1-4291-bc2d-c4bcd7bc2d0c",
        location: "Irvine",
        date: "2022-04-19T05:00:00.000Z",
        type: "hairKut",
        checkedin: false,
        dependent: 25413
      },
    ],
  };
}

export function postCancelAppointment(appointmentId) {
  return api.post(`${BASE_URL}/cancel`, { appointmentId });
}

export function postCreateAppointment({ location, time }) {
  return api.post(`${BASE_URL}/schedule`, {
    location,
    time,
  });
}

export function postRescheduleAppointment({ appointmentId, location, time }) {
  return api.post(`${BASE_URL}/reschedule`, { appointmentId, location, time });
}
