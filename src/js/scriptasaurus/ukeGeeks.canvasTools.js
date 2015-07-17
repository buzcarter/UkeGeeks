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

	/**
 * Converts image JSON data to SVG XML.
 * Limits: no checks for unique Ids.
 * @class  svg
 * @namespace ukeGeeks
	 */
ukeGeeks.svg = (function() {
	function getStyle(type, style) {
		if (!style) {
			return null;
		}

		var s = '',
			property, value;

		for (var key in style) {
			if (!style.hasOwnProperty(key)) {
				continue;
			}

			value = style[key];
			switch (key) {
				case 'fillColor':
					property = 'fill';
					break;
				case 'fontFamily':
					property = 'font';
					break;
				case 'textAlign':
					property = 'text-anchor';
					switch (value) {
						case 'right':
							value = 'end';
							break;
						case 'left':
							value = 'start';
							break;
						default:
							value = 'middle';
					}
					break;
				case 'strokeColor':
					property = 'stroke';
					break;
				case 'strokeWidth':
					property = 'stroke-width';
					break;
				default:
					property = null;
			}

			if (property && value) {
				s += property + ':' + value + ';';
			}
		}

		if (type === 'text' && !style['textAlign']) {
			s += 'text-anchor:middle;';
		}

		return s;
	}

	function render(layer) {
		var s = '',
			style = getStyle(layer.type, layer.style);

		if (style) {
			style = ' style="' + style + '"';
		}

		switch (layer.type) {
			case 'line':
				s = '<line  x1="' + layer.endPoints[0].x + '" y1="' + layer.endPoints[0].y + '"  x2="' + layer.endPoints[1].x + '" y2="' + layer.endPoints[1].y + '" ' + style + ' />';
				break;
			case 'circle':
				s = '<circle cx="' + layer.center.x + '" cy="' + layer.center.y + '" r="' + layer.radius + '" ' + style + ' />';
				break;
			case 'rectangle':
				s = '<rect x="' + layer.pos.x + '" y="' + layer.pos.y + '" width="' + layer.width + '" height="' + layer.height + '" ' + style + ' />';
				break;
			case 'text':
				s = '<text x="' + layer.pos.x + '" y="' + layer.pos.y + '" ' + style + '>' + layer.text + '</text>';
				break;
		}
		return s;
	}

	function renderLayers(layers) {
		var s = '',
			layer, style;
		for (var i = 0; i < layers.length; i++) {
			layer = layers[i];
			if (layer.type === 'group') {
				style = getStyle('group', layer.style)
				s += '<g ' +
					(layer.name ? ('id="' + layer.name + '"') : '') +
					' style="' + style + '" ' +
					'>' + renderLayers(layer.layers, layer.style) + '</g>';
			}
			else {
				s += render(layer);
			}
		}
		return s;
	}

	function process(image) {
		return ('<?xml version="1.0" encoding="utf-8"?>' +
			'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" ' +
			'viewBox="0 0 ' + image.dimensions.width + ' ' + image.dimensions.height + '" ' +
			'width="' + image.dimensions.width + 'px" height="' + image.dimensions.height + 'px">' +
			renderLayers(image.layers) +
			'</svg>'
		);
	}

	function toString(image) {
		return process(image.getData());
	}

	function appendChild(element, image, className) {
		var wrapper = document.createElement('span');
		if (className) {
			wrapper.setAttribute('class', className);
		}
		wrapper.innerHTML = process(image.getData());
		element.appendChild(wrapper);
		return wrapper;
	}

	return {
		toString: toString,
		appendChild: appendChild
	}
})();

	/**
 * Converts image JSON data to a Canvas element
 * @class  canvas
 * @namespace ukeGeeks
	 */
ukeGeeks.canvas = (function() {
	function addCanvas(element, width, height) {
		var canvas = document.createElement('canvas');
		if (!canvas) {
			// console.log('error adding canvas');
			return null;
		}

		element.appendChild(canvas);
		canvas.width = width;
		canvas.height = height;

		var ctx = canvas.getContext('2d');
		if (!ctx) {
			// console.log('error getting canvas context');
			return null;
		}
		return ctx;
	}

	function renderText(ctx, layer, style) {
		if (!ctx.fillText) {
			return; // IE check
		}

		ctx.font = style.fontFamily || '9pt Arial';
		ctx.textAlign = style.textAlign || 'center';
		ctx.fillStyle = style.fillColor || style.color || 'black';
		ctx.fillText(layer.text, layer.pos.x, layer.pos.y);
	}

	function renderCircle(ctx, layer, style) {
		ctx.beginPath();

		ctx.arc(layer.center.x, layer.center.y, layer.radius, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fillStyle = style.fillColor || 'black';

		ctx.fill();
	}

	function renderLine(ctx, layer, style) {
		ctx.beginPath();
		ctx.moveTo(layer.endPoints[0].x, layer.endPoints[0].y);
		ctx.lineTo(layer.endPoints[1].x, layer.endPoints[1].y);

		ctx.strokeStyle = style.strokeColor || 'black';
		ctx.lineWidth = style.strokeWidth || 1;
		ctx.stroke();

		ctx.closePath();
	}

	function renderRectangle(ctx, layer, style) {
		ctx.beginPath();

		ctx.rect(layer.pos.x, layer.pos.y, layer.width, layer.height);

		ctx.strokeStyle = style.strokeColor || 'black';
		ctx.lineWidth = style.strokeWidth || 1;
		ctx.stroke();

		ctx.closePath();
	}

	function merge(o) {
		var newObject = {};
		for (var i = 0; i < arguments.length; i++) {
			if (!arguments[i] || typeof arguments[i] !== 'object') {
				continue;
			}

			var obj = arguments[i]
			for (var attrname in obj) {
				newObject[attrname] = obj[attrname];
			}
		}
		return newObject;
	}

	function render(ctx, layer, parentStyle) {
		var style = merge(layer.style, parentStyle);
		switch (layer.type) {
			case 'line':
				renderLine(ctx, layer, style);
				break;
			case 'circle':
				renderCircle(ctx, layer, style);
				break;
			case 'rectangle':
				renderRectangle(ctx, layer, style);
				break;
			case 'text':
				renderText(ctx, layer, style);
				break;
		}
		}
	
	function renderLayers(ctx, layers, parentStyle) {
		var layer, style;
		for (var i = 0; i < layers.length; i++) {
			layer = layers[i];
			if (layer.type === 'group') {
				renderLayers(ctx, layer.layers, layer.style);
			}
			else {
				render(ctx, layer, parentStyle || null);
			}
		}
		}

	function process(element, image) {
		var data = image.getData();
		var ctx = addCanvas(element, data.dimensions.width, data.dimensions.height);
		if (!ctx){
			return false;
		}

		renderLayers(ctx, data.layers);
		return ctx;
	}

	return {
		appendChild: process
	}
})();