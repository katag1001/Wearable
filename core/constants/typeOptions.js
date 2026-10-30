// core/constants/typeOptions.js
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Lounge / home"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Fine-knit jumper",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Beach / pool",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
      ]
    },
    {
      "type": "top",
      "category": "Shirts/Blouses",
      "name": "Oversized shirt",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "City break",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Long-sleeve t-shirt",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Smart casual",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Gig / concert",
        "Party",
        "City break"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Gym / sport",
        "Outdoor / hiking"
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
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Beach / pool",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Day out",
        "Travel day",
        "City break",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "City break",
        "Beach / pool",
        "Festival",
        "Outdoor / hiking"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Beach / pool",
        "Outdoor / hiking"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Beach / pool",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Beach / pool",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "outer",
      "category": "Suits and blazers",
      "name": "Tailored blazer",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Smart casual",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Casual dinner",
        "Restaurant dinner",
        "Date night"
      ]
    },
    {
      "type": "outer",
      "category": "Suits and blazers",
      "name": "Longline blazer",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Smart casual",
        "Business casual",
        "Brunch / lunch",
        "Casual dinner",
        "Restaurant dinner",
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "City break",
        "Outdoor / hiking"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Classic trench",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Long leather coat",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Outdoor / hiking"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Wool coat",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Parka",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Spring coat",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Cropped jacket",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Bomber",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "City break",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break",
        "Outdoor / hiking"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Knit coat",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Gilet",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Thick turtleneck jumper",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Thin turtleneck jumper",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Lounge / home"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Fine-knit jumper",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Beach / pool",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Beach / pool",
        "Lounge / home"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Day out",
        "Date night",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
      ]
    },
    {
      "type": "top",
      "category": "Shirts/Blouses",
      "name": "Denim shirt",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Date night",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
      ]
    },
    {
      "type": "top",
      "category": "Shirts/Blouses",
      "name": "Oversized shirt",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Date night",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
      ]
    },
    {
      "type": "top",
      "category": "Shirts/Blouses",
      "name": "Peasant/boho blouse",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Festive party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Party top",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Festive party"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Day out",
        "City break"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "City break",
        "Lounge / home"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "City break",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Long-sleeve t-shirt",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Knit vest/tank",
      "season": [
        "Summer",
        "Autumn"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Halter/strappy top",
      "season": [
        "Summer",
        "Autumn"
      ],
      "tags": [
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break",
        "Beach / pool"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break",
        "Beach / pool"
      ]
    },
    {
      "type": "bottom",
      "category": "Skirts",
      "name": "Winter mini skirt",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break",
        "Beach / pool"
      ]
    },
    {
      "type": "bottom",
      "category": "Skirts",
      "name": "Floaty maxi skirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break",
        "Beach / pool"
      ]
    },
    {
      "type": "bottom",
      "category": "Skirts",
      "name": "Fitted maxi skirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break",
        "Beach / pool"
      ]
    },
    {
      "type": "bottom",
      "category": "Skirts",
      "name": "Smart skirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Gig / concert",
        "Party",
        "City break"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Floaty trousers",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Tailored wide leg trousers",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Flared trousers",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Gym / sport",
        "Outdoor / hiking"
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
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Date night",
        "Travel day",
        "City break",
        "Beach / pool",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Day out",
        "Travel day",
        "City break",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Brunch / lunch",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Festive party",
        "Gym / sport"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "City break",
        "Beach / pool",
        "Festival",
        "Outdoor / hiking"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Beach / pool",
        "Outdoor / hiking"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Travel day",
        "City break",
        "Beach / pool",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Beach / pool",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Strappy summer dress",
      "season": [
        "Summer"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Garden party / daytime event",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Beach / pool",
        "Festival"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Garden party / daytime event",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Beach / pool"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Buttondown dress",
      "season": [
        "Summer"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Beach / pool"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Shirt dress",
      "season": [
        "Summer"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Beach / pool"
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
        "Garden party / daytime event",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie"
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
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Festive party",
        "Wedding guest",
        "Formal / black tie"
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
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Festive party"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Winter dress",
      "season": [],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Lounge / home"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Day out",
        "City break"
      ]
    },
    {
      "type": "outer",
      "category": "Suits and blazers",
      "name": "Tailored blazer",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Smart casual",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Casual dinner",
        "Restaurant dinner",
        "Date night"
      ]
    },
    {
      "type": "outer",
      "category": "Suits and blazers",
      "name": "Longline blazer",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Smart casual",
        "Business casual",
        "Brunch / lunch",
        "Casual dinner",
        "Restaurant dinner",
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Beach / pool",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "City break",
        "Outdoor / hiking"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Classic trench",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Long leather coat",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Outdoor / hiking"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Wool coat",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Parka",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Spring coat",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Cropped jacket",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Bomber",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "City break",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break",
        "Outdoor / hiking"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Knit coat",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Gilet",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Thick turtleneck jumper",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Thin turtleneck jumper",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Lounge / home"
      ]
    },
    {
      "type": "top",
      "category": "Jumpers and cardigans",
      "name": "Fine-knit jumper",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Beach / pool",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Beach / pool",
        "Lounge / home"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
      ]
    },
    {
      "type": "top",
      "category": "Shirts/Blouses",
      "name": "Denim shirt",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
      ]
    },
    {
      "type": "top",
      "category": "Shirts/Blouses",
      "name": "Oversized shirt",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
      ]
    },
    {
      "type": "top",
      "category": "Shirts/Blouses",
      "name": "Peasant/boho blouse",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Festive party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Party top",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Festive party"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Day out",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "City break",
        "Lounge / home"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Long-sleeve t-shirt",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Knit vest/tank",
      "season": [
        "Summer",
        "Autumn"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Halter/strappy top",
      "season": [
        "Summer",
        "Autumn"
      ],
      "tags": [
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break",
        "Beach / pool"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break",
        "Beach / pool"
      ]
    },
    {
      "type": "bottom",
      "category": "Skirts",
      "name": "Winter mini skirt",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break",
        "Beach / pool"
      ]
    },
    {
      "type": "bottom",
      "category": "Skirts",
      "name": "Floaty maxi skirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break",
        "Beach / pool"
      ]
    },
    {
      "type": "bottom",
      "category": "Skirts",
      "name": "Fitted maxi skirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break",
        "Beach / pool"
      ]
    },
    {
      "type": "bottom",
      "category": "Skirts",
      "name": "Smart skirt",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Gig / concert",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Floaty trousers",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Tailored wide leg trousers",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Flared trousers",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Gym / sport",
        "Outdoor / hiking"
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
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Day out",
        "Travel day",
        "City break",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Brunch / lunch",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Festive party",
        "Gym / sport"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "City break",
        "Beach / pool",
        "Festival",
        "Outdoor / hiking"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Beach / pool",
        "Outdoor / hiking"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Beach / pool",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Travel day",
        "City break",
        "Beach / pool",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Beach / pool",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Strappy summer dress",
      "season": [
        "Summer"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Garden party / daytime event",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Beach / pool",
        "Festival"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Garden party / daytime event",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Beach / pool"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Buttondown dress",
      "season": [
        "Summer"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Beach / pool"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Shirt dress",
      "season": [
        "Summer"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Travel day",
        "City break",
        "Beach / pool"
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
        "Garden party / daytime event",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie"
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
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Festive party",
        "Wedding guest",
        "Formal / black tie"
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
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Festive party"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Winter dress",
      "season": [],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Lounge / home"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Day out",
        "City break"
      ]
    },
    {
      "type": "outer",
      "category": "Suits and blazers",
      "name": "Tailored blazer",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Smart casual",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie"
      ]
    },
    {
      "type": "outer",
      "category": "Suits and blazers",
      "name": "Longline blazer",
      "season": [
        "Spring",
        "Summer",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Smart casual",
        "Business casual",
        "Brunch / lunch",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Beach / pool",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "City break",
        "Outdoor / hiking"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Classic trench",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Long leather coat",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "City break",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Outdoor / hiking"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Wool coat",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Parka",
      "season": [
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Spring coat",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Cropped jacket",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Bomber",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "City break",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Work from home",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
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
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break",
        "Outdoor / hiking"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Knit coat",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Gilet",
      "season": [
        "Spring",
        "Autumn",
        "Winter"
      ],
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Cocktail party",
        "Wedding guest",
        "Formal / black tie",
        "Travel day",
        "City break",
        "Beach / pool",
        "Gym / sport",
        "Outdoor / hiking",
        "Lounge / home"
      ]
    }
  ]
};

export const getTypeOptions = (gender) =>
  typeOptionsByGender[gender] || typeOptionsByGender.unisex;

export default typeOptionsByGender;
