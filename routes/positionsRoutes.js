const express = require("express");
const router = express.Router();
const positionsController = require("../controllers/positionsController");

// router
//   .route("/:id")
//   .get(positionsController.handleFetchPositionById)
//   .put(positionsController.handleUpdatePositionById)
//   .delete(positionsController.handleDeletePositionById);

router
  .route("/")
  .get(positionsController.handleFetchPosition)
  .post(positionsController.handleNewPosition);

module.exports = router;
