require('main.js');//test circular reference
module.exports=function(words){
	document.body.appendChild(document.createTextNode(words));
	document.body.appendChild(document.createElement('br'));
};