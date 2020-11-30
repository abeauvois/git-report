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
  test("R1: monthTemplate: month in console", () => {
    received = monthTemplate(fromCSVfile[0], "console");
    expect(received).toMatchSnapshot();
  });

  test("R2: monthTemplate: month in html", () => {
    received = monthTemplate(fromCSVfile[0]);
    expect(received).toMatchSnapshot();
  });

  test("R3: dayTemplate: day in console", () => {
    const days = fromCSVfile[1];

    received = dayTemplate(days[0], "console");
    expect(received).toMatchSnapshot();
  });

  test("R4: dayTemplate: day in html", () => {
    const days = fromCSVfile[1];

    received = dayTemplate(days[0]);
    expect(received).toMatchSnapshot();
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
