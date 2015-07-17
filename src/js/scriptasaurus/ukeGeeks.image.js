/**
 * Stores, in an output-format agnostic manner, data for drawing images. Usage:
 * all methods are chainable except getData.
 * Limits: nested groups not supported; names are only available on groups, no unique checks.
 * @class image
 * @namespace ukeGeeks
 * @return {object}
 */
ukeGeeks.image = function() {
	this.__context = {
		root: {},
		layer: null,
		current: null
	};
};

ukeGeeks.image.prototype = {
	newImage: function(width, height) {
		var obj = {
			type: 'image',
			dimensions: {
				height: height,
				width: width
			},
			layers: []
		};

		this.__context.root = obj;
		this.__context.current = obj;

		return this;
	},
	__newLayer: function(obj) {
		if (!this.__context.current.layers) {
			return this;
		}

		obj.style = null;
		this.__context.current.layers.push(obj);
		if (obj.type && obj.type === 'group') {
			this.__context.current = obj;
		}
		else {
			this.__context.layer = obj;
		}
		return this;
	},
	newGroup: function(name) {
		this.__newLayer({
			type: 'group',
			name: name,
			layers: []
		});
		this.__context.layer = null;
		return this;
	},
	endGroup: function() {
		this.__context.current = this.__context.root;
		// this.__context.layer = this.__context.current;
		return this;
	},
	circle: function(centerX, centerY, radius) {
		return this.__newLayer({
			type: 'circle',
			center: {
				x: centerX,
				y: centerY
			},
			radius: radius
		});
	},
	rectangle: function(x, y, width, height) {
		return this.__newLayer({
			type: 'rectangle',
			pos: {
				x: x,
				y: y
			},
			width: width,
			height: height
		});
	},
	line: function(x0, y0, x1, y1) {
		return this.__newLayer({
			type: 'line',
			endPoints: [{
				x: x0,
				y: y0
			}, {
				x: x1,
				y: y1
			}]
		});
	},
	hLine: function(x, y, length) {
		return this.line(x, y, x + (length || 1), y);
	},
	vLine: function(x, y, length) {
		return this.line(x, y, x, y + (length || 1));
	},
	text: function(x, y, text) {
		return this.__newLayer({
			type: 'text',
			pos: {
				x: x,
				y: y
			},
			text: text
		});
	},
	style: function(options) {
		var target = this.__context.layer ? this.__context.layer : this.__context.current;
		if (!target || target.style) {
			return this;
		}

		target.style = options;
		return this;
	},
	getData: function() {
		return this.__context.root;
	}
};
