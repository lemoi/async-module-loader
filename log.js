require('main.js');
module.exports=function(words){
	document.body.appendChild(document.createTextNode(words));
	document.body.appendChild(document.createElement('br'));
};