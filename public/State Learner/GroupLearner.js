/****** ABOUT ******

GroupLearner

	Author: Tom Lamb, Lambyte.com
	Created: 2007.07.29
	Released: 
	Description: An object that finds patterns in a given sequence of elements from a single group. It does this by looking for patterns not only in the given sequence itself, but in the sequence formed by the relationships between the elements of the given sequence, and in the sequence of relationships between those relationships, and so on.
	I didn't originally mean for the constraints to be so similar to those of groups, but after I decided what they had to be, I realized they were the same. Since I'm not very educated with Groups though, I use jargon from my Numeric Operators scheme when it comes to functions.
	

****** ***** ******/

Page.includeOnce("Diag.js");
Page.includeOnce("IncidenceMap.js");
Page.includeOnce("State%20Learner/PredictionData.js");
Page.includeOnce("State%20Learner/StateLine.js");


/******** CONSTRUCTOR ********/

function GroupLearner (recall, productFrom, postFrom)
{
	this.recall = recall || Infinity;
	this.productFrom = productFrom || function (pre, post) {return undefined;};
	this.postFrom = postFrom || function (pre, difference) {return undefined;};
	this._stateLines = new Array();
	this.arrayFormat = new Array();
	Diag.traceEnabled = true;
	Diag.trace("Hello World");
}


/******** PROPERTIES ********/

//The longest series of states that this is allowed to remember
GroupLearner.prototype._recall;
//Structure of differences: _stateLines[n] = the state line for the nth level of multiplication
GroupLearner.prototype._stateLines;
//The GroupLearner whose history is made up of the difference between all adjacent states in this GroupLearner's history
GroupLearner.prototype._differenceLearner;
//A function which returns the state with which pre has to be multiplied to get post. Parameters are (pre, post).
GroupLearner.prototype.productFrom;
//A function which returns the product of pre and difference. Parameters are (pre, difference).
GroupLearner.prototype.postFrom;
//An array which can be used to access the states in history. Indices: [delta][round-delta] to get round's input in state line delta. NOTE: Clone before modifying, because this just an array of references to deltas' histories.
GroupLearner.prototype.arrayFormat;


/******** METHODS ********/

GroupLearner.prototype.takeInput = function (state)
{
	//UNF: return array of latest latest additions to state lines
	//Diag.trace("takeInput("+state+")");
	Diag.traceLevel++;
	//Diag.trace("recall = "+this.recall);
	
	var latestDelta = this._stateLines.push(new StateLine());
	this.arrayFormat.push(latestDelta.history);
	this._stateLines[0].add(state);
	var latest = new Array();
	latest.push(state);
	for (var i = 1; i <= this._stateLines.length-1; i++)
	{
		var previousHistory = this._stateLines[i-1].history;
		var before = previousHistory[previousHistory.length-2];
		var after = previousHistory[previousHistory.length-1];
		var product = this.productFrom(before, after);
		this._stateLines[i].add(product);
		latest.push(product);
	}
	
	Diag.traceLevel--;
	return latest;
}

GroupLearner.prototype.makePrediction = function ()
{
	Diag.trace("makePrediction ()");
	Diag.traceLevel++;
	//UNF: potentials should really be a set, but I just don't have one made yet. But isn't an array sufficient, even better? I'm pretty sure that iterating through an array would be faster than iterating through a set object by orders of magnitude.
	
	/* Pseudocode
	checkLength = Math.min between length of stateLines[0] and recall value
	currentIndex = 0, the first state line's index in stateLines
	predictionData = new PredictionData;
	while checkLength is 0 or more:
		netIncidence = new IncidenceMap
		while currentIndex is within stateLines AND checkLength <= stateLines[currentIndex].history.length:
			currentLine = stateLines[currentindex]
			historyFragment = currentLine.history between (length-1-checkLength, length) AKA .slice(length-checkLength, length);
			currentIncidence = currentLine.incidenceFollowing(historyFragment)
			if (incidence is non-empty):
				rootIncidence = the incidence that has been postFrom()ed from stateLines[currentIndex] to stateLines[0] = incidenceFollowing.clone()
				rootIncidence.sendEachTo:
					for (var i = currentIndex; i >= 1; i--):
						pre = last element from stateLines[i].history
						entry.value = postFrom(pre, entry.value)
				if (predictionData.matchLength is not set)
					predictionData.matchLength = checkLength
				if (predictionData.states is empty)
					netIncidence = netIncidence + rootIncidence
				else
					netIncidence = netIncidence + rootIncidence but only with states found in predictionData.states
				currentIndex++;
		predictionData.states = find maxima within netIncidence. Store in form of an array, so that if there is only one maximum, .states = [state], and if there are several maxima, .states = [state0, state1, ..., staten]. If there are no maxima, .states = [].
		if (predictionData.states has only one element):
			return predictionData
	return predictionData
	
	*/
	
	var predictionData = new PredictionData();
	var netIncidence;
	if (this._stateLines.length >= 1)
	{
		//Don't bother checking for a sequence as long as history, because it's impossible to find data that hasn't been entered yet. Instead, start at history.length-1
		Diag.traceLevel++;
		for (var checkLength = Math.min(this._stateLines[0].history.length-1, this.recall); checkLength >= 0; checkLength--)
		{
			Diag.trace("...checkLength = "+checkLength);
			netIncidence = new IncidenceMap();
			Diag.traceLevel++;
			for (var currentIndex = 0; currentIndex <= this._stateLines.length-1 && checkLength <= this._stateLines[currentIndex].history.length-1; currentIndex++)
			{
				Diag.trace("...currentIndex = "+currentIndex);
				var currentLine = this._stateLines[currentIndex];
				Diag.trace("currentLine.history = "+currentLine.history);
				var historyFragment = currentLine.history.slice(currentLine.history.length-checkLength);
				Diag.trace("historyFragment = "+historyFragment);
				var currentIncidence = currentLine.incidenceFollowing(historyFragment);
				Diag.trace("currentIncidence =  "+currentIncidence);
				if (currentIncidence.size != 0)
				{
					//because currentIncidence is never used again after being transferred to rootIncidence, we can just use it in rootIncidence's place. This next line is then just for clarification.
					var rootIncidence = currentIncidence.clone();
					var home = this;
					rootIncidence.sendEachTo(function (entry)
						{
							with (home)
							{
								for (var i = currentIndex; i >= 1; i--)
								{
									var preHistory = _stateLines[i-1].history;
									var pre = preHistory[preHistory.length-1];
									//remember that we are translating this incidence into what it would mean for the root function, so we modify the key as opposed to the value
									entry.key = postFrom(pre, entry.key);
								}
							}
						});
					Diag.trace("rootIncidence = "+rootIncidence);
					if (predictionData.matchLength == undefined)
					{
						predictionData.matchLength = checkLength;
					}
					if (predictionData.states.length == 0)
					{
						netIncidence = netIncidence.addMap(rootIncidence);
					}
					else
					{
						for (var i = 0; i <= predictionData.states.length; i++)
						{
							var state = predictionData.states[i];
							netIncidence.increment(state, rootIncidence.get(state));
						}
					}
				}
			}
			Diag.traceLevel--;
			Diag.trace("netIncidence = "+netIncidence);
			predictionData.states = netIncidence.getMaxima();
			if (predictionData.states.length == 1)
			{
				Diag.trace("return predictionData; only one element in .states");
				Diag.traceLevel-=2;
				return predictionData;
			}
		}
		Diag.traceLevel--;
	}
	Diag.trace("return predictionData; either a tied array or an empty array")
	Diag.traceLevel--;
	return predictionData;
}			


/*** Setters ***/

GroupLearner.prototype.setRecall = function (recall)
{
	this._recall = recall;
}