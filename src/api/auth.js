import api from "./index";

const BASE_URL = "/auth";

export function postSendTextCode(phoneNumber) {
  return api.post(`${BASE_URL}/send-text-code`, { phoneNumber });
}

export function postCheckTextCode({ phoneNumber, code }) {
  return api.post(`${BASE_URL}/check-text-code`, {
    phoneNumber,
    code,
  });
}

export function getMe() {
  return api.get(`${BASE_URL}/me`);
}

export function postChangeName({ firstName, lastName }) {
  return api.post(`${BASE_URL}/change-name`, { firstName, lastName });
}

export async function postCheckPhoneNumber({ phoneNumber }) {
  const response = await api.post(`${BASE_URL}/phone-number-has-user`, {
    phoneNumber,
  });
  return response.message === "User found";
}

export function postCreateAccount(user) {
  return api.post(`${BASE_URL}/create`, { ...user });
}

export function postCreateDependent(firstname, lastname) {
  return api.post(`${BASE_URL}/create-dependent`, { firstname, lastname });
}
