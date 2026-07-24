const express = require("express");
const router = express.Router();
const allControllers = require("../controllers/allControllers");
const { authMiddleware } = require("../middleware/authMiddleware");

/* USER ROUTES */
router.post("/users/register", allControllers.createItemregister);
router.post("/users/login", allControllers.login);
router.post("/users/verify_token", allControllers.verify_token);

/* CLOTHING ROUTES */
router.post("/clothing/", authMiddleware, allControllers.createItem);
router.get("/clothing/", authMiddleware, allControllers.getAllItems);
router.get("/clothing/:id", authMiddleware, allControllers.getItemById);
router.put("/clothing/:id", authMiddleware, allControllers.updateItem);
router.delete("/clothing/:id", authMiddleware, allControllers.deleteItem);
router.get("/clothing/:type/:name", authMiddleware, allControllers.getItemByName);

/* MATCH ROUTES */
router.post("/match/matches", authMiddleware, allControllers.createMatch);
/*router.post("/match/bulk", authMiddleware, allControllers.createMatchesBulk);*/
router.get("/match/", authMiddleware, allControllers.getAllMatches);
router.get("/match/:id", authMiddleware, allControllers.getMatchById);
router.put("/match/:id", authMiddleware, allControllers.updateMatch);
router.delete("/match/:id", authMiddleware, allControllers.deleteMatch);

/* TODAY ROUTES */
router.post("/today/create", authMiddleware, allControllers.createToday);
router.get("/today/get", authMiddleware, allControllers.getToday);

module.exports = router;