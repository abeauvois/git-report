const { TestScheduler } = require("rxjs/testing");

const { getCalendarDaysStartingAt, getCalendarWeeksStartingAt } = require("../src/calendar");

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
      const initialDate = "2020-03-01";
      return getCalendarDaysStartingAt(source$, initialDate);
    }

    rxTest.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const values = { a: 0, b: 1, c: 2 };
      const source = cold("-a--b--c|", values);

      const expectedMarble = "ef--g--h|";
      const expectedValues = {
        e: "01/03/2020", // initial date in locale fr-fr
        f: "02/03/2020",
        g: "03/03/2020",
        h: "04/03/2020",
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
});
