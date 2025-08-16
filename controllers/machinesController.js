const Machine = require("../models/machinesModel");

exports.handleFetchMachine = async (request, response, next) => {
  try {
    const { filters, sorting } = request.query;
    const data = await Machine.findAll({
      sorting: sorting,
      filters: filters,
    });
    response.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
