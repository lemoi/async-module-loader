const express=require('express');
var app=express();
app.use(express.static('./'));
app.listen(3000,function(){
	process.stdout.write('your server is running','utf8');
});