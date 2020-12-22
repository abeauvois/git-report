const { TestScheduler } = require("rxjs/testing");

const { buffer } = require("rxjs/operators");

const { getCalendarDaysStartingAt, getCalendarWeeksStartingAt, formatDateLocale } = require("../src/calendar");

describe("calendar", () => {
  let rxTest;
  beforeEach(() => {
    rxTest = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  test("R1: getCalendarDaysStartingAt", () => {
    function go(source$) {
      const initialDate = "2020-03-01";
      return getCalendarDaysStartingAt(source$, initialDate).pipe(formatDateLocale());
    }

    rxTest.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const values = { a: 0, b: 1, c: 2 };
      const source = cold("-a--b--c|", values);

      const expectedMarble = "ef--g--h|";
      const expectedValues = {
        e: "2020/03/01", // initial date in locale fr-fr
        f: "2020/03/02",
        g: "2020/03/03",
        h: "2020/03/04",
      };

      const received = go(source);
      expectObservable(received).toBe(expectedMarble, expectedValues);
    });
  });

  test("R2: getCalendarWeeksStartingAt", () => {
    function go(source$) {
      const initialDate = "2020-01-01";
      return getCalendarWeeksStartingAt(source$, initialDate);
    }

    rxTest.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const source = cold("   -a--b--c--d--e--f|");

      const expectedMarble = "i---------j------|";
      const expectedValues = {
        i: 1, // week 1
        j: 2,
      };

      const received = go(source);
      expectObservable(received).toBe(expectedMarble, expectedValues);
    });
  });

  test("R3: getCalendarWeeksStartingAt buffered week", () => {
    function go(source$) {
      const initialDate = "2020-01-01";
      return getCalendarWeeksStartingAt(source$, initialDate);
    }

    rxTest.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const source = cold("-a--b--c--d--e--f|");

      const expectedMarble = "i---------j------|";
      const expectedValues = {
        i: [],
        j: ["a", "b", "c"],
      };

      const received = source.pipe(buffer(go(source)));
      expectObservable(received).toBe(expectedMarble, expectedValues);
    });
  });
});
