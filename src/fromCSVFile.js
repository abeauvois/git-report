const { fromCSV } = require("rx-from-csv");
// path: csv file path
// options: optional configuration for the csv creation
// delimiter: a character to separate values. Default: ,
// noHeaderRow: a boolean value to indicate whether there is a head row.
// columns: an array of column names. This is required if noHeaderRow is true.

const fromCSVFile = (filename) => {
  return fromCSV(filename, {
    delimiter: ",",
    noHeaderRow: true,
    columns: ["sha", "contributor", "date", "message"],
  });
};

module.exports = {
  fromCSVFile,
};
