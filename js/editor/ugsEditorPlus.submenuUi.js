
/**
 * Wires up all the "pseudo-selects" (aka "dropdownlists") on a Tooltip-Dialog boxes on
 * the page; assumes consistent HTML (hello, jQuery)
 * TODO: Refactor -- quite brittle!
 * @class submenuUi
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.submenuUi = (function(){
	/**
	 * attach public members to this object
	 * @type {Object}
	 */
	var _public = {};

	var _open = null;

	/**
	 * borrow the "doAction" method from Actions class
	 * @property _doAction
	 * @type {function}
	 */
	var _doAction = null;

	/**
	 * attaches event handlers
	 * @method init
	 * @return {[type]} [description]
	 */
	_public.init = function(doAction){
		_doAction = doAction;

		$('.enablePseudoSelects label').click(onLabelClick);
		$('.pseudoSelect li').click(onOptionClick);
		$('body').bind('click', closeAll);
		$('.arrowBox').click(doCollapseAllLists);
	};

	/**
	 * a list item has been clicked
	 * @param  {event} e
	 * @return {bool} false to kill event bubbling
	 */
	var onOptionClick = function(e){
		var $optionItem = $(this);
		var hrefValue = stripHash($optionItem.children().attr('href'));

		// the element holding the "pseudo-select"
		var $select = $optionItem.parents('dd');
		var id = $select.attr('id');
		var actionName = $select.data('action');

		// a selection's been made so we reset ("uncheck" all items) and hide the select list
		$('#'+id)
			.hide()
			.find('li').removeClass('checked');

		// check ("highlight") this selected item
		$optionItem.addClass('checked');

		onListActive(this, false);
		_open = null;

		// now bubble out the info -- update display to show selected value ...
		$('label[for=' + id + '] span').text(getLabelText(actionName, hrefValue, $optionItem));
		$('label[for=' + id + ']').parents('dt').removeClass('active');

		// lastly, execute the action
		_doAction(actionName, hrefValue);

		// prevent event bubbling
		return false;
	};

	/**
	 * Label has been clicked, show associated options dialog box.
	 * Watch for 2-clicks on same label (should hide on second click)
	 * @param  {event} e
	 * @return {bool} false to kill event bubbling
	 */
	var onLabelClick = function(e){
		var $thisLabel = $(this);
		var id = $thisLabel.attr('for');
		setActiveLabel($thisLabel);
		$('#'+id).show();
		onListActive(this, true);
		if (_open != null){
			$('#' + _open.id).hide();
		}
		if (_open != null && _open.id == id){
			_open = null;
		}
		else
		{
		 _open = { "id" : id };
		}

		// prevent event bubbling
		return false;
	};

	_public.reset = function($dlg){
		$dlg.find('dt').removeClass('active');
		$dlg.find('.event-userSelecting').removeClass('event-userSelecting');
	};

	var clearActiveLabels = function($parent){
		$parent.closest('dl').children('dt').removeClass('active');
	};

	var setActiveLabel = function($label){
		$label.closest('dl').children('dt').removeClass('active');
		$label.closest('dt').addClass('active');
	};

	/**
	 * trying prevent the options not being set from being too distractive --
	 * (trying and clearly failing)
	 * @method onListActive
	 * @param  {DOM-elemnt}  ele     [description]
	 * @param  {Boolean} isInUse [description]
	 * @return void
	 */
	var onListActive = function(ele, isInUse){
		$(ele).parents('.enablePseudoSelects').toggleClass('event-userSelecting', isInUse);
	};

	/**
	 * @method  doCollapseAllLists
	 * @param  {event} e
	 * @return bool
	 */
	var doCollapseAllLists = function(e){
		if ($(e.target).is('a')){
			return;
		}
		//console.log('doCollapseAllLists');
		//console.log();
		$(this).find('dd').hide();
		_open = null;
		return false;
	};


	/**
	 * user clicked off the current dialog -- close 'em all
	 * @medhod closeAll
	 * @param  {event} e
	 */
	var closeAll = function(e){
		$('.arrowBox').fadeOut(270);
		ugsEditorPlus.topMenus.makeAllInactive();
	};

	var stripHash = function(value){
		return (value[0] == '#') ? value.substr(1) : value;
	};

	/* ----------------------------------------------------------------------------------- *|
	|* Display Text Methods
	|* ----------------------------------------------------------------------------------- */

	/**
	 * used to construct the descriptions for current values
	 * @private
	 * @type {JSON}
	 */
	var _desriptions = {
		'zoomDiagrams' : ['Tiny', 'Small', 'Medium', 'Large', 'Stupid Large'],
		'layout' : ['Reference diagrams on left', 'Reference diagrams at top', 'No reference diagrams'],
		'placement' : ['Chord names inline with lyrics', 'Chord names above lyrics', 'Names & diagrams above lyrics'],
		'colors' : ['Normal colors (white paper)', 'Reversed colors (for projectors)'],
		'tuning' : ['Soprano (GCEA) tuning', 'Baritone (DBEA) tuning']
	};

	/**
	 * Builds a descriptor string of the current values for the pseudo-select labels
	 * @medhod getLabelText
	 * @param  {string} action
	 * @param  {string} value
	 * @param  {jQueryElement} $ele jQuery element that ...
	 * @return string
	 */
	var getLabelText = function(action, value, $ele){
		var index = $ele.index();

		switch (action){
			case 'paper':
				return 'Width ' + $ele.text();
			case 'zoomFonts':
				return 'Font size ' + value + 'pt';
			case 'zoomDiagrams':
				return _desriptions.zoomDiagrams[index] + ' diagrams';
			case 'transpose':
				if (value == 'up_0'){
					return 'Original key';
				}
				var txt = $ele.text();
				return txt.replace(' ', ' steps - "') + '"';
			default:
			 return _desriptions[action][index];
		}
	};

	_public.resetTransposeLabel = function(){
		$('label[for=transposePicker] span').text('Original key');
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}()
);