# async-module-loader
browser module loader compatible with nodejs

*!warning:the loaderjs is just used for browser*

you can use { require , exports , module.exports } to load modules asynchronously just like the nodejs

**run the example** 

`npm install`

`npm start`

you have these modules:

```js
//say.js

module.exports=function(){
	console.log('I am saying');
}
```

```js
//run.js

exports.slow=function(){
	console.log('slow down');
}
```
then,the entry:

```js
//main.js

const say=require('say.js');
const run=require('run.js');
say();
run.slow();
exports.main='Hello World';
```
the html file:

```html
//test.html

<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
</head>
<body>
<script src="src/loader.js"></script>
<script>
	Loader.setEntry('main.js',function(a){
		console.log(a.main);
	});
</script>
</body>
</html>
```
these are in a directory:
```
	/
		test.html
		say.js
		run.js
		main.js
```
these modules will be loaded asynchronously and execute automatically

