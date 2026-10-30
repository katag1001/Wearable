import patterns from "../../shared/patterns.json";
import occasionTagGroups from "../../shared/occasionTags.json";

// Occasion tags, in shared/occasionTags.json's order, each with its group
// ("Everyday", "Work"...). The server reads the same file.
export const tagGroups = occasionTagGroups;

export const tagOptions = occasionTagGroups.flatMap(({ group, tags }) =>
  tags.map((name) => ({ name, group }))
);


export const seasonOptions = [
  "spring",
  "summer",
  "autumn",
  "winter"
];

// Grouped by colour, not alphabetical, so similar colours sit together
// wherever they're listed: neutrals, browns and metallics, then round the
// colour wheel from orange to red.
export const colorOptions = [
  // Neutrals
  { name: "White", value: "#f9f5f5d7" },
  { name: "Cream", value: "#F3EDE0" },
  { name: "Silver", value: "#C0C0C0" },
  { name: "Grey", value: "#808080" },
  { name: "Black", value: "#000000" },

  // Browns and metallics
  { name: "Tan", value: "#D2B48C" },
  { name: "Camel", value: "#C19A6B" },
  { name: "Gold", value: "#D4AF37" },
  { name: "Copper", value: "#B87333" },
  { name: "Brown", value: "#8B4513" },

  // Oranges and yellows
  { name: "Peach", value: "#FFDAB9" },
  { name: "Orange", value: "#FFA500" },
  { name: "Butter Yellow", value: "#F7E7A6" },
  { name: "Bright Yellow", value: "#FFFF00" },

  // Greens
  { name: "Lime Green", value: "#32CD32" },
  { name: "Green", value: "#008000" },
  { name: "Olive Green", value: "#808000" },
  { name: "Forest Green", value: "#228B22" },

  // Blues
  { name: "Turquoise", value: "#40E0D0" },
  { name: "Teal", value: "#008080" },
  { name: "Light Blue", value: "#ADD8E6" },
  { name: "Bright Blue", value: "#1E6FFF" },
  { name: "Dark Blue", value: "#00008B" },
  { name: "Navy", value: "#161D3F" },

  // Purples and pinks
  { name: "Lilac", value: "#C8A2C8" },
  { name: "Purple", value: "#800080" },
  { name: "Baby Pink", value: "#FFD6DE" },
  { name: "Bright Pink", value: "#FF4F9A" },
  { name: "Fuchsia", value: "#FF00FF" },

  // Reds
  { name: "Bright Red", value: "#FF0000" },
  { name: "Dark Red", value: "#A4161A" },
  { name: "Burgundy", value: "#6B1E46" },
  { name: "Maroon", value: "#800000" }
];


// A clothing item's pattern (one each). The matching rules for patterns are
// in server/constants/patternRules.js.
export const patternOptions = patterns;

