/****** ABOUT ******

ArrayMap

	Author: Tom Lamb, Lambyte.com
	Created: 2007.08.19
	Released: 
	Description: A map that only takes arrays, but stores them more efficiently than a linear map.
	

****** ***** ******/
	
const Entry = require("./Entry.js");
//try using native Map
//const Map = require("./Map.js");

/******** CONSTRUCTOR ********/

function ArrayMap () 
{
	//UNF: clone elements? If a person messes with the elements of an array they set to have a value, then discard it and make a fresh one, they will expect .get to return the same value. But since they messed with elements of the array before they got rid of it, the elements of the nodes in this map will have changes and the value the user is looking for will no longer have the same key.
	this._choices = new Map();
	this.size = 0;
}


/******** PROPERTIES ********/

//UNF: recalculate .size at the end of .set
ArrayMap.prototype.size;
//the next 
ArrayMap.prototype._choices;
//the answer to .get( [] )
ArrayMap.prototype._nodeValue;
ArrayMap.prototype._isOccupied;


/******** METHODS ********/

ArrayMap.prototype.get = function (key, keyIndex)
{
	keyIndex = keyIndex || 0;
	if (keyIndex == key.length)
	{
		return this._nodeValue;
	}
	else
	{
		var currentElement = key[keyIndex];
		if (this._choices.has(currentElement))
		{
			var nextNode = this._choices.get(currentElement);
			var nextGet = nextNode.get(key, keyIndex+1);
			return nextGet;
		}
		else
		{
			return undefined;
		}
	}
}

ArrayMap.prototype.set = function (key, value, keyIndex)
{
	keyIndex = keyIndex || 0;
	
	if (keyIndex == key.length)
	{
		this._nodeValue = value;
		this._isOccupied = true;
		this._calculateSize();
		return value;
	}
	else
	{
		var currentElement = key[keyIndex];
		if (this._choices.has(currentElement))
		{
			var nextNode = this._choices.get(currentElement);
			
			nextNode.set(key, value, keyIndex+1);
			
			this._calculateSize();
			
			return value;
		}
		else
		{
			var nextNode = new ArrayMap();
			nextNode.set(key, value, keyIndex+1);
			
			var currentElement = key[keyIndex];
			this._choices.set(currentElement, nextNode);
			this._calculateSize();
			
			return value;
		}
	}
	
}

ArrayMap.prototype.has = function (key, keyIndex)
{
	keyIndex = keyIndex || 0;
	
	if (keyIndex == key.length)
	{
		return (this._isOccupied);
	}
	else
	{
		var currentElement = key[keyIndex];
		if (this._choices.has(currentElement))
		{
			var nextNode = this._choices.get(currentElement);
			return nextNode.has(key, keyIndex+1);
		}
		else
		{
			return false;
		}
	}
}

/* IE 6 does not support __defineGetter__
Map.prototype.__defineGetter__("size", function () 
{
	return this._data.length;
});*/

ArrayMap.prototype.forEach = function (f, baseKey)
{
	baseKey = baseKey || new Array();
	if (this._isOccupied)
	{
		var entry = new Entry(baseKey, this._nodeValue);
		var result = f(entry);
		if (result != undefined)
		{
			return result;
		}
	}
	
	if (this._choices.size > 0)
	{
		//!!!inefficient conversion of  to native style
		this._choices.forEach(function (value, key, map)
			{
				baseKey.push(entry.key);
				var result = entry.value.forEach(f, baseKey);
				if (result != undefined)
				{
					return result;
				}
				baseKey.pop();
			});
		
	}
	return undefined;
}

ArrayMap.prototype.clone = function ()
{
	//Diag.trace("ArrayMap.clone():");
	//Diag.trace("this = "+this);
	var spawn = new ArrayMap();
	this.forEach(function (entry)
		{
			spawn.set(entry.key.clone(), entry.value.clone());
		});
	//Diag.trace("spawn = "+spawn);
	
	return spawn;
}

ArrayMap.prototype.toString = function ()
{
	var result = "{\n";
	this.forEach(function (entry)
		{
			result += "\t"+entry+"\n";
		});
	result += "}";
	return result;
}

/*** Private ***/

ArrayMap.prototype._looksLike = function (a, b)
{
	if (a == b)
	{
		////Diag.trace("Return true: both are primitively equal");
		return true;
	}
	else if (a instanceof Object && b instanceof Object)
	{
		for (var i in a)
		{
			if (!this._looksLike(a[i], b[i]))
			{
				////Diag.trace("Return false: both are objects, but property "+i+"not equal ("+a[i]+" != "+b[i]+")");
				return false;
			}
		}
		for (var i in b)
		{
			//because all properties of a exist and are equal in b, all it takes is for a property in b to not exist in a, and we know it will not be equal. Checking to see if it equals undefined instead of b[i] saves the access time of b[i].
			if (a[i] == undefined)
			{
				////Diag.trace("Return false: both are objects, but property \""+i+"\" not equal ("+a[i]+" != "+b[i]+")");
				return false;
			}
		}
		////Diag.trace("Return true: both are identical objects");
		return true;
	}
	else
	{
		////Diag.trace("Return false: neither both primitive and equal nor both objects");
		return false;
	}
}

ArrayMap.prototype._calculateSize = function ()
{
	var size = 0;
	
	if (this._isOccupied)
	{
		size++;
	}
	
	this._choices.forEach(function (key, value)
		{
			size += value.size;
		});
	
	this.size = size;
}

module.exports = ArrayMap;