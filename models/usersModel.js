const database = require("../config/connection.js");
const bcrypt = require("bcryptjs");

const Position = require("./positionsModel.js");

class User extends Position {
  constructor(
    positionId,
    username,
    password,
    employeeName,
    employeeNumber,
    emailAddress
  ) {
    super();
    this.positionId = positionId;
    this.username = username;
    this.password = password;
    this.employeeName = employeeName;
    this.employeeNumber = employeeNumber;
    this.emailAddress = emailAddress;
  }
  async save() {
    const [checkDuplicateRows] = await database.execute(
      `SELECT username, email_address FROM users WHERE username = ? OR email_address = ?`,
      [this.username, this.emailAddress]
    );
    const duplicateFields = {};
    checkDuplicateRows.forEach((row) => {
      if (row.username === this.username) {
        duplicateFields.username = "username is already exists";
      }
      if (row.email_address === this.emailAddress) {
        duplicateFields.emailAddress = "email address is already exists";
      }
    });

    if (Object.keys(duplicateFields).length > 0) {
      return {
        success: false,
        errorFields: duplicateFields,
      };
    }

    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);

    const [maxRows] = await database.execute(
      `SELECT MAX(id) AS max_id FROM users`
    );
    const newId = (maxRows[0].max_id || 0) + 1;

    const query = `
    INSERT INTO users (id, username, password, employee_name, employee_number, position_id, is_deleted, email_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const [rows] = await database.execute(query, [
      newId,
      this.username,
      this.password,
      this.employeeName,
      this.employeeNumber,
      this.positionId,
      0,
      this.emailAddress,
    ]);

    return { insertId: newId };
  }
  static async searchByUsername(username) {
    const query = `
    SELECT username, employee_name, email_address 
    FROM users 
    WHERE username = ?
  `;
    const [rows] = await database.execute(query, [username]);
    return rows;
  }
  static async viewById(id) {
    const targetId = await id;
    const query = `SELECT users.username,users.employee_name,users.employee_number, users.position_id, users.email_address, users.temp_key, users.is_deleted FROM users WHERE users.id=${targetId}`;
    const [rows, fields] = await database.execute(query);
    rows[0].position_name = await User.positionById(rows[0].position_id);
    return rows;
  }

  static async deleteById(id, data) {
    const targetId = await id;
    const inputData = await data;
    const query = `UPDATE users set users.is_deleted=${inputData.is_deleted}  WHERE users.id=${targetId}`;
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
    const duplicateFields = {};

    if (inputData.referenceUsername !== inputData.username) {
      const [rows] = await database.execute(
        `SELECT username FROM users WHERE username = ?`,
        [inputData.username]
      );
      if (rows.length > 0) {
        duplicateFields.username = "Username already exists";
      }
    }
    if (inputData.referenceEmailAddress !== inputData.emailAddress) {
      const [rows] = await database.execute(
        `SELECT email_address FROM users WHERE email_address = ?`,
        [inputData.emailAddress]
      );
      if (rows.length > 0) {
        duplicateFields.emailAddress = "Email address already exists";
      }
    }

    if (Object.keys(duplicateFields).length > 0) {
      return {
        success: false,
        errorFields: duplicateFields,
      };
    }

    const query = `UPDATE users set users.username='${inputData.username}', users.employee_name='${inputData.employeeName}',users.employee_number='${inputData.employeeNumber}', users.position_id='${inputData.positionId}', users.email_address='${inputData.emailAddress}'  WHERE users.id=${targetId}`;
    const [rows, fields] = await database.execute(query);
    return rows;
  }
  static async setupSecretKey(id, data) {
    const targetId = await id;
    const inputData = await data;
    const query = `UPDATE users set users.temp_key='${inputData.key}' WHERE users.username='${targetId}'`;
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
        users.email_address,
        users.is_deleted,
        users.temp_key,
        job_positions.type AS position_name
      FROM users
      JOIN job_positions ON users.position_id = job_positions.id
      ORDER BY users.date_created DESC
    `;

    const [rows, fields] = await database.execute(query);
    return rows;
  }

  static async findRT() {
    const query = `SELECT users.id, users.employee_name, users.employee_number FROM users WHERE users.position_id IN (2) AND users.is_deleted = FALSE`;
    const [rows, fields] = await database.execute(query);
    return rows;
  }
  static async findPhysician() {
    const query = `SELECT users.id, users.employee_name, users.employee_number FROM users WHERE users.position_id IN (3, 4) AND users.is_deleted = FALSE`;
    const [rows, fields] = await database.execute(query);
    return rows;
  }
  static async mobileAuth(data) {
    const inputData = await data;
    const query =
      "SELECT users.*, job_positions.type as position_name  FROM users LEFT JOIN job_positions ON users.position_id = job_positions.id WHERE users.username = ? AND users.position_id IN (2,5) AND users.is_deleted = FALSE";
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
    const query = `SELECT users.*, job_positions.type as position_name  FROM users LEFT JOIN job_positions ON users.position_id = job_positions.id WHERE users.username = '${inputData.username}' AND users.is_deleted = FALSE`;
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
  static async viewBySecretKey(secretkey, data) {
    const targetkey = secretkey;
    const inputData = data;

    if (!targetkey || typeof inputData?.password !== "string") {
      throw new Error("Invalid ID or password");
    }

    const query = `
    SELECT id, username, employee_name, employee_number,
           position_id, email_address, temp_key, is_deleted
    FROM users
    WHERE TRIM(temp_key) = ?`;

    const [rows] = await database.execute(query, [targetkey]);

    const salt = await bcrypt.genSalt();
    const encryptedPassword = await bcrypt.hash(inputData.password, salt);
    if ((await rows[0]?.temp_key) === targetkey) {
      const [updateResult] = await database.execute(
        "UPDATE users SET password = ?, temp_key = '' WHERE id = ?",
        [encryptedPassword, rows[0]?.id]
      );
      return updateResult;
    } else {
      return null;
    }
  }
}
module.exports = User;
