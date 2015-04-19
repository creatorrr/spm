import originalOboe from "oboe";
import rewire from "rewire";

const utils = rewire("../src/utils");

export default function testUtils ({deepEqual, done, equal, expect}) {
  expect(2);

  let
    {flip, findSatisfactoryVersion} = utils;

  // flip flips arguments
  deepEqual(
    flip(Array)(1,2),
    [1,2].reverse()
  );

  // findSatisfactoryVersion returns the highest matching version
  equal(
    findSatisfactoryVersion("<=1.2.0", ["0.1.0", "1.3.0", "1.1.9"]),
    "1.1.9"
  );

  done();
}
