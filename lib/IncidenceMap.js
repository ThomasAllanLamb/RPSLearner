/****** ABOUT ******

IncidenceMap

	Author: Tom Lamb, Lambyte.com
	Created: 2007.08.27
	Released: 
	Description: An object which stores the number of times that a value is encountered. The difference between this and a plain map is that .get(index) returns 0 when no entry with that key exists, and this object adds the .increment(key, [times]) function which increments the count of the key the given number of times, or once if times is undefined.
	

****** ***** ******/

//try using native Map	
//const Map = require("./Map.js");


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
	var result = new IncidenceMap();
	
	function count (entry)
	{
		result.increment(entry.key, entry.value);
	}
	
	this.forEach(count);
	incidence.forEach(count);
	
	return result;
}

IncidenceMap.prototype.getMaxima = function ()
{
	var maxima = new Array();
	var maxCount = 0;
	this.forEach(function (entry)
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

IncidenceMap.prototype.forEach = function (f)
{
	this._map.forEach(f);
}

IncidenceMap.prototype.clone = function ()
{
	var emptyMap = new IncidenceMap();
	var spawn = emptyMap.addMap(this._map.clone());
	
	return spawn;
}

IncidenceMap.prototype.toString = function ()
{
	return this._map.toString();
}

module.exports = IncidenceMap;