const express = require("express");
const router = express.Router();
const requestsController = require("../controllers/requestsController");

router
  .route("/:id")
  .get(requestsController.handleFetchMedicalTestById)
  .put(requestsController.handleUpdateMedicalTestById)
  .delete(requestsController.handleDeleteMedicalTestById);

router
  .route("/")
  .get(requestsController.handleFetchMedicalTest)
  .post(requestsController.handleNewMedicalTest);

module.exports = router;
