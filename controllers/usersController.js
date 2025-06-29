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
    const { username, password, employeeName, employeeNumber, positionId } =
      request.body;
    const user = new User(
      positionId,
      username,
      password,
      employeeName,
      employeeNumber
    );

    if (
      !username ||
      !password ||
      !employeeName ||
      !employeeNumber ||
      !positionId
    ) {
      return response.status(400).json({ message: "All fields are required." });
    }

    const data = await user.save();

    response.status(201).json(data);
    // response.send(request.body);
  } catch (error) {
    console.error("Error creating user:", error);
    next(error); // Pass the error to the error handler
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
    const incomingwData = request.body;
    const newData = {
      username: incomingwData.username,
      employeeName: incomingwData.employee_name,
      employeeNumber: incomingwData.employee_number,
      positionId: incomingwData.position_id,
    };
    const data = await User.updateById(id, newData);
    response.status(201).json(data);
  } catch (error) {
    next(error);
  }
};
exports.handleDeleteUserById = async (request, response, next) => {
  try {
    const { id } = request.params;
    const data = await User.deleteById(id);
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
exports.handleLoggedUser = async (request, response, next) => {
  try {
    console.log(request.session);
    response.status(200).json({ user: request.session.user });
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
