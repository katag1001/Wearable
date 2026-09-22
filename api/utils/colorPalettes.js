// api/utils/colorPalettes.js
//
// Three independent palette lists, one per Preferences.colour level
// ("min"/"mid"/"max" - api/models/AllModels.js). A user is only ever
// checked against their own level's list - there's no merging between
// them at lookup time, so which combinations count as "bolder" or
// "calmer" is entirely up to what you put in each list, not the code.
//
// Each level also caps how many distinct colours a whole outfit's combined
// colour set may contain (maxColorsByLevel; null = no cap). getColorRules()
// resolves both the palette list and the cap together for a given level,
// since every caller needs both.
//
// All three palette lists currently hold identical placeholder content -
// fill them in independently whenever you're ready; nothing else needs to
// change.

const min = [
  ["Cream", "Camel", "Tan", "White"],
  ["Cream", "Olive Green", "Brown", "Gold"],
  ["Navy", "Light Blue", "White", "Silver"],
  ["Navy", "Dark Blue", "Light Blue", "White"],
  ["Pink", "Lavender", "Lilac", "White"],
  ["Fuchsia", "Pink", "Magenta", "White"],
  ["Purple", "Lavender", "Lilac", "White"],
  ["Forest Green", "Green", "Olive Green", "Cream"],
  ["Green", "Turquoise", "Teal", "White"],
  ["Red", "Orange", "Peach", "Cream"],
  ["Red", "Maroon", "Gold", "Cream"],
  ["Coral", "Peach", "Pink", "White"],
  ["Black", "Grey", "Silver", "White"],
  ["Black", "Red", "Gold", "White"],
  ["Gold", "Cream", "Camel", "White"],
  ["Camel", "Tan", "Brown", "Cream"],
  ["Light Blue", "Lavender", "Lilac", "White"],
  ["Turquoise", "Teal", "Light Blue", "White"],
  ["Olive Green", "Kharki", "Tan", "Cream"],
  ["Yellow", "Orange", "Peach", "White"],
  ["Maroon", "Red", "Brown", "Cream"],
  ["Beige", "Cream", "Peach", "White"],
  ["Dark Blue", "Silver", "White", "Lavender"],
  ["Pink", "Peach", "Coral", "Cream"],
  ["Lime Green", "Green", "Olive Green", "White"],
  ["Purple", "Pink", "Lavender", "White"],
  ["Navy", "Dark Blue", "Silver", "White"],
  ["Forest Green", "Olive Green", "Cream", "Brown"],
  ["Orange", "Peach", "Coral", "White"],
  ["Magenta", "Fuchsia", "Pink", "Lavender"]
];

const mid = [
  ["Cream", "Camel", "Tan", "Gold", "Brown"],
  ["Cream", "Camel", "Olive Green", "Gold", "Brown"],
  ["Beige", "Cream", "Peach", "Pink", "Gold"],
  ["Tan", "Camel", "Kharki", "Olive Green", "Cream"],
  ["Brown", "Camel", "Cream", "Gold", "Peach"],
  ["Forest Green", "Green", "Olive Green", "Cream", "Tan"],
  ["Forest Green", "Green", "Turquoise", "Cream", "White"],
  ["Green", "Lime Green", "Turquoise", "Teal", "White"],
  ["Olive Green", "Green", "Teal", "Cream", "Gold"],
  ["Turquoise", "Teal", "Light Blue", "White", "Silver"],
  ["Navy", "Dark Blue", "Light Blue", "Lavender", "White"],
  ["Navy", "Dark Blue", "Silver", "Cream", "Gold"],
  ["Dark Blue", "Light Blue", "Turquoise", "White", "Silver"],
  ["Navy", "Lavender", "Lilac", "Silver", "White"],
  ["Light Blue", "Lavender", "Lilac", "White", "Silver"],
  ["Purple", "Lavender", "Lilac", "Pink", "White"],
  ["Purple", "Fuchsia", "Pink", "Lavender", "White"],
  ["Magenta", "Fuchsia", "Pink", "Lilac", "White"],
  ["Fuchsia", "Pink", "Lavender", "Silver", "White"],
  ["Pink", "Peach", "Coral", "Lavender", "Cream"],
  ["Red", "Orange", "Peach", "Coral", "Cream"],
  ["Red", "Maroon", "Gold", "Cream", "Brown"],
  ["Maroon", "Red", "Pink", "Gold", "Cream"],
  ["Orange", "Yellow", "Peach", "Coral", "White"],
  ["Gold", "Peach", "Camel", "Cream", "White"],
  ["Black", "Grey", "Silver", "White", "Lavender"],
  ["Black", "Maroon", "Red", "Gold", "Cream"],
  ["Black", "Navy", "Silver", "White", "Gold"],
  ["Grey", "Silver", "Light Blue", "Lavender", "White"],
  ["Beige", "Light Blue", "Lavender", "Cream", "White"],
  ["Cream", "Peach", "Pink", "Gold", "White"],
  ["Cream", "Navy", "Peach", "Gold", "White"],
  ["Cream", "Maroon", "Peach", "Gold", "White"],
  ["Olive Green", "Tan", "Camel", "Cream", "Gold"],
  ["Teal", "Navy", "Turquoise", "Light Blue", "White"],
  ["Turquoise", "Green", "Lime Green", "White", "Light Blue"],
  ["Lavender", "Lilac", "Light Blue", "Fuchsia", "White"],
  ["Purple", "Lilac", "Pink", "Silver", "White"],
  ["Coral", "Peach", "Pink", "Gold", "Cream"],
  ["Red", "Pink", "Peach", "Lavender", "White"],
  ["Maroon", "Purple", "Lavender", "Gold", "Cream"]
];

const max = [
  ["Cream", "Camel", "Tan", "White", "Gold", "Olive Green", "Brown"],
  ["Cream", "Camel", "Tan", "Peach", "Gold", "Olive Green", "Brown", "White"],
  ["Beige", "Cream", "Peach", "Pink", "Gold", "Camel", "White"],
  ["Camel", "Tan", "Kharki", "Olive Green", "Cream", "Gold", "Brown"],
  ["Brown", "Camel", "Cream", "Gold", "Peach", "Olive Green", "White"],
  ["Forest Green", "Green", "Olive Green", "Turquoise", "Teal", "Cream", "White"],
  ["Forest Green", "Green", "Turquoise", "Light Blue", "Cream", "White", "Silver"],
  ["Green", "Lime Green", "Turquoise", "Teal", "Light Blue", "White", "Silver"],
  ["Olive Green", "Green", "Turquoise", "Teal", "Cream", "Tan", "White"],
  ["Forest Green", "Olive Green", "Kharki", "Camel", "Tan", "Cream", "Gold"],
  ["Navy", "Dark Blue", "Light Blue", "Silver", "White", "Lavender", "Lilac"],
  ["Navy", "Dark Blue", "Light Blue", "Turquoise", "Teal", "White", "Silver"],
  ["Navy", "Dark Blue", "Lavender", "Lilac", "Silver", "White", "Gold"],
  ["Dark Blue", "Light Blue", "Turquoise", "Teal", "Lavender", "White", "Silver"],
  ["Navy", "Dark Blue", "Cream", "Camel", "Gold", "White", "Silver"],
  ["Turquoise", "Teal", "Green", "Lime Green", "Light Blue", "White", "Silver"],
  ["Turquoise", "Teal", "Lavender", "Lilac", "Light Blue", "White", "Silver"],
  ["Purple", "Lavender", "Lilac", "Pink", "Fuchsia", "Silver", "White"],
  ["Magenta", "Fuchsia", "Pink", "Purple", "Lavender", "Lilac", "White"],
  ["Fuchsia", "Pink", "Lavender", "Lilac", "Light Blue", "White", "Silver"],
  ["Purple", "Fuchsia", "Pink", "Peach", "Lavender", "Cream", "White"],
  ["Pink", "Peach", "Coral", "Fuchsia", "Lavender", "Cream", "Gold"],
  ["Red", "Orange", "Gold", "Peach", "Coral", "Cream", "Camel", "White"],
  ["Red", "Maroon", "Pink", "Gold", "Brown", "Cream", "White"],
  ["Maroon", "Red", "Purple", "Lavender", "Gold", "Cream", "Brown"],
  ["Red", "Pink", "Magenta", "Fuchsia", "Lavender", "White", "Cream"],
  ["Orange", "Yellow", "Peach", "Coral", "Pink", "Gold", "Cream", "White"],
  ["Gold", "Orange", "Peach", "Coral", "Camel", "Cream", "White"],
  ["Black", "Grey", "Silver", "White", "Red", "Maroon", "Gold"],
  ["Black", "Navy", "Dark Blue", "Silver", "White", "Lavender", "Gold"],
  ["Black", "Maroon", "Red", "Gold", "Cream", "Brown", "White"],
  ["Black", "Purple", "Lavender", "Lilac", "Silver", "White"],
  ["Grey", "Silver", "Light Blue", "Lavender", "Lilac", "White"],
  ["Grey", "Silver", "Pink", "Lavender", "White", "Light Blue"],
  ["Cream", "Navy", "Peach", "Gold", "White", "Camel", "Light Blue"],
  ["Cream", "Maroon", "Peach", "Gold", "White", "Brown", "Pink"],
  ["Cream", "Olive Green", "Peach", "Gold", "Tan", "Camel", "White"],
  ["Beige", "Cream", "Light Blue", "Lavender", "Pink", "Gold", "White"],
  ["Beige", "Cream", "Peach", "Pink", "Lavender", "Light Blue", "Gold"],
  ["Tan", "Camel", "Olive Green", "Kharki", "Cream", "Peach", "Gold"],
  ["Brown", "Forest Green", "Olive Green", "Gold", "Cream", "Camel", "Tan"],
  ["Brown", "Navy", "Camel", "Cream", "Gold", "White", "Light Blue"],
  ["Brown", "Purple", "Lavender", "Cream", "Gold", "Pink", "White"],
  ["Teal", "Navy", "Turquoise", "Light Blue", "Lavender", "White", "Silver"],
  ["Turquoise", "Green", "Lime Green", "Teal", "Light Blue", "Cream", "White"],
  ["Lavender", "Lilac", "Light Blue", "Pink", "Fuchsia", "Silver", "White"],
  ["Purple", "Magenta", "Fuchsia", "Pink", "Lavender", "Lilac", "White"],
  ["Red", "Orange", "Yellow", "Peach", "Pink", "Coral", "Cream", "White"],
  ["Maroon", "Red", "Pink", "Purple", "Gold", "Cream", "Brown", "White"],
  ["Navy", "Dark Blue", "Turquoise", "Teal", "Light Blue", "Silver", "White"],
  ["Forest Green", "Green", "Olive Green", "Turquoise", "Light Blue", "Cream", "White"],
  ["Gold", "Maroon", "Navy", "Cream", "White", "Camel", "Brown"],
  ["Gold", "Fuchsia", "Purple", "Lavender", "Cream", "White"],
  ["Gold", "Teal", "Navy", "Cream", "White", "Light Blue"],
  ["Black", "Grey", "Silver", "Lavender", "Lilac", "White", "Fuchsia"],
  ["Black", "Red", "Maroon", "Gold", "Cream", "Brown", "White"]
];


const colorPalettesByLevel = { min, mid, max };

// Max number of distinct colours allowed across a whole outfit's combined
// colour set, per level - null means no cap at all.
const maxColorsByLevel = { min: 4, mid: 7, max: null };

const DEFAULT_COLOUR_LEVEL = "mid";

// One resolved unit per level: the palette list and the colour-count cap
// together, since every caller that needs one needs the other too.
function getColorRules(level) {
  const resolvedLevel = colorPalettesByLevel[level] ? level : DEFAULT_COLOUR_LEVEL;

  return {
    palettes: colorPalettesByLevel[resolvedLevel],
    maxColors: maxColorsByLevel[resolvedLevel],
  };
}

module.exports = {
  colorPalettesByLevel,
  maxColorsByLevel,
  getColorRules,
  DEFAULT_COLOUR_LEVEL,
};
