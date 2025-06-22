const { getStatusLabel } = require("../utils/statusUtils.js");
const { getDateFormat } = require("../utils/dateUtils.js");

const database = require("../config/connection.js");

class Result {
  constructor(requestId, rtId, extractedText) {
    this.requestId = requestId;
    this.rtId = rtId;
    this.extractedText = extractedText;
  }

  async save() {
    const insertQuery = `
    INSERT INTO results (request_id, extracted_text, date_created)
    VALUES (?, ?, NOW())`;

    const updateQuery = `
    UPDATE requests SET status = ?, rt_id = ? WHERE id = ?`;

    const [rows] = await database.execute(insertQuery, [
      this.requestId,
      JSON.stringify(this.extractedText),
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

  static async viewById(id) {
    const query = `SELECT results.request_id, results.extracted_text, requests.patient_name
      FROM results
      LEFT JOIN requests ON results.request_id = requests.id
      WHERE results.id = ?`;

    const [rows, fields] = await database.execute(query, [id]);
    return rows[0]?.type;
  }

  static async findAll() {
    const query = `
      SELECT
        results.id, 
        results.request_id, 
        results.date_created, 
        requests.patient_name,
        requests.status,
        requests.diagnosis, 
        a.employee_name AS requestor,
        b.employee_name AS physician_doctor
      FROM results 
      LEFT JOIN requests ON results.request_id = requests.id 
      LEFT JOIN users AS a ON requests.requestor_id = a.id 
      LEFT JOIN users AS b ON requests.physician_id = b.id`;

    const [rows, fields] = await database.execute(query);

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
        requests.patient_name,
        requests.age,
        requests.sex,
        requests.status,
        requests.diagnosis, 
        a.employee_name AS requestor,
        b.employee_name AS physician_doctor,
        c.employee_name AS respiratory_therapists

      FROM results 
      JOIN requests ON results.request_id = requests.id 
      JOIN users AS a ON requests.requestor_id = a.id 
      JOIN users AS b ON requests.physician_id = b.id 
      JOIN users AS c ON requests.rt_id = c.id 
      WHERE results.request_id = ?`;

    const [rows, fields] = await database.execute(query, [id]);
    return rows[0];
  }
}

module.exports = Result;
