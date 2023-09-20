import axios from "axios";
import { REACT_APP_API_URL } from "../config";
import { tokenStore } from "../store";

const api = axios.create({
  baseURL: REACT_APP_API_URL,
  responseType: "json",
});

api.interceptors.request.use(
  async function (config) {
    const {token} = tokenStore.getState();
    config.headers.authorization = `Bearer ${token || ""}`;
    return config;
  },
  function (err) {
    return Promise.reject(err);
  }
);

api.interceptors.response.use(
  function (res) {
    return res.data.payload;
  },
  function (err) {
    return Promise.reject({ ...err.toJSON(), atlas: err?.response?.data?.payload?.message });
  }
);

export default api;
