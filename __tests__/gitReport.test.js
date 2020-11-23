const { toArray, skip, pipe, map, take, mergeMap } = require("rxjs/operators");
const { fromCSVFile } = require("../src/fromCSVFile");
const {
  toDailyMapper,
  groupByMonth,
  mergeByGroup,
  byMonthsAndDays,
  toMessagesMapper,
  groupMessagesByDay,
  buildReport,
  sendGitReport,
} = require("../src/gitReport");

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

  test("R2: toDailyMapper", (done) => {
    fromCSVFile(filename)
      .pipe(skip(1), take(1), map(toDailyMapper))
      .subscribe(
        (received) => {
          expect(received).toMatchSnapshot();
          done();
        },
        (e) => console.log("Errroor", e)
      );
  });

  test("R3: groupByMonth & mergeByGroup", (done) => {
    fromCSVFile(filename)
      .pipe(skip(1), map(toDailyMapper), groupByMonth, mergeByGroup)
      .subscribe(
        (received) => {
          expect(received).toMatchSnapshot();
          done();
        },
        (e) => console.log("Errroor", e)
      );
  });

  test("R4: byMonthsAndDays", (done) => {
    fromCSVFile(filename)
      .pipe(skip(1), byMonthsAndDays)
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
      .pipe(skip(1), byMonthsAndDays, mergeMap(groupMessagesByDay))
      .subscribe(
        (received) => {
          expect(received).toMatchSnapshot();
          done();
        },
        (e) => console.log("Errroor", e)
      );
  });

  test("R6: groupByMonthByDay", (done) => {
    fromCSVFile(filename)
      .pipe(skip(1), byMonthsAndDays, mergeMap(groupMessagesByDay), groupByMonth, mergeByGroup)
      .subscribe(
        (received) => {
          expect(received).toMatchSnapshot();
          done();
        },
        (e) => console.log("Errroor", e)
      );
  });

  test("R7: buildReport", (done) => {
    buildReport({ filename: filename }).then((received) => {
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
