const database = require("../config/connection.js");
class Position {
  constructor(type) {
    this.type = type;
  }
  async save() {
    const query = `INSERT INTO job_positions(type) VALUES('${this.type}')`;
    const [rows, fields] = await database.execute(query);
    return rows;
  }
  static async positionById(id) {
    const targetId = await id;
    const query = `SELECT job_positions.type FROM job_positions WHERE id =${targetId}`;
    const [rows, fields] = await database.execute(query);
    return rows[0].type;
  }
  static async findAll() {
    const query = `SELECT job_positions.id, job_positions.type FROM job_positions WHERE id != 5`;
    const [rows, fields] = await database.execute(query);
    return rows;
  }
}
module.exports = Position;
