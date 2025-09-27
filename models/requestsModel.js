const database = require("../config/connection.js");

class MedicalTest {
  constructor(
    patientName,
    age,
    sex,
    diagnosis,
    requestor,
    physician,
    fio2Route,
    ward
  ) {
    this.patientName = patientName;
    this.age = age;
    this.sex = sex;
    this.diagnosis = diagnosis;
    this.requestor = requestor;
    this.physician = physician;
    this.fio2Route = fio2Route;
    this.ward = ward;
  }
  async save() {
    const [maxRows] = await database.execute(
      `SELECT MAX(id) AS max_id FROM medical_requests`
    );
    const newId = (maxRows[0].max_id || 0) + 1;

    const query = `
    INSERT INTO medical_requests (
      id, patient_name, age, sex, diagnosis,
      requestor_id, physician_id, fio2_route,
      status, is_deleted, ward, date_created
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

    const values = [
      newId,
      this.patientName ?? null,
      this.age ?? null,
      this.sex ?? null,
      this.diagnosis ?? null,
      this.requestor ?? null,
      this.physician ?? null,
      this.fio2Route ?? null,
      1,
      0,
      this.ward ?? null,
    ];

    const [rows] = await database.execute(query, values);
    return { insertId: newId, ...rows };
  }

  static async viewById(id) {
    const targetId = await id;
    const query = `SELECT 
    medical_requests.patient_name, 
    medical_requests.age, 
    medical_requests.sex, 
    medical_requests.diagnosis, 
    medical_requests.requestor_id, 
    medical_requests.physician_id, 
    medical_requests.fio2_route,
    medical_requests.ward,  
    medical_requests.status,
    medical_requests.is_deleted 
    FROM medical_requests WHERE medical_requests.id=${targetId}`;
    const [rows, fields] = await database.execute(query);
    return rows;
  }
  static async deleteById(id) {
    const targetId = id;
    const query = `DELETE FROM medical_requests WHERE medical_requests.id=${targetId}`;
    const [rows, fields] = await database.execute(query);
    return rows;
  }

  static async updateById(id, data) {
    const targetId = await id;
    const inputData = await data;
    const query = `UPDATE medical_requests set 
    medical_requests.patient_name='${inputData.patientName}', 
    medical_requests.age='${inputData.age}',
    medical_requests.sex='${inputData.sex}', 
    medical_requests.diagnosis='${inputData.diagnosis}',
    medical_requests.physician_id='${inputData.physician}',
    medical_requests.fio2_route='${inputData.fio2Route}', 
    medical_requests.ward='${inputData.ward}' WHERE medical_requests.id=${targetId}`;
    const [rows, fields] = await database.execute(query);
    return rows;
  }

  static async deleteById(id, data) {
    const targetId = await id;
    const inputData = await data;
    const query = `UPDATE medical_requests set medical_requests.is_deleted=${inputData.is_deleted}  WHERE medical_requests.id=${targetId}`;
    const [rows, fields] = await database.execute(query);
    return rows;
  }

  static async findAll() {
    const query = `SELECT medical_requests.*,  DATE_FORMAT(medical_requests.date_created, '%m/%d/%Y') AS date_created_formatted FROM medical_requests ORDER BY medical_requests.date_created DESC`;
    const [rows, fields] = await database.execute(query);

    return rows;
  }

  static async updateStatusRequestById(id, data) {
    const targetId = await id;
    const inputData = await data;
    const query = `UPDATE medical_requests set 
    medical_requests.status='${inputData.status}'
    WHERE medical_requests.id=${targetId}`;

    const [rows, fields] = await database.execute(query);
    return rows;
  }

  static async countResult({ date = {} } = {}) {
    let whereClause = "";
    const params = [];
    if (date.from && date.to) {
      whereClause = "WHERE DATE(medical_requests.date_created) BETWEEN ? AND ?";
      params.push(date.from, date.to);
    }
    const query = ` SELECT * FROM medical_requests ${whereClause}`;
    const [rows, fields] = await database.execute(query, params);

    return rows;
  }
}
module.exports = MedicalTest;
