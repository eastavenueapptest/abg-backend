const express = require("express");
const router = express.Router();
const requestsController = require("../controllers/requestsController");

router.route("/count-requests").get(requestsController.handleCountRequest);
router
  .route("/update-status/:id")
  .put(requestsController.handleUpdateStatusRequest);

router
  .route("/")
  .get(requestsController.handleFetchMedicalTest)
  .post(requestsController.handleNewMedicalTest);

router
  .route("/:id")
  .get(requestsController.handleFetchMedicalTestById)
  .put(requestsController.handleUpdateMedicalTestById)
  .delete(requestsController.handleDeleteMedicalTestById);

module.exports = router;
