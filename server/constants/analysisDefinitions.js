// server/constants/analysisDefinitions.js
//
// What Gemini is told each pattern, clothing type and occasion means when
// it reads a photo (services/analysisPrompt.js puts them in the prompt).
// Fabric and colour descriptions live with their lists (shared/fabrics.json,
// shared/colors.json). Agreed with the user on the definitions page
// (2 November 2026). Change PROMPT_VERSION (constants/itemAnalysis.js)
// after editing.

// shared/patterns.json -> what counts as that pattern.
const PATTERN_DEFINITIONS = {
  "Plain":
    "One colour all over, with no printed or woven design. Texture alone - ribbing, cable knit, waffle, crinkled linen, a satin sheen - is still Plain as long as it doesn't form a visible repeating design. Small details (a little logo badge, contrast stitching, buttons, a narrow contrast trim) don't change it. Two or more colours in flat blocks (colour-blocking) is not Plain - that's Geometric.",
  "Stripe":
    "Lines of colour repeating across the fabric: horizontal (Breton), vertical (pinstripe) or diagonal, thin or wide, evenly or unevenly spaced. Two sets of lines crossing each other make a check, not a stripe. Rows of tiny dots or motifs that line up are still the motif's pattern, not a stripe.",
  "Check/plaid":
    "Lines crossing at right angles to form squares or rectangles: gingham, tartan, windowpane, houndstooth, Prince of Wales, buffalo check. Also any woven texture that reads as a pattern from a distance - herringbone, tweed and bouclé with visible flecks or checks count here, even when they're one colour family.",
  "Spots/dots":
    "Round or near-round dots repeated across the fabric: polka dots, pin dots, coin spots, scattered spots of any size. If the 'spots' are clearly shapes like hearts, stars or flowers, use the matching pattern (Floral, Geometric or Abstract) instead.",
  "Floral":
    "Flowers, leaves, petals, vines or other plant life printed, woven or jacquard into the fabric - from tiny ditsy florals to large bold blooms and tropical leaves. Flowers that are stitched on in thread are Embroidered; flowers made from open lace are Lace/broderie.",
  "Animal print":
    "A print copying an animal's coat or skin: leopard, cheetah, zebra, tiger, giraffe, cow, snakeskin, crocodile. Counts whatever the colours (a pink leopard print is still Animal print). A plain leather or suede with a natural grain is Plain, not Animal print.",
  "Paisley":
    "Curved teardrop or comma-shaped motifs with ornate inner detail, often packed together with small flowers and swirls - the classic bandana and 70s-shirt print. If the teardrops are stitched on in thread rather than printed, use Embroidered.",
  "Geometric":
    "Regular, hard-edged shapes that aren't stripes, checks or dots: triangles, diamonds, chevrons, zigzags, hexagons, argyle, Aztec or tile-like designs, interlocking lines - and colour-blocking, where flat blocks of two or more colours make up the piece.",
  "Graphic/slogan":
    "Pictures, words, characters, band or brand artwork, or logos bigger than a small chest badge printed on the piece - usually a single large design rather than a repeating pattern. A tiny embroidered logo doesn't count (that's Plain).",
  "Embroidered":
    "A design stitched onto the fabric in thread - flowers, paisleys, motifs, scallops - standing slightly raised from the surface, often in a contrast colour. Choose it when the stitched design is a noticeable part of the piece, not just a small monogram. Open-work lace and broderie anglaise are Lace/broderie instead.",
  "Lace/broderie":
    "Open-work fabric with holes forming the design: lace (fine mesh with floral or scalloped patterns) or broderie anglaise / eyelet (cotton with stitched holes). Includes pieces where lace panels or a broad lace trim are a main feature. Usually one colour - it still counts as patterned.",
  "Camo":
    "Camouflage: irregular, interlocking blotches in earthy greens, browns, khakis and black (or fashion versions in other colours) designed to break up an outline. Pixel or digital camo counts too.",
};

// Every clothing subtype (shared/subtypesByGender.json, all genders) -> how
// to recognise it and tell it from its neighbours. Footwear goes by name.
const SUBTYPE_DEFINITIONS = {
  "Hoodie/sweatshirt":
    "A casual jersey or fleece-backed pullover in sweatshirt fabric - with or without a hood, kangaroo pocket or drawstrings, usually with ribbed cuffs and hem. Includes zip-up hoodies. Not knitted (knitted pullovers are jumpers).",
  "Chunky knit jumper":
    "A thick, chunky or heavy-knit pullover with a crew, V or other low neckline - cable knit, Fair Isle, wool or wool-mix you'd wear for warmth in cold weather. Visible chunky stitches or a bulky, cosy look. If it has a turtle or roll neck, use Thick turtleneck jumper; if it's thin and smooth, use Fine-knit jumper.",
  "Thick turtleneck jumper":
    "A chunky or heavy-knit pullover with a high neck that folds or rolls over (turtle or roll neck). Visibly thick stitches and a bulky collar. A thin, smooth knit with a turtle neck is Thin turtleneck jumper.",
  "Thin turtleneck jumper":
    "A fine, smooth knitted pullover (merino, cashmere, fine wool or cotton knit) with a high folded or funnel neck. The knit stitches are small and flat; it's slim and could be worn under a blazer. A jersey (t-shirt fabric) turtleneck is Short or Long turtleneck instead.",
  "Warm cardigan":
    "A thick or chunky knitted cardigan that opens down the front with buttons or no fastening - cosy, bulky, often cable or ribbed knit, worn for warmth. A thin, smooth cardigan is Light cardigan; a knee-length one worn as a coat is Knit coat.",
  "Fine-knit jumper":
    "A thin, smooth, lightweight knitted pullover (merino, cashmere, cotton or viscose knit) with a crew, V, boat or other low neckline. Small flat stitches and a neat, close fit - smart enough to wear to work. A thick, chunky pullover is Chunky knit jumper.",
  "Light cardigan":
    "A thin, fine-knit cardigan that opens down the front - lightweight, smooth stitches, often with small buttons, cropped or hip-length. Worn as a light layer. A thick, cosy cardigan is Warm cardigan.",
  "Buttondown shirt":
    "A classic collared shirt that buttons all the way down the front, ending around the hips - cotton poplin, oxford, chambray-free cotton or similar crisp fabric, with cuffs and a structured collar. Laid flat it can look long, but if the body ends around the hip or upper thigh with shirt-tails it's a shirt, not a dress. A shirt long enough to be worn alone as a dress (mid-thigh or longer, often with a waist tie) is Shirt dress. A denim one is Denim shirt; linen is Linen shirt; a deliberately huge, boxy one is Oversized shirt.",
  "Denim shirt":
    "A collared button-front shirt made from denim or chambray (the light denim-look cotton) - blue, black or washed denim, often with chest pockets and visible top-stitching. A heavier, jacket-like denim overshirt worn as outerwear is Shacket or Denim jacket.",
  "Oversized shirt":
    "A collared button-front shirt cut deliberately big and boxy - dropped shoulders, wide body, long sleeves and a long, loose hem - meant to be worn loose, open as a layer, or tucked loosely. Still a top (ends around the hips or upper thigh). A crisp, fitted shirt is Buttondown shirt.",
  "Linen shirt":
    "A collared button-front shirt in linen or a linen blend - visibly textured, slightly slubby fabric that creases easily and looks airy. Often relaxed in fit. Any shirt whose fabric clearly reads as linen goes here rather than Buttondown shirt.",
  "Floaty blouse":
    "A lightweight blouse in a soft, flowing fabric - chiffon, georgette, viscose, crepe or thin cotton - that drapes and moves rather than holding a structured shape. Often with loose sleeves, a soft neckline or ties. If it has a gathered or smocked neckline, billowy peasant sleeves or folk embroidery, use Peasant/boho blouse; if it's clearly a dressy occasion piece, Fancy blouse.",
  "Peasant/boho blouse":
    "A loose, relaxed blouse with a folk or bohemian look: gathered, smocked or elasticated neckline (often with a tie or keyhole), billowy or puffed sleeves, and often embroidery, lace or broderie details. Usually cotton or cheesecloth.",
  "Fancy blouse":
    "A dressy blouse for occasions or smart wear: silk, satin or crepe with a sheen, or with statement details - pussy-bow, ruffles, dramatic or puffed sleeves, a statement collar. Looks polished rather than everyday. A sparkly or going-out piece is Party top.",
  "Fancy top":
    "A dressy top that isn't a blouse or shirt - a structured, embellished or textured top for smart occasions: satin cowl-neck tops, corset-style or peplum tops, tops with feathers, pearls, ruching or sculptural details. Smarter than everyday, but not full sequins/sparkle (that's Party top).",
  "Party top":
    "A going-out top made to stand out at night: sequins, sparkle, glitter, metallic or lamé fabric, mesh, rhinestones or other statement embellishment. If it shines or sparkles all over, it's a Party top.",
  "Waistcoat":
    "A sleeveless, buttoned, tailored top or vest in suiting fabric (wool, tweed, linen suiting, pinstripe) - V-neck front with buttons, sometimes with welt pockets, cut like the waistcoat of a three-piece suit. Worn alone as a top or layered. A sleeveless knitted top is Knit vest/tank.",
  "Short turtleneck":
    "A fitted top in jersey or stretch fabric (t-shirt-like, not knitted) with a high turtle, mock or funnel neck and short sleeves or no sleeves. Smooth fabric with no visible knit stitches. A knitted version is a turtleneck jumper.",
  "Long turtleneck":
    "A fitted top in jersey or stretch fabric (t-shirt-like, not knitted) with a high turtle, mock or funnel neck and long sleeves - a base-layer or 'skivvy' style. Smooth fabric with no visible knit stitches. A knitted version is Thin or Thick turtleneck jumper.",
  "Bodysuit":
    "A close-fitting top that continues down into a brief or thong fastening under the crotch (snaps or hooks visible between the legs when laid flat). Any sleeve length or neckline. If you can see the crotch fastening, it's a Bodysuit whatever else it looks like.",
  "Short t-shirt":
    "A casual jersey top with short sleeves and a crew or V neck - plain, printed or graphic tees, including baby tees and boxy tees. Not cropped above the waist (that's Croptop) and not long-sleeved (Long-sleeve t-shirt).",
  "Long-sleeve t-shirt":
    "A casual jersey top with long sleeves and a crew, scoop, square or V neck - t-shirt fabric, not knitted. Plain, striped or printed. A jersey top with a high neck is Long turtleneck; a knitted pullover is a jumper; sleeves ending between the elbow and wrist are 3/4 sleeve top.",
  "3/4 sleeve top":
    "A top whose sleeves end between the elbow and the wrist (three-quarter or bracelet sleeves) - jersey, cotton or light woven fabric, any neckline. The sleeve length is the defining feature: full-length sleeves are Long-sleeve t-shirt, short sleeves are Short t-shirt. A knitted pullover is a jumper whatever its sleeve length.",
  "Vest":
    "A sleeveless jersey top (a tank top) with straps wide enough to cover the shoulder area - racerback, ribbed or plain cotton vests. Not knitted. A top with thin spaghetti straps or a halter neck is Halter/strappy top.",
  "Knit vest/tank":
    "A sleeveless top made of knitted fabric (visible knit stitches or rib) - a knitted tank, sweater vest or knitted cami. Worn alone in warm weather or layered over a shirt.",
  "Halter/strappy top":
    "A top held up by thin spaghetti straps or a halter neck that ties or fastens behind the neck - camisoles, slip tops, strappy satin tops, backless or tie-back tops. Laid flat, a backless or strappy top can look like a long rectangle of fabric: if it has straps, ties or a neckline and no waistband, it's a top, not a skirt.",
  "Croptop":
    "A top that clearly ends above the natural waist, showing the midriff when worn - any sleeve length, including cropped tees and cropped knits. If it has thin straps or a halter neck, use Halter/strappy top instead; strapless is Tube top.",
  "Tube top":
    "A strapless top that stays up on its own - a straight band of fabric around the chest, often elasticated, smocked, ruched or boned: bandeau tops, boob tubes and strapless corset tops. No straps, halter or sleeves. With thin straps it's Halter/strappy top.",
  "Off-the-shoulder top":
    "A top whose neckline sits below the shoulders, leaving both shoulders bare - usually an elasticated or bardot neckline, often with sleeves sitting on the upper arm. One-shoulder tops count too.",
  "Tunic":
    "A long, loose top reaching mid-thigh or lower, meant to be worn over trousers, leggings or jeans rather than alone as a dress - often with side slits, a placket neckline or embroidery. If it's long enough and styled to be worn alone, choose a dress.",
  "Mini skirt":
    "A skirt ending well above the knee, in a lightweight or everyday fabric (cotton, denim, linen, jersey, satin). A skirt has a waistband or waist seam at the top and a hem at the bottom - no armholes, straps or neckline. A mini in a warm fabric is Winter mini skirt.",
  "Winter mini skirt":
    "A mini skirt (well above the knee) in a warm, heavy or textured fabric: wool, tweed, bouclé, corduroy, leather, faux leather, suede or thick knit. Made to be worn with tights in cold weather.",
  "Floaty maxi skirt":
    "A skirt reaching the ankles or floor in a flowing, lightweight fabric - chiffon, cotton, linen, viscose - often tiered, gathered or full, moving freely. Check it's a skirt: a waistband at the top, no straps or bodice.",
  "Fitted maxi skirt":
    "An ankle-length skirt that skims the body closely - bias-cut satin slip skirts, ribbed or jersey knit maxi skirts, column skirts. Narrow rather than full, often with a slit. Check it's a skirt: a waistband at the top, no straps or bodice (a backless or strappy top laid flat is not a skirt).",
  "Smart skirt":
    "A tailored skirt for work or smart occasions: pencil skirts, A-line suiting skirts, skirts in suiting wool, crepe or structured fabric, usually knee to just below the knee, with darts, a zip and a neat waistband.",
  "Midi-skirt":
    "A skirt ending between the knee and the ankle - typically mid-calf - in any non-tailored style: A-line, pleated, slip, wrap or tiered midi skirts. A tailored work skirt is Smart skirt; ankle-length is a maxi skirt.",
  "Cropped jeans":
    "Jeans whose legs end above the ankle (mid-calf to just above the ankle bone), often with a raw or frayed hem - culotte jeans, straight cropped jeans. The shortened length is the defining feature, whatever the cut.",
  "Flared jeans":
    "Jeans fitted through the hip and thigh that widen from the knee down to a clearly flared, dramatic hem - 70s-style flares. A subtle flare just wide enough to sit over a boot is Bootcut jeans. Jeans that are wide all the way from the hip are Wide leg jeans.",
  "Wide leg jeans":
    "Jeans that are wide from the hip all the way down, with a wide, straight-falling leg and a neat, defined waist - palazzo and wide straight jeans. Not tight at the thigh. Very loose, slouchy streetwear jeans are Baggy jeans; a leg that curves out at the knee and back in at the ankle is Barrel jeans.",
  "Straight leg jeans":
    "Jeans with a straight leg the same width from knee to ankle - neither tight like skinny, nor flared, wide or slouchy. Any rise (high, mid or low). The everyday classic cut; use it when nothing else about the cut stands out.",
  "Mom jeans":
    "High-rise jeans, roomy through the hip and thigh, that taper to a narrower ankle - a relaxed, 80s/90s look, usually rigid non-stretch denim. Looser and more slouchy than this is Boyfriend jeans.",
  "Skinny jeans":
    "Tight, stretchy jeans that hug the leg all the way down to a narrow ankle - jeggings included.",
  "Boyfriend jeans":
    "Relaxed, slouchy jeans with a loose fit through the hip and leg and a slightly tapered or straight leg - often worn rolled at the ankle, sometimes distressed. Looser than straight jeans but not wide. High-rise and tapered is Mom jeans.",
  "Baggy jeans":
    "Very loose, oversized jeans that hang off the body with lots of extra fabric through the whole leg, often pooling at the ankle - skater and 90s streetwear styles. Wider and slouchier than Wide leg jeans.",
  "Bootcut jeans":
    "Jeans fitted through the thigh with a slight flare from the knee, just wide enough to sit over a boot. Subtler than Flared jeans.",
  "Barrel jeans":
    "Jeans with a curved, rounded leg - roomy at the knee and tapering in again at the ankle, like a barrel or horseshoe shape, often with seams that twist to the front.",
  "Cropped trousers":
    "Non-denim trousers ending above the ankle (mid-calf to ankle) - capris, culottes, cropped chinos or cropped tailored trousers. The shortened length is the defining feature.",
  "Leather trousers":
    "Trousers made of leather or faux leather (PU/pleather) - shiny or matte with a leather surface, any cut.",
  "Floaty trousers":
    "Soft, wide trousers in a flowing, lightweight fabric - viscose, crepe, chiffon, satin, jersey - that drape and move, often with an elasticated or tie waist. Relaxed rather than tailored (no sharp crease or structured waistband).",
  "Tailored wide leg trousers":
    "Wide-leg trousers in suiting fabric (wool, crepe, twill, linen suiting) with a structured waistband, pressed crease or pleats at the front - smart, office-ready palazzo or wide trousers.",
  "Flared trousers":
    "Non-denim trousers fitted through the hip and thigh that flare out from the knee - kick-flares and bootcut trousers in suiting, jersey, velvet or crepe.",
  "Tailored trousers":
    "Straight, slim or cigarette-leg trousers in suiting fabric with a structured waistband, belt loops or a pressed crease - suit trousers and smart work trousers. Wide tailored trousers are Tailored wide leg trousers; thick, warm wool or tweed trousers are Wool trousers.",
  "Wool trousers":
    "Warm trousers in a thick wool, wool-mix, tweed or flannel - heavier and more textured than ordinary suit trousers, made for cold weather. Any cut.",
  "Cargo pants":
    "Utility trousers with large patch pockets on the thighs (cargo pockets), usually cotton twill or nylon, often with drawstring or cuffed hems and a relaxed fit.",
  "Linen pants":
    "Trousers in linen or a linen blend - visibly textured, airy fabric that creases easily, usually relaxed with an elasticated, drawstring or simple waistband. Any trousers whose fabric clearly reads as linen go here.",
  "Leggings":
    "Skin-tight stretch trousers with no fly or pockets on the front, in jersey, ribbed knit or sports fabric - including gym leggings and flared yoga leggings.",
  "Sweatpants":
    "Casual trousers in sweatshirt or jersey fabric - joggers and tracksuit bottoms, usually with an elasticated or drawstring waist and often cuffed ankles.",
  "Ski/snow pants":
    "Padded, waterproof trousers for snow and skiing - salopettes and ski trousers in nylon or shell fabric, often with braces, reinforced hems and snow gaiters inside the leg.",
  "Fancy Shorts":
    "Dressy shorts for smart or evening wear: tailored suiting shorts, satin, silk, sequin, velvet or leather shorts.",
  "Casual shorts":
    "Everyday shorts in cotton, jersey or similar soft fabric - sweat shorts, cotton chino-style shorts, pull-on shorts. Not denim, linen, cargo or dressy.",
  "Denim shorts":
    "Shorts made of denim - cut-offs, mom shorts, Bermuda denim shorts, often with frayed or turned-up hems.",
  "Linen shorts":
    "Shorts in linen or a linen blend - textured, airy fabric that creases easily, often with an elasticated or drawstring waist.",
  "Cargo shorts":
    "Utility shorts with large patch pockets on the sides of the legs, usually cotton twill.",
  "Jumpsuit":
    "A one-piece garment combining a top and full-length trousers - any sleeve style. Look for trouser legs joined to a bodice.",
  "Playsuit":
    "A one-piece garment combining a top and shorts - any sleeve style, often summery. Look for short legs joined to a bodice.",
  "Overalls":
    "Dungarees: trousers or shorts with a bib front and shoulder straps, usually denim, cord or cotton twill, often with buckles and a bib pocket.",
  "Strappy summer dress":
    "A light, casual summer dress held up by thin spaghetti or strappy shoulder straps - cotton, linen, broderie, viscose or light jersey; sundresses and slip-style day dresses, mini to midi. For hot weather, not evening wear. Ankle-length is Maxi dress.",
  "Summer dress":
    "A light, casual summer dress with sleeves (short, puffed, flutter) or wide shoulder straps - cotton, linen, viscose, broderie or floral prints, mini to midi. Breezy and daytime. Thin spaghetti straps make it a Strappy summer dress; ankle-length is Maxi dress.",
  "Maxi dress":
    "A dress reaching the ankles or the floor that isn't a formal gown - strappy, halter, strapless, sleeved or tiered, in cotton, linen, viscose, jersey, satin or prints. A maxi dress is always a dress, never a maxi skirt: if there's a bodice, straps, a halter or a neckline above the long skirt, it's this. A black-tie gown is Evening dress.",
  "Buttondown dress":
    "A dress that fastens with buttons all the way (or most of the way) down the front but has no shirt collar - often a summery tea dress or a button-through pinafore style. With a shirt collar it's Shirt dress.",
  "Shirt dress":
    "A dress cut like a long shirt: a shirt collar, button placket and usually cuffed sleeves, reaching mid-thigh or longer and meant to be worn on its own, often with a belt or waist tie. Laid flat, an ordinary shirt can look long: a shirt that ends around the hips is a Buttondown shirt, not a dress.",
  "Wedding guest dress":
    "A dressy dress for daytime celebrations like weddings, christenings and garden parties - midi or maxi, in silk, satin, chiffon or crepe, often floral or a bright, elegant colour, with refined details. Smarter than a summer dress but not a black-tie gown.",
  "Evening dress":
    "A formal gown for black-tie and evening events - floor-length or very long, in satin, silk, velvet, sequins or chiffon, with an elegant, dramatic silhouette.",
  "Cocktail dress":
    "A dressy evening dress for parties and smart nights out - short to midi length, often fitted, in satin, velvet, sequins or with embellishment. Glamorous but shorter and less formal than an evening gown.",
  "Winter dress":
    "A dress made for cold weather: knitted jumper dresses, wool or tweed pinafores, corduroy, velvet day dresses or long-sleeved dresses in heavy fabric.",
  "Casual dress":
    "An everyday dress in soft, simple fabric - jersey, t-shirt cotton, sweatshirt or simple knit, e.g. t-shirt dresses, bodycon jersey dresses, simple slip-on day dresses. Not specifically summery, smart or dressy.",
  "Work dress":
    "A smart, tailored dress for the office - shift, sheath or wrap dresses in suiting, crepe or structured jersey, usually knee to midi length with a neat, professional cut.",
  "Tailored blazer":
    "A structured, suit-style jacket ending around the hip, with lapels, padded or defined shoulders and button fastening - in suiting wool, crepe, tweed or linen.",
  "Longline blazer":
    "A blazer with lapels and a tailored shape that reaches the upper or mid-thigh - longer than a standard hip-length blazer, sometimes worn like a light coat.",
  "Poncho":
    "A sleeveless outer layer with an opening for the head, draping over the shoulders and arms - often knitted or woven, sometimes with fringing. A cape counts too.",
  "Duffle coat":
    "A mid-length wool coat, often hooded, fastening with toggles (wooden or horn pegs) and rope or leather loops.",
  "Rain coat":
    "A waterproof or showerproof coat or jacket made to keep rain off - coated, rubberised or technical nylon fabric, often hooded, sometimes a mac or anorak. A belted gabardine trench is Classic trench.",
  "Classic trench":
    "A trench coat in cotton gabardine or similar woven fabric - double-breasted front, wide lapels, belted waist, often epaulettes and a storm flap - usually knee-length, in beige, camel, khaki, navy or black. A leather or faux-leather trench is Long leather coat.",
  "Long leather coat":
    "A long coat (thigh to knee or below) made of leather or faux leather, including leather trench coats.",
  "Fur coat":
    "A coat made of real or faux fur - shaggy, plush or fluffy all over.",
  "Puffer coat":
    "A padded, quilted coat or jacket filled with down or synthetic fill, with visible stitched baffles - any length, thick and puffy. A thin, light one that packs down small is Lightweight down jacket; a sleeveless padded one is Gilet.",
  "Lightweight down jacket":
    "A thin, light quilted jacket with down or synthetic fill - flat, narrow baffles, packable, hip length or shorter. Much slimmer than a Puffer coat; sleeveless is Gilet.",
  "Wool coat":
    "A smart coat in wool or a wool blend (melton, cashmere-wool) - single or double-breasted overcoats, peacoats and wrap coats, usually knee or thigh length. Duffle coats with toggles have their own type.",
  "Parka":
    "A hooded, insulated utility coat to the hip or thigh - often khaki or navy, with a fur-trimmed or lined hood, drawstring waist and large pockets.",
  "Spring coat":
    "A light, unlined or lightly lined coat for mild weather - unpadded cotton, twill or light wool-mix coats, car coats and lightweight macs that aren't a classic trench or a waterproof rain coat.",
  "Cropped jacket":
    "A short jacket ending at or above the waist that isn't denim, leather or a bomber - e.g. a cropped tweed or bouclé jacket, a cropped utility or cord jacket. A tiny cover-up that ends above the bust or ribs is Bolero.",
  "Bolero":
    "A very short cover-up that ends above the waist, often just covering the shoulders and upper arms - knitted shrugs, lace or satin evening boleros and cropped open-front jackets worn over dresses and strappy tops. Usually no fastening.",
  "Bomber":
    "A short jacket gathered at the waist with ribbed knit cuffs, hem and often collar - satin, nylon, suede or wool; a zip front.",
  "Denim jacket":
    "A jacket made of denim - the classic trucker jacket with chest pockets and buttons, or longer and oversized denim jackets. A thin denim shirt is Denim shirt.",
  "Fleece":
    "A jacket or zip-up made of fleece - soft, fuzzy polyester pile, sometimes teddy or sherpa fleece.",
  "Leather jacket":
    "A hip-length or shorter jacket in leather, faux leather or suede - biker, racer, aviator or suede jackets. Thigh length or longer is Long leather coat.",
  "Shacket":
    "A shirt-jacket: a heavy overshirt worn as a light jacket - thick wool, flannel, cord or quilted fabric with a collar, button front and usually chest pockets.",
  "Knit coat":
    "A long knitted layer worn as a coat - a thigh- or knee-length chunky or longline cardigan, or a knitted coat. Shorter, everyday cardigans are tops.",
  "Gilet":
    "A sleeveless outer layer - padded/quilted, fleece, shearling or knitted gilets and body warmers.",
  "Turtleneck":
    "Any top with a high, folded or funnel neck - knitted or jersey.",
  "Slim jeans":
    "Jeans cut close to the leg from thigh to ankle but not skin-tight - slim and skinny fits.",
  "Tapered jeans":
    "Jeans with room at the thigh that narrow steadily to a slim ankle - a slim-tapered or carrot fit. Roomier at the top than Slim jeans.",
  "Relaxed jeans":
    "Loose, roomy jeans through the seat, thigh and leg - relaxed, loose, baggy and skate fits.",
  "Chinos":
    "Smart-casual cotton twill trousers with slanted front pockets and a neat, flat front - beige, navy, olive or stone.",
  "Shorts":
    "Everyday shorts that aren't denim, linen, cargo or skate shorts - chino shorts, sweat shorts, swim-style shorts.",
  "Skater shorts":
    "Loose, long casual shorts reaching the knee or below, often baggy with a relaxed waist.",
  "Romper":
    "A one-piece garment combining a top and shorts.",
};

// Occasion tags (shared/occasionTags.json): the setting, pieces that
// typically fit and pieces that explicitly don't.
const OCCASION_DEFINITIONS = {
  "Comfy casual": {
    setting: "Everyday life where comfort comes first: a slow weekend, a walk, popping to the shops or to see family. Soft, easy and relaxed - nothing that needs keeping neat.",
    fits: "a sweatshirt, a slouchy jumper, a plain t-shirt or vest, relaxed jeans, joggers, leggings, a jersey dress, a fleece",
    doesntFit: "anything tailored or structured, satin, silk or sequins, a smart blouse, a blazer, heels, an evening or occasion dress",
  },
  "Elevated everyday": {
    setting: "An ordinary day where you want to look pulled-together: a day in town, coffee with a friend, browsing shops. Neat, considered and intentional, but not dressed up for an event.",
    fits: "a crisp shirt, a fine-knit jumper, smart jeans, tailored trousers, a neat midi skirt, a simple day dress, a trench coat",
    doesntFit: "gym wear, joggers, a worn-in hoodie, loungewear, sequins, an evening gown, anything you'd only wear to a party",
  },
  "Smart casual": {
    setting: "A step up from everyday for an occasion: meeting people you want to impress, a nice lunch, an exhibition opening, a smart-casual dress code. Polished and well thought-out.",
    fits: "a blouse, a fine-knit, a crisp shirt, tailored trousers, smart dark jeans, a midi skirt, a blazer, a smart dress",
    doesntFit: "joggers, leggings, hoodies, gym wear, graphic or slogan t-shirts, distressed jeans, beachwear, a black-tie gown",
  },
  "Errands": {
    setting: "Practical daytime jobs - the supermarket, the post office, appointments, the school run - in and out of shops and the car, carrying things.",
    fits: "jeans, a t-shirt or long-sleeve top, a jumper or sweatshirt, joggers, leggings, a casual dress, a casual jacket",
    doesntFit: "evening wear, sequins, satin, a cocktail or occasion dress, very formal tailoring, anything delicate or high-maintenance",
  },
  "Work from home": {
    setting: "A working day at home, sometimes on video calls: comfortable enough to sit in all day, presentable from the waist up.",
    fits: "a fine-knit or cosy jumper, a plain top or shirt, a cardigan, leggings, joggers, comfortable trousers or jeans",
    doesntFit: "evening wear, sequins, anything stiff or uncomfortable to sit in, coats, beachwear, very revealing tops",
  },
  "Business casual": {
    setting: "A typical office without a suit requirement: professional and tidy but relaxed - meetings, desk days, client-facing days.",
    fits: "a blouse, a shirt, a fine-knit, tailored trousers, chinos, a smart skirt, a work dress, a blazer, smart dark jeans",
    doesntFit: "hoodies, sweatpants, leggings, gym wear, graphic t-shirts, crop tops, strappy or very revealing tops, shorts, beachwear, sequins",
  },
  "Formal office": {
    setting: "A workplace where a suit or business-formal dress is expected every day - law, finance, formal client meetings, interviews.",
    fits: "a tailored blazer, suit trousers, a crisp buttondown shirt, a fine-knit, a smart skirt, a tailored work dress",
    doesntFit: "jeans, any casual top, knitwear that isn't fine, floaty or boho pieces, prints and patterns that aren't subtle, anything casual",
  },
  "Brunch / lunch": {
    setting: "A daytime meal out with friends, family or a date, at a café or restaurant - relaxed but put-together.",
    fits: "a nice top or blouse, a knit, jeans, smart trousers, a midi or mini skirt, a summer or day dress, a light jacket",
    doesntFit: "gym wear, loungewear, joggers, worn-in hoodies, sequins or evening wear, formal suiting, heavy outdoor gear",
  },
  "Day out": {
    setting: "A full day of sightseeing, galleries, a picnic or a long walk somewhere new - on your feet for hours, partly outdoors.",
    fits: "jeans, comfortable trousers, a t-shirt, a knit, a casual or summer dress, a light jacket or trench, comfortable layers",
    doesntFit: "evening wear, sequins, satin, delicate occasion pieces, very formal tailoring, anything you can't walk comfortably in",
  },
  "Garden party / daytime event": {
    setting: "A dressy daytime celebration - a garden party, christening, daytime wedding reception, races - pretty and elegant, often outdoors.",
    fits: "a floaty or occasion dress, a smart midi skirt, a pretty or fancy blouse, tailored trousers, a light blazer",
    doesntFit: "jeans, t-shirts, hoodies, joggers, leggings, gym wear, casual shorts, heavy winter coats, going-out sequins",
  },
  "Casual dinner": {
    setting: "An easy evening meal out - a local restaurant, a pub, a pizza place - relaxed with no real dress code.",
    fits: "jeans, a nice top, a knit, a casual dress, smart-casual trousers, a casual jacket",
    doesntFit: "gym wear, loungewear, beachwear, black-tie or evening gowns, formal suiting",
  },
  "Restaurant dinner": {
    setting: "A nicer restaurant in the evening where people make an effort - a booked table, a celebration meal.",
    fits: "a fancy blouse or top, a smart knit, tailored or wide-leg trousers, smart jeans, a midi skirt, a cocktail or smart dress, a blazer",
    doesntFit: "hoodies, sweatpants, leggings, gym wear, basic t-shirts, casual shorts, beachwear, outdoor gear",
  },
  "Date night": {
    setting: "An evening date - dinner, drinks or a show - wanting to look appealing, confident and a little dressed up.",
    fits: "a fancy or party top, a nice blouse, a fitted or slip dress, a cocktail dress, smart jeans, a mini or midi skirt, a leather jacket",
    doesntFit: "joggers, gym wear, loungewear, baggy hoodies, practical outdoor gear, frumpy or very formal office tailoring",
  },
  "Drinks / night out": {
    setting: "Bars, cocktail bars and clubs, going out late - lively and sociable, often standing or dancing.",
    fits: "a party or going-out top, a strappy or halter top, a mini skirt, leather trousers, a slip or cocktail dress, smart jeans",
    doesntFit: "gym wear, loungewear, joggers, outdoor gear, frumpy knitwear, formal office suiting, daytime-only pieces like a twee tea dress",
  },
  "Gig / concert": {
    setting: "A live music venue or concert - standing, moving and dancing in a warm, packed crowd.",
    fits: "a t-shirt (graphic tees included), a vest or tank, jeans, a leather or denim jacket, a casual dress, shorts in summer",
    doesntFit: "formal or delicate occasion wear, long gowns, heavy coats indoors, anything that can't handle a crowd",
  },
  "Party": {
    setting: "A birthday, house party or celebration with friends - social, playful and usually in the evening.",
    fits: "a party or fancy top, a playful or bright dress, a mini skirt, satin, sequins, smart jeans",
    doesntFit: "gym wear, loungewear, joggers, practical outdoor gear, office-only tailoring, plain basics on their own",
  },
  "Cocktail party": {
    setting: "An evening event with a cocktail or smart-dressy code - receptions, launches, evening work events. Sleek and glamorous.",
    fits: "a cocktail dress, a sleek satin top or slip, tailored trousers, a smart skirt, a blazer, sequins or metallics",
    doesntFit: "jeans, t-shirts, hoodies, knitwear that isn't fine, casual dresses, shorts, beachwear, anything casual or sporty",
  },
  "Festive party": {
    setting: "A Christmas, New Year's or seasonal party - celebratory, a little extra, rich and sparkly.",
    fits: "velvet, sequins, metallic or party tops, a cocktail dress, satin, deep jewel-coloured pieces, smart tailoring",
    doesntFit: "summer pieces (linen, strappy sundresses, shorts), beachwear, gym wear, loungewear, plain everyday basics",
  },
  "Wedding guest": {
    setting: "Attending a wedding as a guest - ceremony and reception, dressed up, celebratory and respectful.",
    fits: "a wedding guest or occasion dress, a cocktail dress, a smart jumpsuit, a fancy blouse with a smart skirt or trousers, a tailored suit or blazer",
    doesntFit: "jeans, t-shirts, hoodies, casual dresses, shorts, gym wear, anything white or bridal-looking, very revealing party wear",
  },
  "Formal / black tie": {
    setting: "Galas, balls, black-tie dinners - the dressiest occasions with a strict formal code.",
    fits: "an evening gown, a formal floor-length dress, satin or sequin formal pieces, formal tailored trousers worn with a blazer",
    doesntFit: "anything casual or everyday - jeans, t-shirts, knitwear, day dresses, short casual skirts, outdoor gear",
  },
  "Travel day": {
    setting: "A day of travelling - planes, trains, long car journeys and airports - sitting for hours, practical and easy to layer.",
    fits: "joggers, leggings, comfortable jeans, a t-shirt, a sweatshirt or cosy knit, a cardigan, a casual jacket",
    doesntFit: "anything restrictive or delicate, evening wear, sequins, stiff tailoring, short tight skirts, heavy embellishment",
  },
  "City break": {
    setting: "A trip to a city: walking all day between sights, cafés and shops, then dinner out in the evening.",
    fits: "jeans, smart trousers, a nice top or knit, a day dress, a trench or light jacket, versatile pieces that go from day to dinner",
    doesntFit: "gym wear, beachwear, black-tie wear, heavy hiking gear, anything you couldn't walk miles in",
  },
  "Beach / pool": {
    setting: "The beach, a pool or a lido on a hot day - sun, sand and water nearby.",
    fits: "a strappy or summer dress, a vest, a crop top, linen pieces, shorts (denim, linen, casual), a kaftan or cover-up",
    doesntFit: "jeans in heavy denim, tailoring, knitwear, coats, wool, velvet, leather, anything formal or warm",
  },
  "Festival": {
    setting: "An outdoor music festival - days in a field, crowds, dancing, mud and changing weather.",
    fits: "denim shorts, a vest or crop top, a t-shirt, a boho blouse or summer dress, a denim or rain jacket, practical layers",
    doesntFit: "formal or occasion wear, delicate fabrics, tailored office pieces, long gowns, anything precious",
  },
  "Gym / sport": {
    setting: "Exercising - the gym, a class, running, sport or yoga.",
    fits: "leggings, sports shorts, a vest or tank, a sports t-shirt or top, joggers, a hoodie or sweatshirt for warming up",
    doesntFit: "jeans, anything tailored, woven or smart, dresses, skirts, knitwear, anything that doesn't stretch or handle sweat",
  },
  "Outdoor / hiking": {
    setting: "Walks in nature, countryside rambles and hikes - uneven ground, mud, wind and changing weather.",
    fits: "a fleece, a rain coat or parka, a gilet, practical trousers or leggings, a t-shirt or long-sleeve top, a warm jumper",
    doesntFit: "dresses and skirts, tailoring, satin, sequins, delicate or light-coloured smart pieces, anything precious",
  },
  "Lounge / home": {
    setting: "Relaxing at home - sofa evenings, lazy weekends in, getting cosy.",
    fits: "joggers, leggings, sweatshirts, hoodies, soft t-shirts, cosy cardigans and jumpers, jersey dresses",
    doesntFit: "anything structured, tailored, smart or dressed up, coats and jackets, denim jackets, sequins",
  },
};

module.exports = { PATTERN_DEFINITIONS, SUBTYPE_DEFINITIONS, OCCASION_DEFINITIONS };
