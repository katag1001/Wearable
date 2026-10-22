const express = require("express");
const router = express.Router();
const allControllers = require("../controllers/allControllers");
const footwearControllers = require("../controllers/footwearControllers");
const cloudinaryControllers = require("../controllers/cloudinaryControllers");
const { authMiddleware } = require("../middleware/authMiddleware");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimits");

/* USER ROUTES */
router.post("/users/register", registerLimiter, allControllers.createItemregister);
router.post("/users/login", loginLimiter, allControllers.login);
router.post("/users/verify_token", allControllers.verify_token);
router.delete(
  "/users/delete",
  authMiddleware,
  allControllers.deleteUser
);


/* CLOTHING ROUTES */
router.post("/clothing/", authMiddleware, allControllers.createItem);
router.get("/clothing/", authMiddleware, allControllers.getAllItems);
// Must stay above /clothing/:id or "options" is read as an item id.
router.get("/clothing/options", authMiddleware, allControllers.getClothingFilterOptions);
router.get("/clothing/:id", authMiddleware, allControllers.getItemById);
router.put("/clothing/:id", authMiddleware, allControllers.updateItem);
router.delete("/clothing/:id", authMiddleware, allControllers.deleteItem);
/*router.get("/clothing/:type/:name", authMiddleware, allControllers.getItemByName);*/

/* FOOTWEAR ROUTES */
router.post("/footwear/", authMiddleware, footwearControllers.createFootwear);
router.get("/footwear/", authMiddleware, footwearControllers.getAllFootwear);
// Must stay above /footwear/:id or "options" / "today" are read as item ids.
router.get("/footwear/options", authMiddleware, footwearControllers.getFootwearFilterOptions);
router.get("/footwear/today", authMiddleware, footwearControllers.getTodayFootwear);
router.put("/footwear/pairings/reject", authMiddleware, footwearControllers.rejectFootwearPairing);
router.put("/footwear/:id/wear", authMiddleware, footwearControllers.wearFootwear);
router.put("/footwear/:id/unwear", authMiddleware, footwearControllers.unwearFootwear);
router.get("/footwear/:id", authMiddleware, footwearControllers.getFootwearById);
router.put("/footwear/:id", authMiddleware, footwearControllers.updateFootwear);
router.delete("/footwear/:id", authMiddleware, footwearControllers.deleteFootwear);

/* IMAGE ROUTES */
// Removes an uploaded image no item uses (after a failed save).
router.post("/cloudinary/delete", authMiddleware, cloudinaryControllers.deleteUnusedImage);

/* MATCH ROUTES */
router.post("/match/matches", authMiddleware, allControllers.createMatch);
/*router.post("/match/bulk", authMiddleware, allControllers.createMatchesBulk);*/
router.get("/match/", authMiddleware, allControllers.getAllMatches);
// Must stay above /match/:id or "options" is read as a match id.
router.get("/match/options", authMiddleware, allControllers.getMatchFilterOptions);
router.delete("/match/", authMiddleware, allControllers.deleteManyMatches);
router.get("/match/:id", authMiddleware, allControllers.getMatchById);
router.put("/match/:id", authMiddleware, allControllers.updateMatch);
router.put("/match/:id/reject", authMiddleware, allControllers.rejectMatch);
router.put("/match/:id/temperature-feedback", authMiddleware, allControllers.giveTemperatureFeedback);
router.put("/match/:id/tights-feedback", authMiddleware, allControllers.giveTightsFeedback);
router.post("/match/:id/mismatch", authMiddleware, allControllers.mismatchMatch);
router.delete("/match/:id", authMiddleware, allControllers.deleteMatch);

/* TODAY ROUTES */
router.post("/today/create", authMiddleware, allControllers.createToday);
router.get("/today/get", authMiddleware, allControllers.getToday);

/* PREFERENCES ROUTES */
router.get("/preferences", authMiddleware, allControllers.getPreferences);
router.put("/preferences", authMiddleware, allControllers.updatePreferences);

module.exports = router;