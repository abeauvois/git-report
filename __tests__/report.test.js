const { from, of, zip, combineLatest } = require("rxjs");
const { toArray, skip, map, take, mergeMap, filter, flatMap } = require("rxjs/operators");

const { TestScheduler } = require("rxjs/testing");

const { fromCSVFile } = require("../src/fromCSVFile");
const {
  compareValues,
  aggregateDiffs,
  commitToTask,
  mergeTasksWithCalendar,
  groupByYear,
  groupAndMergeByYear,
  groupByMonth,
  groupByDay,
  groupAndMergeByDay,
  groupMessagesByDay,
  buildReport,
  sendGitReport,
} = require("../src/report");

describe("report", () => {
  let rxTest;
  const filename = "./__tests__/test_file.csv";

  beforeEach(() => {
    rxTest = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  test.only("R1: fromCSVFile", (done) => {
    fromCSVFile(filename).subscribe(
      (received) => {
        expect(received).toMatchSnapshot();
      },
      (e) => console.log("Errroor", e),
      () => done()
    );
  });

  test.only("R2.a: commitToTask", (done) => {
    fromCSVFile(filename)
      .pipe(skip(1), take(1), map(commitToTask))
      .subscribe(
        (received) => {
          expect(received).toMatchSnapshot();
        },
        (e) => console.log("Errroor", e),
        () => {
          done();
        }
      );
  });

  test.only("R2.b: mergeTasksWithCalendar", (done) => {
    mergeTasksWithCalendar(filename, "2020-10-12").subscribe(
      (received) => {
        expect(received).toMatchSnapshot();
      },
      (e) => console.log("Errroor", e),
      () => {
        done();
      }
    );
  });

  test.only("R3.a: groupByYear", (done) => {
    mergeTasksWithCalendar(filename, "2020-10-12")
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
        () => {
          done();
        }
      );
  });

  test.only("R3.b: aggregateDiffs ", () => {
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

  test("R3.c: groupByYear & mergeByGroup & aggregateDiffs", (done) => {
    mergeTasksWithCalendar(filename, "2020-10-12")
      .pipe(
        flatMap((tasks) => {
          return from(tasks);
        }),
        groupAndMergeByYear,
        flatMap(([year, list]) => {
          const startDay = `${year}-01-01`;
          const day$ = getDay$(startDay);
          const task$ = from(list.sort(compareValues("milliseconds")));

          return combineLatest([of(year), aggregateDiffs(task$, day$)]);
        })
      )
      .subscribe(
        (received) => {
          expect(received).toMatchSnapshot();
          // done();
        },
        (e) => console.log("Errroor", e),
        () => done()
      );
  });

  test.only("R5: groupMessagesByDay", (done) => {
    mergeTasksWithCalendar(filename, "2020-10-12")
      .pipe(
        flatMap((tasks) => {
          return from(tasks);
        }),
        groupAndMergeByDay,
        mergeMap(groupMessagesByDay)
      )
      .subscribe(
        (received) => {
          expect(received).toMatchSnapshot();
        },
        (e) => console.log("Errroor", e),
        () => {
          done();
        }
      );
  });

  test("R6: groupByMonthByDay", (done) => {
    const asArray = (group) => group.pipe(toArray());
    const groupMapper = (group) => zip(of(group.key), asArray(group));
    const mergeGroup = mergeMap(groupMapper);

    const source$ = fromCSVFile(filename).pipe(skip(1), map(commitToTask));

    const sourceByYear$ = source$.pipe(groupByYear, mergeGroup);
    const sourceByMonth$ = (list) => from(list).pipe(groupByMonth, mergeGroup);
    const sourceByDay$ = (list) => from(list).pipe(groupByDay, mergeGroup);

    sourceByYear$
      .pipe(
        // eslint-disable-next-line no-unused-vars
        filter(([_, list]) => Boolean(list)), // remove undefined list
        flatMap(([year, list]) => combineLatest([of(year), sourceByMonth$(list)])),
        flatMap(([year, [month, list]]) => combineLatest([of(year), combineLatest([of(month), sourceByDay$(list)])])),
        flatMap(([year, [month, [day, list]]]) =>
          combineLatest([of(year), combineLatest([of(month), groupMessagesByDay([day, list])])])
        )
        // tap((t) => console.log("t:", t))
      )
      .subscribe(
        (received) => {
          expect(received).toMatchSnapshot();
          done();
        },
        (e) => console.log("Errroor", e)
      );
  });

  test("R7: buildReport", (done) => {
    buildReport({ filename }).then((received) => {
      expect(received).toMatchSnapshot();
      done();
    });
  });

  test("R8: sendGitReport to console", (done) => {
    sendGitReport({ filename: filename, channel: "console" }).then((received) => {
      expect(received).toMatchSnapshot();
      done();
    });
  });
});
