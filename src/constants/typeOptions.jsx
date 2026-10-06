// src/constants/typeOptions.jsx
//
// Each gender's clothing options: type, category, subtype (name),
// tags and seasons. Clothing has no temperature range - matches get one
// from server/constants/temperatureGroups.js.
//
// IMPORTANT: shared/subtypesByGender.json (used by the backend's
// server/constants/matchScoreBaseline.js for outfit matching)
// independently lists these same subtype names per gender and role, in the
// same order. It does NOT read from this file. If a subtype is added,
// removed, renamed or moved to another role in EITHER this file or
// shared/subtypesByGender.json, the other MUST be updated to match, or the
// two will silently drift apart.

const typeOptionsByGender = {
  "man": [
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Hoodie/sweatshirt",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Warm jumper",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Warm cardigan",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Light jumper",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Dinner",
        "Beach",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Shirts/Blouses",
      "name": "Buttondown shirt",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Shirts/Blouses",
      "name": "Linen shirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn"
      ],
      "tags": [
        "Work",
        "Beach",
        "Wedding",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Turtleneck",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Short t-shirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Gym",
        "Loungewear",
        "Dinner",
        "Beach",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Long t-shirt",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Gym",
        "Loungewear",
        "Dinner",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Vest",
      "season": [
        "Summer",
        "Autumn"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Party",
        "Dinner",
        "Beach",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Waistcoat",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Date night"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Jeans",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Leather trousers",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Tailored trousers",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Cargo pants",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Gym",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Linen pants",
      "season": [
        "Spring",
        "Summer"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Dinner",
        "Beach",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Sweatpants",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Chinos",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Shorts",
      "name": "Shorts",
      "season": [
        "Summer"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Shorts",
      "name": "Denim shorts",
      "season": [
        "Summer"
      ],
      "tags": [
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Shorts",
      "name": "Linen shorts",
      "season": [
        "Summer"
      ],
      "tags": [
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Shorts",
      "name": "Cargo shorts",
      "season": [
        "Spring",
        "Summer"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Shorts",
      "name": "Skater shorts",
      "season": [
        "Summer"
      ],
      "tags": [
        "Loungewear",
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "onepiece",
      "category": "Jumpsuits and playsuits",
      "name": "Romper",
      "season": [
        "Spring",
        "Summer"
      ],
      "tags": [
        "Everyday"
      ]
    },
    {
      "type": "onepiece",
      "category": "Jumpsuits and playsuits",
      "name": "Overalls",
      "season": [
        "Spring",
        "Summer",
        "Autumn"
      ],
      "tags": [
        "Loungewear",
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Suits and blazers",
      "name": "Blazer",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Dinner",
        "Date night"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Duffle coat",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Rain coat",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Gym",
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Trench coat",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Puffer coat",
      "season": [
        "Winter"
      ],
      "tags": [
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Winter Coat",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Gym",
        "Loungewear",
        "Party",
        "Dinner",
        "Beach",
        "Outdoor",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Jacket",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Gym",
        "Loungewear",
        "Party",
        "Dinner",
        "Beach",
        "Outdoor",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Denim jacket",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Shacket",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Loungewear",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Fleece",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Leather jacket",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    }
  ],
  "woman": [
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Hoodie/sweatshirt",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Warm jumper",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Turtleneck jumper",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Warm cardigan",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Light jumper",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Dinner",
        "Beach",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Light cardigan",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Dinner",
        "Beach",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Shirts/Blouses",
      "name": "Buttondown shirt",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Shirts/Blouses",
      "name": "Linen shirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn"
      ],
      "tags": [
        "Work",
        "Beach",
        "Wedding",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Shirts/Blouses",
      "name": "Floaty blouse",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Shirts/Blouses",
      "name": "Fancy blouse",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Fancy top",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Waistcoat",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Short turtleneck",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Long turtleneck",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Dinner",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Bodysuit",
      "season": [
        "Spring",
        "Summer"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Short t-shirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Gym",
        "Loungewear",
        "Dinner",
        "Beach",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Long t-shirt",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Gym",
        "Loungewear",
        "Dinner",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Vest",
      "season": [
        "Summer",
        "Autumn"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Party",
        "Dinner",
        "Beach",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Croptop",
      "season": [
        "Summer",
        "Autumn"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Party",
        "Dinner",
        "Beach",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Off-the-shoulder top",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Beach",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Tunic",
      "season": [
        "Spring",
        "Summer"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Skirts",
      "name": "Mini skirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Beach",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Skirts",
      "name": "Maxi skirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Dinner",
        "Beach",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Skirts",
      "name": "Knee-length skirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Skirts",
      "name": "Midi-skirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Skirts",
      "name": "Low waist midi",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Cropped jeans",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Flared jeans",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Wide leg jeans",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "High waisted jeans",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Low waist jeans",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Skinny jeans",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Boyfriend jeans",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Cropped trousers",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Leather trousers",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Wideleg trousers",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Tailored trousers",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Cargo pants",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Gym",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Linen pants",
      "season": [
        "Spring",
        "Summer"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Beach",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Leggings",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Sweatpants",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Chinos",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Shorts",
      "name": "Fancy Shorts",
      "season": [
        "Summer"
      ],
      "tags": [
        "Gym",
        "Party",
        "Dinner",
        "Date night"
      ]
    },
    {
      "type": "bottom",
      "category": "Shorts",
      "name": "Casual shorts",
      "season": [
        "Summer"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Shorts",
      "name": "Denim shorts",
      "season": [
        "Summer"
      ],
      "tags": [
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Shorts",
      "name": "Linen shorts",
      "season": [
        "Summer"
      ],
      "tags": [
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Shorts",
      "name": "Cargo shorts",
      "season": [
        "Spring",
        "Summer"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "onepiece",
      "category": "Jumpsuits and playsuits",
      "name": "Jumpsuit",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "onepiece",
      "category": "Jumpsuits and playsuits",
      "name": "Playsuit",
      "season": [
        "Spring",
        "Summer"
      ],
      "tags": [
        "Loungewear",
        "Party",
        "Dinner",
        "Beach",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "onepiece",
      "category": "Jumpsuits and playsuits",
      "name": "Overalls",
      "season": [
        "Spring",
        "Summer",
        "Autumn"
      ],
      "tags": [
        "Loungewear",
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Summer dress",
      "season": [
        "Summer"
      ],
      "tags": [
        "Dinner",
        "Beach",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Wedding guest dress",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Wedding"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Evening dress",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Wedding",
        "Date night"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Cocktail dress",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Date night"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Winter dress",
      "season": [],
      "tags": [
        "Everyday"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Casual dress",
      "season": [
        "Spring",
        "Summer"
      ],
      "tags": [
        "Loungewear",
        "Everyday"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Work dress",
      "season": [
        "Summer"
      ],
      "tags": [
        "Work",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Suits and blazers",
      "name": "Blazer",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Dinner",
        "Date night"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Poncho",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Loungewear",
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Duffle coat",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Rain coat",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Gym",
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Trench coat",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Fur coat",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Puffer coat",
      "season": [
        "Winter"
      ],
      "tags": [
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Winter Coat",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Gym",
        "Loungewear",
        "Party",
        "Dinner",
        "Beach",
        "Outdoor",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Jacket",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Gym",
        "Loungewear",
        "Party",
        "Dinner",
        "Beach",
        "Outdoor",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Denim jacket",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Fleece",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Leather jacket",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    }
  ],
  "unisex": [
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Hoodie/sweatshirt",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Warm jumper",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Turtleneck jumper",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Warm cardigan",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Light jumper",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Dinner",
        "Beach",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Light cardigan",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Dinner",
        "Beach",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Shirts/Blouses",
      "name": "Buttondown shirt",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Shirts/Blouses",
      "name": "Linen shirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn"
      ],
      "tags": [
        "Work",
        "Beach",
        "Wedding",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Shirts/Blouses",
      "name": "Floaty blouse",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Shirts/Blouses",
      "name": "Fancy blouse",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Fancy top",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Waistcoat",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Wedding",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Short turtleneck",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Long turtleneck",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Dinner",
        "Outdoor",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Bodysuit",
      "season": [
        "Spring",
        "Summer"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Short t-shirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Gym",
        "Loungewear",
        "Dinner",
        "Beach",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Long t-shirt",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Gym",
        "Loungewear",
        "Dinner",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Vest",
      "season": [
        "Summer",
        "Autumn"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Party",
        "Dinner",
        "Beach",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Croptop",
      "season": [
        "Summer",
        "Autumn"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Party",
        "Dinner",
        "Beach",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Off-the-shoulder top",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Beach",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Tunic",
      "season": [
        "Spring",
        "Summer"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Skirts",
      "name": "Mini skirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Beach",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Skirts",
      "name": "Maxi skirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Dinner",
        "Beach",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Skirts",
      "name": "Knee-length skirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Skirts",
      "name": "Midi-skirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Skirts",
      "name": "Low waist midi",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Cropped jeans",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Flared jeans",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Wide leg jeans",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "High waisted jeans",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Low waist jeans",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Skinny jeans",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Boyfriend jeans",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Cropped trousers",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Leather trousers",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Wideleg trousers",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Tailored trousers",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Cargo pants",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Gym",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Linen pants",
      "season": [
        "Spring",
        "Summer"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Dinner",
        "Beach",
        "Outdoor",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Leggings",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Sweatpants",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Chinos",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Shorts",
      "name": "Fancy Shorts",
      "season": [
        "Summer"
      ],
      "tags": [
        "Gym",
        "Party",
        "Dinner",
        "Date night"
      ]
    },
    {
      "type": "bottom",
      "category": "Shorts",
      "name": "Casual shorts",
      "season": [
        "Summer"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Shorts",
      "name": "Denim shorts",
      "season": [
        "Summer"
      ],
      "tags": [
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Shorts",
      "name": "Linen shorts",
      "season": [
        "Summer"
      ],
      "tags": [
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Shorts",
      "name": "Cargo shorts",
      "season": [
        "Spring",
        "Summer"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "bottom",
      "category": "Shorts",
      "name": "Skater shorts",
      "season": [
        "Summer"
      ],
      "tags": [
        "Loungewear",
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "onepiece",
      "category": "Jumpsuits and playsuits",
      "name": "Jumpsuit",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "onepiece",
      "category": "Jumpsuits and playsuits",
      "name": "Playsuit",
      "season": [
        "Spring",
        "Summer"
      ],
      "tags": [
        "Loungewear",
        "Party",
        "Dinner",
        "Beach",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "onepiece",
      "category": "Jumpsuits and playsuits",
      "name": "Romper",
      "season": [
        "Spring",
        "Summer"
      ],
      "tags": [
        "Everyday"
      ]
    },
    {
      "type": "onepiece",
      "category": "Jumpsuits and playsuits",
      "name": "Overalls",
      "season": [
        "Spring",
        "Summer",
        "Autumn"
      ],
      "tags": [
        "Loungewear",
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Summer dress",
      "season": [
        "Summer"
      ],
      "tags": [
        "Dinner",
        "Beach",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Wedding guest dress",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Wedding"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Evening dress",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Wedding",
        "Date night"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Cocktail dress",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Date night"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Winter dress",
      "season": [],
      "tags": [
        "Everyday"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Casual dress",
      "season": [
        "Spring",
        "Summer"
      ],
      "tags": [
        "Loungewear",
        "Everyday"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Work dress",
      "season": [
        "Summer"
      ],
      "tags": [
        "Work",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Suits and blazers",
      "name": "Blazer",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Dinner",
        "Wedding",
        "Date night"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Poncho",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Loungewear",
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Duffle coat",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Rain coat",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Gym",
        "Beach",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Trench coat",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Fur coat",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Party",
        "Dinner",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Puffer coat",
      "season": [
        "Winter"
      ],
      "tags": [
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Winter Coat",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Gym",
        "Loungewear",
        "Party",
        "Dinner",
        "Beach",
        "Outdoor",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Jacket",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Gym",
        "Loungewear",
        "Party",
        "Dinner",
        "Beach",
        "Outdoor",
        "Wedding",
        "Date night",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Denim jacket",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Work",
        "Loungewear",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Shacket",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Loungewear",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Fleece",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Gym",
        "Loungewear",
        "Outdoor",
        "Everyday"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Leather jacket",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Party",
        "Dinner",
        "Outdoor",
        "Date night",
        "Everyday"
      ]
    }
  ]
};

export const getTypeOptions = (gender) =>
  typeOptionsByGender[gender] || typeOptionsByGender.unisex;

export default typeOptionsByGender;
