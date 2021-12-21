import axios from "axios";
import { REACT_APP_API_URL } from "../config";

const api = axios.create({
  baseURL: REACT_APP_API_URL,
  responseType: "json",
});

api.interceptors.request.use(
  async function (config) {
    const token = sessionStorage.getItem("token");
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
    return Promise.reject(err.toJSON());
  }
);

export default api;
