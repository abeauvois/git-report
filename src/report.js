const { from, of, iif, zip, pipe, combineLatest, interval, concat } = require("rxjs");
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
  takeLast,
} = require("rxjs/operators");

const { consoleTemplate } = require("./templates");
const { fromCSVFile } = require("./fromCSVFile");
const { toYYYYMMDD, getCalendarDaysStartingAt, getWeek } = require("./calendar");

const { TasksManager } = require("./TasksManager.js");

const groupByYear = groupBy((r) => r.year);
const groupByMonth = groupBy((r) => r.month);
const groupByWeek = groupBy((r) => r.week);
const groupByDay = groupBy((r) => r.day);
const groupByAmPm = groupBy((r) => r.ampm);
const mergeByGroup = mergeMap((group) => zip(of(group.key), group.pipe(toArray())));

const DEFAULT_MESSAGE = "off";

const dateToTaskMapper = (d, message = DEFAULT_MESSAGE) => {
  return {
    date: toYYYYMMDD(d),
    milliseconds: d.valueOf(),
    week: getWeek(d),
    dayWeek: d.getDay(), // Sunday - Saturday : 0 - 6
    ampm: d.getHours() <= 12 ? "am" : "pm",
    hour: d.getHours(),
    day: d.getDate(), // 1 to 31
    month: d.getMonth(), // 0 to 11
    year: d.getFullYear(), // YYYY
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
    return order === "asc" ? comparison : comparison * -1;
  };
}

function taskReducer(ampm, emptyKey) {
  return (acc, curr) => {
    if (curr.ampm === ampm) return acc;
    if (curr.message.includes("Merge branch")) return acc;
    if (curr.message.includes("Merge remote")) return acc;
    if (curr.message.includes("tmp")) return acc;
    if (acc && curr.message.includes(emptyKey)) return acc;

    const accEmptyKey = acc.includes(emptyKey);

    let result;
    if (accEmptyKey && curr.message) {
      result = `${curr.message}`;
    } else {
      result = `${acc ? acc + "," : acc}${curr.message}`;
    }

    return result;
  };
}

const toMessagesMapper = (day, emptyKey = "off") => ([_, tasks]) => ({
  date: tasks[0].date,
  day: tasks[0].day,
  week: tasks[0].week,
  month: tasks[0].month,
  year: tasks[0].year,
  dayWeek: tasks[0].dayWeek,
  messagesAm: tasks.reduce(taskReducer("pm", emptyKey), emptyKey),
  messagesPm: tasks.reduce(taskReducer("am", emptyKey), emptyKey),
});

const getTask$ = (filename) =>
  fromCSVFile(filename).pipe(
    skip(1),
    map((task) => commitToTask(task)),
    toArray(),
    map((received) => received.sort(compareValues("milliseconds")))
  );

const mergeTasksWithCalendar = (task$, lastDays) => {
  const source$ = interval(10);

  const getDay$ = (startDate, days) =>
    getCalendarDaysStartingAt(source$, startDate).pipe(
      take(days),
      map((day) => dateToTaskMapper(day)),
      takeLast(lastDays || days),
      toArray()
    );

  return task$.pipe(
    flatMap((tm) => {
      const { firstTaskDate } = tm.getBounds();
      const tasks = tm.getState().items;
      const numDays = tm.getLength();
      const calendarDays = getDay$(firstTaskDate, numDays);
      return concat(from(tasks).pipe(takeLast(lastDays || numDays)), from(calendarDays));
    }),
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
const groupAndMergeByWeek = pipe(groupByWeek, mergeByGroup);
const groupAndMergeByDay = pipe(groupByDay, mergeByGroup);
const groupMessagesByDay = ([month, tasks]) => from(tasks).pipe(groupByDay, mergeByGroup, map(toMessagesMapper(month)));

const buildReport = ({ report = "", filename, lastDays }) => {
  const task$ = getTask$(filename).pipe(
    flatMap((tasks) => {
      const tm = TasksManager(tasks);
      return of(tm);
    })
  );

  const source$ = mergeTasksWithCalendar(task$, lastDays).pipe(
    flatMap((tasks) => {
      return from(tasks);
    }),
    groupAndMergeByDay,
    mergeMap(groupMessagesByDay),
    // filter((day) => day.getDay() !== 0 && day.getDay() !== 6), // remove Sunday & Saturday
    groupAndMergeByYear,
    flatMap(([year, tasks]) => combineLatest([of(year), from(tasks).pipe(groupAndMergeByMonth)])),
    flatMap(([year, [month, tasks]]) =>
      combineLatest([of(year), combineLatest([of(month), from(tasks).pipe(groupAndMergeByWeek)])])
    )
  );

  return new Promise((resolve, reject) => {
    source$.subscribe(
      (result) => (report = consoleTemplate(report)(result)),
      (error) => console.log("errror:", error) || reject(error),
      () => console.log(report) || resolve(report)
    );
  });
};

function sendReport({ filename, channel = "email" }) {
  return buildReport({ filename }).then((received) => {
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
  getTask$,
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
  groupAndMergeByWeek,
  groupAndMergeByDay,
  groupMessagesByDay,
  buildReport,
  sendReport,
};
