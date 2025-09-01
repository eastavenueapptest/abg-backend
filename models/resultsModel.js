const { getStatusLabel } = require("../utils/statusUtils.js");
const { getDateFormat } = require("../utils/dateUtils.js");

const database = require("../config/connection.js");

class Result {
  constructor(requestId, rtId, extractedText, machineId, isDetermined) {
    this.requestId = requestId;
    this.rtId = rtId;
    this.extractedText = extractedText;
    this.machineId = machineId;
    this.isDetermined = isDetermined;
  }

  async save() {
    const [maxRows] = await database.execute(
      `SELECT MAX(id) AS max_id FROM results`
    );
    const newId = (maxRows[0].max_id || 0) + 1;

    const insertQuery = `
    INSERT INTO results (id, request_id, extracted_text, machine_id, date_created, is_determined)
    VALUES (?, ?, ?, ?, ?, NOW())`;

    const updateQuery = `
    UPDATE medical_requests SET status = ?, rt_id = ? WHERE id = ?`;

    const [rows] = await database.execute(insertQuery, [
      newId,
      this.requestId,
      JSON.stringify(this.extractedText),
      this.machineId,
      this.isDetermined,
    ]);

    if (rows.affectedRows > 0) {
      await database.execute(updateQuery, [2, this.rtId, this.requestId]);
    }

    return rows;
  }

  static async deleteById(id) {
    const query = `DELETE FROM results WHERE id = ?`;

    const [rows, fields] = await database.execute(query, [id]);
    return rows[0];
  }

  static async updateById(id, data) {
    const query = `UPDATE results SET extracted_text = ? WHERE id = ?`;

    const [rows, fields] = await database.execute(query, [
      JSON.stringify(data.extractedText),
      id,
    ]);
    return rows;
  }

  static async updateByInterPreration(id, data) {
    const query = `UPDATE results SET interpreted_by = ?, interpreted_message = ? WHERE id = ?`;

    const [rows, fields] = await database.execute(query, [
      data?.interpreted_by,
      data?.interpreted_message,
      id,
    ]);
    return rows;
  }

  static async viewById(id) {
    const query = `SELECT results.request_id, results.extracted_text, medical_requests.patient_name
      FROM results
      LEFT JOIN medical_requests ON results.request_id = medical_requests.id
      WHERE results.id = ?`;

    const [rows, fields] = await database.execute(query, [id]);
    return rows[0]?.type;
  }

  static async findAll({ date = {}, sorting = "desc" } = {}) {
    let whereClause = "";
    const params = [];
    if (date.from && date.to) {
      const fromDate = date.from.length === 16 ? date.from + ":00" : date.from;
      const toDate = date.to.length === 16 ? date.to + ":00" : date.to;
      console.log({ fromDate, toDate });
      whereClause = "WHERE results.date_created BETWEEN ? AND ?";
      params.push(fromDate, toDate);
    }

    const sortDirection = sorting.toLowerCase() === "asc" ? "ASC" : "DESC";
    const query = `
    SELECT  
      results.id, 
      results.request_id,
      DATE_FORMAT(medical_requests.date_created, '%m/%d/%Y') AS medical_requests_date_created_formatted,
      TIME_FORMAT(medical_requests.date_created, '%h:%i %p') AS medical_requests_time_only,
      DATE_FORMAT(results.date_created, '%m/%d/%Y %h:%i %p') AS results_date_created_formatted,
      TIME_FORMAT(SEC_TO_TIME(TIMESTAMPDIFF(SECOND, medical_requests.date_created, results.date_created)), '%H:%i') AS turnaround_time_hh_mm,
      results.extracted_text, 
      results.interpreted_by,
      results.interpreted_message,        
      results.machine_id, 
      results.is_determined,
      medical_requests.patient_name,
      medical_requests.age,
      medical_requests.sex,
      medical_requests.fio2_route,
      medical_requests.status,
      medical_requests.diagnosis,
      machines.machine_name, 
      a.employee_name AS requestor,
      b.employee_name AS physician_doctor,
      c.employee_name AS respiratory_therapists
    FROM results 
    JOIN medical_requests ON results.request_id = medical_requests.id 
    JOIN users AS a ON medical_requests.requestor_id = a.id 
    JOIN users AS b ON medical_requests.physician_id = b.id 
    JOIN users AS c ON medical_requests.rt_id = c.id 
    JOIN machines ON results.machine_id = machines.id
    ${whereClause}
    ORDER BY medical_requests.date_created ${sortDirection}
  `;

    const [rows, fields] = await database.execute(query, params);

    const filteredRows = rows.map((item) => ({
      ...item,
      date_text: getDateFormat(item.date_created),
      status_text: getStatusLabel(item.status),
    }));

    return filteredRows;
  }

  static async viewResultFormById(id) {
    const query = `
      SELECT 
        results.id, 
        results.request_id, 
        results.extracted_text, 
        results.interpreted_by,
        results.interpreted_message,
        medical_requests.patient_name,
        medical_requests.age,
        medical_requests.sex,
        medical_requests.status,
        medical_requests.diagnosis, 
        a.employee_name AS requestor,
        b.employee_name AS physician_doctor,
        c.employee_name AS respiratory_therapists

      FROM results 
      JOIN medical_requests ON results.request_id = medical_requests.id 
      JOIN users AS a ON medical_requests.requestor_id = a.id 
      JOIN users AS b ON medical_requests.physician_id = b.id 
      JOIN users AS c ON medical_requests.rt_id = c.id 
      WHERE results.id = ?
      
      ORDER BY results.id DESC`;

    const [rows, fields] = await database.execute(query, [id]);
    return rows[0];
  }
}

module.exports = Result;
