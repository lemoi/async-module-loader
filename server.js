const http=require('http');
const fs=require('fs');
http.createServer(function(req,res){
	res.statusCode=200;
	var readStream=fs.createReadStream(__dirname+req.url);
	readStream.on('error',function(err){
		console.log(err);
	});
	readStream.pipe(res);
}).listen(3000,function(){
	console.log('your server is running');
});