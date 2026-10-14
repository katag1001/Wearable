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
// The lists and caps live in shared/colorPalettes.json (hand-edit them
// there) so the Today page's shoe box can use the same palettes in the
// browser (src/components/today/footwear/footwearRanking.js). Fill each
// level in independently - nothing else needs to change.

const colorPalettes = require("../../shared/colorPalettes.json");

const colorPalettesByLevel = colorPalettes.palettes;

// Max number of distinct colours allowed across a whole outfit's combined
// colour set, per level - null means no cap at all.
const maxColorsByLevel = colorPalettes.maxColors;

const DEFAULT_COLOUR_LEVEL = colorPalettes.defaultLevel;

// One resolved unit per level: the palette list and the colour-count cap
// together, since every caller that needs one needs the other too. `level`
// is the resolved level, which picks the colour-count score
// (outfitScoreService.computeColourScore).
function getColorRules(level) {
  const resolvedLevel = colorPalettesByLevel[level] ? level : DEFAULT_COLOUR_LEVEL;

  return {
    palettes: colorPalettesByLevel[resolvedLevel],
    maxColors: maxColorsByLevel[resolvedLevel],
    level: resolvedLevel,
  };
}

module.exports = {
  colorPalettesByLevel,
  maxColorsByLevel,
  getColorRules,
  DEFAULT_COLOUR_LEVEL,
};
