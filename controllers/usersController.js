const User = require("../models/usersModel");

exports.handleFetchUser = async (request, response, next) => {
  try {
    const { filters, sorting } = request.query;
    const data = await User.findAll({
      sorting: sorting,
      filters: filters,
    });
    response.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

exports.handleNewUser = async (request, response, next) => {
  try {
    const {
      username,
      password,
      employeeName,
      employeeNumber,
      positionId,
      emailAddress,
    } = request.body;

    const errorFields = {};

    if (!username) errorFields.username = "username is required";
    if (!password) errorFields.password = "password is required";
    if (!employeeName) errorFields.employeeName = "employee name is required";
    if (!employeeNumber)
      errorFields.employeeNumber = "employee number is required";
    if (!positionId) errorFields.positionId = "role is is required";
    if (!emailAddress) errorFields.emailAddress = "email address is required";

    if (Object.keys(errorFields).length > 0) {
      return response.status(400).json({
        message: "Some required fields are missing.",
        errorFields,
      });
    }

    const user = new User(
      positionId,
      username,
      password,
      employeeName,
      employeeNumber,
      emailAddress
    );

    const data = await user.save();

    if (!data.success && data.errorFields) {
      return response.status(400).json({
        message: "Duplicate fields found.",
        errorFields: data.errorFields,
      });
    }

    response.status(201).json(data);
  } catch (error) {
    console.error("Error creating user:", error);
    next(error);
  }
};

exports.handleFetchUserById = async (request, response, next) => {
  try {
    const { id } = request.params;
    const data = await User.viewById(id);
    response.status(201).json(data);
  } catch (error) {
    next(error);
  }
};
exports.handleUpdateUserById = async (request, response, next) => {
  try {
    const { id } = request.params;
    const { username, employeeName, employeeNumber, positionId, emailAddress } =
      request.body;
    const errorFields = {};

    if (!username) errorFields.username = "username is required";
    if (!employeeName) errorFields.employeeName = "employee name is required";
    if (!employeeNumber)
      errorFields.employeeNumber = "employee number is required";
    if (!positionId) errorFields.positionId = "role is is required";
    if (!emailAddress) errorFields.emailAddress = "email address is required";

    if (Object.keys(errorFields).length > 0) {
      return response.status(400).json({
        message: "Some required fields are missing.",
        errorFields,
      });
    }
    const referenceUser = await User.viewById(id);
    const newData = {
      positionId,
      username,
      employeeName,
      employeeNumber,
      emailAddress,
      referenceUsername: referenceUser[0]?.username,
      referenceEmailAddress: referenceUser[0]?.email_address,
    };
    const data = await User.updateById(id, newData);

    if (!data.success && data.errorFields) {
      return response.status(400).json({
        message: "Duplicate fields found.",
        errorFields: data.errorFields,
      });
    }

    response.status(201).json(data);
  } catch (error) {
    next(error);
  }
};
exports.handleDeleteUserById = async (request, response, next) => {
  try {
    const { id } = request.params;
    const { is_deleted } = request.body;
    const data = await User.deleteById(id, { is_deleted });
    response.status(201).json(data);
  } catch (error) {
    next(error);
  }
};
exports.handleFetchPosition = async (request, response, next) => {
  try {
    const { id } = request.params;
    const newData = request.body;
    const data = await User.changePasswordById(id, newData);
    response.status(201).json(data);
  } catch (error) {
    next(error);
  }
};
exports.handleChangepasswordUser = async (request, response, next) => {
  try {
    const { id } = request.params;
    const newData = request.body;
    const data = await User.changePasswordById(id, newData);
    response.status(201).json(data);
  } catch (error) {
    next(error);
  }
};
exports.handleLoggedUser = async (request, response, next) => {
  try {
    if (request.session) {
      response
        .status(200)
        .json({ all: request.session, user: request.session.user });
    } else {
      response.status(404).json({ message: "No user found in session" });
    }
  } catch (error) {
    response.status(500).json({ message: error.message });
    next(error);
  }
};
exports.handleLoginUser = async (request, response, next) => {
  try {
    let data;

    if (request.body.isMobile) {
      data = await User.mobileAuth({
        username: request.body.username,
        password: request.body.password,
      });
    } else {
      data = await User.auth({
        username: request.body.username,
        password: request.body.password,
      });
    }

    if (data) {
      request.session.user = data;

      request.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return response
            .status(500)
            .json({ message: "Failed to save session" });
        }
        response
          .status(201)
          .json({ message: "Login successful", data: request.session.user });
      });
    } else {
      response.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    response.status(500).json({ message: error.message });
    next(error);
  }
};
exports.handleLogoutUser = (request, response, next) => {
  try {
    request.session.destroy((err) => {
      if (err) {
        return response.status(500).json({ message: "Failed to log out" });
      }
      response.status(200).json({ message: "Logout successful" });
    });
  } catch (error) {
    response.status(500).json({ message: error.message });
    next(error);
  }
};
exports.handleFetchRT = async (request, response, next) => {
  try {
    const data = await User.findRT();
    response.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

exports.handleFetchPhysician = async (request, response, next) => {
  try {
    const data = await User.findPhysician();
    response.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
exports.handleResetNewPassword = async (request, response, next) => {
  try {
    const { secretkey, password } = request.body;
    const data = await User.viewBySecretKey(secretkey, { password });

    if (data?.changedRows === 1) {
      return response.status(201).json({ success: true });
    } else {
      return response.status(404).json({ error: "Record Not Found" });
    }
  } catch (error) {
    next(error);
  }
};
