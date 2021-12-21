import api from "./index";

const BASE_URL = "/auth";

export function postSendTextCode(phoneNumber) {
  return api.post(`${BASE_URL}/send-text-code`, { phone: phoneNumber });
}

export function postCheckTextCode({ phoneNumber, code }) {
  return api.post(`${BASE_URL}/check-text-code`, {
    phone: phoneNumber,
    code,
  });
}

export function getMe() {
  return api.get(`${BASE_URL}/me`);
}

export function postChangeName({ firstName, lastName }) {
  return api.post(`${BASE_URL}/change-name`, { firstName, lastName });
}
