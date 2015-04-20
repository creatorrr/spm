import rewire from "rewire";

import testData from "./data";
const Package = rewire("../src/package");

export default function testPackage ({doesNotThrow, done, expect, ifError, ok, throws}) {
  expect(6);

  let
    pkg = new Package,
    testConfig = testData["versions"]["1.0.0"];

  // init package
  doesNotThrow(
    pkg.init.bind(pkg, testConfig)
  );

  // package should be valid
  ok(pkg.isValid());

  // Not anymore
  pkg.version = "lady gaga";
  ok(!pkg.isValid());

  // package cannot be init twice
  throws(
    pkg.init.bind(pkg, testConfig)
  );

  // Mock module
  Package.__set__({
    getJSON: () => testConfig,

    // Dirty hack for es transpiler compat
    _getJSON: {
      getJSON: () => testConfig
    }
  });

  let
    mockedPkg = new Package,

    tests = [
      // Make sure pkg emits load event
      new Promise(resolve =>
        mockedPkg.on("load", pkg => {
          ok(pkg);
          resolve();
        })
      ),

      // getJSON fetches json as obj
      mockedPkg.load("http://registry.npmjs.org/co/1.0.0")
        .then(({name}) => {
          ok(name);
        })
        .catch(ifError)
    ];

  Promise.all(tests)
    .then(() => done());
}

