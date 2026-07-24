// src/constants/typeOptions.js

import fancy_top from "../assets/images/icons/fancy_top.PNG";
import formal_dress from "../assets/images/icons/formal_dress.PNG";
import light_jacket from "../assets/images/icons/light_jacket.PNG";
import light_jumper from "../assets/images/icons/light_jumper.PNG";
import light_pants from "../assets/images/icons/light_pants.PNG";
import light_shirt from "../assets/images/icons/light_shirt.PNG";
import maxi_skirt from "../assets/images/icons/maxi_skirt.PNG";
import midi_skirt from "../assets/images/icons/midi_skirt.PNG";
import mini_skirt from "../assets/images/icons/mini_skirt.PNG";
import party_dress from "../assets/images/icons/party_dress.PNG";
import shorts from "../assets/images/icons/shorts.PNG";
import sports_top from "../assets/images/icons/sports_top.PNG";
import summer_dress from "../assets/images/icons/summer_dress.PNG";
import t_shirt from "../assets/images/icons/t_shirt.PNG";
import tank_top from "../assets/images/icons/tank_top.PNG";
import warm_dress from "../assets/images/icons/warm_dress.PNG";
import warm_jumper from "../assets/images/icons/warm_jumper.PNG";
import warm_pants from "../assets/images/icons/warm_pants.PNG";
import warm_shirt from "../assets/images/icons/warm_shirt.PNG";
import winter_coat from "../assets/images/icons/winter_coat.PNG";

const typeOptions = [
  // bottom
  {
    type: "bottom",
    name: "Light Pants",
    icon: light_pants,
    season: ["Spring", "Summer"],
    tags: ["Work", "Everyday", "Beach", "Dinner", "Loungewear"],
    minTemp: 18,
    maxTemp: 30,
  },
  {
    type: "bottom",
    name: "Warm Pants",
    icon: warm_pants,
    season: ["Autumn", "Winter"],
    tags: ["Work", "Everyday", "Beach", "Dinner"],
    minTemp: -5,
    maxTemp: 18,
  },
  {
    type: "bottom",
    name: "Maxi Skirt",
    icon: maxi_skirt,
    season: ["Spring", "Summer"],
    tags: ["Everyday", "Beach", "Work", "Date Night"],
    minTemp: 18,
    maxTemp: 32,
  },
  {
    type: "bottom",
    name: "Shorts",
    icon: shorts,
    season: ["Spring", "Summer"],
    tags: ["Everyday", "Beach", "Outdoor", "Sports"],
    minTemp: 22,
    maxTemp: 40,
  },
  {
    type: "bottom",
    name: "Mini Skirt",
    icon: mini_skirt,
    season: ["Spring", "Summer", "Autumn"],
    tags: ["Date Night", "Party", "Everyday"],
    minTemp: 18,
    maxTemp: 32,
  },
  {
    type: "bottom",
    name: "Midi Skirt",
    icon: midi_skirt,
    season: ["Spring", "Summer", "Autumn", "Winter"],
    tags: ["Work", "Everyday", "Wedding"],
    minTemp: 12,
    maxTemp: 30,
  },

  // top
  {
    type: "top",
    name: "T-Shirt",
    icon: t_shirt,
    season: ["Spring", "Summer", "Autumn", "Winter"],
    tags: ["Everyday", "Gym", "Outdoor"],
    minTemp: 10,
    maxTemp: 35,
  },
  {
    type: "top",
    name: "Sports Top",
    icon: sports_top,
    season: ["Spring", "Summer", "Autumn", "Winter"],
    tags: ["Gym", "Outdoor"],
    minTemp: 15,
    maxTemp: 35,
  },
  {
    type: "top",
    name: "Light Shirt",
    icon: light_shirt,
    season: ["Spring", "Summer", "Autumn"],
    tags: ["Work", "Dinner", "Everyday"],
    minTemp: 16,
    maxTemp: 28,
  },
  {
    type: "top",
    name: "Warm Shirt",
    icon: warm_shirt,
    season: ["Autumn", "Winter"],
    tags: ["Work", "Dinner", "Everyday"],
    minTemp: 5,
    maxTemp: 18,
  },
  {
    type: "top",
    name: "Tank Top",
    icon: tank_top,
    season: ["Spring", "Summer"],
    tags: ["Everyday", "Gym", "Outdoor"],
    minTemp: 22,
    maxTemp: 40,
  },
  {
    type: "top",
    name: "Light Jumper",
    icon: light_jumper,
    season: ["Spring", "Autumn"],
    tags: ["Everyday", "Work", "Outdoor", "Dinner"],
    minTemp: 10,
    maxTemp: 20,
  },
  {
    type: "top",
    name: "Warm Jumper",
    icon: warm_jumper,
    season: ["Autumn", "Winter"],
    tags: ["Everyday", "Work", "Outdoor", "Dinner"],
    minTemp: -5,
    maxTemp: 12,
  },
  {
    type: "top",
    name: "Fancy Top",
    icon: fancy_top,
    season: ["Spring", "Summer", "Autumn", "Winter"],
    tags: ["Party", "Date Night", "Wedding", "Dinner"],
    minTemp: 15,
    maxTemp: 28,
  },

  // outer
  {
    type: "outer",
    name: "Light Jacket",
    icon: light_jacket,
    season: ["Spring", "Autumn"],
    tags: ["Everyday", "Work", "Outdoor", "Dinner"],
    minTemp: 10,
    maxTemp: 20,
  },
  {
    type: "outer",
    name: "Winter Coat",
    icon: winter_coat,
    season: ["Autumn", "Winter"],
    tags: ["Everyday", "Work", "Outdoor", "Dinner", "Date Night"],
    minTemp: -15,
    maxTemp: 10,
  },

  // onepiece
  {
    type: "onepiece",
    name: "Formal Dress/Jumpsuit",
    icon: formal_dress,
    season: ["Spring", "Summer", "Autumn", "Winter"],
    tags: ["Party", "Date Night", "Wedding", "Dinner"],
    minTemp: 15,
    maxTemp: 30,
  },
  {
    type: "onepiece",
    name: "Party Dress/Jumpsuit",
    icon: party_dress,
    season: ["Spring", "Summer", "Autumn", "Winter"],
    tags: ["Party", "Date Night", "Wedding", "Dinner"],
    minTemp: 16,
    maxTemp: 30,
  },
  {
    type: "onepiece",
    name: "Summer Dress/Jumpsuit",
    icon: summer_dress,
    season: ["Spring", "Summer"],
    tags: ["Everyday", "Beach", "Date Night"],
    minTemp: 22,
    maxTemp: 40,
  },
  {
    type: "onepiece",
    name: "Warm Dress/Jumpsuit",
    icon: warm_dress,
    season: ["Autumn", "Winter"],
    tags: ["Everyday", "Work", "Date Night"],
    minTemp: 8,
    maxTemp: 18,
  },
];

export default typeOptions;
