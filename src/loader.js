/*
API:
    Loader.setEntry('main.js');加载入口
		1.加载脚本文件
		2.判断其依赖关系 找出没有加载完成的模块
		3.加载未加载的模块，判断依赖关系
		需要解决的问题 循环引用
*/

/* the loaderjs is just used for browser*/
if(Loader!==undefined) throw new Error('the loader namespace may be used for other lib');
var Loader=(function(){
		var deepCopy=function(obj){
			var obj_copy,type=typeof obj;
			function copyObj(o,target){
				for(var i in o){ 	
					if(typeof o[i]==='object'&&o[i]!==null){
						target[i]={};
						copyObj(o[i],target[i]);	
					}else if(typeof o[i]==='function'){
						target[i]=copyFunc(o[i]);
					}else{
						target[i]=o[i];
					}
				}
			}
			function copyFunc(func){
				var temp=function(){
					return func.apply(this,arguments);
				};
				for(var key in func){
					temp[key]=deepCopy(func[key]);
				}
				return temp;
			}
			if(type==='function'){
				obj_copy=copyFunc(obj);
			}else if(type==='object'&&obj!==null){
				obj_copy={};
				copyObj(obj,obj_copy);
			}else{
				obj_copy=obj;
			}
			return obj_copy;
		};
		/*
			ajax加载文件
			@param {string} url fetch的地址
			@param {function} callback 用来执行加载完成的操作  
		*/
  	var fetchTextFromURL=function(url,callback){
    var xhr = new XMLHttpRequest();
    xhr.onerror = error;
    function error() {
   		throw new Error('XHR error' + (xhr.status ? ' (' + xhr.status + (xhr.statusText ? ' ' + xhr.statusText  : '') + ')' : '') + ' loading ' + url);
    }
    xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
		if (xhr.status === 200) {
		  callback(xhr.responseText);
		}else {
		  error();
		}
		}
    };
    xhr.open("GET", url, true);
    if (xhr.setRequestHeader) {
      xhr.setRequestHeader('Accept', 'application/x-es-module, */*');
    }
    xhr.send();
	};
	var loadScript=function(path,parent,callback){
		if(Modules.hasAdd(path)) return;
		var _module=new Module(path,parent);
		Modules.set(path,_module);
		fetchTextFromURL(path,function(script_text){
			var script=new Script(script_text,path);
			_module.children=script.deP;
			if(_module.children.length===0){
				setTimeout(function(){
					script.init();
					if(callback!==undefined) setTimeout(callback,0);
				},0);
			}else{
				Modules.register(_module.children,function(){
					script.init();
					if(callback!==undefined) setTimeout(function(){
						callback(_module.exports);
					},0);
				});
				for(var i in _module.children){
					var load=loadScript(_module.children[i],path);
				}
			}
		});
	};
	var Script=function(script_text,path){
		this.deP=Script.getDep(script_text);
		this.wrapStart='(function(){var module=Loader.getModule(\''+path+'\');(function(require,exports){';
		this.execPart=script_text;
		this.wrapEnd='})(module.require,module.exports);module.loaded=true;Loader.checkOut(\''+path+'\')})()';
	};
	Script.prototype.generate=function(){
		return this.wrapStart+this.execPart+this.wrapEnd;
	};
	Script.prototype.init=function(){
		var Head=window.document.head||window.document.body;
		var script=document.createElement('script');
		script.text=this.generate();
		Head.appendChild(script);
		Head.removeChild(script);
	};
	Script.regExp=/require\((["'])(.*?)\1\)/g;
	Script.getDep=function(script_text){
		var result,deP=[];
		while((result=Script.regExp.exec(script_text))!==null){
			deP.push(Path.polyfill(result[2]));
		}
		return deP;
	};
	var Path=function(){};
	Path.regExp=/^(\.{1,2})?(\/)?.*?\.js/;
	Path.polyfill=function(path){
		var result=Path.regExp.exec(path);
		if (result===null){
			return './'+path+'.js';
		}else if(result[2]===undefined){
			return "./"+path;
		}else if(result[1]===undefined){
			return "."+path;
		}
		return path;
	};

	var Module=function(path,parent){
		this.exports={};
		this.loaded=false;
		this.id=path;
		this.parent=parent;//' LOADER'为入口
		this.children=null;
	};
	Module.prototype.require=function(path){
		return deepCopy(Modules.get(Path.polyfill(path)).exports);
	};
	var Modules=(function(){
		var __M=[],path_id_map={},__fnQueue={};
		var IdManager=function(){};
		IdManager._id=1;
		IdManager.setId=function(path){
			var id=path_id_map[path];
			if(id===undefined){
				path_id_map[path]=this._id;
				return this._id++;
			}else{
				return id;
			}
		};
		IdManager.getId=function(path){
			return path_id_map[path];
		};
		function hasAdd(path){
			var id;
			return !!((id=IdManager.getId(path))&&(__M[id]));
		}
		function set(path,module){
			var id=IdManager.setId(path);
			__M[id]=module;
		}
		function get(path){
			var id,module;
			if(!((id=IdManager.getId(path))&&(module=__M[id]))){
				throw new Error("can't get the module");
			}
			return module;
		}
		function hasLoaded(path){
			var id;
			return !!((id=IdManager.getId(path))&&__M[id]&&__M[id].loaded);
		}
		function register(deps,callback){
			var i,id,idList=[],encode,waitFor=[],fnObj,temp;
			for(i=0;i<deps.length;i++){	
				id=IdManager.setId(deps[i]);
				idList.push(id);
				if(!hasLoaded(deps[i])) waitFor.push(id);
			}
			encode=idList.join('&');
			if(__fnQueue[encode]!==undefined)
				if(typeof __fnQueue[encode].exec === 'function'){
					temp=__fnQueue[encode].exec;
					__fnQueue[encode].exec=[];
					__fnQueue[encode].exec.push(temp,callback);
				}else{
					__fnQueue[encode].exec.push(callback);
				}
			else{
				__fnQueue[encode]={};
				fnObj=__fnQueue[encode];
				fnObj.exec=callback;
				fnObj.waitfor=waitFor;
				fnObj.finished=false;
			}
		}
		function asyncExec(queue,key){
			if(typeof queue[key].exec ==='function'){
				queue[key].finished=true;
				setTimeout(function(){
					queue[key].exec();
					delete queue[key];
				},0);
			}else{
				for(var j in queue[key].exec){
					queue[key].finished=true;
					(function(){
						var con=j,i=0;
						setTimeout(function(){
							queue[key].exec[con]();
							if(i===j) delete queue[key];
							i++;
						},0);
					})();
				}
			}
		}
		function checkOut(path){
			var i,waitFor,id;
			id=IdManager.getId(path);
			if(id===undefined){
				throw new Error('the path is not included');
			}
			for(i in __fnQueue){
				if(__fnQueue[i].finished) continue;
				waitFor=__fnQueue[i].waitfor;
				index=waitFor.indexOf(id);
				if(index===undefined)  continue;
				waitFor.splice(index,1);
				if(waitFor.length===0){
					asyncExec(__fnQueue,i);
				}
			}
		}
		return {
			set:set,
			get:get,
			register:register,
			checkOut:checkOut,
			hasAdd:hasAdd
		};
	})();
	var rtObj={};
	//不暴露设置不可遍历
	rtObj.getModule=Modules.get;
	//入口
	rtObj.setEntry=function(path,callback){
		path=Path.polyfill(path);
		loadScript(path,'LOADER',callback);
	};
	rtObj.checkOut=Modules.checkOut;
	// Obejct.defineProperties(rtObj,{
	// 	module:{
	// 		value:module
	// 	},
	// 	entry:{
	// 		set:function(){

	// 		}
	// 	}
	// });
	return rtObj;
})();
/*
function(){
	module=new Module();
	function(exports,require){
		
	}(module.exports,module.require)	
}();

*/