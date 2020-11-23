require("dotenv").config();

const { sendGitReport } = require("./src/gitReport");

sendGitReport({ filename: "./csv/real-world-git-log.csv" });
