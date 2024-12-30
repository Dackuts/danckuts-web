import api from "./index";

const BASE_URL = "/appointments";

export function getAppointments() {
	return api.get(`${BASE_URL}/recent`);
}

export function postCancelAppointment(appointmentId) {
	return api.post(`${BASE_URL}/cancel`, { appointmentId });
}

export async function postCreateAppointment({ location, time, dependent = null }) {
	let googleTag;
	try {
		googleTag = JSON.parse(localStorage.getItem("queryGoogleTag"));
		localStorage.removeItem("queryGoogleTag");
	} catch (_err) {}
	return api.post(`${BASE_URL}/schedule`, {
		location,
		time,
		...(googleTag != null && {...googleTag}),
		...(dependent != null && { dependent }),
	});
}

export function postRescheduleAppointment({ appointmentId, location, time }) {
	return api.post(`${BASE_URL}/reschedule`, { appointmentId, location, time });
}

export function postForceReminder(appointmentId, reminderType) {
	return api.post(`${BASE_URL}/force-reminder`, {
		appointmentId,
		reminderType
	});
}