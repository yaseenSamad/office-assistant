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

// const attendanceRoutes = require("./routes/attendance.routes");
// const leaveRoutes = require("./routes/leave.routes");
// const postRoutes = require("./routes/post.routes");

const app = express();
app.use(cors());
app.use(express.json());

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

// app.use("/api/attendance", attendanceRoutes);
// app.use("/api/leaves", leaveRoutes);
// app.use("/api/posts", postRoutes);

const PORT = process.env.PORT || 5000;

sequelize.sync({  }).then(() => {
  console.log("✅ Database synced");
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
