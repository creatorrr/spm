// Enable tests written in ES6
require("babel/register");

// Require tests
module.exports = {
  "testDependencyTree": require("./testDependencyTree"),
  "testExtract": require("./testExtract"),
  "testPackage": require("./testPackage"),
  "testSPM": require("./testSPM"),
  "testUtils": require("./testUtils")
};
