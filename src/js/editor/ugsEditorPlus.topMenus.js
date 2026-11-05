/**
 * Handles Top Menu UI -- includes the show/hide dialogs (why? cuz they're attached to top menu buttons)
 * Shows (a) dialongs (such as Edit) and (b) those tool-tippy options thingies.
 * @class topMenus
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.topMenus = (function() {

	/**
	 * attaches events...
	 * @method _init
	 * @public
	 * @return {void}
	 */
	var _init = function() {
		var dom = ugsEditorPlus.dom;
		dom.on('#ugsAppToolbar > ul li:not([data-dialog]) > a', 'click', _onMenuItemClick);
		dom.on('.showOptionsBox a', 'click', _onShowOptionsClick);

		dom.on('#ugsAppToolbar > ul li[data-dialog]', 'click', _onShowDlgBtnClick);
		dom.on('.closeBtn', 'click', _onCloseBtnClick);
		dom.on('.resizeBtn', 'click', _onResizeBtnClick);
	};

	/**
	 * Click handler for nav items that are NOT attached to a dialog box.
	 * @method _onMenuItemClick
	 * @private
	 * @return {void}
	 */
	var _onMenuItemClick = function() {
		// the clicked anchor tag
		var parent = this.parentNode;
		var isOpen = parent.classList.contains('active');
		_makeAllInactive();
		if (isOpen) {
			return;
		}
		parent.classList.add('active');
	};

	/**
	 * Deselects all items in app's top menu/nav bar (just removes active state from all items)
	 * @method _makeAllInactive
	 * @private
	 * @return {void}
	 */
	var _makeAllInactive = function() {
		ugsEditorPlus.dom.all('#ugsAppToolbar > ul > li').forEach(function(li) {
			li.classList.remove('active');
		});
	};

	/**
	 * Same as _makeAllInactive method PLUS closes any open drop down/arrow boxes.
	 * @method _closeAll
	 * @private
	 * @return {void}
	 */
	var _closeAll = function() {
		// hide any drop-down/arrow boxes currently open
		_makeAllInactive();
		ugsEditorPlus.dom.all('.arrowBox').forEach(ugsEditorPlus.dom.hide);
	};

	/**
	 * handles nav menu/toolbar click event. The data-dialog="X" attribute
	 * on the element assocaites the menu item with the dialog box (the
	 * box's id)
	 * @method _onShowDlgBtnClick
	 * @private
	 * @param e {event}
	 * @return {bool} false to kill event bubbling
	 */
	var _onShowDlgBtnClick = function(e) {
		_closeAll();

		// now show dialog associated with the clicked button
		var id = this.getAttribute('data-dialog');
		ugsEditorPlus.dom.fadeIn(document.getElementById(id));

		// prevent event bubbling
		e.preventDefault();
		e.stopPropagation();
	};

	/**
	 * dialog box's close button's click handler. Hides the first parent
	 * with class.
	 * @method _onCloseBtnClick
	 * @private
	 * @param e {event}
	 * @return {bool} false to kill event bubbling
	 */
	var _onCloseBtnClick = function(e) {
		ugsEditorPlus.dom.fadeOut(this.closest('.overlay'));
		// prevent event bubbling
		e.preventDefault();
		e.stopPropagation();
	};

	var _onResizeBtnClick = function(e) {
		_closeAll();
		ugsEditorPlus.resize.toggle(this.closest('.overlay'));
		e.preventDefault();
		e.stopPropagation();
	};

	/**
	 * display a "tooltip" options dialog
	 * @method _onShowOptionsClick
	 * @private
	 * @param e {event}
	 * @return {bool} false to kill event bubbling
	 */
	var _onShowOptionsClick = function(e) {
		var dom = ugsEditorPlus.dom;
		var dlg = document.getElementById(this.getAttribute('href').replace(/^#/, ''));

		dom.all('.arrowBox').forEach(function(box) {
			if (box !== dlg) {
				dom.hide(box);
			}
		});

		dom.all('dd', dlg).forEach(dom.hide);
		dom.fadeToggle(dlg);

		ugsEditorPlus.submenuUi.reset(dlg);

		// prevent event bubbling
		e.preventDefault();
		e.stopPropagation();
	};

	// ---------------------------------------
	// return public interface
	// ---------------------------------------
	return {
		init: _init,
		makeAllInactive: _makeAllInactive
	};

}());