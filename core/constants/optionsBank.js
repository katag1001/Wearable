import patterns from "../../shared/patterns.json";
import colors from "../../shared/colors.json";
import fabrics from "../../shared/fabrics.json";
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
// colour wheel from orange to red. The list is shared/colors.json, which
// the server's image analysis also picks from.
export const colorOptions = colors.map(({ name, value }) => ({ name, value }));


// A clothing item's main fabric (one each, "" = not known). Seasonal
// fabrics decide which seasons its outfits belong to
// (server/services/seasonalityService.js).
export const fabricOptions = fabrics.map(({ name }) => name);

// A clothing item's pattern (one each). The matching rules for patterns are
// in server/constants/patternRules.js.
export const patternOptions = patterns;

