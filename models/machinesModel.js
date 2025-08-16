const database = require("../config/connection.js");
class Machine {
  constructor(name) {
    this.name = name;
  }
  static async findAll() {
    const query = `SELECT machines.id, machines.machine_name FROM machines`;
    const [rows, fields] = await database.execute(query);
    return rows;
  }
}
module.exports = Machine;
