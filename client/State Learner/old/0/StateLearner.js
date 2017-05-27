/****** ABOUT ******

StateLearner

	Author: Tom Lamb, Lambyte.com
	Created: 2006.07.13
	Released: 
	Description: An object that takes input and uses the history to try to predict the next input.
	
	
****** ***** ******/

Page.includeOnce("../Map.js");


/******** CONSTRUCTOR ********/
function StateLearner () 
{
	this._history = new Array();
	this._ledger = new Map();
}



/******** PROPERTIES ********/

//Structure of history: _history[n] = input of the nth turn*/
StateLearner.prototype._history;
//Structure of ledger: .get(history fragment) => incidence[state N] = number of times that state N occurs after the given "history fragment"
/*NOTE: Future optimization. Instead of making incidence an array, make it map of the form incidence.get(state) => key. This is because the states that the user gives won't necessarily be in a array-like format. i.e. they might just use state values 5, 1000 and 25. If an array were used for that example, it would be forced to be 1000 elements long, even though only 3 elements are needed.*/
StateLearner.prototype._ledger;


/******** METHODS ********/

/* NOTE: In case of a tie between state predictions by equally-detailed history fragments, history fragment size should be stepped down and the process repeated until the tie is broken or the size reaches zero. If the size reaches zero, then use Math.random to decide the prediction. */

StateLearner.prototype.takeInput = function (state)
{
	var historyFragment = this._history.clone();
	this._history.push(state);
	while (historyFragment.length >= 0)
	{
		//increment the incidence count for the number of times that "historyFragment" has preceded "state"
		var incidence = this._ledger.get(historyFragment);
		var count = incidence[state];
		if (count == undefined)
		{
			incidence[state] = 1;
			this._ledger.set(historyFragment, incidence);
		}
		else
		{
			incidence[state] += 1;
			this._ledger.set(historyFragment, incidence);
		}
		historyFragment.shift();
	}
}

StateLearner.prototype.makePrediction = function ()
{
	var potentials = new Array();
	var historyFragment = this._history.clone();
	//we know we won't be able to find any states that have come after the entire history, so don't bother looking
	historyFragment.pop();
	while (historyFragment.length >= 0)
	{
		if (potentials.length == 0)
		{
			var incidence = this._ledger.get(historyFragment);
			for (var i = 0; i <= incidence.length-1; i++)
			{
				if (incidence[i] >= 1)
				{
					potentials.push(i);
				}
			}
		}
		var max = 0;
		var newPotentials = new Array();
		for (var i = 0; i <= potentials.length-1; i++)
		{
			var incidence = this._ledger.get(historyFragment);
			var currentState = potentials[i];
			var stateCount = incidence[currentState];
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
		//UNF: If potentials is empty, then we have to find the maximum among all states, but if potentials is non-empty, then we find the maximum among only the states that potentials contains. Is that right? It seems strange that in once case, we consider what it contains, and in the other, we consider all that it does not contain.
		//if a max is found, return that.
		if (potentials.length == 1)
		{
			return potentials[0];
		}
		historyFragment.shift();
	}
	//no decisive majority found. I don't really have any great ideas about what to do in this case, but return undefined seems like as good a choice as any.
	return undefined;
}