const RPSLearner = require("./RPSLearner.js");

window.onload = function () {
  var rPSLearner = new RPSLearner();
  document.body.appendChild(rPSLearner.dOMRoot);
}