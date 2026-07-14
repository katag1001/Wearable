import { colorOptions, tagOptions } from "../../../constants/optionsBank";

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


export const suggestSubtypesFromName = (name, typeOptions) => {

  if (!name) return [];


  const text = name
    .toLowerCase()
    .trim();


  const keywordMap = {

    "Light Pants": [
      "pants",
      "pant",
      "trousers",
      "trouser",
      "chinos",
      "chino",
      "linen pants",
      "cotton pants",
      "summer pants",
      "light pants",
      "wide leg",
      "wide-leg",
      "straight leg",
      "straight-leg"
    ],


    "Warm Pants": [
      "pants",
      "pant",
      "trousers",
      "trouser",
      "wool pants",
      "thermal pants",
      "fleece pants",
      "winter pants",
      "corduroy",
      "warm pants",
      "lined pants"
    ],


    "Maxi Skirt": [
      "skirt",
      "maxi",
      "long skirt",
      "flowy skirt",
      "boho skirt"
    ],


    "Midi Skirt": [
      "skirt",
      "midi",
      "mid length",
      "mid-length"
    ],


    "Mini Skirt": [
      "skirt",
      "mini",
      "short skirt"
    ],


    "Shorts": [
      "shorts",
      "short",
      "cargo shorts",
      "swim shorts",
      "board shorts",
      "beach shorts"
    ],


    "T-Shirt": [
      "top",
      "tshirt",
      "t-shirt",
      "tee",
      "graphic tee",
      "cotton tee",
      "crew neck",
      "crewneck",
      "oversized tee"
    ],


    "Sports Top": [
      "sports top",
      "sport top",
      "gym top",
      "workout top",
      "running top",
      "activewear"
    ],


    "Light Shirt": [
      "shirt",
      "button shirt",
      "button-up",
      "button up",
      "linen shirt",
      "oxford shirt",
      "summer shirt",
      "light shirt",
      "blouse"
    ],


    "Warm Shirt": [
      "warm shirt",
      "flannel",
      "thermal shirt",
      "wool shirt",
      "overshirt",
      "shacket"
    ],


    "Tank Top": [
      "tank",
      "top",
      "tank top",
      "camisole",
      "cami",
      "sleeveless",
      "vest"
    ],


    "Light Jumper": [
      "jumper",
      "sweater",
      "cardigan",
      "light jumper",
      "thin knit",
      "light knit",
      "spring knit"
    ],


    "Warm Jumper": [
      "jumper",
      "sweater",
      "hoodie",
      "fleece",
      "wool jumper",
      "chunky knit",
      "thick knit",
      "warm jumper"
    ],


    "Fancy Top": [
      "fancy top",
      "party top",
      "silk top",
      "satin top",
      "evening top",
      "elegant top"
    ],


    "Light Jacket": [
      "jacket",
      "light jacket",
      "denim jacket",
      "bomber",
      "windbreaker",
      "spring jacket"
    ],


    "Winter Coat": [
      "coat",
      "winter coat",
      "parka",
      "puffer",
      "down jacket",
      "winter jacket"
    ],


    "Formal Dress/Jumpsuit": [
      "dress",
      "jumpsuit",
      "formal dress",
      "wedding dress",
      "evening dress"
    ],


    "Party Dress/Jumpsuit": [
      "dress",
      "jumpsuit",
      "party dress",
      "cocktail dress",
      "celebration dress"
    ],


    "Summer Dress/Jumpsuit": [
      "dress",
      "jumpsuit",
      "summer dress",
      "floral dress",
      "beach dress",
      "linen dress"
    ],


    "Warm Dress/Jumpsuit": [
      "dress",
      "jumpsuit",
      "winter dress",
      "knit dress",
      "wool dress",
      "warm dress"
    ]

  };


  const matches = Object.entries(keywordMap)
    .filter(([subtype, keywords]) => {

      return keywords.some(keyword =>
        text.includes(keyword)
      );

    })
    .map(([subtype]) => {

      return typeOptions.find(
        item => item.name === subtype
      );

    })
    .filter(Boolean);


  return matches.slice(0, 4);

};

