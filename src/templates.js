const c = require("chalk");

const { toDayName, toMonthName } = require("../src/calendar");

const yearTemplate = (year, display = "html") =>
  display !== "html" ? `${c.red(year)}` : `<strong>${year}, ${year}</strong>`;

const monthTemplate = (month, display = "html") =>
  display !== "html" ? `${c.blue(toMonthName(month))}` : `<strong>${month}, ${toMonthName(month)}</strong>`;

const dayTemplate = (day, display = "html") => (display !== "html" ? c.yellow(day.day) : `<strong>${day.day}</strong>`);

let lastYear = null;
let lastMonth = null;
let lastWeek = null;

const consoleTemplate = (template) => (result) => {
  const [year, [month, [week, tasks]]] = result;

  const newYear = lastYear === null || year !== lastYear ? `${yearTemplate(year, "console")}\n` : "";
  if (lastYear === null) {
    lastYear = year;
    lastMonth = null;
  }

  const newMonth = lastMonth === null || month !== lastMonth ? `${monthTemplate(month, "console")}\n` : "";

  if (lastMonth === null) {
    lastMonth = month;
  }

  const newWeek = lastWeek === null || week !== lastWeek ? `Week ${week}\n` : "";
  if (lastWeek === null) {
    lastWeek = week;
  }

  template = template ? (template += newYear) : newYear;
  template += newMonth;
  template += newWeek;

  tasks.forEach((commit) => {
    template += `${c.yellow(toDayName(commit.dayWeek))}, ${c.yellow(commit.day)}\n`;
    template += `AM: ${c.yellow(commit.messagesAm)}\n`;
    template += `PM: ${c.yellow(commit.messagesPm)}\n`;

    template += "\n";
  });

  return template;
};

const htmlTemplate = ([month, days]) => {
  let template;
  const initialValue = `Month ${monthTemplate(month)}<br>`;

  template = template ? (template += initialValue) : initialValue;

  template += `<br>`;

  days.forEach((day) => {
    template += `Day ${dayTemplate(day)}: ${day.messages}<br>`;
  });

  template += `<br>`;
  return template;
};

module.exports = {
  monthTemplate,
  dayTemplate,
  toDayName,
  htmlTemplate,
  consoleTemplate,
};
