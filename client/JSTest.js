/******** Setup *********/
/*** Diag ***/
var diag = true;

function test (varname)
{
	var result = Boolean(eval(varname));
	var value = eval(varname); //even though I use it here, that doesn't change anything. I still hate eval()
	if (diag == true) alert(varname+"(="+value+") resolves to "+result);
	return result;
}

/*** Event handlers ***/
function init ()
{
	alert('init()')
	d = window.document;
	box = d.getElementById('box').style
	textArea = d.getElementById('textArea')
	newText = d.createTextNode('coded text');
	textArea.removeChild(textArea.childNodes[0]);
	textArea.appendChild(newText);
}