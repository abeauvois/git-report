const { toYYYYMMDD, toDayName, toMonthName, dateDiffDays } = require("../src/calendar");
const { TasksManager } = require("../src/TasksManager");

describe("Task Manager", () => {
  test("R1: getstate and getLength should return tasks and length", () => {
    const tasks = [
      {
        date: "2020/12/23",
        day: 23,
        dayWeek: 3,
        messagesAm: "msg1 23 dec 2020",
        messagesPm: "off",
        month: 11,
        week: 52,
        year: 2020,
      },
      {
        date: "2020/12/24",
        day: 24,
        dayWeek: 4,
        messagesAm: "off",
        messagesPm: "msg1 24 dec 2020",
        month: 11,
        week: 52,
        year: 2020,
      },
      {
        date: "2020/12/25",
        day: 25,
        dayWeek: 5,
        messagesAm: "off",
        messagesPm: "off",
        month: 11,
        week: 52,
        year: 2020,
      },
    ];
    const tm = TasksManager(tasks);
    const items = tm.getState().items;
    expect(items).toEqual(tasks);

    items.push({});
    expect(items).not.toEqual(tm.getState().items);

    const length = tm.getLength();
    expect(length).toEqual(3);

    const { firstTaskDate, lastTaskDate } = tm.getBounds();
    expect(firstTaskDate).toEqual("2020/12/23");
    expect(lastTaskDate).toEqual("2020/12/25");
  });

  test("R2: update state should replace the state", () => {
    const tasks = [
      {
        date: "2020/12/23",
        day: 23,
        dayWeek: 3,
        messagesAm: "msg1 23 dec 2020",
        messagesPm: "off",
        month: 11,
        week: 52,
        year: 2020,
      },
      {
        date: "2020/12/24",
        day: 24,
        dayWeek: 4,
        messagesAm: "off",
        messagesPm: "msg1 24 dec 2020",
        month: 11,
        week: 52,
        year: 2020,
      },
      {
        date: "2020/12/25",
        day: 25,
        dayWeek: 5,
        messagesAm: "off",
        messagesPm: "off",
        month: 11,
        week: 52,
        year: 2020,
      },
    ];

    const tm = TasksManager(tasks);

    const state = tm.getState();
    expect(state.items).toEqual(tasks);

    tm.updateState({ items: [] });

    expect(tm.getState().items).toEqual([]);
  });

  test("R3: getDateBeforeLastTaskDate should not mutate TasksManager state", () => {
    const tasks = [
      {
        date: "2020/12/23",
        day: 23,
        dayWeek: 3,
        messagesAm: "msg1 23 dec 2020",
        messagesPm: "off",
        month: 11,
        week: 52,
        year: 2020,
      },
      {
        date: "2020/12/24",
        day: 24,
        dayWeek: 4,
        messagesAm: "off",
        messagesPm: "msg1 24 dec 2020",
        month: 11,
        week: 52,
        year: 2020,
      },
      {
        date: "2020/12/25",
        day: 25,
        dayWeek: 5,
        messagesAm: "off",
        messagesPm: "off",
        month: 11,
        week: 52,
        year: 2020,
      },
    ];

    const tm = TasksManager(tasks);

    const length = tm.getLength();
    expect(length).toEqual(3);

    const firstDate = tm.getDateBeforeLastTaskDate(1);
    expect(toYYYYMMDD(firstDate)).toEqual("2020/12/24");

    const lengthAfter = tm.getLength();
    expect(lengthAfter).toEqual(3);
  });
});
