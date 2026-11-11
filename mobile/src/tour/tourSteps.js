// The app tour's steps, in order. Each speech bubble points at the
// element registered under its `target` (useTourTarget / TourTarget):
// Today's sample outfit and its buttons, the tag line, then the tabs.

export const TOUR_STEPS = [
  {
    target: "outfit",
    title: "Today's outfit",
    text: "Every day you'll get shown an outfit here. If you don't love it, swipe through to find the perfect look.",
  },
  {
    target: "wear",
    title: "Wear it",
    text: "Tap the heart to choose this outfit today. This way we can always recommend you new pieces and you can keep track of what you've worn.",
  },
  {
    target: "mismatch",
    title: "Not right",
    text: "If you get recommended something you don't love, or just isn't right for today, tap here to report it so that we can improve your recommendations for next time.",
  },
  {
    target: "tag",
    title: "Change the tag",
    text: "If you set a schedule, you'll get recommended outfits that fit that perfectly. If you want something different today, just tap the tag at the top to change it around. Perfect when you need a spontaneous date outfit.",
  },
  {
    target: "shoes",
    title: "Change shoes",
    text: "If you love the outfit but the shoes aren't quite right, you can always change them here.",
  },
  {
    target: "tab-wardrobe",
    title: "Your wardrobe",
    text: "Sort, add and favourite all your lovely clothes here.",
  },
  {
    target: "tab-outfits",
    title: "Your outfits",
    text: "Take a look through here to find the perfect styles for you. Build your own outfits or favourite what you love.",
  },
  {
    target: "tab-plan",
    title: "Plan ahead",
    text: "Pick a day on the calendar to plan what you'll wear, with the weather for that day. On the day, your planned outfit is ready and waiting on Today.",
  },
  {
    target: "tab-create",
    title: "Add",
    text: "Time to start adding all your favourite pieces!",
  },
];
