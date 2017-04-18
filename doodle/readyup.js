exports._ = {};
exports._.callback = function(){};
exports.init = function(call){
	exports._.callback = call;
};
exports._.count = 0;
exports._.running = false;
exports._.called = false;
exports._.attempt = function(){
	if(exports._.called){
		return;
	}
	if(!exports._.running){
		return;
	}
	if(exports._.count > 0){
		return;
	}
	exports._.callback();
	exports._.called = true;
};
exports.wait = function(){
	exports._.count++;
};
exports.done = function(){
	exports._.count--;
	exports._.attempt();
};
exports.finish = function(){
	exports._.running = true;
	exports._.attempt();
}