const database = require("../config/connection.js");
const bcrypt = require("bcrypt");
const Position = require("./positionsModel.js");

class User extends Position {
  constructor(positionId, username, password, employeeName, employeeNumber) {
    super();
    this.positionId = positionId;
    this.username = username;
    this.password = password;
    this.employeeName = employeeName;
    this.employeeNumber = employeeNumber;
  }
  async save() {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    const query = `INSERT INTO USERS(users.username, users.password, users.employee_name, users.employee_number,users.position_id) 
    VALUES('${this.username}','${this.password}', '${this.employeeName}', '${this.employeeNumber}', '${this.positionId}')`;
    const rows = await database.execute(query);
    return rows[0];
  }
  static async viewById(id) {
    const targetId = await id;
    const query = `SELECT users.username,users.employee_name,users.employee_number, users.position_id FROM users WHERE users.id=${targetId}`;
    const [rows, fields] = await database.execute(query);
    rows[0].position_name = await User.positionById(rows[0].position_id);
    return rows;
  }
  static async deleteById(id) {
    const targetId = id;
    const query = `DELETE FROM users WHERE users.id=${targetId}`;
    const [rows, fields] = await database.execute(query);
    return rows;
  }
  static async changePasswordById(id, data) {
    const targetId = await id;
    const inputData = await data;

    if (!targetId || typeof inputData?.password !== "string") {
      throw new Error("Invalid ID or password");
    }

    const salt = await bcrypt.genSalt();
    const encryptedPassword = await bcrypt.hash(inputData.password, salt);

    const [rows] = await database.execute(
      "SELECT password FROM users WHERE id = ?",
      [targetId]
    );

    if (rows.length === 1) {
      const [updateResult] = await database.execute(
        "UPDATE users SET password = ? WHERE id = ?",
        [encryptedPassword, targetId]
      );
      return updateResult;
    }

    return null;
  }
  static async updateById(id, data) {
    const targetId = await id;
    const inputData = await data;
    const query = `UPDATE users set users.username='${inputData.username}', users.employee_name='${inputData.employeeName}',users.employee_number='${inputData.employeeNumber}', users.position_id='${inputData.positionId}'  WHERE users.id=${targetId}`;
    const [rows, fields] = await database.execute(query);
    return rows;
  }
  static async usersPosition(id) {
    const targetId = await id;
    const result = await User.positionById(targetId);
    return result;
  }
  static async findAll() {
    const query = `
      SELECT 
        users.id,
        users.username,
        users.employee_name,
        users.employee_number,
        users.position_id,
        job_positions.type AS position_name
      FROM users
      JOIN job_positions ON users.position_id = job_positions.id
    `;

    const [rows, fields] = await database.execute(query);
    return rows;
  }

  static async findRT() {
    const query = `SELECT users.id, users.employee_name, users.employee_number FROM users WHERE users.position_id IN (2)`;
    const [rows, fields] = await database.execute(query);
    return rows;
  }
  static async findPhysician() {
    const query = `SELECT users.id, users.employee_name, users.employee_number FROM users WHERE users.position_id IN (3, 4)`;
    const [rows, fields] = await database.execute(query);
    return rows;
  }
  static async mobileAuth(data) {
    const inputData = await data;
    const query =
      "SELECT * FROM users WHERE users.username = ? AND users.position_id IN (2,5)";
    const [rows, fields] = await database.execute(query, [inputData.username]);
    const filteredRows = rows.filter((row) => !Buffer.isBuffer(row._buff));
    if (filteredRows.length === 0) {
      return false;
    }
    filteredRows.forEach((row) => {
      row.access = [
        {
          page: "dashboard",
          action: ["create", "read", "update", "delete"],
        },
        {
          page: "medical-records",
          sub: [
            {
              page: "scanned-result",
              action: ["create", "read", "update"],
            },
            {
              page: "abg-form",
              action: ["create", "read", "update"],
            },
          ],
        },
      ];
    });

    const isMatched = await bcrypt.compare(
      inputData.password,
      filteredRows[0].password
    );

    return isMatched ? filteredRows[0] : false;
  }
  static async auth(data) {
    const inputData = await data;
    const query = `SELECT * FROM users WHERE users.username = '${inputData.username}'`;
    const [rows, fields] = await database.execute(query);
    const filteredRows = rows.filter((row) => !Buffer.isBuffer(row._buff));

    rows.forEach((row) => {
      if (!Buffer.isBuffer(row._buff)) {
        const accessMap = {
          5: [
            {
              page: "dashboard",
              action: ["create", "read", "update", "delete"],
            },
            {
              page: "users",
              action: ["create", "read", "update", "delete"],
            },
            {
              page: "medical-records",
              sub: [
                {
                  page: "request",
                  action: ["create", "read", "update", "delete"],
                },
                {
                  page: "scanned-result",
                  action: ["create", "read", "update", "delete"],
                },
                {
                  page: "abg-form",
                  action: ["create", "read", "update", "delete"],
                },
              ],
            },
          ],
          1: [
            {
              page: "dashboard",
              action: ["create", "read", "update", "delete"],
            },
            {
              page: "medical-records",
              sub: [
                {
                  page: "request",
                  action: ["create", "read", "update", "delete"],
                },
                // {
                //   page: "scanned-result",
                //   action: ["create", "read", "update", "delete"],
                // },
                // {
                //   page: "abg-form",
                //   action: ["create", "read", "update", "delete"],
                // },
              ],
            },
          ],
          2: [
            {
              page: "dashboard",
              action: ["create", "read", "update", "delete"],
            },
            {
              page: "medical-records",
              sub: [
                // {
                //   page: "request",
                //   action: ["read"],
                // },
                {
                  page: "scanned-result",
                  action: ["create", "read", "update"],
                },
                {
                  page: "abg-form",
                  action: ["create", "read", "update"],
                },
              ],
            },
          ],
          3: [
            {
              page: "dashboard",
              action: ["create", "read", "update", "delete"],
            },
            {
              page: "medical-records",
              sub: [
                // {
                //   page: "request",
                //   action: ["read"],
                // },
                {
                  page: "abg-form",
                  action: ["create", "read", "update"],
                },
              ],
            },
          ],
          4: [
            {
              page: "dashboard",
              action: ["create", "read", "update", "delete"],
            },
            ,
            {
              page: "medical-records",
              sub: [
                // {
                //   page: "request",
                //   action: ["read"],
                // },
                {
                  page: "abg-form",
                  action: ["create", "read", "update"],
                },
              ],
            },
          ],
        };

        row.access = accessMap[row.position_id] || [];
      }
    });

    const isMatched = await bcrypt.compare(
      inputData.password,
      filteredRows[0].password
    );
    return isMatched ? filteredRows[0] : false;
  }
}
module.exports = User;
