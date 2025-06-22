const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router
  .route("/current/:id")
  .get(usersController.handleFetchUserById)
  .put(usersController.handleUpdateUserById)
  .delete(usersController.handleDeleteUserById);

router
  .route("/")
  .get(usersController.handleFetchUser)
  .post(usersController.handleNewUser);

router.route("/login").post(usersController.handleLoginUser);
router.route("/logout").post(usersController.handleLogoutUser);
router.route("/session").get(usersController.handleLoggedUser);
router
  .route("/change-password/:id")
  .put(usersController.handleChangepasswordUser);

router.route("/assignee-for-rt").get(usersController.handleFetchRT);
router
  .route("/assignee-for-physician")
  .get(usersController.handleFetchPhysician);

module.exports = router;
