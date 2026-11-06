// core/api/trends.js
//
// The current trends, for the web /trends page. Admins only: the server
// answers 403 for anyone else.

import { api } from "./client.js";

// { ok, trends } - every trend, newest first.
export const listTrends = async () => (await api.get("/trends")).data;

// `trend`: { label, plural, genders, pieces, until? }.
export const createTrend = async (trend) => (await api.post("/trends", trend)).data;

export const updateTrend = async (id, trend) => (await api.put(`/trends/${id}`, trend)).data;

export const deleteTrend = async (id) => (await api.delete(`/trends/${id}`)).data;

// `scope`: "expired" (the ended ones) or "all".
export const clearTrends = async (scope) =>
  (await api.delete("/trends", { params: { scope } })).data;
