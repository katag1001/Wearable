// core/api/errors.js

// The message the server sent with a failed request (some endpoints call
// it `message`, some `error`), or `fallback` - e.g. no response at all:
// wrong URL, no network, or the request timed out.
export const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.response?.data?.error || fallback;
