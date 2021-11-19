const fs = require("fs");

module.exports = (input) => {
  var data = fs.readFileSync(input[0], "utf8");
  console.log("READ");
  console.log("input :", input);
  console.log("output :", data.toString());
  return data.toString();
};
