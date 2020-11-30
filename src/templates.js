const c = require("chalk");

const toDayName = (day) => {
  var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return dayNames[day];
};

const toMonthName = (month) => {
  var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Oct", "Nov", "Dec"];
  return monthNames[month];
};

const monthTemplate = (month, display = "html") =>
  display !== "html" ? `${c.blue(toMonthName(month - 1))}` : `<strong>${month - 1}, ${toMonthName(month - 1)}</strong>`;

const dayTemplate = (day, display = "html") => (display !== "html" ? c.yellow(day.day) : `<strong>${day.day}</strong>`);

let lastMonth = null;

const consoleTemplate = (template) => (result) => {
  const [year, [month, commit]] = result;

  const initialValue = lastMonth === null || month !== lastMonth ? `${monthTemplate(month, "console")} ${year}\n` : "";
  if (lastMonth === null) {
    lastMonth = month;
  }

  template = template ? (template += initialValue) : initialValue;

  template += `${c.yellow(toDayName(commit.dayWeek))}, ${c.yellow(commit.day)}\n`;
  template += `AM: ${c.yellow(commit.messagesAm)}\n`;
  template += `PM: ${c.yellow(commit.messagesPm)}\n`;

  template += "\n";
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
  htmlTemplate,
  consoleTemplate,
};
