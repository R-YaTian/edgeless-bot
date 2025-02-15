import { ProducerParameters, ProducerReturned } from "../../src/class";
import fs from "fs";
import { Err, Ok, Result } from "ts-results";
import path from "path";
import { writeGBK } from "../../src/utils";

import shell from "shelljs";

interface RequiredObject {
  shortcutName: string;
}

export default async function (
  p: ProducerParameters
): Promise<Result<ProducerReturned, string>> {
  const { workshop, downloadedFile, requiredObject, taskName } = p;
  const { shortcutName } = requiredObject as RequiredObject;
  const ready = path.join(workshop, "ready");
  const aDF = path.join(workshop, downloadedFile),
    rD = `${workshop}/ready/${taskName}`;

  shell.mkdir("-p", rD);
  shell.mv(aDF, rD);
  writeGBK(
    path.join(ready, taskName + ".wcs"),
    `LINK X:\\Users\\Default\\Desktop\\${shortcutName},%ProgramFiles%\\Edgeless\\${taskName}\\${downloadedFile}`
  );

  const exist = function (p: string): boolean {
    return fs.existsSync(path.join(ready, p));
  };
  if (exist(taskName + ".wcs") && exist(taskName + "/" + downloadedFile)) {
    return new Ok({
      readyRelativePath: "ready",
    });
  } else {
    return new Err(
      "Error:Click2install self check failed due to file missing in ready folder"
    );
  }
}
