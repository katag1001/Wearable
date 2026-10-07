const express = require("express");
const router = express.Router();
const allControllers = require("../controllers/allControllers");
const { authMiddleware } = require("../middleware/authMiddleware");

/* USER ROUTES */
router.post("/users/register", allControllers.createItemregister);
router.post("/users/login", allControllers.login);
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
router.delete("/match/:id", authMiddleware, allControllers.deleteMatch);

/* TODAY ROUTES */
router.post("/today/create", authMiddleware, allControllers.createToday);
router.get("/today/get", authMiddleware, allControllers.getToday);

/* PREFERENCES ROUTES */
router.get("/preferences", authMiddleware, allControllers.getPreferences);
router.put("/preferences", authMiddleware, allControllers.updatePreferences);

module.exports = router;