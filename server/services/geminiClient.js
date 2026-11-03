// server/services/geminiClient.js
//
// The only place that talks to Gemini. GEMINI_API_KEY (and optionally
// GEMINI_MODEL) come from server/.env locally and from Vercel's
// environment variables when deployed - never from the web or mobile app.

const { GoogleGenAI } = require("@google/genai");
const {
  DEFAULT_MODEL,
  THINKING_LEVEL,
  REQUEST_TIMEOUT_MS,
} = require("../constants/itemAnalysis.js");

// Gemini errors worth one more try: rate limits, overload, timeouts.
const RETRYABLE_STATUSES = [408, 429, 500, 502, 503, 504];

let client = null;

const isGeminiConfigured = () => Boolean(process.env.GEMINI_API_KEY);

const getModel = () => process.env.GEMINI_MODEL || DEFAULT_MODEL;

function getClient() {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  return client;
}

const isRetryableError = (error) =>
  RETRYABLE_STATUSES.includes(error?.status) || /timed? ?out|abort/i.test(error?.message || "");

// Asks about one image; the answer must follow `schema` (JSON Schema). The
// prompt goes first and the image after it: the prompt is the same for
// every photo, so Gemini can reuse it (implicit caching - cheaper input).
// Returns { answer, usage, model }. `answer` is the parsed JSON, or null if
// the reply wasn't JSON. Throws Gemini's errors (see isRetryableError).
async function askGemini({ prompt, image, schema, model = getModel() }) {
  const response = await getClient().models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }, { inlineData: { mimeType: image.mimeType, data: image.data } }],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: schema,
      thinkingConfig: { thinkingLevel: THINKING_LEVEL },
      httpOptions: { timeout: REQUEST_TIMEOUT_MS },
    },
  });

  let answer = null;

  try {
    answer = JSON.parse(response.text);
  } catch {
    answer = null;
  }

  return { answer, usage: response.usageMetadata || null, model };
}

module.exports = { askGemini, isGeminiConfigured, isRetryableError, getModel };
