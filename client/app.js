const markupFactory = require("./index.pug");
//there are no variables to pass to the template. Being verbose because I am unfamiliar
const markup = markupFactory({});
document.write(markup);

(function () {
  const StateLearner = require("state-learner");
  /* ???: 2017.05.29: Discovered comments said that these were used directly, but I can't see how. Possibly was originally intended as "types that are intantiated by other classes, but used here"? The PredictionData type is returned and by one of the methods used by this class (stateLearner.makePrediction).
  const PredictionData = require("PredictionData.js");
  //const IncidenceMap = require("IncidenceMap.js");
  const ArrayMap = require("ArrayMap.js");
  */

  //faux enumeration
  //???: is there a new way of doing enumerations in ECMAScript? Should I use it here?
  var ROCK = "R";
  var PAPER = "P";
  var SCISSORS = "S";

  //construct
  var rPSAI;
  var lastPrediction;
  var roundsPassed;
  var allStates;
  var aIWins;
  window.onload = function ()
  {
    roundsPassed = 0;
    allStates = new Array(ROCK, PAPER, SCISSORS);
    aIWins = 0;
    rPSAI = new StateLearner();
    enforceRecall();
    renewPrediction();
  }

  function enforcePredictionVisibility ()
  {
    function setInsidesOfTo (node, displayStyle)
    {
      if (node.firstChild)
      {
        node.firstChild.style.display = displayStyle;
      }
    }
    
    var checkbox = document.getElementById("guessVisible");
    if (!checkbox.checked)
    {
      setInsidesOfTo(document.getElementById("rockGuess"), "none");
      setInsidesOfTo(document.getElementById("paperGuess"), "none");
      setInsidesOfTo(document.getElementById("scissorsGuess"), "none");
    }
    else
    {
      setInsidesOfTo(document.getElementById("rockGuess"), "block");
      setInsidesOfTo(document.getElementById("paperGuess"), "block");
      setInsidesOfTo(document.getElementById("scissorsGuess"), "block");
    }
  }

  function enforceRecall ()
  {
    var recallNode = document.getElementById("recall");
    
    var enteredRecall = Number(recallNode.value);
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
    
    rPSAI.recall = enteredRecall;
    recallNode.value = enteredRecall;
  }

  function getPredictionCellOf (state)
  {
    var predictionCell;
    if (state == ROCK)
    {
      predictionCell = document.getElementById("rockGuess");
    }
    else if (state == PAPER)
    {
      predictionCell = document.getElementById("paperGuess");
    }
    else if (state == SCISSORS)
    {
      predictionCell = document.getElementById("scissorsGuess");
    }
    return predictionCell;
  }

  function selectRock ()
  {
    rPSAI.takeInput(ROCK);
    addHistory(ROCK, lastPrediction);
    renewPrediction();
  }

  function selectPaper ()
  {
    rPSAI.takeInput(PAPER);
    addHistory(PAPER, lastPrediction);
    renewPrediction();
  }

  function selectScissors ()
  {
    rPSAI.takeInput(SCISSORS);
    addHistory(SCISSORS, lastPrediction);
    renewPrediction();
  }

  function renewPrediction ()
  {
    //clear old prediction
    if (lastPrediction != undefined)
    {
      var oldPredictionCell = getPredictionCellOf(lastPrediction);
      var oldPredictionSpan = oldPredictionCell.childNodes[0];
      oldPredictionCell.removeChild(oldPredictionSpan);
    }
    
    var predictionData = rPSAI.makePrediction();
    if (predictionData.matchLength == undefined)
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
    
    var predictionCell = getPredictionCellOf(newPrediction);
    
    var box = document.createElement("span");
    box.className = "aISelect";
    predictionCell.appendChild(box);
    
    lastPrediction = newPrediction;
    
    enforcePredictionVisibility();
  }

  function addHistory (humanSelection, aISelection)
  {
    var tableNode = document.getElementById("tableBody");
    var recentRow = tableNode.getElementsByTagName("tr")[3];
    //remove the text "History:" from recent row and replace it with the round number, because it is going to be shifted down.
    var roundCell = recentRow.getElementsByTagName("td")[0];
    var roundText = roundCell.firstChild;
    //it's roundsPassed-1 because we're labelling the row for the round that has just passed and is being pushed down.
    roundText.data = roundsPassed+1;
    
    var newRow = document.createElement("tr");
    var historyCell = document.createElement("td");
    var historyText = document.createTextNode("History:");
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
    if (roundsPassed == 0)
    {
      //if this is the first round, then the previous round's row that just got pushed down will be the blank placeholder row that the page is initialized with, so delete it for aesthetics' sake.
      tableNode.removeChild(recentRow);
    }
    
    //update statistics
    if (aISelection == humanSelection)
    {
      aIWins++;
    }
    var aIAccuracyNode = document.getElementById("aIAccuracy");
    var aIGainNode = document.getElementById("aIGain");
    var normalizedNode = document.getElementById("normalizedGain");
    //the statistics are blank in the first round, and they can't be filled until two rounds have passed, so we don't have to empty them before adding the new ones if either of these conditions hold.
    
    //remove data if roundsPassed >= 1 because only then will there be any data to remove
    if (roundsPassed >= 1)
    {
      var oldAccuracy = aIAccuracyNode.firstChild
      var oldGain = aIGainNode.firstChild
      var oldNormalized = normalizedNode.firstChild;
      aIAccuracyNode.removeChild(oldAccuracy);
      aIGainNode.removeChild(oldGain);
      normalizedNode.removeChild(oldNormalized);
    }
    
    var newAccuracy = aIWins/(roundsPassed+1);
    //*10000/100 dance is done to get an answer to 2 decimal places
    var newAccuracyPercentage = (Math.round(newAccuracy*10000)/100);
    var newAccuracyText = document.createTextNode(newAccuracyPercentage+"%");
    aIAccuracyNode.appendChild(newAccuracyText);
    
    var newGain = (newAccuracy-(1/allStates.length));
    var newGainPercentage = Math.round(newGain*10000)/100;
    var newGainText = document.createTextNode(newGainPercentage+"%");
    aIGainNode.appendChild(newGainText);
    
    var newNormalized = newGain/(1/3);
    var newNormalizedPercentage = Math.round(newNormalized*10000)/100;
    var newNormalizedText = document.createTextNode(newNormalizedPercentage+"%");
    normalizedNode.appendChild(newNormalizedText);
    
    roundsPassed++;
  }
});