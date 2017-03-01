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

Page.includeOnce("Diag.js");
Page.includeOnce("Entry.js");


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
	//Diag.trace("Map.set(indexName, newValue");
	Diag.traceLevel++;
	//Diag.trace("indexName = "+indexName);
	//Diag.trace("newValue = "+newValue);
	var d = this._data;
	for (var i = 0; i <= d.length-1; i++)
	{
		var entry = d[i];
		if (Equals(entry.key, indexName))
		{
			//index found, so modify it
			//Diag.trace(indexName+" exists as "+entry.value+" in "+entry+"; setting to "+newValue);
			Diag.traceLevel--;
			return (d[i].value = newValue);
		}
	}
	
	//index not found, so create it
	//Diag.trace("create ("+indexName+" => "+newValue+")");
	var entry = new Entry(indexName, newValue);
	d.push(entry);
	this.size++;
	//Diag.trace("after creation,\n"+this._data);
	Diag.traceLevel--;
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
	//Diag.trace("Map.sendEachTo(f)");
	Diag.traceLevel++;
	for (var i = 0; i <= this._data.length-1; i++)
	{
		var entry = this._data[i];
		//Diag.trace("entry = "+entry);
		var ret = f(entry);
		if (ret != undefined)
		{
			Diag.traceLevel--;
			return ret;
		}
	}
	Diag.traceLevel--;
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
	//Diag.trace("Map.clone():");
	Diag.traceLevel++;
	//Diag.trace("this = "+this);
	var spawn = new Map();
	for (var i = 0; i <= this._data.length-1; i++)
	{
		var entry = this._data[i];
		//Diag.trace("...cloning "+entry);
		spawn.set(entry.key.clone(), entry.value.clone());
	}
	//Diag.trace("spawn = "+spawn);
	Diag.traceLevel--;
	return spawn;
}