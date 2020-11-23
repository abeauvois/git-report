const { from, of, zip, pipe } = require("rxjs");
const { take, map, skip, groupBy, mergeMap, toArray, filter } = require("rxjs/operators");

const { sendMail } = require("./email");
const { consoleTemplate } = require("./templates");
const { fromCSVFile } = require("./fromCSVFile");

const groupByMonth = groupBy((r) => r.month);
const groupByDay = groupBy((r) => r.day);
const mergeByGroup = mergeMap((group) => zip(of(group.key), group.pipe(toArray())));

const toDailyMapper = (row) => {
  var d = new Date(row.date);
  var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  //   console.log(dayNames[d.getDay()]);
  return {
    weekDay: dayNames[d.getDay()],
    day: d.getDate(),
    month: d.getMonth(),
    message: row.message.match(/.*"(.*)"/)[1],
  };
};

const toMessagesMapper = (month) => ([day, datas]) => ({
  month,
  day,
  messages: datas.reduce((acc, curr) => {
    if (curr.message.includes("Merge branch")) return acc;
    if (curr.message.includes("Merge remote")) return acc;
    if (curr.message.includes("tmp")) return acc;

    return `${acc ? acc + "," : acc} ${curr.message}`;
  }, ""),
});

const groupMessagesByDay = ([month, tasks]) => from(tasks).pipe(groupByDay, mergeByGroup, map(toMessagesMapper(month)));
const byMonthsAndDays = pipe(map(toDailyMapper), groupByMonth, mergeByGroup);

const buildReport = ({ report = "", filename, limit = 100 }) => {
  return new Promise((resolve, reject) => {
    fromCSVFile(filename)
      .pipe(skip(1), take(limit), byMonthsAndDays, mergeMap(groupMessagesByDay), groupByMonth, mergeByGroup)
      .subscribe(
        (result) => (report = consoleTemplate(report)(result)),
        (error) => console.log("errror:", error) || reject(error),
        () => resolve(report)
      );
  });
};

function sendGitReport({ filename, channel = "email", limit = 100 }) {
  return buildReport({ filename, limit }).then((received) => {
    if (channel === "email") {
      sendMail({ text: received });
      return received;
    } else if (channel === "console") {
      console.log(received);
      return received;
    }
  });
}

module.exports = {
  toDailyMapper,
  toMessagesMapper,
  groupByMonth,
  mergeByGroup,
  byMonthsAndDays,
  groupMessagesByDay,
  buildReport,
  sendGitReport,
};
