import rewire from "rewire";

import { mockOboe } from "./mocks";
const utils = rewire("../src/utils");

export default function testUtils ({deepEqual, done, equal, expect, ifError, ok}) {
  expect(6);

  let
    {flip, findSatisfactoryVersion, getPath, setPath} = utils;

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

  let obj = {a: {b: {c: 0}}};
  // getPath gets object value by path
  equal(
    getPath(obj, "a/b/c"),
    obj.a.b.c
  );

  // setPath sets a object value path to value
  setPath(
    obj,
    "a/b/c",
    2
  );

  equal(
    obj.a.b.c,
    2
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
