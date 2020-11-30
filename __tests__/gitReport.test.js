const { from, of, zip, pipe, combineLatest } = require("rxjs");
const {
  toArray,
  skip,
  map,
  take,
  mergeMap,
  tap,
  groupBy,
  merge,
  mergeAll,
  concatMap,
  expand,
  filter,
  flatMap,
} = require("rxjs/operators");
const { fromCSVFile } = require("../src/fromCSVFile");
const {
  toDateTimeMapper,
  groupByYear,
  groupByMonth,
  groupByDay,
  groupByAmPm,
  mergeByGroup,
  // groupMessagesByAmPm,
  groupAndMergeByMonth,
  groupAndMergeByDay,
  groupMessagesByDay,
  buildReport,
  sendGitReport,
} = require("../src/report");

describe("gitReport", () => {
  const filename = "./__tests__/test_file.csv";

  test("R1: fromCSVFile", (done) => {
    fromCSVFile(filename)
      .pipe(toArray())
      .subscribe(
        (received) => {
          expect(received).toMatchSnapshot();
          done();
        },
        (e) => console.log("Errroor", e)
      );
  });

  test("R2: toDateTimeMapper", (done) => {
    fromCSVFile(filename)
      .pipe(skip(1), take(1), map(toDateTimeMapper))
      .subscribe(
        (received) => {
          expect(received).toMatchSnapshot();
          done();
        },
        (e) => console.log("Errroor", e)
      );
  });

  test("R3.a: groupByYear & mergeByGroup", (done) => {
    fromCSVFile(filename)
      .pipe(skip(1), map(toDateTimeMapper), groupByYear, mergeByGroup)
      .subscribe(
        (received) => {
          expect(received).toMatchSnapshot();
          done();
        },
        (e) => console.log("Errroor", e)
      );
  });

  test("R3.b: groupByMonth & mergeByGroup", (done) => {
    fromCSVFile(filename)
      .pipe(skip(1), map(toDateTimeMapper), groupByMonth, mergeByGroup)
      .subscribe(
        (received) => {
          expect(received).toMatchSnapshot();
          done();
        },
        (e) => console.log("Errroor", e)
      );
  });

  test("R4: groupAndMergeByMonth", (done) => {
    fromCSVFile(filename)
      .pipe(skip(1), map(toDateTimeMapper), groupAndMergeByMonth)
      .subscribe(
        (received) => {
          expect(received).toMatchSnapshot();
          done();
        },
        (e) => console.log("Errroor", e)
      );
  });

  test("R5: groupMessagesByDay", (done) => {
    fromCSVFile(filename)
      .pipe(skip(1), map(toDateTimeMapper), groupAndMergeByDay, mergeMap(groupMessagesByDay))
      .subscribe(
        (received) => {
          expect(received).toMatchSnapshot();
          done();
        },
        (e) => console.log("Errroor", e)
      );
  });

  test("R6: groupByMonthByDay", (done) => {
    const asArray = (group) => group.pipe(toArray());
    const groupMapper = (group) => zip(of(group.key), asArray(group));
    const mergeGroup = mergeMap(groupMapper);

    const source$ = fromCSVFile(filename).pipe(skip(1), map(toDateTimeMapper));

    const sourceByYear$ = source$.pipe(groupByYear, mergeGroup);
    const sourceByMonth$ = (list) => from(list).pipe(groupByMonth, mergeGroup);
    const sourceByDay$ = (list) => from(list).pipe(groupByDay, mergeGroup);

    sourceByYear$
      .pipe(
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
