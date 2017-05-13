const assert = require("assert");
const StateLearner = require("../lib/StateLearner/StateLearner.js");
const PredictionData = require("../lib/StateLearner/PredictionData.js");

describe("State Learner", function () {

  describe("#makePrediction", function () {

    it("undefined if history is empty", function () {
      var sample = new StateLearner();
      assert.strictEqual(sample.makePrediction(), undefined);
    });

    it("prefers longer history matches", function () {
      var sample = new StateLearner();
      
      //longer match leads to C
      sample.append("A");
      sample.append("B");
      sample.append("C");

      //shorter match leads to D
      sample.append("B");
      sample.append("D");

      //set recent history to match both short and long antecedents
      sample.append("A");
      sample.append("B");

      assert.deepStrictEqual(sample.makePrediction(), new PredictionData(2, ["C"]));
    });

    it("returns multiple matches when there is a tie for longest matched history", function () {
      var sample = new StateLearner();

      //A is followed just as often by B as it is by C
      sample.append("A");
      sample.append("B");
      sample.append("A");
      sample.append("C");

      //set recent history
      sample.append("A");

      const prediction = sample.makePrediction();
      const correctAnswer = new PredictionData(1, ["B","C"]);

      assert.deepStrictEqual(prediction, correctAnswer);
    });

    it("degenerates to searching for a zero-length history, which matches all times in history", function () {
      var sample = new StateLearner()
      
      //a history where one option has a higher incidence than the others
      sample.append("A");
      sample.append("B");
      sample.append("A");

      //a recent history that has no precedence, so that it will have to rely on searching for a zero-length history
      sample.append("Z");

      const correctAnswer = new PredictionData(0, ["A"]);

      assert.deepStrictEqual(sample.makePrediction(), correctAnswer);
    })
  });
});