/****** ABOUT ******

IncidenceMap

	Author: Tom Lamb, Lambyte.com
	Created: 2007.08.27
	Released: 
	Description: An object which stores the number of times that a value is encountered. The difference between this and a plain map is that .get(index) returns 0 when no entry with that key exists, and this object adds the .increment(key, [times]) function which increments the count of the key the given number of times, or once if times is undefined.
	

****** ***** ******/
	
Page.includeOnce("Map.js");


/******* CONSTRUCTOR *******/

function IncidenceMap ()
{
	this._map = new Map();
	this.size = 0;
}


/******* PROPERTIES *******/

IncidenceMap.prototype._map;
IncidenceMap.prototype.size;


/******* METHODS *******/

IncidenceMap.prototype.increment = function (key, times)
{
	times = (times == undefined)? 1 : times;
	var count = this.set(key, this.get(key)+times);
	return count;
}

IncidenceMap.prototype.addMap = function (incidence)
{
	//Diag.trace("Incidence.addMap(incidence)");
	Diag.traceLevel++;
	//Diag.trace("incidence = "+incidence);
	var result = new IncidenceMap();
	
	function count (entry)
	{
		//Diag.trace("count {"+entry+"}");
		result.increment(entry.key, entry.value);
	}
	
	this.sendEachTo(count);
	//Diag.trace("Result after this.sendEachTo: "+result);
	incidence.sendEachTo(count);
	//Diag.trace("Result after incidence.sendEachTo: "+result);
	
	Diag.traceLevel--;
	return result;
}

IncidenceMap.prototype.getMaxima = function ()
{
	var maxima = new Array();
	var maxCount = 0;
	this.sendEachTo(function (entry)
		{
			if (entry.value > maxCount)
			{
				maxima = new Array();
				maxima.push(entry.key);
				maxCount = entry.value;
			}
			else if (entry.value == maxCount)
			{
				maxima.push(entry.key);
			}
		});
	return maxima;
}

IncidenceMap.prototype.get = function (index)
{
	var count = this._map.get(index);
	if (count == undefined)
	{
		count = 0;
	}
	
	return count;
}

IncidenceMap.prototype.set = function (indexName, newValue)
{
	this._map.set(indexName, newValue);
	this.size = this._map.size;
	return newValue;
}

IncidenceMap.prototype.contains = function (indexName)
{
	return this._map.contains(indexName);
}

IncidenceMap.prototype.sendEachTo = function (f)
{
	this._map.sendEachTo(f);
}

IncidenceMap.prototype.clone = function ()
{
	//Diag.trace("IncidenceMap.clone():");
	Diag.traceLevel++;
	//Diag.trace("this = "+this);
	var emptyMap = new IncidenceMap();
	var spawn = emptyMap.addMap(this._map.clone());
	//Diag.trace("spawn = "+spawn);
	Diag.traceLevel--;
	return spawn;
}

IncidenceMap.prototype.toString = function ()
{
	return this._map.toString();
}