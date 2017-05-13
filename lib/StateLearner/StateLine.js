/****** ABOUT ******

StateLine

	Author: Tom Lamb, Lambyte.com
	Created: 2007.08.25
	Released: 
	Description: An object that stores a sequence of states and can return the incidence of which states follow given state sequences.
	
	

****** ***** ******/

const ArrayMap = require("../ArrayMap.js");
const IncidenceMap = require("../IncidenceMap.js");


/******** CONSTRUCTOR ********/

function StateLine ()
{
	this.history = new Array();
	this._ledger = new ArrayMap();
}


/******** PROPERTIES ********/

//Structure of history: history[n] = input of the nth turn*/
StateLine.prototype.history;
//Structure of ledger: ledger.get(history fragment) => incidence.get(state N) = number of times that state N occurs after the given "history fragment"
StateLine.prototype._ledger;


/******** METHODS ********/

StateLine.prototype.add = function (state)
{
	var historyFragment = this.history.slice(0);
	
	while (true)
	{
		//increment the incidence count for the number of times that "historyFragment" has preceded "state"
		var incidence = this._ledger.get(historyFragment);
		
		if (incidence == undefined)
		{
			//this history fragment has not occurred yet, so create a new incidence map
			var newIncidence = new IncidenceMap();
			newIncidence.set(state, 1);
			//NOTE: We have to clone historyFragment, because we are creating a new entry in the map. If it were left uncloned, we might modify the array being used for the purposes of this loop, and at the same time modify the array being used as an index in the map.
			this._ledger.set(historyFragment.slice(0), newIncidence);
		}
		else
		{
			incidence.increment(state);
			//incidence is an object, and therefore a reference, so we don't need to call ledger.set(historyFragment, incidence)
		}
		
		if (historyFragment.length == 0)
		{
			this.history.push(state);
			return;
		}
		historyFragment.shift();
	}
	
}

StateLine.prototype.incidenceFollowing = function (sequence)
{
	//NOTE: sequence should be an array
	var incidence = this._ledger.get(sequence);
	if (incidence == undefined)
	{
		return new IncidenceMap();
	}
	else
	{
		return incidence;
	}
}

module.exports = StateLine;