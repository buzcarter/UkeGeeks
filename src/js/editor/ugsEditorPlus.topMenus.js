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
		// $('#ugsAppToolbar > ul a')
		$('#ugsAppToolbar > ul li').not('[data-dialog]').children('a').click(_onMenuItemClick);
		$('.showOptionsBox a').click(_onShowOptionsClick);

		$('#ugsAppToolbar > ul li[data-dialog]').click(_onShowDlgBtnClick);
		$('.closeBtn').click(_onCloseBtnClick);
		$('.resizeBtn').click(_onResizeBtnClick);
	};

	/**
	 * Click handler for nav items that are NOT attached to a dialog box.
	 * @method _onMenuItemClick
	 * @private
	 * @return {void}
	 */
	var _onMenuItemClick = function() {
		// the clicked anchor tag
		var $parent = $(this).parent();
		var isOpen = $parent.hasClass('active');
		_makeAllInactive();
		if (isOpen) {
			return;
		}
		$parent.addClass('active');
	};

	/**
	 * Deselects all items in app's top menu/nav bar (just removes active state from all items)
	 * @method _makeAllInactive
	 * @private
	 * @return {void}
	 */
	var _makeAllInactive = function() {
		$('#ugsAppToolbar > ul > li').removeClass('active');
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
		$('.arrowBox').hide();
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
		var id = $(this).data('dialog');
		$('#' + id).fadeIn();

		// prevent event bubbling
		return false;
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
		$(this).parents('.overlay').fadeOut();
		// prevent event bubbling
		return false;
	};

	var _onResizeBtnClick = function(e) {
		_closeAll();
		var dlg = $(this).parents('.overlay');
		ugsEditorPlus.resize.toggle(dlg);
		return false;
	};

	/**
	 * display a "tooltip" options dialog
	 * @method _onShowOptionsClick
	 * @private
	 * @param e {event}
	 * @return {bool} false to kill event bubbling
	 */
	var _onShowOptionsClick = function(e) {
		var id = $(this).attr('href');

		$('.arrowBox').not(id).hide();

		var $dlg = $(id);
		$dlg.find('dd').hide();
		$dlg.fadeToggle();

		ugsEditorPlus.submenuUi.reset($dlg);

		// prevent event bubbling
		return false;
	};

	// ---------------------------------------
	// return public interface
	// ---------------------------------------
	return {
		init: _init,
		makeAllInactive: _makeAllInactive
	};

}());