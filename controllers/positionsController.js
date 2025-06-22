const Position = require("../models/positionsModel");

exports.handleNewPosition = async (request, response, next) => {
  try {
    const { type } = request.body;
    const position = new Position(type);

    const data = await position.save();
    response.status(201).json(data);
  } catch (error) {
    next(error);
  }
};
exports.handleFetchPosition = async (request, response, next) => {
  try {
    const { filters, sorting } = request.query;
    const data = await Position.findAll({
      sorting: sorting,
      filters: filters,
    });
    response.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
