/**
 * For demo purposes allows one to turn on/off the inlineDiagrams setting. 
 * @method checkUrlOpts
 * @return {void}
 */
function checkUrlOpts(){
	var re = new RegExp("[?&]inline=([^&]*)", "i");
	var m = ('' + window.location).match(re);
	if (!m || m.length < 1){
		return;
	}
	ukeGeeks.settings.inlineDiagrams = true;
}

/**
 * Here we've added a call to checkUrlOpts in what's otherwise a 
 * very "standard" way to run Scriptasaurus.
 */
if (isLegacyIe){
	window.attachEvent('onload',function(){
		checkUrlOpts();
		ukeGeeks.scriptasaurus.init(true);
		ukeGeeks.scriptasaurus.run();
	});
}
else{
	(function(){
		checkUrlOpts();
		ukeGeeks.scriptasaurus.init(false);
		ukeGeeks.scriptasaurus.run();
	})();
}