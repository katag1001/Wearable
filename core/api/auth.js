// core/api/auth.js

import { api } from "./client.js";

// { ok, token, email } on success; axios throws on a 4xx/5xx.
export const login = async (email, password) => {
  const response = await api.post("/users/login", { email, password });

  return response.data;
};

// { ok, message }. password2 is the "confirm password" field, checked on
// the server.
export const register = async ({ email, password, password2 }) => {
  const response = await api.post("/users/register", {
    email,
    password,
    password2,
  });

  return response.data;
};

// Permanently deletes the logged-in user and all their data.
export const deleteAccount = async () => {
  const response = await api.delete("/users/delete");

  return response.data;
};

// { ok, decoded } for a valid token.
export const verifyToken = async () => {
  const response = await api.post("/users/verify_token");

  return response.data;
};
