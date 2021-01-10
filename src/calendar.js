const { map, startWith, scan, distinctUntilChanged } = require("rxjs/operators");

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

const toDayName = (day) => {
  var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return dayNames[day];
};

const toMonthName = (month) => {
  var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
  return monthNames[month];
};

const toYYYYMMDD = (date) => date.toLocaleDateString("en-ZA");

const formatDateLocale = () => map(toYYYYMMDD);

const dateDiffDays = (date1, date2) => {
  const dt1 = new Date(date1);
  const dt2 = new Date(date2);
  return Math.floor(
    (Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) -
      Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) /
      (1000 * 60 * 60 * 24)
  );
};

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
      return getWeek(date);
    }),
    distinctUntilChanged()
  );
};

module.exports = {
  toYYYYMMDD,
  toDayName,
  toMonthName,
  dateDiffDays,
  getWeek,
  getCalendarDaysStartingAt,
  getCalendarWeeksStartingAt,
  formatDateLocale,
};
