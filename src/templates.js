const c = require("chalk");

const monthTemplate = (month, display = "html") => (display !== "html" ? c.blue(month) : `<strong>${month}</strong>`);
const dayTemplate = (day, display = "html") => (display !== "html" ? c.yellow(day.day) : `<strong>${day.day}</strong>`);

const consoleTemplate = (template) => ([month, days]) => {
  const initialValue = `Month ${monthTemplate(month, "console")}\n`;

  template = template ? (template += initialValue) : initialValue;

  days.forEach((day) => {
    template += `Day ${c.yellow(day.day)}: ${day.messages}\n`;
  });

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
