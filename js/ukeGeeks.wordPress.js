/*!
/*
 * Plugin for WordPress blogs
 * @class wordpress
 * @namespace ukeGeeks
 * @static
 */
ukeGeeks.wordpress = new function(){
	/**
	 * Preps this class for running
	 * @method init
	 * @param isIeFamily {bool} TRUE if UserAgent (Browser to you and me) is Internet Explorer
	 * @return {void}
	 */
	this.init = function(isIeFamily, scaleMultiplier){
		scaleMultiplier = (arguments.length > 1) ? scaleMultiplier : 1.0;
		ukeGeeks.scriptasaurus.init(isIeFamily);
		ukeGeeks.settings.scale(scaleMultiplier);
	};
	
	var maxSongsAllowed = 10;
	
	/**
	 * 
	 * @method run
	 * @param name {datatype} Description
	 * @return {void}
	 */
	this.run = function(){
		//console.log('run');
		var pre = _getSourceElements();
		for(var i = 0; i < pre.length; i++){
			if (i >= maxSongsAllowed){
				alert('For performance reasons only the first ' + maxSongsAllowed + ' songs will be formatted to include chord fingering diagrams. (change in your site settings)');
				return;
			}
			_rewriteHtml(pre[i]);
		}
		var songs = ukeGeeks.scriptasaurus.runByClasses();
	};
	
	/**
	 * 
	 * @method _getSourceElements
	 * @private
	 * @param name {datatype} Description
	 * @return {void}
	 */
	var _getSourceElements = function(){
		//console.log('getSourceElements');
		var a = document.getElementsByTagName('pre');
		var out = [];
		for(var i = 0; i < a.length; i++){
			out.push(a[i]);
		}
		return out;
	}
	
	/**
	 * 
	 * @method _rewriteHtml
	 * @private
	 * @param name {datatype} Description
	 * @return {void}
	 */
	var _rewriteHtml = function(preEle){
		//console.log('rewriteHtml');
		// <div class="ugs-song-wrap"></div>
		var songWrapDiv = document.createElement('div');
		//masterDiv.id = 'ukeSongContainer';
		songWrapDiv.className = ukeGeeks.settings.wrapClasses.wrap;
		songWrapDiv.innerHTML = '<div class="' + ukeGeeks.settings.wrapClasses.diagrams + ' ugs-grouped"></div>'
			+ '<div class="' + ukeGeeks.settings.wrapClasses.text + '"><pre>' + preEle.innerHTML + '</pre></div>';
		preEle.parentNode.insertBefore(songWrapDiv, preEle);
		preEle.style.display = 'none';
	};
}

if (!console){
	console = {log: function(){}};
}

/**
 * +++
 */
if (isLegacyIe){
	window.attachEvent('onload',function(){
		ukeGeeks.wordpress.init(true, 0.8);
		ukeGeeks.wordpress.run();
	});
}
else{
	(function(){
		ukeGeeks.wordpress.init(false, 0.8);
		ukeGeeks.wordpress.run();
	})();
}

