/****** ABOUT ******

ArrayMap

	Author: Tom Lamb, Lambyte.com
	Created: 2007.08.19
	Released: 
	Description: A map that only takes arrays, but stores them more efficiently than a linear map.
	

****** ***** ******/
	
Page.includeOnce("Diag.js");
Page.includeOnce("Entry.js");

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
ArrayMap.prototype._choices;
ArrayMap.prototype._nodeValue;
ArrayMap.prototype._isOccupied;

/******** METHODS ********/

ArrayMap.prototype.get = function (index, indexIndex)
{
	//Diag.trace("ArrayMap.get("+index+", "+indexIndex+")");
	
	indexIndex = indexIndex || 0;
	if (indexIndex == index.length)
	{
		//Diag.trace("return "+this._nodeValue+";");
		return this._nodeValue;
	}
	else
	{
		var currentElement = index[indexIndex];
		if (this._choices.contains(currentElement))
		{
			var nextNode = this._choices.get(currentElement);
			var nextGet = nextNode.get(index, indexIndex+1);
			//Diag.trace("return "+nextGet+";");
			return nextGet;
		}
		else
		{
			//Diag.trace("return undefined;");
			return undefined;
		}
	}
}

ArrayMap.prototype.set = function (index, value, indexIndex)
{
	//Diag.trace("ArrayMap.set("+index+", "+value+", "+indexIndex+")");
	
	indexIndex = indexIndex || 0;
	
	if (indexIndex == index.length)
	{
		//Diag.trace("indexIndex == index.length");
		this._nodeValue = value;
		this._isOccupied = true;
		this._calculateSize();
		//Diag.trace("Done.");
		//Diag.trace("this = "+this);
		//Diag.trace("return "+value+";");
		return value;
	}
	else
	{
		//Diag.trace("indexIndex != index.length");
		var currentElement = index[indexIndex];
		if (this._choices.contains(currentElement))
		{
			//Diag.trace("_choices.contains("+currentElement+")");
			var nextNode = this._choices.get(currentElement);
			Diag.traceLevel++;
			nextNode.set(index, value, indexIndex+1);
			Diag.traceLevel--;
			this._calculateSize();
			//Diag.trace("Done.");
			//Diag.trace("this = "+this);
			//Diag.trace("return "+value+";");
			return value;
		}
		else
		{
			//Diag.trace("!_choices.contains("+currentElement+")");
			//Diag.trace("_choices = "+this._choices);
			Diag.traceLevel++;
			var nextNode = new ArrayMap();
			nextNode.set(index, value, indexIndex+1);
			Diag.traceLevel--;
			var currentElement = index[indexIndex];
			this._choices.set(currentElement, nextNode);
			this._calculateSize();
			//Diag.trace("Done.");
			//Diag.trace("this = "+this);
			//Diag.trace("return "+value+";");
			return value;
		}
	}
	
}

ArrayMap.prototype.contains = function (index, indexIndex)
{
	indexIndex = indexIndex || 0;
	
	if (indexIndex == index.length)
	{
		return (this._isOccupied);
	}
	else
	{
		var currentElement = index[indexIndex];
		if (this._choices.contains(currentElement))
		{
			var nextNode = this._choices.get(currentElement);
			return nextNode.contains(index, indexIndex+1);
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

ArrayMap.prototype.sendEachTo = function (f, baseKey)
{
	////Diag.trace("sendEachTo(f)");
	////Diag.trace("_choices.size = "+this._choices.size);
	baseKey = baseKey || new Array();
	if (this._isOccupied)
	{
		var entry = new Entry(baseKey, this._nodeValue);
		var result = f(entry);
		if (result != undefined)
		{
			////Diag.trace("return "+result+"; f returned it");
			return result;
		}
	}
	
	if (this._choices.size > 0)
	{
		Diag.traceLevel++;
		this._choices.sendEachTo(function (entry)
			{
				////Diag.trace("Choice add:"+entry);
				baseKey.push(entry.key);
				var result = entry.value.sendEachTo(f, baseKey);
				if (result != undefined)
				{
					////Diag.trace("return "+result+"; next branch returned it");
					Diag.traceLevel--;
					return result;
				}
				baseKey.pop();
			});
		Diag.traceLevel--;
	}
	////Diag.trace("return undefined; all done");
	return undefined;
}

ArrayMap.prototype.clone = function ()
{
	//Diag.trace("ArrayMap.clone():");
	Diag.traceLevel++;
	//Diag.trace("this = "+this);
	var spawn = new ArrayMap();
	this.sendEachTo(function (entry)
		{
			spawn.set(entry.key.clone(), entry.value.clone());
		});
	//Diag.trace("spawn = "+spawn);
	Diag.traceLevel--;
	return spawn;
}

ArrayMap.prototype.toString = function ()
{
	var result = "{\n";
	this.sendEachTo(function (entry)
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
	
	this._choices.sendEachTo(function (entry)
		{
			size += entry.value.size;
		});
	
	this.size = size;
}