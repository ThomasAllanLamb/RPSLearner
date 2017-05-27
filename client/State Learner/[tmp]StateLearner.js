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


/******** CONSTRUCTOR ********/
function StateLearner (recall)
{
	this.recall = recall || Infinity;
	this._history = new Array();
	this._ledger = new ArrayMap();
}



/******** PROPERTIES ********/

//Structure of history: _history[n] = input of the nth turn*/
StateLearner.prototype._history;
//Structure of ledger: .get(history fragment) => incidence[state N] = number of times that state N occurs after the given "history fragment"
StateLearner.prototype._ledger;
//Maximum length for a sequence of states to be stored or retrieved
StateLearner.prototype.recall;


/******** METHODS ********/

StateLearner.prototype.takeInput = function (state)
{
	//Diag.trace("takeInput("+state+")");
	Diag.traceLevel++;
	//Diag.trace("recall = "+this.recall);
	//Diag.trace("_ledger (old) = "+this._ledger);
	//Diag.trace("_history (old) = "+this._history);
	//Note that historyFragment is a clone of the history BEFORE the new state has been added
	var historyFragment = this._history.clone();
	this._history.push(state);
	//Diag.trace("historyFragment = "+historyFragment);
	
	//only bother to record as much as this statelearner can recall
	if (this.recall > 0)
	{
		while (historyFragment.length > this.recall-1)
		{
			historyFragment.shift();
		}
		
		Diag.traceLevel++;
		while (historyFragment.length >= 0)
		{
			//Diag.trace("...\nhistoryFragment = "+historyFragment);
			
			//increment the incidence count for the number of times that "historyFragment" has preceded "state"
			var incidence = this._ledger.get(historyFragment);
			//Diag.trace("incidence (old) = "+incidence);
			
			if (incidence == undefined)
			{
				//this history fragment has not occurred yet, so create a new incidence map
				var newIncidence = new Map();
				newIncidence.set(state, 1);
				//NOTE: We have to clone historyFragment, because we are creating a new entry in the map. If it were left uncloned, we might modify the array being used for the purposes of this loop, and at the same time modify the array being used as an index in the map.
				this._ledger.set(historyFragment.clone(), newIncidence);
			}
			else
			{
				var count = incidence.get(state);
				if (count == undefined)
				{
					incidence.set(state, 1);
					this._ledger.set(historyFragment, incidence);
				}
				else
				{
					incidence.set(state, count+1);
					this._ledger.set(historyFragment, incidence);
				}
			}
			
			
			//Diag.trace("incidence (new) = "+this._ledger.get(historyFragment));
			
			if (historyFragment.length == 0)
			{
				Diag.traceLevel--;
				//Diag.trace("_ledger (new) = "+this._ledger);
				//Diag.trace("_history (new) = "+this._history);
				Diag.traceLevel--;
				return;
			}
			historyFragment.shift();
		}
	}
	
	//recall has been 0, so nothing has been saved
	Diag.traceLevel--;
	return;
}

StateLearner.prototype.makePrediction = function ()
{
	//Diag.trace("makePrediction ()");
	Diag.traceLevel++;
	//Diag.trace(this._ledger);
	//UNF: potentials should really be a set, but I just don't have one made yet. But isn't an array sufficient, even better? I'm pretty sure that direct access to an element of an array would be faster than a getter method on a set object by orders of magnitude.
	
	var historyFragment = this._history.clone();
	//we know we won't be able to find any states that have come after the entire history, so don't bother looking
	historyFragment.shift();
	var potentials = new Array();
	//only search for as much history as this instance can recall. Since the state that is potentially to be found in incidence is counted when counting recall capacity, history fragment can only be recall-1
	if (this.recall > 0)
	{
		while (historyFragment.length > this.recall-1)
		{
			historyFragment.shift();
		}
		
		var predictionData = new PredictionData();
		
		Diag.traceLevel++;
		while (historyFragment.length >= 0)
		{
			//Diag.trace("...");
			//Diag.trace("potentials = "+potentials);
			//Diag.trace("historyFragment = "+historyFragment);
			var incidence = this._ledger.get(historyFragment);
			//Diag.trace("incidence = "+incidence);
			if (incidence != undefined)
			{
				//at the end of each round, if there is only one potential state, we return that because it is a solitary maximum and therefore definitive winner. So if at the beginning of a round, potentials is non-empty, that means that there must have been more than one left. When there is more than one left, that means there was a tie and we settle that by finding a maximum among potentials in the current incidence object. If potentials is empty, however, we fill it with the maxima of incidence. We can use the same code when potentials is empty as when potentials is non-empty for finding the maximum by just filling potentials with all of incidence.
				if (potentials.length == 0)
				{
					incidence.sendEachTo(function (entry) {
						potentials.push(entry.key);
					});
					//because potentials was empty before, this is the longest match, so we can set match length now.
					predictionData.matchLength = historyFragment.length;
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
					predictionData.state = potentials[0];
					//Diag.trace("return "+potentials[0]+"; maximum found");
					Diag.traceLevel--;
					Diag.traceLevel--;
					return predictionData;
				}
				else if (historyFragment.length == 0)
				{
					if (potentials.length == 0)
					{
						//because all history including null history has been checked for a match and no state was found, we can infer that there has not yet been any input.
						//Diag.trace("return undefined; no input has been given, so it is impossible for StateLearner to make a prediction");
						Diag.traceLevel--;
						Diag.traceLevel--;
						return predictionData;
					}
					else
					{
						//since there hasn't been a solitary maximum found at any level of detail, and the list of potentials is non-empty, we know that there must be a tie between two or more states. By returning the potentials array, the user can choose what to do with the all the relevant information available.
						predictionData.state = potentials;
						//Diag.trace("return "+potentials+"; two or more states are tied");
						Diag.traceLevel--;
						Diag.traceLevel--;
						return predictionData;
					}
				}
			}
			historyFragment.shift();
		}
	}
	
	//recall is 0, so it's impossible to predict anything
	Diag.traceLevel--;
	return undefined;
}