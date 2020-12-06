const { TestScheduler } = require("rxjs/testing");
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
  throttleTime,
} = require("rxjs/operators");
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
  getCalendarDaysStartingAt,
} = require("../src/report");

describe("calendar", () => {
  beforeEach(() => {
    rxTest = new TestScheduler((actual, expected) => {
      // asserting the two objects are equal
      // e.g. using chai.
      expect(actual).toEqual(expected);
    });
  });

  test("R1: getCalendarDaysStartingAt", () => {
    function go(source$) {
      return getCalendarDaysStartingAt(source$, "2020-03-01");
    }

    rxTest.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const values = { a: 0, b: 1, c: 2 };
      const source = cold("-a--b--c|", values);

      const expectedMarble = "ef--g--h|";
      const expectedValues = {
        e: "01/03/2020",
        f: "02/03/2020",
        g: "03/03/2020",
        h: "04/03/2020",
      };

      const received = go(source);
      expectObservable(received).toBe(expectedMarble, expectedValues);
    });
  });
});
