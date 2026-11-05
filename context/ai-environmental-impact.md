# AI photo analysis: environmental impact

The text below is live in Settings (web User -> Settings, mobile Profile ->
Settings); the app's copy, with its bold parts, is `AI_ABOUT_SECTIONS` in
`core/constants/aiAnalysis.js` - change it there.

AI is a tool, not a requirement.
These days, it feels like you can't even turn on your fridge without AI being forced down your throat. We use AI because it can make certain things easier, not because we think everything needs it.

Our aim is to help you make the most of the clothes you already own, and make more sustainable choices along the way. AI can help with that by making it quicker to add and organise your wardrobe. But how you use it is entirely up to you.

Don't want to use AI? That's absolutely fine.

You can opt out of AI analysis. You can add and manage your clothes yourself, without AI analysing your photos. 

Want to opt in? Well what does one AI analysis cost?
Whenever AI fills in the details of an item for you, we send one photo to Google's Gemini for analysis.

Google estimates that a typical Gemini request uses around:

0.24 Wh of electricity — roughly equivalent to running a TV for 9 seconds.
0.26 mL of water — approximately five drops, used for data-centre cooling.
What does that mean for your wardrobe?

For a 100-piece wardrobe, that's approximately:

24 Wh of electricity — about the same as running an LED bulb for two and a half hours.
26 mL of water — less than two tablespoons.

A little perspective
Making, wearing and washing a single pair of jeans uses an estimated 3,781 litres of water and produces 33.4 kg of CO₂e over its lifetime.

The water used for one pair of jeans would cover the AI analysis of approximately 145,000 wardrobes of 100 items each.

Ultimately, our mission is to help you buy less, wear more and get creative with what you already have.

Because the most sustainable item is always the one already in your wardrobe.

## The workings (not for the app)

| | One analysis | 100 items | One pair of jeans |
|---|---|---|---|
| Electricity | 0.24 Wh | 24 Wh | not used (see caveats) |
| Water | 0.26 mL | 26 mL | 3,781 L |
| Carbon | 0.03 g CO2e | 3 g CO2e | 33,400 g CO2e |

- Water: 3,781 L / 0.026 L per wardrobe is about 145,000 wardrobes.
- Carbon: 33,400 g / 3 g per wardrobe is about 11,000 wardrobes.
- Real-world equivalents: Google's paper compares 0.24 Wh to under 9
  seconds of TV, and 0.26 mL to about five drops. 24 Wh is a 10 W LED bulb
  for 2.4 hours. A UK tablespoon is 15 mL.

## Caveats to know before publishing

1. **The figure is for a typical text request, not ours.** Google's 0.24 Wh /
   0.26 mL is the *median Gemini Apps text prompt* (May 2025). Our call sends
   an image to `gemini-3.5-flash-lite` with LOW thinking, and sometimes
   retries once. An image request likely uses somewhat more, but Google
   publishes no per-image figure, so treat it as an estimate. That's why the
   app text says "a typical Gemini request". Google also notes the figures
   have not been independently verified.
2. **Google's water figure is disputed.** It counts only data-centre
   cooling water. Critics say that including the water used to generate the
   electricity gives estimates up to ~50 mL per request
   ([DatacenterDynamics](https://www.datacenterdynamics.com/en/news/google-median-gemini-prompt-uses-024-watt-hours-of-power-and-consumes-026ml-of-water/)).
   Even at 50 mL, 100 items is 5 L, and one pair of jeans still equals
   ~750 wardrobes.
3. **The jeans figure is the whole life cycle.** It includes the consumer
   washing them: fibre (mostly cotton) production is 68% of the water and
   consumer care 23%. Making alone is still around 2,900 L. It's one
   brand and one product (the 501), measured in 2015.
4. **No jeans energy figure.** I couldn't confirm the energy total in
   Levi's 2015 study, so the comparison uses water and carbon only.
5. **Not included:** background removal (Cloudinary), storing photos, and
   running our own server. Every photo gets background removal whether or
   not AI analysis is on, and Cloudinary publishes no per-image figures.

## Sources

- [Google Cloud blog: Measuring the environmental impact of AI inference](https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference)
  (Aug 2025, with the technical paper)
- [DatacenterDynamics: Google median Gemini prompt uses 0.24 Wh and 0.26 mL of water](https://www.datacenterdynamics.com/en/news/google-median-gemini-prompt-uses-024-watt-hours-of-power-and-consumes-026ml-of-water/)
  (coverage including the critics' view)
- [Levi Strauss & Co.: 3 Surprising Insights About Those 501 Jeans](https://www.levistrauss.com/2015/03/26/3-surprising-insights-about-those-501-jeans/)
  (2015 LCA summary: ~3,800 L, 68% fibre / 23% consumer care)
- [Levi Strauss & Co.: Full LCA Results Deck (2015)](https://stg.levistrauss.levis.com/wp-content/uploads/2015/03/Full-LCA-Results-Deck-FINAL.pdf)
  (3,781 L water, 33.4 kg CO2e)
