import { ProticoAPI } from "protico-sdk";
import axios from "axios";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";
export default axios;
let proticoAPI: ProticoAPI;
export const getProticoAPI = () => {
  if (!proticoAPI) {
    const backendUrl = "http://localhost:8000";
    console.log("init proticoAPI: ", backendUrl);
    proticoAPI = new ProticoAPI("", backendUrl);
  }
  return proticoAPI;
};
