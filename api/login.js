import http from "../request/http"
export const login = (data) => http.get(`/auth/login`, data);