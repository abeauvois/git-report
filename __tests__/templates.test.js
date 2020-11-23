const c = require("chalk");
const { monthTemplate, dayTemplate, htmlTemplate, consoleTemplate } = require("../src/templates");

let received, expected, fromCSVfile;

describe("templates", () => {
  beforeEach(() => {
    fromCSVfile = [
      9,
      [
        { day: 1, messages: "m1" },
        { day: 2, messages: "m2" },
      ],
    ];
    received = null;
    expected = null;
  });
  test("R1: htmlTemplate: month in console", () => {
    received = monthTemplate(fromCSVfile[0], "console");
    expected = c.blue(fromCSVfile[0]);
    expect(received).toEqual(expected);
  });

  test("R2: htmlTemplate: month in html", () => {
    received = monthTemplate(fromCSVfile[0]);
    expected = `<strong>${fromCSVfile[0]}</strong>`;
    expect(received).toEqual(expected);
  });

  test("R3: htmlTemplate: day in console", () => {
    const days = fromCSVfile[1];

    received = dayTemplate(days[0], "console");
    expected = c.yellow(days[0].day);
    expect(received).toEqual(expected);
  });

  test("R4: htmlTemplate: day in html", () => {
    const days = fromCSVfile[1];

    received = dayTemplate(days[0]);
    expected = `<strong>${days[0].day}</strong>`;
    expect(received).toEqual(expected);
  });

  test("R5: htmlTemplate", () => {
    received = htmlTemplate(fromCSVfile);
    expect(received).toMatchSnapshot();
  });

  test("R5: consoleTemplate", () => {
    received = consoleTemplate(fromCSVfile);
    expect(received).toMatchSnapshot();
  });
});
