import { ProticoClient } from "protico-sdk";
import axios from "axios";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";
export default axios;
let proticoClient: ProticoClient;
export const getProticoClient = () => {
  if (!proticoClient) {
    const backendUrl = "http://localhost:8000";
    console.log("init ProticoClient: ", backendUrl);
    proticoClient = new ProticoClient(backendUrl, "");
  }
  return proticoClient;
};
