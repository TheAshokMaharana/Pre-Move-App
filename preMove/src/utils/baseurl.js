// baseurl.js
import axios from "axios";

export const api = axios.create({
  // baseURL: "https://premove-backend-14.onrender.com/api/",
  // baseURL: "http://13.49.243.156/api/",
  baseURL: "http://13.61.184.233:5000",
});
