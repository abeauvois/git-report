const { TestScheduler } = require("rxjs/testing");

const { buffer } = require("rxjs/operators");

const { getCalendarDaysStartingAt, getCalendarWeeksStartingAt, formatDateLocale, getWeek } = require("../src/calendar");
const { toYYYYMMDD, toDayName, toMonthName, dateDiffDays } = require("../src/calendar");

describe("calendar", () => {
  let rxTest;
  beforeEach(() => {
    rxTest = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  test("R0.a: getWeek", () => {
    expect(getWeek(new Date("01/01/2020"))).toEqual(1);
    expect(getWeek(new Date("12/31/2020"))).toEqual(53);
  });

  test("R0.b: toDayName", () => {
    const date = new Date("12/31/2020");
    expect(toDayName(date.getDay())).toEqual("Thu");
    const date1 = new Date("01/31/2020");
    expect(toDayName(date1.getDay())).toEqual("Fri");
  });

  test("R0.c: toMonthName", () => {
    const date = new Date("12/31/2020");
    expect(toMonthName(date.getMonth())).toEqual("Dec");
    const date1 = new Date("01/31/2020");
    expect(toMonthName(date1.getMonth())).toEqual("Jan");
  });

  test("R0.d: toYYYYMMDD", () => {
    const date = new Date("12/31/2020");
    const isoDate = toYYYYMMDD(date);
    expect(isoDate).toEqual("2020/12/31");

    const date1 = new Date("2020-12-31"); // year first means UTC YYYY-MM-DD
    expect(toYYYYMMDD(date1)).toEqual("2020/12/31");

    const date2 = new Date("2020-31-12"); // year first means UTC YYYY-MM-DD
    expect(toYYYYMMDD(date2)).toEqual("Invalid Date");

    const date3 = new Date("Fri Nov 13 10:40:39 2020"); // git log --date=local
    expect(toYYYYMMDD(date3)).toEqual("2020/11/13");
    expect(toMonthName(date3.getMonth())).toEqual("Nov");
  });

  test("R0.e: dateDiffDays", () => {
    const date1 = "2020-01-01";
    const date2 = "2020/12/31";
    expect(dateDiffDays(date1, date2)).toEqual(365);

    const date3 = "Fri Nov 13 10:40:39 2020";
    const date4 = "2020/11/13";
    expect(dateDiffDays(date3, date4)).toEqual(0);
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
