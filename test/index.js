// Enable tests written in ES6
require("babel/register");

// Require tests
module.exports = {
  "testDependencyTree": require("./testDependencyTree"),
  "testPackage": require("./testPackage"),
  "testUtils": require("./testUtils")
};
