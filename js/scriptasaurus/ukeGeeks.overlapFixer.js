/**
 * Singleton to correct overlapping chord names/diagrams in songs rendered by UGS
 * @class overlapFixer
 * @namespace ukeGeeks
 * @project UkeGeeks' Scriptasaurus
 */
ukeGeeks.overlapFixer = (function() {

	// private
	// ---------------------------
	var _publics = {};

	/**
	 * returns TRUE if Box A overlaps Box B (horizontally only)
	 * @method checkOverlap
	 * @param  {object} "a" box
	 * @param  {object} "b" box
	 * @return {boolean}
	 */
	var checkOverlap = function(a, b) {
		if ((b.left > a.right) || (b.right < a.left)) {
			//overlap not possible
			return false;
		}
		if ((b.left > a.left) && (b.left < a.right)) {
			return true;
		}
		if ((b.right > a.left) && (b.right < a.right)) {
			return true;
		}
		return false;
	};


	/**
	 * returns object with width and left & right offsets
	 * @method getBox
	 * @param  {DOM_element} element to be measured
	 * @return {object}
	 */
	var getBox = function(ele){
		var box =
		{
			width: getWidth(ele),
			left: getLeftOffset(ele),
			right: 0
		};
		// due to how CSS & HTML is defined it's possible that the <em> wrapping the
		// chord name is actually wider than the <strong>, let's check.
		// BTW: this will happen on the "mini-chord diagram" option
		var em = ele.getElementsByTagName('em')[0];
		if (em){
			var emWidth = getWidth(em);
			if (emWidth > box.width){
				//console.log('box strong.width: ' + box.width + 'px, em.width: ' + emWidth +'px');
				box.width = emWidth + 2;
			}
		}

		box.right = box.left + box.width;
		return box;
	};

	/**
	 * source: http://www.cjboco.com/blog.cfm/post/determining-an-elements-width-and-height-using-javascript/
	 * @method getWidth
	 * @param  {DOM_element} element to be measured
	 * @return {int}
	 */
	var getWidth = function(ele) {
		if (typeof ele.clip !== "undefined") {
			return ele.clip.width;
		}

		return (ele.style.pixelWidth)
			? ele.style.pixelWidth
			: ele.offsetWidth;
	};

	/**
	 * source: http://stackoverflow.com/questions/442404/dynamically-retrieve-the-position-x-y-of-an-html-element
	 * @method getLeftOffset
	 * @param  {DOM_element} element to be measured
	 * @return {int}
	 */
	var getLeftOffset = function(ele) {
		var left = 0;
		while( ele && !isNaN( ele.offsetLeft )) {
			left += ele.offsetLeft - ele.scrollLeft;
			ele = ele.offsetParent;
		}
		return left;
	};


	/**
	 * checks (and fixes if problem is presetn) two code tags
	 * @method checkChords
	 * @param  {[DOM_element]} codeA [description]
	 * @param  {[DOM_element]} codeB [description]
	 * @return {void}
	 */
	var checkChords = function(codeA, codeB){
		var strongA = codeA.getElementsByTagName('strong')[0];
		var strongB = codeB.getElementsByTagName('strong')[0];

		if (!strongA || !strongB){
			return;
		}

		var boxA = getBox(strongA);
		var boxB = getBox(strongB);

		if(checkOverlap(boxA, boxB)){
			var width = boxA.right - boxB.left + 1;
			codeA.style.paddingRight = (width < 1 ? 1 : width) +'px';
		}
	};

	/**
	 * Runs through the element looking for UkeGeek chords (based on HTML) and
	 * adjust the horizontal spacing if any of the chords overlap.
	 * @method Fix
	 * @param  {DOM_element} element containing the UGS HTML song
	 */
	_publics.Fix = function(ele){
		var elements = ele.getElementsByTagName('code');

		for (var i = 0; i < elements.length; i++) {
			elements[i].style.paddingRight = '0px';
		}

		for (var i = 0; i < (elements.length - 1); i++) {
			checkChords(elements[i], elements[i + 1]);
		}
	};

	return _publics;
})();
