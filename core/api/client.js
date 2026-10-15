// core/api/client.js
//
// The one axios instance both apps use for the Wearable API. Each request
// gets the configured base URL and, when someone is logged in, their
// Bearer token - so no caller has to build the Authorization header.

import axios from "axios";

import { getCoreConfig } from "../config.js";
import { STORAGE_KEYS } from "../storageKeys.js";

export const api = axios.create();

api.interceptors.request.use((request) => {
  const { apiUrl, storage } = getCoreConfig();

  request.baseURL = apiUrl;

  const token = storage.getItem(STORAGE_KEYS.token);

  if (token && !request.headers.Authorization) {
    request.headers.Authorization = `Bearer ${token}`;
  }

  return request;
});
