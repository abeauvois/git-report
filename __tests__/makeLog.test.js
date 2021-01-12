const { makeLog, execShellCommand } = require("../src/makeLog");

describe("MakeLog", () => {
  test('R0: execShellCommand echo ""', async () => {
    const exit = await execShellCommand("echo");
    expect(exit).toEqual(true);
  });
  test("R0: execShellCommand echo any", async () => {
    const exit = await execShellCommand("echo any");
    expect(exit).toEqual(true);
  });
  test("R0: execShellCommand git log", async () => {
    const exit = await execShellCommand(`git log --date=local --pretty=format:'%h, %an, %ad, "%s"'`);
    expect(exit).toEqual(true);
  });
  test("R1: makeLog echo", async () => {
    const create = await makeLog("test.csv", "abeauvois");
    expect(create).toEqual(true);

    const remove = await execShellCommand("rm test.csv");
    expect(remove).toEqual(true);
  });
});
