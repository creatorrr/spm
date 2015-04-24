import { createReadStream } from "fs";

import extract from "../src/extract";
import { getPath } from "../src/utils";

export default function testExtract ({done, equal, expect}) {
  expect(1);

  let
    inStream = createReadStream("./test/fixtures.tgz"),
    extracted = extract(inStream);

  extracted.then(result => {
    let path = "fixtures/packtest/omega.txt";

    // Make sure the path maps to correct entry
    equal(
      path,
      getPath(result, path).path
    );

    done();
  });
}
