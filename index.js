#!/usr/bin/env node

require("dotenv").config();
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { sendGitReport } = require("./src/gitReport");

yargs(hideBin(process.argv))
  .command(
    "console [filename]",
    "Building...",
    (yargs) => {
      yargs.positional("filename", {
        describe: "CSV filename ie: ./csv/real-world-git-log.csv",
        default: "./csv/real-world-git-log.csv",
      });
    },
    (argv) => {
      if (argv.verbose) console.info(`Report from :${argv.filename}`);
      sendGitReport({ filename: argv.filename, channel: "console" });
    }
  )
  .option("help", {
    alias: "h",
    type: "boolean",
    description: "Show this help",
  })
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging",
  }).argv;

// sendGitReport({ filename: "./csv/real-world-git-log.csv" });
