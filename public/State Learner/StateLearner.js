/****** ABOUT ******

StateLearner

	Author: Tom Lamb, Lambyte.com
	Created: 2006.07.13
	Released: 
	Description: An object that takes input and stores into history, which it uses to try to predict the next input.
	
	
****** ***** ******/

Page.includeOnce("ArrayMap.js");
Page.includeOnce("Diag.js");
Page.includeOnce("State%20Learner/PredictionData.js");
Page.includeOnce("State%20Learner/StateLine.js");


/******** CONSTRUCTOR ********/

function StateLearner (recall)
{
	this.recall = recall || Infinity;
	this._stateLine = new StateLine();
}


/******** PROPERTIES ********/

//Maximum length for a sequence of states to be stored or retrieved
StateLearner.prototype.recall;
//This state learner's state line
StateLearner.prototype._stateLine;


/******** METHODS ********/

StateLearner.prototype.takeInput = function (state)
{
	this._stateLine.add(state);
}

StateLearner.prototype.makePrediction = function ()
{
	//Diag.trace("makePrediction ()");
	//Diag.traceLevel++;
	//???: potentials should really be a set, but I just don't have one made yet. But isn't an array sufficient, even better? I'm pretty sure that direct access to an element of an array would be faster than a getter method on a set object by orders of magnitude.
	
	var historyFragment = this._stateLine.history.clone();
	//we know we won't be able to find any states that have come after the entire history, start with the second-longest history by removing the most distant state
	historyFragment.shift();
	//only search for as much history as this instance can recall. Since the state that is potentially to be found in incidence is counted when counting recall capacity, history fragment can only be recall-1
	while (historyFragment.length > this.recall-1)
	{
		historyFragment.shift();
	}
	
	//Diag.trace("while (historyFragment.length >= 0)")
	//Diag.traceLevel++;
	var potentials = new Array();
	var predictionData = new PredictionData();
	while (historyFragment.length >= 0)
	{
		//Diag.trace("historyFragment.length = "+historyFragment.length);
		//Diag.trace("potentials = "+potentials);
		//Diag.trace("historyFragment = "+historyFragment);
		//at the end of each round, if there is only one potential state, that means that all other potential states have been eliminated in previous iterations, so we return that. As a result, if at the beginning of an iteration potentials is non-empty, that means that there must have been more than one left and the end of the last iteration. When there is more than one left, that means there was a tie at the end of the last iteration, so we settle that by finding a maximum among potentials in the incidence of this iteration. If potentials is empty, however, we fill it with the maxima of incidence. If we fill potentials with all of incidence when it is empty, we can use the same code when potentials is empty as when it is non-empty.
		var incidence = this._stateLine.incidenceFollowing(historyFragment);
		//Diag.trace("incidence = "+incidence);
		if (potentials.length == 0)
		{
			incidence.sendEachTo(function (entry) {
				potentials.push(entry.key);
			});
			
			if (potentials.length >= 1) predictionData.matchLength = historyFragment.length;
		}
		var max = 0;
		var newPotentials = new Array();
		for (var i = 0; i <= potentials.length-1; i++)
		{
			var currentState = potentials[i];
			var stateCount = incidence.get(currentState);
			if (stateCount > max)
			{
				max = stateCount;
				newPotentials = new Array();
				newPotentials.push(currentState);
			}
			else if (stateCount == max)
			{
				newPotentials.push(currentState);
			}
		}
		potentials = newPotentials;
		if (potentials.length == 1)
		{
			predictionData.states = potentials[0];
			//Diag.trace("return "+potentials[0]+"; maximum found");
			//Diag.traceLevel--;
			//Diag.traceLevel--;
			return predictionData;
		}
		else if (historyFragment.length == 0)
		{
			if (potentials.length == 0)
			{
				//because all history including null history has been checked for a match and potentials is still empty, we can infer that there was never any input to begin with.
				//Diag.trace("return undefined; no input has been given, so it is impossible for StateLearner to make a prediction");
				//Diag.traceLevel--;
				//Diag.traceLevel--;
				return predictionData;
			}
			else
			{
				//since there hasn't been a solitary maximum found at any level of detail, and the list of potentials is non-empty, we know that there must be a tie between two or more states. By returning the potentials array, the user can choose what to do with the all the relevant information available.
				predictionData.states = potentials;
				//Diag.trace("return "+potentials+"; two or more states are tied");
				//Diag.traceLevel--;
				//Diag.traceLevel--;
				return predictionData;
			}
		}
		
		historyFragment.shift();
	}
	
	//recall is 0, so it's impossible to predict anything
	//Diag.traceLevel--;
	return undefined;
}