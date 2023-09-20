import api from "./index";

const BASE_URL = "/appointments";

export function getAppointments() {
	return api.get(`${BASE_URL}/recent`);
}

export function postCancelAppointment(appointmentId) {
	return api.post(`${BASE_URL}/cancel`, { appointmentId });
}

export async function postCreateAppointment({ location, time, dependent = null }) {
	try {
		const googleTag = JSON.parse(localStorage.getItem("queryGoogleTag"));
		localStorage.removeItem("queryGoogleTag");
		if(googleTag != null) {
			await api.post(`/create-google-marketing?utm_source=${googleTag.utm_source}&utm_medium=${googleTag.utm_medium}&utm_campaign=${googleTag.utm_campaign}&gclid=${googleTag.gclid}&fbclid=${googleTag.fbclid}`)
		}
	} catch (_err) {}
	return api.post(`${BASE_URL}/schedule`, {
		location,
		time,
		...(dependent != null && { dependent }),
	});
}

export function postRescheduleAppointment({ appointmentId, location, time }) {
	return api.post(`${BASE_URL}/reschedule`, { appointmentId, location, time });
}
