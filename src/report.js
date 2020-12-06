const { from, of, zip, pipe, combineLatest } = require("rxjs");
const {
  map,
  skip,
  groupBy,
  mergeMap,
  toArray,
  filter,
  flatMap,
  // take,
  // tap,
  // startWith,
  // scan,
  // distinctUntilChanged,
} = require("rxjs/operators");

const { sendMail } = require("./email");
const { consoleTemplate } = require("./templates");
const { fromCSVFile } = require("./fromCSVFile");

const groupByYear = groupBy((r) => r.year);
const groupByMonth = groupBy((r) => r.month);
const groupByDay = groupBy((r) => r.day);
const groupByAmPm = groupBy((r) => r.ampm);
const mergeByGroup = mergeMap((group) => zip(of(group.key), group.pipe(toArray())));

const toDateTimeMapper = (row) => {
  var d = new Date(row.date);
  return {
    dayWeek: d.getDay(),
    ampm: d.getHours() <= 12 ? "am" : "pm",
    hour: d.getHours(),
    day: d.getDate(),
    month: d.getMonth(),
    year: d.getFullYear(),
    message: row.message.match(/.*"(.*)"/)[1],
  };
};

const toMessagesMapper = (day) => ([_, tasks]) => ({
  day,
  dayWeek: tasks[0].dayWeek,
  messagesAm: tasks.reduce((acc, curr) => {
    if (curr.ampm === "pm") return acc;
    if (curr.message.includes("Merge branch")) return acc;
    if (curr.message.includes("Merge remote")) return acc;
    if (curr.message.includes("tmp")) return acc;

    return `${acc ? acc + "," : acc} ${curr.message}`;
  }, ""),
  messagesPm: tasks.reduce((acc, curr) => {
    if (curr.ampm === "am") return acc;
    if (curr.message.includes("Merge branch")) return acc;
    if (curr.message.includes("Merge remote")) return acc;
    if (curr.message.includes("tmp")) return acc;

    return `${acc ? acc + "," : acc} ${curr.message}`;
  }, ""),
});

const groupAndMergeByYear = pipe(groupByYear, mergeByGroup);
const groupAndMergeByMonth = pipe(groupByMonth, mergeByGroup);
const groupAndMergeByDay = pipe(groupByDay, mergeByGroup);
const groupMessagesByDay = ([month, tasks]) => from(tasks).pipe(groupByDay, mergeByGroup, map(toMessagesMapper(month)));
// const groupMessagesByAmPm = ([day, tasks]) => from(tasks).pipe(groupByAmPm, mergeByGroup, map(toMessagesMapper(day)));

const asArray = (group) => group.pipe(toArray());
const groupMapper = (group) => zip(of(group.key), asArray(group));
const mergeGroup = mergeMap(groupMapper);

const buildReport = ({ report = "", filename, limit = 100 }) => {
  const source$ = fromCSVFile(filename).pipe(skip(1), map(toDateTimeMapper));

  const sourceByYear$ = source$.pipe(groupByYear, mergeGroup);
  const sourceByMonth$ = (list) => from(list).pipe(groupByMonth, mergeGroup);
  const sourceByDay$ = (list) => from(list).pipe(groupByDay, mergeGroup);
  return new Promise((resolve, reject) => {
    sourceByYear$
      .pipe(
        filter(([_, list]) => Boolean(list)), // remove undefined list
        flatMap(([year, list]) => combineLatest([of(year), sourceByMonth$(list)])),
        flatMap(([year, [month, list]]) => combineLatest([of(year), combineLatest([of(month), sourceByDay$(list)])])),
        flatMap(([year, [month, [day, list]]]) =>
          combineLatest([of(year), combineLatest([of(month), groupMessagesByDay([day, list])])])
        )
      )
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
  toDateTimeMapper,
  toMessagesMapper,
  groupByYear,
  groupByMonth,
  groupByDay,
  groupByAmPm,
  mergeByGroup,
  groupAndMergeByYear,
  groupAndMergeByMonth,
  groupAndMergeByDay,
  groupMessagesByDay,
  // groupMessagesByAmPm,
  buildReport,
  sendGitReport,
};
