module.exports = (input) => {
  var array = input[0].split(" ");
  var result = "";
  for (var i = array.length - 1; i >= 0; i--) {
    result += array[i] + " ";
  }
  console.log("REVERSE");
  console.log("input :", input);
  console.log("output :", result);
  return result;
};
