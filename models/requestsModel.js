const database = require("../config/connection.js");

class MedicalTest {
  constructor(
    patientName,
    age,
    sex,
    diagnosis,
    requestor,
    physician,
    fio2Route
  ) {
    this.patientName = patientName;
    this.age = age;
    this.sex = sex;
    this.diagnosis = diagnosis;
    this.requestor = requestor;
    this.physician = physician;
    this.fio2Route = fio2Route;
  }
  async save() {
    const [maxRows] = await database.execute(
      `SELECT MAX(id) AS max_id FROM requests`
    );
    const newId = (maxRows[0].max_id || 0) + 1;

    const query = `
    INSERT INTO requests (
      id, patient_name, age, sex, diagnosis,
      requestor_id, physician_id, fio2_route,
      status, date_created
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
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
      0,
    ];

    const [rows] = await database.execute(query, values);
    return { insertId: newId, ...rows };
  }

  static async viewById(id) {
    const targetId = await id;
    const query = `SELECT 
    requests.patient_name, 
    requests.age, 
    requests.sex, 
    requests.diagnosis, 
    requests.requestor_id, 
    requests.physician_id, 
    requests.fio2_route,  
    requests.status 
    FROM REQUESTS WHERE requests.id=${targetId}`;
    const [rows, fields] = await database.execute(query);
    return rows;
  }
  static async deleteById(id) {
    const targetId = id;
    const query = `DELETE FROM REQUESTS WHERE requests.id=${targetId}`;
    const [rows, fields] = await database.execute(query);
    return rows;
  }

  static async updateById(id, data) {
    const targetId = await id;
    const inputData = await data;
    const query = `UPDATE REQUESTS set 
    requests.patient_name='${inputData.patientName}', 
    requests.age='${inputData.age}',
    requests.sex='${inputData.sex}', 
    requests.diagnosis='${inputData.diagnosis}',
    requests.physician_id='${inputData.physician}',
    requests.fio2_route='${inputData.fio2Route}',
    requests.status='${inputData.status}'  WHERE requests.id=${targetId}`;
    const [rows, fields] = await database.execute(query);
    return rows;
  }
  static async findAll() {
    const query = `SELECT * FROM requests ORDER BY requests.date_created DESC`;
    const [rows, fields] = await database.execute(query);

    return rows;
  }
}
module.exports = MedicalTest;
