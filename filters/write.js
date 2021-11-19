const fs = require("fs");

module.exports = (input, params) => {
  console.log("WRITE");
  console.log("input :", input);
  console.log("params :", params);
  // console.log("output :", result);
  fs.writeFileSync(params[0], input[0]);
  return "bonjour";
};
