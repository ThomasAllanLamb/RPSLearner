/******* ABOUT *******

Map
	An array that can use strings or integers as keys.


Properties:

	length
		as with arrays


Methods:

	get(indexName)
		like myArray[indexName]
	
	set(indexName, value)
		like myArray[indexName] = value

******** ****** *******/

const Entry = require("./Entry.js");


/******* CONSTRUCTOR *******/

function Map ()
{
	this._data = new Array();
	this.size = 0;
}


/******* PROPERTIES *******/

Map.prototype._data;
Map.prototype.size;


/******* METHODS *******/

/*** Public ***/

Map.prototype.get = function (target)
{
	//get a given index by running through all the indices until a match is found
	var d = this._data;
	for (var i = 0; i <= d.length-1; i++)
	{
		if (Equals(d[i].key, target))
		{
			return (d[i].value);
		}
	}
	
	return undefined;
}

Map.prototype.set = function (indexName, newValue)
{
	var d = this._data;
	for (var i = 0; i <= d.length-1; i++)
	{
		var entry = d[i];
		if (Equals(entry.key, indexName))
		{
			//index found, so modify it
			return (d[i].value = newValue);
		}
	}
	
	//index not found, so create it
	var entry = new Entry(indexName, newValue);
	d.push(entry);
	this.size++;
	return newValue;
}

Map.prototype.contains = function (indexName)
{
	for (var i = 0; i <= this._data.length-1; i++)
	{
		if (Equals(this._data[i].key, indexName))
		{
			return true;
		}
	}
	//all data has been compared and no match found, so return false
	return false;
}

/* IE 6 does not support __defineGetter__
Map.prototype.__defineGetter__("size", function () 
{
	return this._data.length;
});*/

Map.prototype.sendEachTo = function (f)
{
	for (var i = 0; i <= this._data.length-1; i++)
	{
		var entry = this._data[i];
		var ret = f(entry);
		if (ret != undefined)
		{
			return ret;
		}
	}
	return;
}

Map.prototype.toString = function ()
{
	var result = "{";
	for (var i = 0; i <= this._data.length-1; i++)
	{
		result += "\n\t"+this._data[i].toString();
	}
	result += "\n}";
	return result;
}

Map.prototype.clone = function ()
{
	var spawn = new Map();
	for (var i = 0; i <= this._data.length-1; i++)
	{
		var entry = this._data[i];
		spawn.set(entry.key.clone(), entry.value.clone());
	}
	return spawn;
}

module.exports = Map;