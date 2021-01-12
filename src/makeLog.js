const exec = require("child_process").exec;

function execShellCommand(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { maxBuffer: 1024 * 500 }, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      } else if (stdout) {
        // console.log(stdout);
      } else {
        console.log(stderr);
      }
      resolve(stdout ? true : stdout === "" ? true : false);
    });
  });
}

async function makeLog(filename, username) {
  await execShellCommand(`echo sha, contributor, date, message > ${filename}`);
  await execShellCommand(
    `git log --date=local --pretty=format:'%h, %an, %ad, "%s"' | egrep ${username} >> ${filename}`
  );

  const exit = await execShellCommand(`cat ${filename}`);

  return exit;
}

module.exports = {
  execShellCommand,
  makeLog,
};
