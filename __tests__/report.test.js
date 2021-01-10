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
} = require("../src/report");

describe("report", () => {
  let rxTest;
  const filename = "./__tests__/test_file.csv";
  const filenameR2 = "./__tests__/test_file_report_R2_b.csv";
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
    const firstTaskDate = "2020/11/12";
    const lastTaskDate = "2020/11/13";

    const task$ = getTask$(filenameR2).pipe(
      flatMap((tasks) => {
        const tm = TasksManager(tasks);
        return of(tm);
      })
    );

    mergeTasksWithCalendar(task$).subscribe(
      (received) => {
        expect(received[0].date).toEqual(firstTaskDate);
        expect(received[0].message).toEqual("off");

        expect(received.length).toEqual(4);
        expect(received[received.length - 1].date).toEqual(lastTaskDate);
        expect(received[received.length - 1].message).toEqual("m1 13 nov");
      },
      (e) => console.log("Errroor", e),
      () => done()
    );
  });

  test("R2.b: mergeTasksWithCalendar should start 1 day before lastTaskDate", (done) => {
    const lastTaskDate = "2020/11/13";

    const takeLast = 1;

    const task$ = getTask$(filenameR2).pipe(
      flatMap((tasks) => {
        const tm = TasksManager(tasks);
        return of(tm);
      })
    );

    mergeTasksWithCalendar(task$, takeLast).subscribe(
      (received) => {
        expect(received[0].date).toEqual(lastTaskDate);
        expect(received[0].message).toEqual("off");

        expect(received.length).toEqual(2);
        expect(received[received.length - 1].date).toEqual(lastTaskDate);
        expect(received[received.length - 1].message).toEqual("m1 13 nov");
      },
      (e) => console.log("Errroor", e),
      () => done()
    );
  });

  test("R3.a: groupByYear", (done) => {
    const task$ = getTask$(filenameR2).pipe(
      flatMap((tasks) => {
        const tm = TasksManager(tasks);
        return of(tm);
      })
    );

    mergeTasksWithCalendar(task$)
      .pipe(
        flatMap((tasks) => {
          return from(tasks);
        }),
        groupAndMergeByYear
      )
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

  test("R4: groupMessagesByDay", (done) => {
    const task$ = getTask$(filenameR2).pipe(
      flatMap((tasks) => {
        const tm = TasksManager(tasks);
        return of(tm);
      })
    );

    mergeTasksWithCalendar(task$)
      .pipe(
        flatMap((tasks) => {
          return from(tasks);
        }),
        groupAndMergeByDay,
        mergeMap(groupMessagesByDay),
        toArray()
      )
      .subscribe(
        (received) => {
          expect(received).toMatchSnapshot();
        },
        (e) => console.log("Errroor", e),
        () => done()
      );
  });

  test("R5: groupByYear", (done) => {
    const task$ = getTask$(filenameR3a).pipe(
      flatMap((tasks) => {
        const tm = TasksManager(tasks);
        return of(tm);
      })
    );

    const source$ = mergeTasksWithCalendar(task$).pipe(
      flatMap((tasks) => {
        return from(tasks);
      }),
      groupAndMergeByDay,
      mergeMap(groupMessagesByDay),
      groupAndMergeByYear,
      flatMap(([year, tasks]) => combineLatest([of(year), from(tasks).pipe(groupAndMergeByMonth)])),
      flatMap(([year, [month, tasks]]) =>
        combineLatest([of(year), combineLatest([of(month), from(tasks).pipe(groupAndMergeByWeek)])])
      )
    );

    source$.pipe(tap((t) => console.log("t:", t))).subscribe(
      (received) => {
        expect(received).toMatchSnapshot();
      },
      (e) => console.log("Errroor", e),
      () => done()
    );
  });

  test("R6.a: buildReport", (done) => {
    buildReport({ filename: filenameR6b }).then((received) => {
      expect(received).toMatchSnapshot();
      done();
    });
  });

  test("R6.b: buildReport last 2 days", (done) => {
    buildReport({ filename: filenameR6b, lastDays: 2 }).then((received) => {
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
