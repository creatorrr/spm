import rewire from "rewire";

import { mockOboe } from "./mocks";
const utils = rewire("../src/utils");

export default function testUtils ({deepEqual, done, equal, expect, ifError, ok}) {
  expect(4);

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

  // Mock module
  utils.__set__({
    oboe: mockOboe
  });

  let
    {getJSON, getJSONProp} = utils,

    tests = [
      // getJSON fetches json as obj
      getJSON("http://registry.npmjs.org/co")
        .then(({name}) => {
          ok(name);
        })
        .catch(ifError),

      // getJSONProp fetches a particular prop from json
      getJSONProp("http://registry.npmjs.org/co", "name")
        .then((name) => {
          ok(name);
        })
        .catch(ifError)
    ];

  Promise.all(tests)
    .then(() => done());
}
