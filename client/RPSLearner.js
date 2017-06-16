const StateLearner = require("state-learner");

//???: is there a new way of doing enumerations in ECMAScript? Should I use it here? 
//faux enumeration
const ROCK = "R";
const PAPER = "P";
const SCISSORS = "S";
const allStates = new Array(ROCK, PAPER, SCISSORS);

function RPSLearner () {
  this._rPSAI = new StateLearner();

  //???: not sure if the root should be an element, or a collection of sibling elements, or what. Choosing single element for now, because that is simpler to implement
  var dOMRoot = document.createElement("div");
  dOMRoot.innerHTML = require("./index.pug");

  var styleElement = document.createElement("style");
  //loaders convert less to css so we don't have to do it here
  styleElement.innerHTML = require("./index.less");
  dOMRoot.appendChild(styleElement);

  //references to commonly-used elements
  this._dOMShorthand = {
    selectRock: dOMRoot.querySelector("#selectRock"),
    selectPaper: dOMRoot.querySelector("#selectPaper"),
    selectScissors: dOMRoot.querySelector("#selectScissors"),
    rockGuess: dOMRoot.querySelector("#rockGuess"),
    paperGuess: dOMRoot.querySelector("#paperGuess"),
    scissorsGuess: dOMRoot.querySelector("#scissorsGuess"),
    tableBody: dOMRoot.querySelector("#tableBody"),
    guessVisible: dOMRoot.querySelector("#guessVisible"),
    recall: dOMRoot.querySelector("#recall"),
    aIAccuracy: dOMRoot.querySelector("#aIAccuracy"),
    aIGain: dOMRoot.querySelector("#aIGain"),
    normalizedGain: dOMRoot.querySelector("#normalizedGain")
  }

  //when you click buttons
  const th = this;
  this._dOMShorthand.selectRock.addEventListener("click", function () {th._selectRock();});
  this._dOMShorthand.selectPaper.addEventListener("click", function () {th._selectPaper();});
  this._dOMShorthand.selectScissors.addEventListener("click", function () {th._selectScissors()});
  this._dOMShorthand.guessVisible.addEventListener("click", function () {th._enforcePredictionVisibility()});
  this._dOMShorthand.recall.addEventListener("blur", function () {th._enforceRecall()});


  
  this._lastPrediction;
  this._roundsPassed = 0;
  this._aIWins = 0;
  
  //initialize
  this._enforceRecall();
  this._renewPrediction();
  this._enforcePredictionVisibility();
  
  this.dOMRoot = dOMRoot;
}

RPSLearner.prototype._enforcePredictionVisibility = function ()
{
  function setInsidesOfTo (node, displayStyle)
  {
    if (node.firstChild)
    {
      node.firstChild.style.display = displayStyle;
    }
  }
  
  if (!this._dOMShorthand.guessVisible.checked)
  {
    setInsidesOfTo(this._dOMShorthand.rockGuess, "none");
    setInsidesOfTo(this._dOMShorthand.paperGuess, "none");
    setInsidesOfTo(this._dOMShorthand.scissorsGuess, "none");
  }
  else
  {
    setInsidesOfTo(this._dOMShorthand.rockGuess, "block");
    setInsidesOfTo(this._dOMShorthand.paperGuess, "block");
    setInsidesOfTo(this._dOMShorthand.scissorsGuess, "block");
  }
}

RPSLearner.prototype._enforceRecall = function ()
{
  var enteredRecall = Number(this._dOMShorthand.recall.value);
  if (isNaN(enteredRecall))
  {
    //this will also catch misspellings of "Infinity," like "infinity," so we don't need to catch those specifically.
    enteredRecall = Infinity;
  }
  else if (enteredRecall < 0)
  {
    enteredRecall = 0;
  }
  else
  {
    enteredRecall = Math.round(enteredRecall, 1);
  }
  
  this._rPSAI.recall = enteredRecall;
  this._dOMShorthand.recall.value = enteredRecall;
}

RPSLearner.prototype._getPredictionCellOf = function (state)
{
  var predictionCell;
  if (state == ROCK)
  {
    predictionCell = this._dOMShorthand.rockGuess;
  }
  else if (state == PAPER)
  {
    predictionCell = this._dOMShorthand.paperGuess;
  }
  else if (state == SCISSORS)
  {
    predictionCell = this._dOMShorthand.scissorsGuess;
  }
  return predictionCell;
}

RPSLearner.prototype._selectRock = function ()
{
  this._rPSAI.append(ROCK);
  this._addHistory(ROCK, this._lastPrediction);
  this._renewPrediction();
}

RPSLearner.prototype._selectPaper = function ()
{
  this._rPSAI.append(PAPER);
  this._addHistory(PAPER, this._lastPrediction);
  this._renewPrediction();
}

RPSLearner.prototype._selectScissors = function ()
{
  this._rPSAI.append(SCISSORS);
  this._addHistory(SCISSORS, this._lastPrediction);
  this._renewPrediction();
}

RPSLearner.prototype._renewPrediction = function ()
{
  //clear old prediction
  if (this._lastPrediction != undefined)
  {
    var oldPredictionCell = this._getPredictionCellOf(this._lastPrediction);
    var oldPredictionSpan = oldPredictionCell.childNodes[0];
    oldPredictionCell.removeChild(oldPredictionSpan);
  }
  
  var predictionData = this._rPSAI.makePrediction();
  if (predictionData === undefined)
  {
    //if predictionData.matchLength is undefined, that means that StateLearner was forced to make a prediction without any data.
    var randomIndex = Math.round(Math.random()*(allStates.length-1));
    var newPrediction = allStates[randomIndex];
  }
  else if (predictionData.states.length >= 2)
  {
    //if predictionData.state is an array of more than one element, it means that the contents of the array should be treated as a Set of states that were tied in match length
    var randomIndex = Math.round(Math.random()*(predictionData.states.length-1));
    var newPrediction = predictionData.states[randomIndex];
  }
  else
  {
    var newPrediction = predictionData.states[0];
  }
  
  var predictionCell = this._getPredictionCellOf(newPrediction);
  
  var box = document.createElement("span");
  box.className = "aISelect";
  predictionCell.appendChild(box);
  
  this._lastPrediction = newPrediction;
  
  this._enforcePredictionVisibility();
}

RPSLearner.prototype._addHistory = function (humanSelection, aISelection)
{
  var tableNode = this._dOMShorthand.tableBody;
  var recentRow = tableNode.getElementsByTagName("tr")[3];
  //remove the text "History:" from recent row and replace it with the round number, because it is going to be shifted down.
  
  var roundCell = recentRow.getElementsByTagName("td")[0];
  var roundText = roundCell.firstChild;
  //it's roundsPassed-1 because we're labelling the row for the round that has just passed and is being pushed down.
  roundText.data = this._roundsPassed;
  
  var newRow = document.createElement("tr");
  var historyCell = document.createElement("td");
  var historyText = document.createTextNode(this._roundsPassed+1);
  historyCell.appendChild(historyText);
  newRow.appendChild(historyCell);
  
  var rockCell = document.createElement("td");
  var paperCell = document.createElement("td");
  var scissorsCell = document.createElement("td");
  
  var cellOf = new Array();
  cellOf[ROCK] = rockCell;
  cellOf[PAPER] = paperCell;
  cellOf[SCISSORS] = scissorsCell;
  
  if (humanSelection == aISelection)
  {
    var selectionNode = document.createElement("span");
    selectionNode.className = "bothSelect";
    var selectionCell = cellOf[humanSelection];
    selectionCell.appendChild(selectionNode);
  }
  else
  {
    var humanSelectionNode = document.createElement("span");
    humanSelectionNode.className = "humanSelect";
    var humanSelectionCell = cellOf[humanSelection];
    humanSelectionCell.appendChild(humanSelectionNode);
    
    if (aISelection != undefined)
    {
      
      var aISelectionNode = document.createElement("span");
      aISelectionNode.className = "aISelect";
      var aISelectionCell = cellOf[aISelection];
      aISelectionCell.appendChild(aISelectionNode);
    }
  }
  
  newRow.appendChild(rockCell);
  newRow.appendChild(paperCell);
  newRow.appendChild(scissorsCell);
  
  tableNode.insertBefore(newRow, recentRow);
  if (this._roundsPassed == 0)
  {
    //if this is the first round, then the previous round's row that just got pushed down will be the blank placeholder row that the page is initialized with, so delete it for aesthetics' sake.
    tableNode.removeChild(recentRow);
  }
  
  //update statistics
  if (aISelection == humanSelection)
  {
    this._aIWins++;
  }
  
  var newAccuracy = this._aIWins/(this._roundsPassed+1);
  //*10000/100 is done to get an answer to 2 decimal places
  var newAccuracyPercentage = (Math.round(newAccuracy*10000)/100);
  this._dOMShorthand.aIAccuracy.innerHTML = newAccuracyPercentage+"%"
  
  var newGain = (newAccuracy-(1/allStates.length));
  var newGainPercentage = Math.round(newGain*10000)/100;
  this._dOMShorthand.aIGain.innerHTML = newGainPercentage+"%";
  
  var newNormalized = newGain/(1/3);
  var newNormalizedPercentage = Math.round(newNormalized*10000)/100;
  this._dOMShorthand.normalizedGain.innerHTML = newNormalizedPercentage+"%";
  
  this._roundsPassed++;
}

module.exports = RPSLearner;