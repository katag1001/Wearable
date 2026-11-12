// core/constants/typeOptions.js
//
// Each gender's clothing options: type, category, subtype (name),
// and tags. Clothing has no temperature range - matches get one
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
      "name": "Chunky knit jumper",
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
      "name": "Slim jeans",
      "tags": [
        "Elevated everyday",
        "Smart casual",
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
      "name": "Straight leg jeans",
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Travel day",
        "City break"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Tapered jeans",
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Travel day",
        "City break"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Relaxed jeans",
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Gig / concert",
        "Travel day",
        "City break",
        "Festival"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Bootcut jeans",
      "tags": [
        "Elevated everyday",
        "Smart casual",
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
      "name": "Leather trousers",
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
      "name": "Wool trousers",
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Festive party",
        "City break"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Cargo pants",
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
      "name": "Ski/snow pants",
      "tags": [
        "Travel day",
        "Gym / sport",
        "Outdoor / hiking"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Chinos",
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
      "category": "Jackets",
      "name": "Lightweight down jacket",
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Festival",
        "Gym / sport",
        "Outdoor / hiking"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Wool coat",
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
      "name": "Chunky knit jumper",
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
      "name": "3/4 sleeve top",
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
        "Lounge / home"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Vest",
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
      "name": "Tube top",
      "tags": [
        "Elevated everyday",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break",
        "Beach / pool",
        "Festival"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Croptop",
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
      "name": "Bootcut jeans",
      "tags": [
        "Elevated everyday",
        "Smart casual",
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
      "category": "Jeans",
      "name": "Barrel jeans",
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "City break"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Wide leg jeans",
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
      "name": "Baggy jeans",
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Drinks / night out",
        "Gig / concert",
        "Travel day",
        "City break",
        "Festival"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Skinny jeans",
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
      "name": "Straight leg jeans",
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Travel day",
        "City break"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Mom jeans",
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Gig / concert",
        "Travel day",
        "City break",
        "Festival"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Boyfriend jeans",
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
      "name": "Wool trousers",
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
        "Business casual",
        "Formal office",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Cocktail party",
        "Festive party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Cargo pants",
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
      "name": "Ski/snow pants",
      "tags": [
        "Travel day",
        "Gym / sport",
        "Outdoor / hiking"
      ]
    },
    {
      "type": "bottom",
      "category": "Shorts",
      "name": "Fancy Shorts",
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
      "name": "Maxi dress",
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Brunch / lunch",
        "Day out",
        "Garden party / daytime event",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Wedding guest",
        "Travel day",
        "City break",
        "Beach / pool",
        "Festival"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Buttondown dress",
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
      "category": "Jackets",
      "name": "Lightweight down jacket",
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Festival",
        "Gym / sport",
        "Outdoor / hiking"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Wool coat",
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
      "name": "Bolero",
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Business casual",
        "Brunch / lunch",
        "Garden party / daytime event",
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
      "type": "outer",
      "category": "Jackets",
      "name": "Bomber",
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
      "name": "Chunky knit jumper",
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
      "name": "3/4 sleeve top",
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
        "Lounge / home"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Vest",
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
      "name": "Tube top",
      "tags": [
        "Elevated everyday",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "City break",
        "Beach / pool",
        "Festival"
      ]
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Croptop",
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
      "name": "Bootcut jeans",
      "tags": [
        "Elevated everyday",
        "Smart casual",
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
      "category": "Jeans",
      "name": "Barrel jeans",
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "City break"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Wide leg jeans",
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
      "name": "Baggy jeans",
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Drinks / night out",
        "Gig / concert",
        "Travel day",
        "City break",
        "Festival"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Skinny jeans",
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
      "name": "Straight leg jeans",
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Drinks / night out",
        "Party",
        "Travel day",
        "City break"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Mom jeans",
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Casual dinner",
        "Gig / concert",
        "Travel day",
        "City break",
        "Festival"
      ]
    },
    {
      "type": "bottom",
      "category": "Jeans",
      "name": "Boyfriend jeans",
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
      "name": "Wool trousers",
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Work from home",
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
        "Festive party",
        "Wedding guest",
        "Formal / black tie",
        "City break"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Cargo pants",
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
      "name": "Ski/snow pants",
      "tags": [
        "Travel day",
        "Gym / sport",
        "Outdoor / hiking"
      ]
    },
    {
      "type": "bottom",
      "category": "Trousers",
      "name": "Chinos",
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
      "name": "Maxi dress",
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Brunch / lunch",
        "Day out",
        "Garden party / daytime event",
        "Casual dinner",
        "Restaurant dinner",
        "Date night",
        "Wedding guest",
        "Travel day",
        "City break",
        "Beach / pool",
        "Festival"
      ]
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Buttondown dress",
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
      "category": "Jackets",
      "name": "Lightweight down jacket",
      "tags": [
        "Comfy casual",
        "Elevated everyday",
        "Smart casual",
        "Errands",
        "Brunch / lunch",
        "Day out",
        "Travel day",
        "City break",
        "Festival",
        "Gym / sport",
        "Outdoor / hiking"
      ]
    },
    {
      "type": "outer",
      "category": "Coats",
      "name": "Wool coat",
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
      "name": "Bolero",
      "tags": [
        "Elevated everyday",
        "Smart casual",
        "Business casual",
        "Brunch / lunch",
        "Garden party / daytime event",
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
      "type": "outer",
      "category": "Jackets",
      "name": "Bomber",
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
