const { toArray } = require("rxjs/operators");
const { fromCSVFile } = require("../src/fromCSVFile");

let received, expected, result;

describe("csv", () => {
  beforeEach(() => {
    received = null;
    expected = null;
  });
  test("R1: fromCSVFile", (done) => {
    result = null;
    fromCSVFile("./__tests__/test_file.csv")
      .pipe(toArray())
      .subscribe(
        (received) => {
          expect(received).toMatchSnapshot();
          done();
        },
        (e) => e
      );
  });
});
