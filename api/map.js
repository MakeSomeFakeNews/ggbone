import http from "../request/http"
export const register = (data) => http.post(`/user/register`, data);