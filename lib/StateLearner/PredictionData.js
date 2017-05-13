/****** ABOUT ******

PredictionData

	Author: Tom Lamb, Lambyte.com
	Created: 2007.08.02
	Released: 
	Description: An object specifying all the properties of a prediction.
	

****** ***** ******/
	

/******** CONSTRUCTOR ********/

function PredictionData (matchLength, states) 
{
	this.matchLength = matchLength;
	this.states = states || new Array();
}


/******** PROPERTIES ********/

//The longest history match that led to this prediction.
PredictionData.prototype.matchLength;
//The predicted state (or states, in which case this is an array of states)
PredictionData.prototype.states;


/******** METHODS ********/

PredictionData.prototype.getIsValid = function ()
{
	return (this.matchLength != undefined);
}

module.exports = PredictionData;