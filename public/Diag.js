/****** ABOUT ******

Diag

	Author: Tom Lamb, Lambyte.com
	Created: 2007.07.21
	Released: 
	Description: An object that contains various diagnostic tools to aid in development with Javascript.
	

****** ***** ******/



/******** CONSTRUCTOR ********/
function Diag () 
{
	//static class, do not instantiate.
}


/******** PROPERTIES ********/

/*** Trace properties ***/
Diag.traceWindow;
//dimensions to initialize the trace window with
Diag.traceWindowWidth = 500;
Diag.traceWindowHeight = 500;
Diag.screenWidth = 1024; //I don't know where to get this from offically, so just hard-code it for now.
Diag.traceLevel = 0;
Diag.traceEnabled = true;


/******** METHODS ********/

Diag.trace = function (text)
{
	//NOTE: This implementation uses <br /> tags instead of \n as newlines. This is because while the newline character \n works as a newline in firefox with style.white-space = "pre", it does not work in IE. <br /> tags, however, work in both.
	if (Diag.traceEnabled)
	{
		Diag._ensureTraceWindow();
		var contentNode = Diag.traceWindow.document.getElementById("content");
		//to make each trace call automatically use a new line, we add a newline to each block of text
		text = "\n"+text;
		var levelTabs = "";
		for (var i = 0; i <= Diag.traceLevel-1; i++)
		{
			levelTabs += "\t";
		}
		var formatted = text.replace(/\n/g,"\n"+levelTabs);
		
		var index;
		while ((index = formatted.indexOf("\n")) != -1)
		{
			var beforeText = formatted.substring(0, index);
			var beforeNode = Diag.traceWindow.document.createTextNode(beforeText);
			contentNode.appendChild(beforeNode);
			var br = Diag.traceWindow.document.createElement("br");
			contentNode.appendChild(br);
			//chop off the text that came before, as well as the newline character.
			formatted = formatted.substr(index+1);
		}
		//what's left in formatted is just the tail end of what it originally was, starting after the last newline character.
		var tail = Diag.traceWindow.document.createTextNode(formatted);
		contentNode.appendChild(tail);
		if (window.focus != undefined)
		{
			Diag.traceWindow.focus();
		}
	}
}

Diag._ensureTraceWindow = function ()
{
	if (Diag.traceWindow == undefined || Diag.traceWindow.document == undefined)
	{
		Diag.traceWindow = window.open("about:blank", 
									   "TraceWindow", 
									   "width="+Diag.traceWindowWidth
									   	+",height="+Diag.traceWindowHeight
									   	+",top=0"
									   	+",left="+(Diag.screenWidth-Diag.traceWindowWidth)
									   	+",scrollbars=yes,resizable=yes,toolbar=yes");
		//Because document.write blanks the page of non-generated content the first time it is called, we send document.write an empty string to initialize the page. If we made any changes to the page THEN called document.write for the first time, the changes would be undone as the page was blanked.
		Diag.traceWindow.document.write("Trace:<br />");
		Diag.traceWindow.document.title = "Trace Window";
		//NOTE: I'd like to not be forced to use document.write("string") to create the body element, but the following method throws an exception.
		//var body = Diag.traceWindow.document.createElement("body");
		//Diag.traceWindow.document.childNodes[0].appendChild(body);
		Diag.traceWindow.document.body.style.overflow = "scroll";
		
		var content = Diag.traceWindow.document.createElement("pre");
		content.style.fontFamily = "monospace";
		content.style.fontSize = "15px";
		content.style.whiteSpace = "pre";
		content.setAttribute("id", "content");
		//alert("Diag.traceWindow.childNodes[0] = "+Diag.traceWindow.document.childNodes[0]+"\nDiag.traceWindow.childNodes[0].childNodes[0] = "+Diag.traceWindow.document.childNodes[0].childNodes[0]+"\nDiag.traceWindow.childNodes[0].childNodes[1] = "+Diag.traceWindow.document.childNodes[0].childNodes[1]);
		Diag.traceWindow.document.childNodes[0].childNodes[1].appendChild(content);
	}
}