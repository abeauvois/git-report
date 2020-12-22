const { from, of, zip, pipe, combineLatest, interval } = require("rxjs");
const {
  map,
  startWith,
  scan,
  distinctUntilChanged,
  //     take,
  //   skip,
  //   groupBy,
  //   mergeMap,
  //   toArray,
  //   filter,
  //   flatMap,
  //   tap,
} = require("rxjs/operators");

// const { toDayName } = require("./templates");

/**
 * Returns the week number for this date.  dowOffset is the day of week the week
 * "starts" on for your locale - it can be from 0 to 6. If dowOffset is 1 (Monday),
 * the week returned is the ISO 8601 week number.
 * @param int dowOffset
 * @return int
 */
const getWeek = function (date, dowOffset) {
  /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */

  dowOffset = typeof dowOffset == "int" ? dowOffset : 0; //default dowOffset to zero
  var newYear = new Date(date.getFullYear(), 0, 1);
  var day = newYear.getDay() - dowOffset; //the day of week the year begins on
  day = day >= 0 ? day : day + 7;
  var daynum =
    Math.floor(
      (date.getTime() - newYear.getTime() - (date.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000
    ) + 1;
  var weeknum;
  //if the year starts before the middle of a week
  if (day < 4) {
    weeknum = Math.floor((daynum + day - 1) / 7) + 1;
    if (weeknum > 52) {
      const nYear = new Date(date.getFullYear() + 1, 0, 1);
      let nday = nYear.getDay() - dowOffset;
      nday = nday >= 0 ? nday : nday + 7;
      /*if the next year starts before the middle of
                  the week, it is week #1 of that year*/
      weeknum = nday < 4 ? 1 : 53;
    }
  } else {
    weeknum = Math.floor((daynum + day - 1) / 7);
  }
  return weeknum;
};

const formatDateLocale = () =>
  map((date) => {
    return date.toLocaleDateString("fr-fr", { timeZone: "Europe/Paris" });
  });

const getCalendarDaysStartingAt = (source$, startDate) => {
  const date = new Date(startDate);
  return source$.pipe(
    startWith(date),
    scan((acc, _) => {
      const newDate = acc.setDate(acc.getDate() + 1);
      return new Date(newDate);
    })
  );
};

const getCalendarWeeksStartingAt = (source$, startDate) => {
  const date = new Date(startDate);
  return source$.pipe(
    startWith(date),
    scan((acc, _) => {
      const newDate = acc.setDate(acc.getDate() + 1);
      return new Date(newDate);
    }),
    map((date) => {
      //   console.log(
      //     "getWeek(date)",
      //     toDayName(date.getDay()),
      //     date.toLocaleString("fr-fr", { timeZone: "Europe/Paris" }),
      //     getWeek(date)
      //   );
      return getWeek(date);
    }),
    distinctUntilChanged()
  );
};

module.exports = {
  getCalendarDaysStartingAt,
  getCalendarWeeksStartingAt,
  formatDateLocale,
};