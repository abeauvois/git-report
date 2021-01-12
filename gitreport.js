#!/usr/bin/env node

require("dotenv").config();
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { buildReport, sendReport } = require("./src/report");
const { makeLog } = require("./src/makeLog");

yargs(hideBin(process.argv))
  .command(
    "console [filename] [lastdays]",
    "Display report in the terminal",
    (yargs) => {
      yargs
        .positional("filename", {
          describe: "CSV filename ie: ./csv/real-world-git-log.csv",
          default: "./csv/real-world-git-log.csv",
        })
        .positional("lastdays", {
          describe: "Only the last `lastdays`",
          type: "num",
        });
    },
    (argv) => {
      // if (argv.verbose) console.info(`Report from :${argv.filename}`);
      console.info(`Report from :${argv.filename}`);
      console.info(`Args :${JSON.stringify(argv)}`);
      buildReport({ filename: argv.filename, channel: "console", lastdays: argv.lastdays });
    }
  )
  .command(
    "makeLog [filename] [username]",
    "Create the log file from git log command",
    (yargs) => {
      yargs
        .positional("filename", {
          describe: "CSV filename ie: ./csv/real-world-git-log.csv",
          default: "gitlog.csv",
        })
        .positional("username", {
          describe: "Keep commits in the git log created by `username`",
        });
    },
    (argv) => {
      // if (argv.verbose) console.info(`Report from :${argv.filename}`);
      console.info(`Making log from :${argv.filename}`);
      console.info(`Username :${argv.username}`);
      makeLog(argv.filename, argv.username);
    }
  )
  .command(
    "gmail [filename]",
    "Send report by email",
    (yargs) => {
      yargs.positional("filename", {
        describe: "CSV filename ie: ./csv/real-world-git-log.csv",
        default: "./csv/real-world-git-log.csv",
      });
    },
    (argv) => {
      if (argv.verbose) console.info(`Report from :${argv.filename} sent to: ${process.env.GMAIL_EMAIL}`);
      sendReport({ filename: argv.filename });
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
