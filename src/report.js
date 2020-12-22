const { from, of, zip, pipe, combineLatest, interval, concat } = require("rxjs");
const {
  map,
  skip,
  groupBy,
  mergeMap,
  toArray,
  filter,
  flatMap,
  take,
  scan,
  last,
  // take,
  // tap,
  // startWith,
  // scan,
  // distinctUntilChanged,
} = require("rxjs/operators");

// const { sendMail } = require("./email");
const { consoleTemplate } = require("./templates");
const { fromCSVFile } = require("./fromCSVFile");
const { toYYYYMMDD, getCalendarDaysStartingAt } = require("./calendar");

const groupByYear = groupBy((r) => r.year);
const groupByMonth = groupBy((r) => r.month);
const groupByDay = groupBy((r) => r.day);
const groupByAmPm = groupBy((r) => r.ampm);
const mergeByGroup = mergeMap((group) => zip(of(group.key), group.pipe(toArray())));

const DEFAULT_MESSAGE = "off";

const dateToTaskMapper = (d, message = DEFAULT_MESSAGE) => {
  return {
    date: toYYYYMMDD(d),
    milliseconds: d.valueOf(),
    dayWeek: d.getDay(),
    ampm: d.getHours() <= 12 ? "am" : "pm",
    hour: d.getHours(),
    day: d.getDate(),
    month: d.getMonth(),
    year: d.getFullYear(),
    message,
  };
};

const commitToTask = (task, message) => {
  var d = new Date(task.date);
  return dateToTaskMapper(d, message || task.message.match(/.*"(.*)"/)[1]);
};

function compareValues(key, order = "asc") {
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = typeof a[key] === "string" ? a[key].toUpperCase() : a[key];
    const varB = typeof b[key] === "string" ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return order === "desc" ? comparison * -1 : comparison;
  };
}

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

const mergeTasksWithCalendar = (filename, startDate = "2020-10-12") => {
  const source$ = interval(100);

  const getDay$ = (startDay) =>
    getCalendarDaysStartingAt(source$, startDay).pipe(
      take(3),
      map((day, index) => dateToTaskMapper(day)),
      toArray()
    );

  const getTask$ = fromCSVFile(filename).pipe(
    skip(1),
    map((task, index) => commitToTask(task)),
    toArray()
  );

  return getTask$.pipe(
    flatMap((tasks) => concat(of(tasks), getDay$(startDate))),
    scan((acc, curr) => acc.concat(curr), []),
    last(),
    map((received) => received.sort(compareValues("milliseconds")))
  );
};

const isSameDay = (task, calendar) =>
  task.year === calendar.year && task.month === calendar.month && task.day === calendar.day;

const aggregateDiffs = (task$, day$) =>
  zip(task$, day$).pipe(map(([task, day]) => (isSameDay(task, day) ? [task] : [task, day])));

const groupAndMergeByYear = pipe(groupByYear, mergeByGroup);
const groupAndMergeByMonth = pipe(groupByMonth, mergeByGroup);
const groupAndMergeByDay = pipe(groupByDay, mergeByGroup);
const groupMessagesByDay = ([month, tasks]) => from(tasks).pipe(groupByDay, mergeByGroup, map(toMessagesMapper(month)));
// const groupMessagesByAmPm = ([day, tasks]) => from(tasks).pipe(groupByAmPm, mergeByGroup, map(toMessagesMapper(day)));

const asArray = (group) => group.pipe(toArray());
const groupMapper = (group) => zip(of(group.key), asArray(group));
const mergeGroup = mergeMap(groupMapper);

const buildReport = ({ report = "", filename, limit = 100 }) => {
  const source$ = fromCSVFile(filename).pipe(skip(1), map(commitToTask));

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
  compareValues,
  aggregateDiffs,
  commitToTask,
  toMessagesMapper,
  mergeTasksWithCalendar,
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
