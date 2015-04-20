// Enable tests written in ES6
require("babel/register");

// Require tests
module.exports = {
  "testPackage": require("./testPackage"),
  "testUtils": require("./testUtils")
};
