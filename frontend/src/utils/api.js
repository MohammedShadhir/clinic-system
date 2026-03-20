import axios from "axios";
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://clinic-system-production-03f7.up.railway.app";
const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});
export const getPatients = () => api.get("/patients").then((r) => r.data);
export const createPatient = (d) =>
  api.post("/patients", d).then((r) => r.data);
export const getDoctors = () => api.get("/doctors").then((r) => r.data);
export const listVisits = () => api.get("/visits").then((r) => r.data);
export const getVisit = (id) => api.get(`/visits/${id}`).then((r) => r.data);
export const createVisit = (d) => api.post("/visits", d).then((r) => r.data);
export const finalizeVisit = (d) =>
  api.post("/visits/finalize", d).then((r) => r.data);
export const updateBillStatus = (id, status) =>
  api.patch(`/visits/${id}/bill`, { status }).then((r) => r.data);
export default api;
