// require("dotenv").config();
// const express = require("express");
// const session = require("express-session");
// const MySQLStore = require("express-mysql-session")(session);
// const cors = require("cors");
// const app = express();
// const http = require("http");
// const WebSocket = require("ws");

// const pool = require("./config/connection");
// const sessionStore = new MySQLStore(
//   {
//     clearExpired: true,
//     checkExpirationInterval: 900000,
//     expiration: 1000 * 60 * 60 * 24 * 3,
//   },
//   pool
// );

// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:8100",
//   "https://localhost",
//   "capacitor://localhost",
//   "http://0.0.0.0",
//   "ionic://localhost",
//   "https://abgp-frontend-production.up.railway.app",
// ];

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: [
//       "Origin",
//       "X-Requested-With",
//       "Content-Type",
//       "Accept",
//       "Authorization",
//     ],
//   })
// );
// app.options("*", cors());
// //SESSION
// app.use(
//   session({
//     secret: process.env.NODE_APP_SECRET_KEY,
//     resave: false,
//     saveUninitialized: false,
//     store: sessionStore,
//     cookie: {
//       // secure: false,
//       // sameSite: "lax",
//       sameSite: "none",
//       secure: true,
//       httpOnly: true,
//       maxAge: 1000 * 60 * 60 * 24 * 3,
//     },
//   })
// );

// // API ROUTES
// // API routes
// app.use(
//   `/api/${process.env.NODE_APP_API_USERS}`,
//   require("./routes/usersRoutes")
// );
// app.use(
//   `/api/${process.env.NODE_APP_API_POSITIONS}`,
//   require("./routes/positionsRoutes")
// );
// app.use(
//   `/api/${process.env.NODE_APP_API_REQUESTS}`,
//   require("./routes/requestsRoutes")
// );
// app.use(
//   `/api/${process.env.NODE_APP_API_RESULTS}`,
//   require("./routes/resultsRoutes")
// );
// app.use(
//   `/api/${process.env.NODE_APP_API_EMAILS}`,
//   require("./routes/emailsRoutes")
// );

// app.use(
//   `/api/${process.env.NODE_APP_API_MACHINES}`,
//   require("./routes/machineRoutes")
// );
// // CHECKS IF RUNNING
// app.use((err, request, response, next) => {
//   console.error(err);
//   response.status(500).json({ status: "failed to run server API" });
// });

// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server, path: "/ws" });
// wss.on("connection", (ws) => {
//   console.log("🔌 WebSocket client connected");

//   ws.on("message", (msg) => {
//     console.log("Received:", msg.toString());
//     ws.send("Echo: " + msg);
//   });

//   ws.on("close", () => console.log("Client disconnected"));
// });
// const PORT = process.env.NODE_APP_SERVER_PORT || 3000;
// // SERVER WILL LISTEN TO
// server.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const cors = require("cors");
const app = express();

// APP ALLOWS WHICH ORIGIN, TYPE OF REQUESTS, ALLOWED TO SUBMIT E.G FORM-DATA, MEDIA TYPE ETC.
//
const pool = require("./config/connection");
const sessionStore = new MySQLStore(
  {
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 1000 * 60 * 60 * 24 * 3,
  },
  pool
);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8100",
  "https://localhost",
  "capacitor://localhost",
  "http://0.0.0.0",
  "ionic://localhost",
  "https://abgp-frontend-production.up.railway.app",
  "https://abgp-frontend.onrender.com",
  "https://eastavenueapptest.github.io/abgp-frontend",
  "https://eastavenueapptest.github.io",
  "https://script.google.com/macros/s/AKfycbz49BTqBw4hmCZUnLF4leWj2nUGel4_R7VzXMQ-zusc7Gi02Z1bEgeJKEe8VDxocbtf/exec",
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
  })
);

//SESSION
app.use(
  session({
    secret: process.env.NODE_APP_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      // secure: false,
      // sameSite: "lax",
      sameSite: "none",
      secure: true,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 3,
    },
  })
);

// API ROUTES
// API routes
app.use(
  `/api/${process.env.NODE_APP_API_USERS}`,
  require("./routes/usersRoutes")
);
app.use(
  `/api/${process.env.NODE_APP_API_POSITIONS}`,
  require("./routes/positionsRoutes")
);
app.use(
  `/api/${process.env.NODE_APP_API_REQUESTS}`,
  require("./routes/requestsRoutes")
);
app.use(
  `/api/${process.env.NODE_APP_API_RESULTS}`,
  require("./routes/resultsRoutes")
);
app.use(
  `/api/${process.env.NODE_APP_API_EMAILS}`,
  require("./routes/emailsRoutes")
);

app.use(
  `/api/${process.env.NODE_APP_API_MACHINES}`,
  require("./routes/machineRoutes")
);
// CHECKS IF RUNNING
app.use((error, request, response, next) => {
  console.error("Global error handler:", error.message);
  response.status(500).json({
    err: "Internal server error",
    details: error.message,
    code: error.code,
    command: error.command,
    response: error.response,
    responseCode: error.responseCode,
    stack: error.stack,
  });
});

// SERVER WILL LISTEN TO
app.listen(process.env.NODE_APP_SERVER_PORT || 3000, () =>
  console.log(`server running on PORT ${process.env.NODE_APP_SERVER_PORT}`)
);
