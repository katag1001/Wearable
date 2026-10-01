// src/constants/typeOptions.jsx
//
// Generated from the LWS Matrix CSVs (context/LWS Matrix - *.csv).
// Each gender's clothing options: type, category, subtype (name),
// tags, seasons, and the temperature range they suit.
//
// IMPORTANT: shared/subtypesByGender.json (used by the backend's
// api/constants/matchScoreBaseline.js for outfit-matching scores)
// independently lists these same subtype names per gender. It does NOT read
// from this file. If a subtype is added, removed, or renamed in EITHER this
// file or shared/subtypesByGender.json, the other MUST be updated to match,
// or the two will silently drift apart.

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
      ],
      "minTemp": 8,
      "maxTemp": 18
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
      ],
      "minTemp": -5,
      "maxTemp": 12
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
      ],
      "minTemp": -5,
      "maxTemp": 12
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
      ],
      "minTemp": 12,
      "maxTemp": 20
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
      ],
      "minTemp": 12,
      "maxTemp": 25
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
      ],
      "minTemp": 18,
      "maxTemp": 35
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
      ],
      "minTemp": 5,
      "maxTemp": 15
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
      ],
      "minTemp": 15,
      "maxTemp": 35
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Long-tshirt",
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
      ],
      "minTemp": 12,
      "maxTemp": 22
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
      ],
      "minTemp": 18,
      "maxTemp": 35
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
      ],
      "minTemp": 5,
      "maxTemp": 22
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
      ],
      "minTemp": 0,
      "maxTemp": 15
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
      ],
      "minTemp": 8,
      "maxTemp": 22
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
      ],
      "minTemp": 8,
      "maxTemp": 22
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
      ],
      "minTemp": 18,
      "maxTemp": 35
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
      ],
      "minTemp": 0,
      "maxTemp": 18
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
      ],
      "minTemp": 12,
      "maxTemp": 25
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
      ],
      "minTemp": 18,
      "maxTemp": 35
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
      ],
      "minTemp": 18,
      "maxTemp": 35
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
      ],
      "minTemp": 20,
      "maxTemp": 35
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
      ],
      "minTemp": 18,
      "maxTemp": 35
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
      ],
      "minTemp": 18,
      "maxTemp": 35
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
      ],
      "minTemp": 21,
      "maxTemp": 35
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
      ],
      "minTemp": 12,
      "maxTemp": 30
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
      ],
      "minTemp": 8,
      "maxTemp": 18
    },
    {
      "type": "outer",
      "category": "Suits and blazers",
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
      ],
      "minTemp": 12,
      "maxTemp": 22
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
      ],
      "minTemp": -10,
      "maxTemp": 8
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
      ],
      "minTemp": 0,
      "maxTemp": 18
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
      ],
      "minTemp": 8,
      "maxTemp": 18
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
      ],
      "minTemp": -15,
      "maxTemp": 5
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
      ],
      "minTemp": -15,
      "maxTemp": 0
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
      ],
      "minTemp": 8,
      "maxTemp": 18
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Demin jacket",
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
      ],
      "minTemp": 12,
      "maxTemp": 22
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
      ],
      "minTemp": 10,
      "maxTemp": 20
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
      ],
      "minTemp": 0,
      "maxTemp": 12
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
      ],
      "minTemp": 8,
      "maxTemp": 18
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
      ],
      "minTemp": 10,
      "maxTemp": 20
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
      ],
      "minTemp": 0,
      "maxTemp": 15
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
      ],
      "minTemp": 0,
      "maxTemp": 15
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
      ],
      "minTemp": 0,
      "maxTemp": 15
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
      ],
      "minTemp": 15,
      "maxTemp": 22
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
      ],
      "minTemp": 15,
      "maxTemp": 22
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
      ],
      "minTemp": 15,
      "maxTemp": 25
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
      ],
      "minTemp": 20,
      "maxTemp": 35
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
      ],
      "minTemp": 18,
      "maxTemp": 30
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
      ],
      "minTemp": 15,
      "maxTemp": 25
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
      ],
      "minTemp": 15,
      "maxTemp": 25
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
      ],
      "minTemp": 15,
      "maxTemp": 25
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Short Turtlneck",
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
      ],
      "minTemp": 10,
      "maxTemp": 20
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
      ],
      "minTemp": 0,
      "maxTemp": 15
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
      ],
      "minTemp": 15,
      "maxTemp": 30
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
      ],
      "minTemp": 18,
      "maxTemp": 35
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Long-tshirt",
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
      ],
      "minTemp": 15,
      "maxTemp": 25
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
      ],
      "minTemp": 20,
      "maxTemp": 35
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
      ],
      "minTemp": 22,
      "maxTemp": 35
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
      ],
      "minTemp": 20,
      "maxTemp": 30
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
      ],
      "minTemp": 18,
      "maxTemp": 28
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
      ],
      "minTemp": 20,
      "maxTemp": 35
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
      ],
      "minTemp": 15,
      "maxTemp": 30
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
      ],
      "minTemp": 18,
      "maxTemp": 30
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
      ],
      "minTemp": 15,
      "maxTemp": 30
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
      ],
      "minTemp": 15,
      "maxTemp": 30
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
      ],
      "minTemp": 15,
      "maxTemp": 25
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
      ],
      "minTemp": 10,
      "maxTemp": 25
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
      ],
      "minTemp": 10,
      "maxTemp": 25
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
      ],
      "minTemp": 10,
      "maxTemp": 25
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
      ],
      "minTemp": 10,
      "maxTemp": 25
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
      ],
      "minTemp": 10,
      "maxTemp": 25
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
      ],
      "minTemp": 10,
      "maxTemp": 25
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
      ],
      "minTemp": 15,
      "maxTemp": 25
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
      ],
      "minTemp": 5,
      "maxTemp": 18
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
      ],
      "minTemp": 15,
      "maxTemp": 28
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
      ],
      "minTemp": 10,
      "maxTemp": 25
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
      ],
      "minTemp": 10,
      "maxTemp": 25
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
      ],
      "minTemp": 20,
      "maxTemp": 35
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
      ],
      "minTemp": 10,
      "maxTemp": 22
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
      ],
      "minTemp": 5,
      "maxTemp": 20
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
      ],
      "minTemp": 15,
      "maxTemp": 28
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
      ],
      "minTemp": 20,
      "maxTemp": 35
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
      ],
      "minTemp": 20,
      "maxTemp": 35
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
      ],
      "minTemp": 20,
      "maxTemp": 35
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
      ],
      "minTemp": 22,
      "maxTemp": 35
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
      ],
      "minTemp": 20,
      "maxTemp": 35
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
      ],
      "minTemp": 15,
      "maxTemp": 25
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
      ],
      "minTemp": 22,
      "maxTemp": 35
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
      ],
      "minTemp": 12,
      "maxTemp": 30
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
      ],
      "minTemp": 22,
      "maxTemp": 35
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
      ],
      "minTemp": 15,
      "maxTemp": 30
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
      ],
      "minTemp": 15,
      "maxTemp": 25
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
      ],
      "minTemp": 18,
      "maxTemp": 28
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Winter dress",
      "season": [],
      "tags": [
        "Everyday"
      ],
      "minTemp": 0,
      "maxTemp": 15
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
      ],
      "minTemp": 18,
      "maxTemp": 30
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
      ],
      "minTemp": 15,
      "maxTemp": 25
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
      ],
      "minTemp": 10,
      "maxTemp": 20
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
      ],
      "minTemp": 10,
      "maxTemp": 18
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
      ],
      "minTemp": -5,
      "maxTemp": 10
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
      ],
      "minTemp": 5,
      "maxTemp": 20
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
      ],
      "minTemp": 10,
      "maxTemp": 20
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
      ],
      "minTemp": -10,
      "maxTemp": 5
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
      ],
      "minTemp": -10,
      "maxTemp": 10
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
      ],
      "minTemp": -10,
      "maxTemp": 5
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
      ],
      "minTemp": 10,
      "maxTemp": 20
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Demin jacket",
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
      ],
      "minTemp": 15,
      "maxTemp": 25
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
      ],
      "minTemp": 5,
      "maxTemp": 15
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
      ],
      "minTemp": 10,
      "maxTemp": 20
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
      ],
      "minTemp": 9,
      "maxTemp": 19
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
      ],
      "minTemp": -2,
      "maxTemp": 13
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
      ],
      "minTemp": -2,
      "maxTemp": 13
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
      ],
      "minTemp": -2,
      "maxTemp": 13
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
      ],
      "minTemp": 13,
      "maxTemp": 21
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
      ],
      "minTemp": 13,
      "maxTemp": 21
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
      ],
      "minTemp": 13,
      "maxTemp": 25
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
      ],
      "minTemp": 19,
      "maxTemp": 35
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
      ],
      "minTemp": 18,
      "maxTemp": 30
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
      ],
      "minTemp": 15,
      "maxTemp": 25
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
      ],
      "minTemp": 15,
      "maxTemp": 25
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
      ],
      "minTemp": 13,
      "maxTemp": 23
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Short Turtlneck",
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
      ],
      "minTemp": 8,
      "maxTemp": 18
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
      ],
      "minTemp": 0,
      "maxTemp": 15
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
      ],
      "minTemp": 15,
      "maxTemp": 30
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
      ],
      "minTemp": 16,
      "maxTemp": 35
    },
    {
      "type": "top",
      "category": "Tops",
      "name": "Long-tshirt",
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
      ],
      "minTemp": 13,
      "maxTemp": 23
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
      ],
      "minTemp": 19,
      "maxTemp": 35
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
      ],
      "minTemp": 22,
      "maxTemp": 35
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
      ],
      "minTemp": 20,
      "maxTemp": 30
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
      ],
      "minTemp": 18,
      "maxTemp": 28
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
      ],
      "minTemp": 20,
      "maxTemp": 35
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
      ],
      "minTemp": 15,
      "maxTemp": 30
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
      ],
      "minTemp": 18,
      "maxTemp": 30
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
      ],
      "minTemp": 15,
      "maxTemp": 30
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
      ],
      "minTemp": 15,
      "maxTemp": 30
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
      ],
      "minTemp": 15,
      "maxTemp": 25
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
      ],
      "minTemp": 10,
      "maxTemp": 25
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
      ],
      "minTemp": 10,
      "maxTemp": 25
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
      ],
      "minTemp": 10,
      "maxTemp": 25
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
      ],
      "minTemp": 10,
      "maxTemp": 25
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
      ],
      "minTemp": 10,
      "maxTemp": 25
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
      ],
      "minTemp": 10,
      "maxTemp": 25
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
      ],
      "minTemp": 15,
      "maxTemp": 25
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
      ],
      "minTemp": 2,
      "maxTemp": 16
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
      ],
      "minTemp": 15,
      "maxTemp": 28
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
      ],
      "minTemp": 9,
      "maxTemp": 23
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
      ],
      "minTemp": 9,
      "maxTemp": 23
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
      ],
      "minTemp": 19,
      "maxTemp": 35
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
      ],
      "minTemp": 10,
      "maxTemp": 22
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
      ],
      "minTemp": 2,
      "maxTemp": 19
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
      ],
      "minTemp": 13,
      "maxTemp": 26
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
      ],
      "minTemp": 20,
      "maxTemp": 35
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
      ],
      "minTemp": 19,
      "maxTemp": 35
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
      ],
      "minTemp": 19,
      "maxTemp": 35
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
      ],
      "minTemp": 21,
      "maxTemp": 35
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
      ],
      "minTemp": 19,
      "maxTemp": 35
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
      ],
      "minTemp": 18,
      "maxTemp": 35
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
      ],
      "minTemp": 15,
      "maxTemp": 25
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
      ],
      "minTemp": 21,
      "maxTemp": 35
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
      ],
      "minTemp": 22,
      "maxTemp": 35
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
      ],
      "minTemp": 12,
      "maxTemp": 30
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
      ],
      "minTemp": 22,
      "maxTemp": 35
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
      ],
      "minTemp": 15,
      "maxTemp": 30
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
      ],
      "minTemp": 15,
      "maxTemp": 25
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
      ],
      "minTemp": 18,
      "maxTemp": 28
    },
    {
      "type": "onepiece",
      "category": "Dresses",
      "name": "Winter dress",
      "season": [],
      "tags": [
        "Everyday"
      ],
      "minTemp": 0,
      "maxTemp": 15
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
      ],
      "minTemp": 18,
      "maxTemp": 30
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
      ],
      "minTemp": 15,
      "maxTemp": 25
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
      ],
      "minTemp": 9,
      "maxTemp": 19
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
      ],
      "minTemp": 10,
      "maxTemp": 18
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
      ],
      "minTemp": -7,
      "maxTemp": 9
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
      ],
      "minTemp": 2,
      "maxTemp": 19
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
      ],
      "minTemp": 9,
      "maxTemp": 19
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
      ],
      "minTemp": -12,
      "maxTemp": 2
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
      ],
      "minTemp": -12,
      "maxTemp": 7
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
      ],
      "minTemp": -12,
      "maxTemp": 2
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
      ],
      "minTemp": 9,
      "maxTemp": 19
    },
    {
      "type": "outer",
      "category": "Jackets",
      "name": "Demin jacket",
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
      ],
      "minTemp": 13,
      "maxTemp": 23
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
      ],
      "minTemp": 10,
      "maxTemp": 20
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
      ],
      "minTemp": 2,
      "maxTemp": 13
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
      ],
      "minTemp": 9,
      "maxTemp": 19
    }
  ]
};

export const getTypeOptions = (gender) =>
  typeOptionsByGender[gender] || typeOptionsByGender.unisex;

export default typeOptionsByGender;
