// core/constants/aiAnalysis.js
//
// Wording for the AI photo analysis choice (Preferences.aiAnalysis): the
// consent prompt shown before a user's first add (useAiConsent) and the
// Settings screen (useAiSettings). Shared so the web and mobile apps say
// exactly the same thing.

import photoLimits from "../../shared/photoLimits.json";

export const DAILY_PHOTO_LIMIT = photoLimits.dailyPhotoLimit;

export const AI_CONSENT_MESSAGE =
  "Hi there! To make your life easier, we use AI to analyse your photos and fill in the item details for you. If you want, you can opt out of AI analysis and fill them in yourself (but it will take a bit longer).";

export const AI_CONSENT_SAVED_MESSAGE =
  "Preference saved! You can change this any time in Settings and also take a look at the environmental and usage costs.";

// The two answers, as shown on the prompt and in Settings.
export const AI_CHOICES = [
  { value: true, label: "Use AI" },
  { value: false, label: "I'll fill them in myself" },
];

export const AI_SETTINGS_DESCRIPTION =
  "Choose whether AI analyses your photos and fills in new items for you, or you fill them in yourself.";

// Settings' "about AI" text, under the choice (workings, caveats and
// sources: context/ai-environmental-impact.md). Each section has a title,
// paragraphs and optional bullet points; **text** is drawn bold
// (splitBold, core/utils/boldText.js).
export const AI_ABOUT_SECTIONS = [
  {
    title: "AI is a tool, not a requirement",
    paragraphs: [
      "These days, it feels like you can't even turn on your fridge without AI being forced down your throat. We use AI because it can make certain things easier, **not because we think everything needs it**.",
      "Our aim is to help you **make the most of the clothes you already own**, and make more sustainable choices along the way. AI can help with that by making it quicker to add and organise your wardrobe. But how you use it is **entirely up to you**.",
    ],
  },
  {
    title: "Don't want to use AI? That's absolutely fine",
    paragraphs: [
      "You can **opt out of AI analysis**. You can add and manage your clothes yourself, without AI analysing your photos.",
    ],
  },
  {
    title: "Want to opt in? Well, what does one AI analysis cost?",
    paragraphs: [
      "Whenever AI fills in the details of an item for you, we send **one photo** to Google's Gemini for analysis.",
      "Google estimates that a typical Gemini request uses around:",
    ],
    points: [
      "**0.24 Wh of electricity** — roughly equivalent to running a TV for 9 seconds.",
      "**0.26 mL of water** — approximately five drops, used for data-centre cooling.",
    ],
  },
  {
    title: "What does that mean for your wardrobe?",
    paragraphs: ["For a **100-piece wardrobe**, that's approximately:"],
    points: [
      "**24 Wh of electricity** — about the same as running an LED bulb for two and a half hours.",
      "**26 mL of water** — less than two tablespoons.",
    ],
  },
  {
    title: "A little perspective",
    paragraphs: [
      "Making, wearing and washing a single pair of jeans uses an estimated **3,781 litres of water** and produces **33.4 kg of CO₂e** over its lifetime.",
      "The water used for one pair of jeans would cover the AI analysis of approximately **145,000 wardrobes** of 100 items each.",
      "Ultimately, our mission is to help you **buy less, wear more** and get creative with what you already have.",
      "Because **the most sustainable item is always the one already in your wardrobe**.",
    ],
  },
];

export const AI_USAGE_TITLE = "Your usage";

export const AI_USAGE_TEXT = `You can add up to ${DAILY_PHOTO_LIMIT} photos a day.`;

export const AI_SOURCES = [
  {
    label: "Google Cloud: Measuring the environmental impact of AI inference (2025)",
    url: "https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference",
  },
  {
    label: "Levi Strauss & Co.: 3 Surprising Insights About Those 501 Jeans (2015)",
    url: "https://www.levistrauss.com/2015/03/26/3-surprising-insights-about-those-501-jeans/",
  },
  {
    label: "Levi Strauss & Co.: Full Life Cycle Assessment Results (2015)",
    url: "https://stg.levistrauss.levis.com/wp-content/uploads/2015/03/Full-LCA-Results-Deck-FINAL.pdf",
  },
];

// "3 of 200 photos added today" - from the user's preferences
// (analysisDay is the UTC day of analysisCount, kept by the server).
export const photosUsedToday = (preferences, now = new Date()) =>
  preferences?.analysisDay === now.toISOString().slice(0, 10) ? preferences.analysisCount || 0 : 0;
