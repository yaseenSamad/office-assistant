const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const { sequelize } = require("./models");

const userRoutes = require("./routes/user.routes");
const authRoutes = require('./routes/auth.routes');
const teamRoutes = require('./routes/team.routes')
const policyRoutes = require('./routes/policy.routes')
const holidayRoutes = require("./routes/holiday.routes");
const postRoutes = require("./routes/post.routes");
const leaveRoutes = require("./routes/leave.routes")
const attendanceRoutes = require("./routes/attendance.routes")
const workExperienceRoutes = require("./routes/work_experience.routes");
const educationRoutes = require("./routes/education.routes");
const salaryRoutes = require("./routes/salary.routes");
const payrollRoutes = require("./routes/payroll.routes");

// const attendanceRoutes = require("./routes/attendance.routes");
// const leaveRoutes = require("./routes/leave.routes");
// const postRoutes = require("./routes/post.routes");

const app = express();

const allowedOrigins = [
  "http://localhost:4203",
  "https://yaseenmohamed.website",
  "https://api.yaseenmohamed.website"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    message: "Server is healthy",
    timestamp: new Date()
  });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// routes
app.use('/auth', authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams",teamRoutes)
app.use("/api/policies",policyRoutes)
app.use("/api/holidays", holidayRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/attendance",attendanceRoutes );
app.use("/api/work-experience", workExperienceRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/salaries", salaryRoutes);
app.use("/api/payroll", payrollRoutes);

// app.use("/api/attendance", attendanceRoutes);
// const leaveRoutes = require("./routes/leave.routes");
// const postRoutes = require("./routes/post.routes");

const PORT = process.env.PORT || 5004;

sequelize.authenticate().then(() => {
  console.log("✅ Database connected successfully");
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("❌ Unable to connect to the database:", err);
});
