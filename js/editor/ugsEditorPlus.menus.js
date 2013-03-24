
/**
 * Handles Menu UI - show/hide, set checked state, calls actions
 * @class menus
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.menus = new function(){
	// top level LI (list items)
	var _menuItems;
	// currently selected top menu href ('#top')
	var _topBtnUl = null;
	var _topBtnHref = '';
	// currently selected sub-menu item's href ('#sub')
	var _subBtnHref = '';
	// associative array/JSON of last click event
	var _prevValues = {
		'#layout' : '#left',
		'#placement' : '#above',
		'#tuning' : '#soprano',
		'#zoom' : '#prct_100',
		'#transpose' : '#up_0',
		'#colors' : '#normal'
	};
	
	/**
	 * DESCRIPTION
	 * @method init
	 * @return {void}
	 */
	this.init = function(){
		_menuItems = document.getElementById('ugsAppToolbar').getElementsByTagName('ul')[0].children;
		addSizeOptions();
		attachClicks();
	};
	
	/**
	 * DESCRIPTION
	 * @private
	 * @method attachClicks
	 * @return {void}
	 */
	var attachClicks = function() {
		for (var i = 0; i < _menuItems.length; i++){
			var topBtn = _menuItems[i].getElementsByTagName('a')[0];
			var ul = _menuItems[i].getElementsByTagName('ul');
			if (ul.length < 1){
				topBtn.onclick = function(){closeAll(); return false;};
				continue;
			}
			
			topBtn.onclick = function(){switchActiveMenu(this); return false;};
			
			var items = _menuItems[i].getElementsByTagName('li');
			for(var j = 0; j < items.length; j++){
				var subBtn = items[j].getElementsByTagName('a')[0];
				subBtn.onclick = function(){subBtnClick(this); return false;};
			}
		}
	};
	
	/**
	 * DESCRIPTION
	 * @private
	 * @method switchActiveMenu
	 * @param ele (DOM_element) 
	 * @return {void}
	 */
	var switchActiveMenu = function(ele){
		var isOpen = ukeGeeks.toolsLite.hasClass(ele.parentNode, 'active');
		closeAll();
		if (isOpen) {
			return;
		}
		ukeGeeks.toolsLite.addClass(ele.parentNode, 'active');
		_topBtnUl = ele.parentNode.getElementsByTagName('ul')[0];
		_topBtnHref = getHref(ele);
		
	};
	
	/**
	 * DESCRIPTION
	 * @private
	 * @method subBtnClick
	 * @param ele (DOM_element) 
	 * @return {void}
	 */
	var subBtnClick = function(ele){
		closeAll();
		_subBtnHref = getHref(ele);
		
		if (_prevValues[_topBtnHref] == _subBtnHref){
			return;
		}
		// remove 
		for (var i = 0; i < _topBtnUl.children.length; i++){
			ukeGeeks.toolsLite.removeClass(_topBtnUl.children[i], 'checked');
		}
		// set checked item
		ukeGeeks.toolsLite.addClass(ele.parentNode, 'checked');
		
		ugsEditorPlus.actions.doClick(_topBtnHref, _subBtnHref);
		_prevValues[_topBtnHref] = _subBtnHref;
	};
	
	/**
	 * To support legacy IE need to cleanup the href's
	 * @method getHref
	 * @private
	 * @param ele (DOM_element) 
	 * @return {string}
	 */
	var getHref = function(ele){
		return '#' + ele.getAttribute('href').split('#')[1];
	};
	
	/**
	 * DESCRIPTION
	 * @method closeAll
	 * @private
	 * @return {void}
	 */
	var closeAll = function(){
		for (var i = 0; i < _menuItems.length; i++){
			ukeGeeks.toolsLite.removeClass(_menuItems[i], 'active');
		}
	};

	/**
	 * DESCR
	 * @method addSizeOptions
	 * @private
	 * @param element {DOM_element} handle to HTML Select tag that was clicked
	 */
	var addSizeOptions = function(){
		var s = '';
		var size = 0;
		for(var i = 50; i < 120; i += 5){
			size++;
			var selected =  (i == 100) ? 'class="checked"' : '';
			var pt = '';
			switch (i){
				case 50:
				case 60:
				case 75:
				case 85:
				case 90:
				case 100:
				case 115:
					pt = '<em>' + Math.round((i / 100) * 12) + 'pt</em>'; //'DW bug
					break;
			}
			//pt = ' &nbsp;&nbsp;&nbsp;' + Math.round(10 * (i / 100) * 12) + 'pt';
			s += '<li ' + selected + '><a href="#prct_' + i + '">' + i + '%' + pt + '</a></li>';
		}
		var element = document.getElementById('printScale');
		element.innerHTML = s;
		// element.size = size;
	};

/**
	 * Sets Transpose menu's selected value to "Original"; adds example chord names 
	 * @method resetTranspose
	 * @param chord {string} 
	 */
	this.resetTranspose = function(chord){
		var ul = document.getElementById('transposeOptions');
		var items = ul.getElementsByTagName('li');
		var sample;
		var steps = -6;
		
		_prevValues['#transpose'] = '#up_0';

		for (i = 0; i < items.length; i++){
			ukeGeeks.toolsLite.removeClass(items[i], 'checked');
			sample = (chord.length < 1) ? '' : ukeGeeks.transpose.shift(chord, steps);
			items[i].getElementsByTagName('em')[0].innerHTML = sample;
			if (steps == 0){
				ukeGeeks.toolsLite.addClass(items[i], 'checked');
			}
			steps++;
		}
	};
};

