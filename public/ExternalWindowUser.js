function ExternalWindowUser () 
{
	//Static class -- do not instantiate
}

ExternalWindowUser.openWindow = function ()
{
	ExternalWindowUser.myExternalWindow = window.open("about:blank", 
	   "traceWindow", 
	   "width=350"
	   	+",height=300");
}
		

ExternalWindowUser.setEvent = function (text)
{
	alert("Setting unload.");
	document.body.addEventListener("unload", 
		function ()
		{
			alert("Unload.\nmyExternalWindow = "+traceWindow);
			ExternalWindowUser.myExternalWindow.close();
		}, 
		false);
}