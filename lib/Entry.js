/****** ABOUT ******

Entry

	Author: Tom Lamb, Lambyte.com
	Created: 2007.07.29
	Released: 
	Description: A key-value pair.
	

****** ***** ******/

//UNF: below was pasted from StateLearner.js, and I'm still converting it into GroupLearner

/******** CONSTRUCTOR ********/

function Entry (key, value)
{
	this.key = key;
	this.value = value;
}


/******** PROPERTIES ********/

Entry.prototype.key;
Entry.prototype.value;


/******** METHODS ********/

Entry.prototype.clone = function ()
{
	return new Entry(this.key.clone(), this.value.clone());
}

Entry.prototype.toString = function ()
{
	return this.key+"\t=>\t"+this.value;
}

module.exports = Entry;