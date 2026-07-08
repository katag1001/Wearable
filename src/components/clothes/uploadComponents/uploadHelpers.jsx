export const colorOptions = [
  { name: "Beige", value: "#F5F5DC" },
  { name: "Black", value: "#000000" },
  { name: "Brown", value: "#8B4513" },
  { name: "Camel", value: "#C19A6B" },
  { name: "Cream", value: "#FFFDD0" },
  { name: "Dark Blue", value: "#00008B" },
  { name: "Forest Green", value: "#228B22" },
  { name: "Fuchsia", value: "#FF00FF" },
  { name: "Gold", value: "#D4AF37" },
  { name: "Grey", value: "#808080" },
  { name: "Green", value: "#008000" },
  { name: "Lavender", value: "#E6E6FA" },
  { name: "Light Blue", value: "#ADD8E6" },
  { name: "Lilac", value: "#C8A2C8" },
  { name: "Lime Green", value: "#32CD32" },
  { name: "Magenta", value: "#FF00FF" },
  { name: "Maroon", value: "#800000" },
  { name: "Navy", value: "#000080" },
  { name: "Olive Green", value: "#808000" },
  { name: "Orange", value: "#FFA500" },
  { name: "Peach", value: "#FFDAB9" },
  { name: "Pink", value: "#FFC0CB" },
  { name: "Purple", value: "#800080" },
  { name: "Red", value: "#FF0000" },
  { name: "Silver", value: "#C0C0C0" },
  { name: "Tan", value: "#D2B48C" },
  { name: "Teal", value: "#008080" },
  { name: "Turquoise", value: "#40E0D0" },
  { name: "White", value: "#FFFFFF" },
  { name: "Yellow", value: "#FFFF00" }
];


export const styleOptions = [
  "plain",
  "patterned"
];


export const seasonTempRanges = {
  spring: {
    min: 10,
    max: 20
  },
  summer: {
    min: 15,
    max: 35
  },
  autumn: {
    min: 8,
    max: 15
  },
  winter: {
    min: 0,
    max: 13
  }
};


export const tagOptions = [
  "Work",
  "Gym",
  "Loungewear",
  "Party",
  "Date night",
  "Wedding",
  "Beach",
  "Outdoor",
  "Dinner",
  "Everyday"
];


export const seasonOptions = [
  "spring",
  "summer",
  "autumn",
  "winter"
];


export const getInitialState = () => ({
  name: "",
  imageUrl: "",
  min_temp: 10,
  max_temp: 20,
  colors: [],
  styles: "plain",
  type: "",
  subtype: "",
  spring: false,
  summer: false,
  autumn: false,
  winter: false,
  tags: [],
  lastWornDate: new Date(
    Date.now() -
    100 * 365 * 24 * 60 * 60 * 1000
  )
});


export const detectFromName = (name) => {
  const lower = name.toLowerCase();


  const detectedColors = colorOptions
    .filter(color =>
      lower.includes(
        color.name.toLowerCase()
      )
    )
    .map(color => color.name);



  const detectedSeasons = {
    spring: lower.includes("spring"),
    summer: lower.includes("summer"),
    autumn:
      lower.includes("autumn") ||
      lower.includes("fall"),
    winter: lower.includes("winter")
  };



  const detectedTags = tagOptions.filter(tag =>
    lower.includes(tag.toLowerCase())
  );



  const style =
    detectedColors.length > 1
      ? "patterned"
      : "plain";



  return {
    detectedColors,
    detectedSeasons,
    detectedTags,
    style
  };
};



export const calculateTemperatureRange = (
  activeSeasons
) => {

  if (!activeSeasons.length) {
    return {
      min_temp: 10,
      max_temp: 20
    };
  }



  const ranges = activeSeasons.map(
    season =>
      seasonTempRanges[season]
  );



  return {
    min_temp: Math.min(
      ...ranges.map(range => range.min)
    ),

    max_temp: Math.max(
      ...ranges.map(range => range.max)
    )
  };
};

