/****** ABOUT ******

Page

	Author: Tom Lamb, Lambyte.com
	Created: 2007.02.05
	Released: Not yet released
	Description: A script to be included on every HTML page that has Javascript. Takes care of globally-necessary tasks that javascript hasn't yet taken care of. Once javascript properly handles these, then it will be easy to just edit the method that Page uses from whatever hack I have in place now to the proper implementation.
	
	
Methods:
	includeOnce (path)
		Same as PHP's include_once, this ensures that the given script has been loaded into the page.
	
	isIncluded (path)
		Whether or not the given path has been included.
	

****** ***** ******/


/*** Global functions ***/

function Equals (a, b)
{
	if (a == undefined || a == null 
		|| b == undefined || b == null)
	{
		return (a == b);
	}
	else
	{
		return a.equals(b);
	}
}


/******** CONSTRUCTOR ********/

function Page ()
{
	//static class, no need to instantiate
}

//getNode should be in methods, but I need it in order to define properties so I will initialize it here.
Page.getNode = function (base, targetNodeName)
{
	//Find and return a reference to the first node of name targetNodeName. Favours nodes closest to the trunk of the node tree of base, in order identical to that of base.childNodes.
	for (var i = 0; i <= base.childNodes.length-1; i++)
	{
		var c = base.childNodes[i];
		if (c.nodeName.toLowerCase() == targetNodeName)
		{
			return c;
		}
	}
	//Not found at this level, so try the next.
	for (var i = 0; i <= base.childNodes.length-1; i++)
	{
		var probe = Page.getNode(base.childNodes[i], targetNodeName);
		if (probe)
		{
			return probe;
		}
	}
	//Node is not found at this level or any deeper levels, so it does not exist within base.
	return null;
}

/******** PROPERTIES ********/

Page.head = Page.getNode(document, "head");
Page.baseDirectory = "";


/******** METHODS ********/

Page.includeOnce = function (path)
{
	if (!Page.isIncluded(path))
	{
		var absolutePath = this.baseDirectory+path;
		var e = document.createElement('script');
		e.setAttribute('type', 'text/javascript');
		e.setAttribute('src', absolutePath);
		Page.head.appendChild(e);
	}
}

Page.isIncluded = function (path)
{
	var absolutePath = this.baseDirectory+path;
	for (var i = 0; i <= Page.head.childNodes.length-1; i++)
	{
		var c = Page.head.childNodes[i];
		if (c.nodeName.toLowerCase() == "script" && c.getAttribute("src") == absolutePath)
		{
			return true;
		}
	}
	//alert("isIncluded("+path+") = false; absolutePath = "+absolutePath);
	return false;
}

/*** Language object prototype changes ***/

/*** Number ***/

Number.prototype.clone = function ()
{
	return this;
}

Number.prototype.equals = function (target)
{
	var result = (this.valueOf() === target.valueOf());
	return result;
}


/*** String ***/

String.prototype.clone = function ()
{
	return this;
}

String.prototype.equals = function (target)
{
	return (this.valueOf() === target.valueOf());
}


/*** Boolean ***/

Boolean.prototype.clone = function ()
{
	return this;
}

Boolean.prototype.equals = function (target)
{
	return (this.valueOf() === target.valueOf());
}

/*** Function ***/

Function.prototype.clone = function ()
{
	//Diag.trace("Function.clone()");
	Diag.traceLevel++;
	//Diag.trace("this = "+this);
	//Diag.trace("spawn = "+this);
	Diag.traceLevel--;
	return this;
}

Function.prototype.getName = function ()
{
	var code = this.toString();
	//NOTE: might have to have a second parameter.
	var startingAtName = code.substring(9);
	var parenthesisIndex = startingAtName.indexOf("(");
	if (parenthesisIndex == 0)
	{
		//anonymous function, but toString() just leaves their name blank. I think Rhino labels them "anonymous" in its toString, so I'll use that.
		return "anonymous";
	}
	var name = startingAtName.substring(0, parenthesisIndex);
	return name;
}

/* UNF: Still trying to find a nice way of displaying functions. This override just displays a "one-size-fits-all" label
Function.prototype.toString = function ()
{
	return "function () {...}";
}
*/

Function.prototype.equals = function (target)
{
	if (this == target)
	{
		//this will only catch targets that one and the same with this
		return true;
	}
	else
	{
		if (this.toString() == target.toString())
		{
			//their contents are the same, so now we just check all static properties to ensure there are no disagreements.
			for (var i in this)
			{
				if (!Equals(this[i], target[i]))
				{
					return false;
				}
			}
			for (var i in target)
			{
				if (this[i] == undefined)
				{
					return false;
				}
			}
		}
		return false;
	}
}	


/*** Object ***/

Object.prototype.clone = function ()
{
	var ret = new Object();
	for (var i in this)
	{
		if (this[i] instanceof Object)
		{
			ret[i] = this[i].clone();
		}
		else
		{
			ret[i] = this[i];
		}
	}
	return ret;
}


//currently, objects are just displayed as [object Object], which is pretty non-descriptive. This override method will display objects as their JSON value. The only downside to this solution is that when objects become more complicated, the JSON will be more verbose. This shouldn't be a problem, though, because the more complicated an object becomes, the more likely it is to have a concise .toString override of its own.
Object.prototype.toString = function ()
{
	var result = "{";
	for (var i in this)
	{
		//UNF: still trying to find a nice way of displaying functions
		var stringForm;
		if (this[i] instanceof Function)
		{
			stringForm = "function (...) {...}";
		}
		else
		{
			stringForm = this[i].toString();
		}
		result += i+":"+stringForm+",";
	}
	if (result.length >= 2)
	{
		//chop off trailing comma
		result = result.substring(0,result.length-1);
	}
	result += "}";
	return result;
}

Object.prototype.equals = function (target)
{
	//UNF: there is no way that I can think of to check whether or not an undefined property in an object is really a property whose value is undefined rather than a property which just doesn't exist, so for now just let these disagreements go. In the future, I think that this can be accomplished by keeping a list of names of undefined properties that are found in this during the previous for..in loop, and checking to see whether or not the undefined properties found in target's for..in loop are already in the list.
	var existingUndefined = new Array();
	for (var i in this)
	{
		if (this[i] == undefined)
		{
			existingUndefined.push(i);
		}
		
		if (!Equals(this[i], target[i]))
		{
			return false;
		}
	}
	for (var i in target)
	{
		//we save time here by just checking whether the corresponsing property in this exists. If it exists then we know that it is equal to the current property because we have already tested all properties which exist in this, and have found them all to be equal. However, since non-existant properties are represented by the value undefined, as well as properties which have been purposely set to the value undefined, we have to use an alternate method to detect disagreements when both properties report that value.
		if (target[i] == undefined)
		{
			if (!existingUndefined.contains(i))
			{
				return false;
			}
		}
		else if (this[i] == undefined)
		{
			return false;
		}
	}
	return true;
}


/*** Array ***/

Array.prototype.randomElement = function ()
{
	var index = Math.round(Math.random()*(this.length-1));
	return this[index];
}

Array.prototype.contains = function (value)
{
	//I often use an array in the place of a Set. It seems to work just fine, but arrays lack the definition of a contains function, so here it is.
	for (var i = 0; i <= this.length-1; i++)
	{
		if (Equals(this[i], value))
		{
			return true;
		}
	}
	return false;
}

Array.prototype.clone = function ()
{
	//NOTE: only makes deep clones of elements that are also arrays
	var ret = new Array();
	for (var i = 0; i <= this.length-1; i++)
	{
		if (this[i] instanceof Array)
		{
			ret.push(this[i].clone());
		}
		else
		{
			ret.push(this[i]);
		}
	}
	return ret;
}

//I don't like the fact that javascript represents empty arrays as empty strings. I prefer that they be displayed as [].
Array.prototype.toString = function ()
{
	var ret = "[";
	for (var i = 0; i <= this.length-2; i++)
	{
		ret += this[i]+",";
	}
	var lastElement = this[this.length-1];
	if (lastElement != undefined)
	{
		ret += lastElement.toString();
	}
	ret += "]";
	return ret;
}

Array.prototype.equals = function (target)
{
	if (this.length != target.length)
	{
		return false;
	}
	else
	{
		for (var i = 0; i <= this.length-1; i++)
		{
			if (!Equals(this[i], target[i]))
			{
				return false;
			}
		}
		return true;
	}
}
		

/*** Math ***/

Math.roundTo = function (x, significantFigures)
{
	//UNF: This isn't actually sig figs, so change the wording. This is just truncation of decimals.
	significantFigures = significantFigures || 0;
	return Math.round(x*Math.pow(10, significantFigures))/Math.pow(10, significantFigures);
}