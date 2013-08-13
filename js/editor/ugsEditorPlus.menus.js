
/**
 * Handles Top Menu UI -- includes the show/hide dialogs (why? cuz they're attached to top menu buttons)
 * Shows (a) dialongs (such as Edit) and (b) those tool-tippy options thingies.
 * @class topMenus
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.topMenus = (function(){
	/**
	 * attach public members to this object
	 * @type {Object}
	 */
	var _public = {};

	/**
	 * attaches events...
	 * @method init
	 * @return {void}
	 */
	_public.init = function(){
		// $('#ugsAppToolbar > ul a')
		$('#ugsAppToolbar > ul  li').not('[data-dialog]').children('a').click(onMenuItemClick);
  	$('.showOptionsBox a').click(onShowOptionsClick);

		$('#ugsAppToolbar > ul  li[data-dialog]').click(onShowDlgBtnClick);
		$('.closeBtn').click(onCloseBtnClick);
		$('.resizeBtn').click(onResizeBtnClick);

 	};

	/**
	 * DESCRIPTION
	 * @private
	 * @method onMenuItemClick
	 * @return {void}
	 */
	var onMenuItemClick = function(){
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
	 * DESCRIPTION
	 * @method _makeAllInactive
	 * @private
	 * @return {void}
	 */
	var _makeAllInactive = function(){
		$('#ugsAppToolbar > ul > li').removeClass('active');
	};

	/**
	 * handles nav menu/toolbar click event. The data-dialog="X" attribute
	 * on the element assocaites the menu item with the dialog box (the
	 * box's id)
	 * @method onShowDlgBtnClick
	 * @private
	 * @param e {event}
	 * @return {bool} false to kill event bubbling
	 */
	var onShowDlgBtnClick = function(e){
		var id = $(this).data('dialog');
		$('#' + id).fadeIn();
		// prevent event bubbling
		return false;
	};

	/**
	 * dialog box's close button's click handler. Hides the first parent
	 * with class.
	 * @method onCloseBtnClick
	 * @private
	 * @param e {event}
	 * @return {bool} false to kill event bubbling
	 */
	var onCloseBtnClick = function(e){
		$(this).parents('.overlay').fadeOut();
		// prevent event bubbling
		return false;
	};

	var onResizeBtnClick = function(e){
		var dlg = $(this).parents('.overlay');
		ugsEditorPlus.resize.toggle(dlg);
		return false;
	};

	/**
	 * display a "tooltip" options dialog
	 * @method onShowOptionsClick
	 * @param  {[type]} e [description]
	 * @return {bool} false to kill event bubbling
	 */
	var onShowOptionsClick = function(e){
		var id = $(this).attr('href');
		$('.arrowBox').not(id).hide();
		var $dlg = $(id);
		$dlg.find('dd').hide();
		$dlg.fadeToggle();

		ugsEditorPlus.submenuUi.reset($dlg);

		// prevent event bubbling
		return false;
	};

	_public.makeAllInactive = _makeAllInactive;

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}()
);