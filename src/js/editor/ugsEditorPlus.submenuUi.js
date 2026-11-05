
/**
 * Wires up all the "pseudo-selects" (aka "dropdownlists") on a Tooltip-Dialog boxes on
 * the page; assumes consistent HTML
 * TODO: Refactor -- quite brittle!
 * @class submenuUi
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.submenuUi = (function(){
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	var _open = null;

	/**
	 * attaches event handlers
	 * @method init
	 * @public
	 * @return {[type]} [description]
	 */
	_public.init = function() {
		ugsEditorPlus.themes.loadList('#colorPicker .pseudoSelect', ugsEditorPlus.options.theme);
		var dom = ugsEditorPlus.dom;
		dom.on('.enablePseudoSelects label', 'click', onLabelClick);
		dom.on('.pseudoSelect li', 'click', onOptionClick);
		dom.on(document.body, 'click', closeAll);
		dom.on('.arrowBox', 'click', doCollapseAllLists);

		syncOptions(ugsEditorPlus.options);
	};

	/**
	 * a list item has been clicked
	 * @method onOptionClick
	 * @param  {event} e
	 * @return {bool} false to kill event bubbling
	 */
	var onOptionClick = function(e){
		var optionItem = this;
		var value = stripHash(optionItem.querySelector('a').getAttribute('href'));

		// the element holding the "pseudo-select"
		var select = optionItem.closest('dd');
		var id = select.id;
		var actionName = select.getAttribute('data-action');

		// a selection's been made so we hide the (sub) select list
		ugsEditorPlus.dom.hide(select);
		// ...and reset ("uncheck") all items and check ("highlight") this selected item
		setChecked(optionItem);

		onListActive(this, false);
		_open = null;

		// now bubble out the info -- update display to show selected value ...
		var label = getLabel(id);
		label.querySelector('span').textContent = getLabelText(actionName, value, optionItem);
		label.closest('dt').classList.remove('active');

		// lastly, execute the action
		ugsEditorPlus.dom.trigger('ugs:option', {
			action: actionName,
			value: value
		});

		// prevent event bubbling
		e.preventDefault();
		e.stopPropagation();
	};

	var setChecked = function(item) {
		if (!item) {
			//console.log('item for option not found');
			return;
		}
		Array.prototype.forEach.call(item.parentNode.children, function(sibling) {
			sibling.classList.remove('checked');
		});
		item.classList.add('checked');
	};

	/**
	 * the label (in the dt) for the pseudo-select with this id
	 * @method getLabel
	 * @param  {string} id
	 * @return {DOM-element}
	 */
	var getLabel = function(id) {
		return document.querySelector('label[for="' + id + '"]');
	};

	/**
	 * a value safe to use inside a quoted CSS attribute selector
	 * @method cssString
	 * @param  {string} value
	 * @return {string}
	 */
	var cssString = function(value) {
		return String(value).replace(/["\\]/g, '\\$&');
	};

	var syncOptions = function(options) {
		var item, id,
			map = [{
				action: 'zoomFonts',
				value: options.fontSize
			}, {
				action: 'zoomDiagrams',
				value: options.diagramSize
			}, {
				action: 'layout',
				value: options.diagramPosition
			}, {
				action: 'paper',
				value: options.paper
			}, {
				action: 'colors',
				value: options.theme
			}, {
				action: 'tuning',
				value: options.tuning
			}, {
				action: 'placement',
				value: options.lyricStyle
			}];

		for (var i = map.length - 1; i >= 0; i--) {
			item = document.querySelector('[data-action="' + map[i].action + '"] a[href="#' + cssString(map[i].value) + '"]');
			if (!item) {
				continue;
			}
			item = item.closest('li');
			id = item.closest('dd').id;
			setChecked(item);
			getLabel(id).querySelector('span').textContent = getLabelText(map[i].action, map[i].value, item);
		}
	};

	/**
	 * Label has been clicked, show associated options dialog box.
	 * Watch for 2-clicks on same label (should hide on second click)
	 * @method onLabelClick
	 * @param  {event} e
	 * @return {bool} false to kill event bubbling
	 */
	var onLabelClick = function(e){
		var id = this.getAttribute('for');
		setActiveLabel(this);
		ugsEditorPlus.dom.show(document.getElementById(id));
		onListActive(this, true);
		if (_open !== null) {
			ugsEditorPlus.dom.hide(document.getElementById(_open.id));
		}
		if (_open !== null && _open.id == id) {
			_open = null;
		}
		else {
			_open = {
				"id": id
			};
		}

		// prevent event bubbling
		e.preventDefault();
		e.stopPropagation();
	};

	/**
	 * clears "active" & "in use" states within the (tooltip) dialog
	 * @method reset
	 * @param  {DOM-element} dlg
	 */
	_public.reset = function(dlg){
		ugsEditorPlus.dom.all('dt', dlg).forEach(function(dt) {
			dt.classList.remove('active');
		});
		ugsEditorPlus.dom.all('.event-userSelecting', dlg).forEach(function(ele) {
			ele.classList.remove('event-userSelecting');
		});
	};

	var setActiveLabel = function(label){
		Array.prototype.forEach.call(label.closest('dl').children, function(child) {
			if (child.tagName == 'DT') {
				child.classList.remove('active');
			}
		});
		label.closest('dt').classList.add('active');
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
		var wrap = ele.closest('.enablePseudoSelects');
		if (wrap) {
			wrap.classList.toggle('event-userSelecting', isInUse);
		}
	};

	/**
	 * @method  doCollapseAllLists
	 * @param  {event} e
	 * @return bool
	 */
	var doCollapseAllLists = function(e){
		if (e.target.matches('a')){
			return;
		}
		ugsEditorPlus.dom.all('dd', this).forEach(ugsEditorPlus.dom.hide);
		_open = null;
		e.preventDefault();
		e.stopPropagation();
	};

	/**
	 * user clicked off the current dialog -- close 'em all
	 * @method closeAll
	 * @param  {event} e
	 */
	var closeAll = function(e){
		ugsEditorPlus.dom.all('.arrowBox').forEach(function(box) {
			ugsEditorPlus.dom.fadeOut(box, 270);
		});
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
	 * @property _descriptions
	 * @private
	 * @type {JSON}
	 */
	var _desriptions = {
		'zoomDiagrams' : ['Tiny', 'Small', 'Medium', 'Large', 'Stupid Large'],
		'layout' : ['Reference diagrams on left', 'Reference diagrams at top', 'No reference diagrams'],
		'placement' : ['Chord names inline with lyrics', 'Chord names above lyrics', 'Names & diagrams above lyrics'],
		'tuning' : ['(GCEA) Standard tuning', '(DGBE) Baritone tuning', '(ADF#B) alternate tuning']
	};

	/**
	 * Builds a descriptor string of the current values for the pseudo-select labels
	 * @method getLabelText
	 * @param  {string} action
	 * @param  {string} value
	 * @param  {DOM-element} ele the selected list item (LI)
	 * @return {string}
	 */
	var getLabelText = function(action, value, ele){
		var index = Array.prototype.indexOf.call(ele.parentNode.children, ele);

		switch (action){
			case 'paper':
				return 'Width ' + ele.textContent;
			case 'zoomFonts':
				return 'Font size ' + value + 'pt';
			case 'zoomDiagrams':
				return _desriptions.zoomDiagrams[index] + ' diagrams';
			case 'colors':
				return ugsEditorPlus.themes.getDescription(value);
			case 'transpose':
				if (value == 'up_0'){
					return 'Original key';
				}
				var txt = ele.textContent;
				return txt.replace(' ', ' steps - "') + '"';
			default:
			 return _desriptions[action][index];
		}
	};

	_public.resetTransposeLabel = function(){
		getLabel('transposePicker').querySelector('span').textContent = 'Original key';
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}());
