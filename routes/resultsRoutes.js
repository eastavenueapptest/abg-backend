const express = require("express");
const router = express.Router();
const resultsController = require("../controllers/resultsController");

router
  .route("/:id")
  .get(resultsController.handleFetchResultById)
  .put(resultsController.handleUpdateResultById)
  .delete(resultsController.handleDeleteResultById);

router
  .route("/view-medical-report-form/:id")
  .get(resultsController.handleFetchResultFormById);

router
  .route("/")
  .get(resultsController.handleFetchResult)
  .post(resultsController.handleNewResult);

module.exports = router;
