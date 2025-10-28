const MedicalTest = require("../models/requestsModel");
const transporter = require("../utils/emailUtils");
require("dotenv").config();

exports.handleUpdateStatusRequest = async (request, response, next) => {
  try {
    const { id } = request.params;
    const incomingwData = request.body;
    const newData = {
      status: incomingwData.status,
    };
    const data = await MedicalTest.updateStatusRequestById(id, newData);
    response.status(201).json(data);
  } catch (error) {
    console.log("Error");
    next(error);
  }
};
exports.handleFetchMedicalTest = async (request, response, next) => {
  try {
    const { filters, sorting } = request.query;
    const data = await MedicalTest.findAll({
      sorting: sorting,
      filters: filters,
    });
    response.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
exports.handleDeleteMedicalTestById = async (request, response, next) => {
  try {
    const { id } = request.params;
    const { is_deleted } = request.body;
    const data = await MedicalTest.deleteById(id, { is_deleted });
    response.status(201).json(data);
  } catch (error) {
    next(error);
  }
};
exports.handleNewMedicalTest = async (request, response, next) => {
  try {
    const {
      patientName,
      age,
      sex,
      diagnosis,
      requestor,
      physician,
      fio2Route,
      ward,
    } = request.body;

    const errorFields = {};

    if (!patientName) errorFields.patientName = "patient name is required";
    if (!age) errorFields.age = "age is required";
    if (!sex) errorFields.sex = "sex is required";
    if (!diagnosis) errorFields.diagnosis = "diagnosis is required";
    if (!requestor) errorFields.requestor = "requestor is required";
    if (!physician) errorFields.requestor = "physician is required";
    if (!fio2Route) errorFields.fio2Route = "fio2Route is required";
    if (!ward) errorFields.ward = "ward is required";

    const inputs = new MedicalTest(
      patientName,
      age,
      sex,
      diagnosis,
      requestor,
      physician,
      fio2Route,
      ward
    );

    if (Object.keys(errorFields).length > 0) {
      return response.status(400).json({
        message: "Some required fields are missing.",
        errorFields,
      });
    }

    const data = await inputs.save();

    response.status(201).json(data);
  } catch (error) {
    console.error("Error creating user:", error);
    next(error);
  }
};
exports.handleFetchMedicalTestById = async (request, response, next) => {
  try {
    const { id } = request.params;
    const data = await MedicalTest.viewById(id);
    response.status(201).json(data);
  } catch (error) {
    console.log("Error");
    next(error);
  }
};
exports.handleUpdateMedicalTestById = async (request, response, next) => {
  try {
    const { id } = request.params;
    const incomingwData = request.body;
    const newData = {
      patientName: incomingwData.patient_name,
      sex: incomingwData.sex,
      diagnosis: incomingwData.diagnosis,
      age: incomingwData.age,
      physician: incomingwData.physician_id,
      fio2Route: incomingwData.fio2_route,
      ward: incomingwData.ward,
    };
    const data = await MedicalTest.updateById(id, newData);
    response.status(201).json(data);
  } catch (error) {
    console.log("Error");
    next(error);
  }
};

exports.handleCountRequest = async (request, response, next) => {
  try {
    const { from, to } = request.query;

    const data = await MedicalTest.countResult({
      date: {
        from,
        to,
      },
    });
    response.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
