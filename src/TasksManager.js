const { dateDiffDays } = require("./calendar");

const TasksManager = (items) => {
  let state = { items };

  const getState = () => ({ items: [...state.items] });

  const updateState = (newState) => (state = newState);

  const getBounds = () => {
    if (!state.items || !state.items[0]) {
      return {};
    }
    let firstTaskDate = state.items[0].date;
    let lastTaskDate = state.items[state.items.length - 1].date;
    return { firstTaskDate, lastTaskDate };
  };

  const getDateBeforeLastTaskDate = (days) => {
    const { lastTaskDate } = getBounds();
    const d = new Date(lastTaskDate);
    d.setDate(d.getDate() - days);
    // const gap = Math.abs(dateDiffDays(d, lastTaskDate));
    // if (gap > getLength()) {
    //   return null;
    // } else {
    return d;
    // }
  };

  const getLength = () => {
    const { firstTaskDate, lastTaskDate } = getBounds();
    return Math.abs(dateDiffDays(firstTaskDate, lastTaskDate)) + 1;
  };

  const log = () => {
    const { firstTaskDate, lastTaskDate } = getBounds();
    console.log("🚀 firstTaskDate", firstTaskDate);
    console.log("🚀 lastTaskDate", lastTaskDate);
    console.log("🚀 Interval in days", getLength());
  };

  return {
    getState,
    updateState,
    getBounds,
    getDateBeforeLastTaskDate,
    getLength,
    log,
  };
};

module.exports = { TasksManager };
