const { from, of, combineLatest } = require("rxjs");
const { toArray, skip, map, take, mergeMap, flatMap, tap } = require("rxjs/operators");

const { TestScheduler } = require("rxjs/testing");

const { fromCSVFile } = require("../src/fromCSVFile");
const { TasksManager } = require("../src/TasksManager");

const {
  getTask$,
  aggregateDiffs,
  mergeTasksWithCalendar,
  groupAndMergeByYear,
  groupAndMergeByMonth,
  groupAndMergeByDay,
  groupMessagesByDay,
  buildReport,
  sendReport,
  groupAndMergeByWeek,
  getBounds,
  aggregateByMonthYearWeekDay,
} = require("../src/report");

describe("report", () => {
  let rxTest;
  const gitlog = "./__tests__/gitlog.csv";
  const filename = "./__tests__/test_file.csv";
  const filenameR2a = "./__tests__/test_file_report_R2_a.csv";
  const filenameR2b = "./__tests__/test_file_report_R2_b.csv";
  const filenameR3a = "./__tests__/test_file_report_R3_a.csv";
  const filenameR6b = "./__tests__/test_file_report_R6_b.csv";

  beforeEach(() => {
    rxTest = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  test("R1.a: fromCSVFile", (done) => {
    fromCSVFile(filename)
      .pipe(take(2))
      .subscribe(
        (received) => {
          expect(received).toMatchSnapshot();
        },
        (e) => console.log("Errroor", e),
        () => done()
      );
  });

  test("R1.b: getTask$", (done) => {
    getTask$(filename).subscribe(
      (received) => {
        expect(received).toMatchSnapshot();
      },
      (e) => console.log("Errroor", e),
      () => done()
    );
  });

  test("R2.a: mergeTasksWithCalendar should start on firstTaskDate", (done) => {
    const firstTaskDate = "2020/12/17";
    const lastTaskDate = "2021/01/01";
    let result = [];

    const task$ = getTask$(filenameR2a).pipe(
      flatMap((tasks) => {
        const tm = TasksManager(tasks);
        return of(tm);
      })
    );

    mergeTasksWithCalendar(task$).subscribe(
      (received) => {
        result.push(received);
      },
      (e) => console.log("Errroor", e),
      () => {
        expect(result[0].date).toEqual(firstTaskDate);
        expect(result[0].message).toEqual("off");

        expect(result.length).toEqual(30);
        expect(result[result.length - 1].date).toEqual(lastTaskDate);
        expect(result[result.length - 1].message).toEqual("msg1 01 jan 2021");

        done();
      }
    );
  });

  test("R3.a: groupByYear", (done) => {
    const task$ = getTask$(filenameR2b).pipe(
      flatMap((tasks) => {
        const tm = TasksManager(tasks);
        return of(tm);
      })
    );

    mergeTasksWithCalendar(task$)
      .pipe(groupAndMergeByYear)
      .subscribe(
        (received) => {
          expect(received).toMatchSnapshot();
        },
        (e) => console.log("Errroor", e),
        () => done()
      );
  });

  test("R3.b: aggregateDiffs ", () => {
    rxTest.run((helpers) => {
      const { cold, expectObservable } = helpers;

      const days = {
        a: {
          ampm: "am",
          day: 1,
          dayWeek: 5,
          hour: 1,
          message: "meeting",
          milliseconds: 1609459200000,
          month: 0,
          year: 2021,
        },
        b: {
          ampm: "pm",
          day: 4,
          dayWeek: 3,
          hour: 13,
          message: "meeting",
          milliseconds: 1635943239000,
          month: 10,
          year: 2021,
        },
      };
      const tasks = {
        i: {
          ampm: "pm",
          day: 3,
          dayWeek: 3,
          hour: 13,
          message: "m1 03 nov 21",
          milliseconds: 1635943239000,
          month: 10,
          year: 2021,
        },
        j: {
          ampm: "pm",
          day: 4,
          dayWeek: 3,
          hour: 13,
          message: "m1 04 nov 21",
          milliseconds: 1635943239000,
          month: 10,
          year: 2021,
        },
      };
      const day$ = cold("-a--b|", days);
      const task$ = cold("-i--j|", tasks);

      const expectedMarble = "-n--m|";
      const expectedValues = {
        n: [tasks.i, days.a],
        m: [tasks.j],
      };

      const received = aggregateDiffs(task$, day$);
      expectObservable(received).toBe(expectedMarble, expectedValues);
    });
  });

  test("R4: aggregate by Year, Month, Week and Day", (done) => {
    const task$ = getTask$(filenameR2b).pipe(
      flatMap((tasks) => {
        const tm = TasksManager(tasks);
        return of(tm);
      })
    );

    aggregateByMonthYearWeekDay(task$).subscribe(
      (received) => {
        expect(received).toMatchSnapshot();
      },
      (e) => console.log("Errroor", e),
      () => done()
    );
  });

  test("R5.a: buildReport", (done) => {
    buildReport({ filename: filenameR6b }).then((received) => {
      expect(received).toMatchSnapshot();
      done();
    });
  });

  test("R5.b: buildReport last 2 days", (done) => {
    buildReport({ filename: filenameR6b, lastdays: 2 }).then((received) => {
      expect(received).toMatchSnapshot();
      done();
    });
  });

  test.skip("R8: sendReport to console", (done) => {
    sendReport({ filename: filenameR3a, channel: "console" }).then((received) => {
      expect(received).toMatchSnapshot();
      done();
    });
  });
});
