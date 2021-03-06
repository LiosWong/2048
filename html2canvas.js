"use strict";
var _html2canvas = {}, previousElement, computedCSS, html2canvas;
function h2clog(b) {
	if (_html2canvas.logging && window.console && window.console.log) {
		window.console.log(b)
	}
}
_html2canvas.Util = {};
_html2canvas.Util.backgroundImage = function(a) {
	if (/data:image\/.*;base64,/i.test(a)
			|| /^(-webkit|-moz|linear-gradient|-o-)/.test(a)) {
		return a
	}
	if (a.toLowerCase().substr(0, 5) === 'url("') {
		a = a.substr(5);
		a = a.substr(0, a.length - 2)
	} else {
		a = a.substr(4);
		a = a.substr(0, a.length - 1)
	}
	return a
};
_html2canvas.Util.Bounds = function(a) {
	var c, b = {};
	if (a.getBoundingClientRect) {
		c = a.getBoundingClientRect();
		b.top = c.top;
		b.bottom = c.bottom || (c.top + c.height);
		b.left = c.left;
		b.width = c.width || (c.right - c.left);
		b.height = c.height || (c.bottom - c.top);
		return b
	}
};
_html2canvas.Util.getCSS = function(c, d) {
	var e;
	function b(h, j) {
		var f = c.runtimeStyle && c.runtimeStyle[h], i, g = c.style;
		if (!/^-?[0-9]+\.?[0-9]*(?:px)?$/i.test(j) && /^-?\d/.test(j)) {
			i = g.left;
			if (f) {
				c.runtimeStyle.left = c.currentStyle.left
			}
			g.left = h === "fontSize" ? "1em" : (j || 0);
			j = g.pixelLeft + "px";
			g.left = i;
			if (f) {
				c.runtimeStyle.left = f
			}
		}
		return j
	}
	if (window.getComputedStyle) {
		if (previousElement !== c) {
			computedCSS = document.defaultView.getComputedStyle(c, null)
		}
		e = computedCSS[d];
		if (d === "backgroundPosition") {
			e = (e.split(",")[0] || "0 0").split(" ");
			e[0] = (e[0].indexOf("%") === -1) ? b(d + "X", e[0]) : e[0];
			e[1] = (e[1] === undefined) ? e[0] : e[1];
			e[1] = (e[1].indexOf("%") === -1) ? b(d + "Y", e[1]) : e[1]
		} else {
			if (/border(Top|Bottom)(Left|Right)Radius/.test(d)) {
				var a = e.split(" ");
				if (a.length <= 1) {
					a[1] = a[0]
				}
				a[0] = parseInt(a[0], 10);
				a[1] = parseInt(a[1], 10);
				e = a
			}
		}
	} else {
		if (c.currentStyle) {
			if (d === "backgroundPosition") {
				e = [ b(d + "X", c.currentStyle[d + "X"]),
						b(d + "Y", c.currentStyle[d + "Y"]) ]
			} else {
				e = b(d, c.currentStyle[d]);
				if (/^(border)/i.test(d) && /^(medium|thin|thick)$/i.test(e)) {
					switch (e) {
					case "thin":
						e = "1px";
						break;
					case "medium":
						e = "0px";
						break;
					case "thick":
						e = "5px";
						break
					}
				}
			}
		}
	}
	return e
};
_html2canvas.Util.BackgroundPosition = function(c, d, f) {
	var h = _html2canvas.Util.getCSS(c, "backgroundPosition"), b, e, a, g;
	if (h.length === 1) {
		g = h;
		h = [];
		h[0] = g;
		h[1] = g
	}
	if (h[0].toString().indexOf("%") !== -1) {
		a = (parseFloat(h[0]) / 100);
		e = ((d.width * a) - (f.width * a))
	} else {
		e = parseInt(h[0], 10)
	}
	if (h[1].toString().indexOf("%") !== -1) {
		a = (parseFloat(h[1]) / 100);
		b = ((d.height * a) - (f.height * a))
	} else {
		b = parseInt(h[1], 10)
	}
	return {
		top : b,
		left : e
	}
};
_html2canvas.Util.Extend = function(a, c) {
	for ( var b in a) {
		if (a.hasOwnProperty(b)) {
			c[b] = a[b]
		}
	}
	return c
};
_html2canvas.Util.Children = function(c) {
	var b;
	try {
		b = (c.nodeName && c.nodeName.toUpperCase() === "IFRAME") ? c.contentDocument
				|| c.contentWindow.document
				: (function(e) {
					var d = [];
					if (e !== null) {
						(function(m, h) {
							var k = m.length, g = 0;
							if (typeof h.length === "number") {
								for ( var f = h.length; g < f; g++) {
									m[k++] = h[g]
								}
							} else {
								while (h[g] !== undefined) {
									m[k++] = h[g++]
								}
							}
							m.length = k;
							return m
						})(d, e)
					}
					return d
				})(c.childNodes)
	} catch (a) {
		h2clog("html2canvas.Util.Children failed with exception: " + a.message);
		b = []
	}
	return b
};
(function() {
	_html2canvas.Generate = {};
	var a = [
			/^(-webkit-linear-gradient)\(([a-z\s]+)([\w\d\.\s,%\(\)]+)\)$/,
			/^(-o-linear-gradient)\(([a-z\s]+)([\w\d\.\s,%\(\)]+)\)$/,
			/^(-webkit-gradient)\((linear|radial),\s((?:\d{1,3}%?)\s(?:\d{1,3}%?),\s(?:\d{1,3}%?)\s(?:\d{1,3}%?))([\w\d\.\s,%\(\)-]+)\)$/,
			/^(-moz-linear-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?))([\w\d\.\s,%\(\)]+)\)$/,
			/^(-webkit-radial-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?)),\s(\w+)\s([a-z-]+)([\w\d\.\s,%\(\)]+)\)$/,
			/^(-moz-radial-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?)),\s(\w+)\s?([a-z-]*)([\w\d\.\s,%\(\)]+)\)$/,
			/^(-o-radial-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?)),\s(\w+)\s([a-z-]+)([\w\d\.\s,%\(\)]+)\)$/ ];
	_html2canvas.Generate.parseGradient = function(g, b) {
		var l, f, h = a.length, q, k, n, c, e, m;
		for (f = 0; f < h; f += 1) {
			q = g.match(a[f]);
			if (q) {
				break
			}
		}
		if (q) {
			switch (q[1]) {
			case "-webkit-linear-gradient":
			case "-o-linear-gradient":
				l = {
					type : "linear",
					x0 : null,
					y0 : null,
					x1 : null,
					y1 : null,
					colorStops : []
				};
				n = q[2].match(/\w+/g);
				if (n) {
					c = n.length;
					for (f = 0; f < c; f += 1) {
						switch (n[f]) {
						case "top":
							l.y0 = 0;
							l.y1 = b.height;
							break;
						case "right":
							l.x0 = b.width;
							l.x1 = 0;
							break;
						case "bottom":
							l.y0 = b.height;
							l.y1 = 0;
							break;
						case "left":
							l.x0 = 0;
							l.x1 = b.width;
							break
						}
					}
				}
				if (l.x0 === null && l.x1 === null) {
					l.x0 = l.x1 = b.width / 2
				}
				if (l.y0 === null && l.y1 === null) {
					l.y0 = l.y1 = b.height / 2
				}
				n = q[3]
						.match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}(?:%|px))?)+/g);
				if (n) {
					c = n.length;
					e = 1 / Math.max(c - 1, 1);
					for (f = 0; f < c; f += 1) {
						m = n[f]
								.match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/);
						if (m[2]) {
							k = parseFloat(m[2]);
							if (m[3] === "%") {
								k /= 100
							} else {
								k /= b.width
							}
						} else {
							k = f * e
						}
						l.colorStops.push({
							color : m[1],
							stop : k
						})
					}
				}
				break;
			case "-webkit-gradient":
				l = {
					type : q[2] === "radial" ? "circle" : q[2],
					x0 : 0,
					y0 : 0,
					x1 : 0,
					y1 : 0,
					colorStops : []
				};
				n = q[3]
						.match(/(\d{1,3})%?\s(\d{1,3})%?,\s(\d{1,3})%?\s(\d{1,3})%?/);
				if (n) {
					l.x0 = (n[1] * b.width) / 100;
					l.y0 = (n[2] * b.height) / 100;
					l.x1 = (n[3] * b.width) / 100;
					l.y1 = (n[4] * b.height) / 100
				}
				n = q[4]
						.match(/((?:from|to|color-stop)\((?:[0-9\.]+,\s)?(?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)\))+/g);
				if (n) {
					c = n.length;
					for (f = 0; f < c; f += 1) {
						m = n[f]
								.match(/(from|to|color-stop)\(([0-9\.]+)?(?:,\s)?((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\)/);
						k = parseFloat(m[2]);
						if (m[1] === "from") {
							k = 0
						}
						if (m[1] === "to") {
							k = 1
						}
						l.colorStops.push({
							color : m[3],
							stop : k
						})
					}
				}
				break;
			case "-moz-linear-gradient":
				l = {
					type : "linear",
					x0 : 0,
					y0 : 0,
					x1 : 0,
					y1 : 0,
					colorStops : []
				};
				n = q[2].match(/(\d{1,3})%?\s(\d{1,3})%?/);
				if (n) {
					l.x0 = (n[1] * b.width) / 100;
					l.y0 = (n[2] * b.height) / 100;
					l.x1 = b.width - l.x0;
					l.y1 = b.height - l.y0
				}
				n = q[3]
						.match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}%)?)+/g);
				if (n) {
					c = n.length;
					e = 1 / Math.max(c - 1, 1);
					for (f = 0; f < c; f += 1) {
						m = n[f]
								.match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%)?/);
						if (m[2]) {
							k = parseFloat(m[2]);
							if (m[3]) {
								k /= 100
							}
						} else {
							k = f * e
						}
						l.colorStops.push({
							color : m[1],
							stop : k
						})
					}
				}
				break;
			case "-webkit-radial-gradient":
			case "-moz-radial-gradient":
			case "-o-radial-gradient":
				l = {
					type : "circle",
					x0 : 0,
					y0 : 0,
					x1 : b.width,
					y1 : b.height,
					cx : 0,
					cy : 0,
					rx : 0,
					ry : 0,
					colorStops : []
				};
				n = q[2].match(/(\d{1,3})%?\s(\d{1,3})%?/);
				if (n) {
					l.cx = (n[1] * b.width) / 100;
					l.cy = (n[2] * b.height) / 100
				}
				n = q[3].match(/\w+/);
				m = q[4].match(/[a-z-]*/);
				if (n && m) {
					switch (m[0]) {
					case "farthest-corner":
					case "cover":
					case "":
						var p = Math
								.sqrt(Math.pow(l.cx, 2) + Math.pow(l.cy, 2));
						var j = Math.sqrt(Math.pow(l.cx, 2)
								+ Math.pow(l.y1 - l.cy, 2));
						var o = Math.sqrt(Math.pow(l.x1 - l.cx, 2)
								+ Math.pow(l.y1 - l.cy, 2));
						var d = Math.sqrt(Math.pow(l.x1 - l.cx, 2)
								+ Math.pow(l.cy, 2));
						l.rx = l.ry = Math.max(p, j, o, d);
						break;
					case "closest-corner":
						var p = Math
								.sqrt(Math.pow(l.cx, 2) + Math.pow(l.cy, 2));
						var j = Math.sqrt(Math.pow(l.cx, 2)
								+ Math.pow(l.y1 - l.cy, 2));
						var o = Math.sqrt(Math.pow(l.x1 - l.cx, 2)
								+ Math.pow(l.y1 - l.cy, 2));
						var d = Math.sqrt(Math.pow(l.x1 - l.cx, 2)
								+ Math.pow(l.cy, 2));
						l.rx = l.ry = Math.min(p, j, o, d);
						break;
					case "farthest-side":
						if (n[0] === "circle") {
							l.rx = l.ry = Math.max(l.cx, l.cy, l.x1 - l.cx,
									l.y1 - l.cy)
						} else {
							l.type = n[0];
							l.rx = Math.max(l.cx, l.x1 - l.cx);
							l.ry = Math.max(l.cy, l.y1 - l.cy)
						}
						break;
					case "closest-side":
					case "contain":
						if (n[0] === "circle") {
							l.rx = l.ry = Math.min(l.cx, l.cy, l.x1 - l.cx,
									l.y1 - l.cy)
						} else {
							l.type = n[0];
							l.rx = Math.min(l.cx, l.x1 - l.cx);
							l.ry = Math.min(l.cy, l.y1 - l.cy)
						}
						break
					}
				}
				n = q[5]
						.match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}(?:%|px))?)+/g);
				if (n) {
					c = n.length;
					e = 1 / Math.max(c - 1, 1);
					for (f = 0; f < c; f += 1) {
						m = n[f]
								.match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/);
						if (m[2]) {
							k = parseFloat(m[2]);
							if (m[3] === "%") {
								k /= 100
							} else {
								k /= b.width
							}
						} else {
							k = f * e
						}
						l.colorStops.push({
							color : m[1],
							stop : k
						})
					}
				}
				break
			}
		}
		return l
	};
	_html2canvas.Generate.Gradient = function(b, c) {
		var f = document.createElement("canvas"), r = f.getContext("2d"), p, q, j, k, h;
		f.width = c.width;
		f.height = c.height;
		p = _html2canvas.Generate.parseGradient(b, c);
		h = new Image();
		if (p) {
			if (p.type === "linear") {
				q = r.createLinearGradient(p.x0, p.y0, p.x1, p.y1);
				for (j = 0, k = p.colorStops.length; j < k; j += 1) {
					try {
						q.addColorStop(p.colorStops[j].stop,
								p.colorStops[j].color)
					} catch (l) {
						h2clog([ "failed to add color stop: ", l,
								"; tried to add: ", p.colorStops[j],
								"; stop: ", j, "; in: ", b ])
					}
				}
				r.fillStyle = q;
				r.fillRect(0, 0, c.width, c.height);
				h.src = f.toDataURL()
			} else {
				if (p.type === "circle") {
					q = r.createRadialGradient(p.cx, p.cy, 0, p.cx, p.cy, p.rx);
					for (j = 0, k = p.colorStops.length; j < k; j += 1) {
						try {
							q.addColorStop(p.colorStops[j].stop,
									p.colorStops[j].color)
						} catch (l) {
							h2clog([ "failed to add color stop: ", l,
									"; tried to add: ", p.colorStops[j],
									"; stop: ", j, "; in: ", b ])
						}
					}
					r.fillStyle = q;
					r.fillRect(0, 0, c.width, c.height);
					h.src = f.toDataURL()
				} else {
					if (p.type === "ellipse") {
						var g = document.createElement("canvas"), d = g
								.getContext("2d"), o = Math.max(p.rx, p.ry), n = o * 2, m;
						g.width = g.height = n;
						q = d
								.createRadialGradient(p.rx, p.ry, 0, p.rx,
										p.ry, o);
						for (j = 0, k = p.colorStops.length; j < k; j += 1) {
							try {
								q.addColorStop(p.colorStops[j].stop,
										p.colorStops[j].color)
							} catch (l) {
								h2clog([ "failed to add color stop: ", l,
										"; tried to add: ", p.colorStops[j],
										"; stop: ", j, "; in: ", b ])
							}
						}
						d.fillStyle = q;
						d.fillRect(0, 0, n, n);
						r.fillStyle = p.colorStops[j - 1].color;
						r.fillRect(0, 0, f.width, f.height);
						m = new Image();
						m.onload = function() {
							r.drawImage(m, p.cx - p.rx, p.cy - p.ry, 2 * p.rx,
									2 * p.ry);
							h.src = f.toDataURL()
						};
						m.src = g.toDataURL()
					}
				}
			}
		}
		return h
	};
	_html2canvas.Generate.ListAlpha = function(d) {
		var c = "", b;
		do {
			b = d % 26;
			c = String.fromCharCode((b) + 64) + c;
			d = d / 26
		} while ((d * 26) > 26);
		return c
	};
	_html2canvas.Generate.ListRoman = function(f) {
		var e = [ "M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V",
				"IV", "I" ], c = [ 1000, 900, 500, 400, 100, 90, 50, 40, 10, 9,
				5, 4, 1 ], g = "", d, b = e.length;
		if (f <= 0 || f >= 4000) {
			return f
		}
		for (d = 0; d < b; d += 1) {
			while (f >= c[d]) {
				f -= c[d];
				g += e[d]
			}
		}
		return g
	}
})();
_html2canvas.Parse = function(b, C) {
	window.scroll(0, 0);
	var L = {
		rangeBounds : false,
		svgRendering : C.svgRendering
				&& (function() {
					var r = new Image(), U = document.createElement("canvas"), i = (U.getContext === undefined) ? false
							: U.getContext("2d");
					if (i === false) {
						return false
					}
					U.width = U.height = 10;
					r.src = [
							"data:image/svg+xml,",
							"<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'>",
							"<foreignObject width='10' height='10'>",
							"<div xmlns='http://www.w3.org/1999/xhtml' style='width:10;height:10;'>",
							"sup", "</div>", "</foreignObject>", "</svg>" ]
							.join("");
					try {
						i.drawImage(r, 0, 0);
						U.toDataURL()
					} catch (V) {
						return false
					}
					h2clog("html2canvas: Parse: SVG powered rendering available");
					return true
				})()
	};
	var p = ((C.elements === undefined) ? document.body : C.elements);
	var P = false, c = 0, e = {}, j = p.ownerDocument, H = new RegExp("("
			+ C.ignoreElements + ")"), z = j.body, N, S, m, G, B, w, E, O, q, J;
	function y() {
		return {
			width : Math.max(Math.max(j.body.scrollWidth,
					j.documentElement.scrollWidth), Math.max(
					j.body.offsetWidth, j.documentElement.offsetWidth), Math
					.max(j.body.clientWidth, j.documentElement.clientWidth)),
			height : Math.max(Math.max(j.body.scrollHeight,
					j.documentElement.scrollHeight), Math.max(
					j.body.offsetHeight, j.documentElement.offsetHeight), Math
					.max(j.body.clientHeight, j.documentElement.clientHeight))
		}
	}
	b = b || {};
	if (j.createRange) {
		N = j.createRange();
		if (N.getBoundingClientRect) {
			S = j.createElement("boundtest");
			S.style.height = "123px";
			S.style.display = "block";
			z.appendChild(S);
			N.selectNode(S);
			m = N.getBoundingClientRect();
			G = m.height;
			if (G === 123) {
				L.rangeBounds = true
			}
			z.removeChild(S)
		}
	}
	var v = _html2canvas.Util.getCSS;
	function x(i, r) {
		var U = parseInt(v(i, r), 10);
		return (isNaN(U)) ? 0 : U
	}
	function R(V, i, X, U, W, r) {
		V.setVariable("fillStyle", r);
		V.fillRect(i, X, U, W);
		c += 1
	}
	function h(r, i) {
		switch (i) {
		case "lowercase":
			return r.toLowerCase();
		case "capitalize":
			return r.replace(/(^|\s|:|-|\(|\))([a-z])/g, function(U, W, V) {
				if (U.length > 0) {
					return W + V.toUpperCase()
				}
			});
		case "uppercase":
			return r.toUpperCase();
		default:
			return r
		}
	}
	function g(i) {
		return i.replace(/^\s*/g, "").replace(/\s*$/g, "")
	}
	function l(U, Y) {
		if (e[U + "-" + Y] !== undefined) {
			return e[U + "-" + Y]
		}
		var i = j.createElement("div"), r = j.createElement("img"), W = j
				.createElement("span"), X, V, Z;
		i.style.visibility = "hidden";
		i.style.fontFamily = U;
		i.style.fontSize = Y;
		i.style.margin = 0;
		i.style.padding = 0;
		z.appendChild(i);
		r.src = "data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=";
		r.width = 1;
		r.height = 1;
		r.style.margin = 0;
		r.style.padding = 0;
		r.style.verticalAlign = "baseline";
		W.style.fontFamily = U;
		W.style.fontSize = Y;
		W.style.margin = 0;
		W.style.padding = 0;
		W.appendChild(j.createTextNode("Hidden Text"));
		i.appendChild(W);
		i.appendChild(r);
		X = (r.offsetTop - W.offsetTop) + 1;
		i.removeChild(W);
		i.appendChild(j.createTextNode("Hidden Text"));
		i.style.lineHeight = "normal";
		r.style.verticalAlign = "super";
		V = (r.offsetTop - i.offsetTop) + 1;
		Z = {
			baseline : X,
			lineWidth : 1,
			middle : V
		};
		e[U + "-" + Y] = Z;
		z.removeChild(i);
		return Z
	}
	function a(U, i, V, r) {
		if (g(U).length > 0) {
			r.fillText(U, i, V);
			c += 1
		}
	}
	function Q(r, aj, Z) {
		var am = Z.ctx, aq = v(r, "fontFamily"), ah = v(r, "fontSize"), ao = v(
				r, "color"), au = v(r, "textDecoration"), X = v(r, "textAlign"), i = v(
				r, "letterSpacing"), aa, af, an, ad, ak, ai = v(r, "fontWeight"), ac = v(
				r, "fontStyle"), at = v(r, "fontVariant"), ap = false, Y, V, al = 0, W, ar, ag, ab, U, ae;
		aj.nodeValue = h(aj.nodeValue, v(r, "textTransform"));
		af = g(aj.nodeValue);
		if (af.length > 0) {
			if (au !== "none") {
				an = l(aq, ah)
			}
			X = X.replace([ "-webkit-auto" ], [ "auto" ]);
			if (C.letterRendering === false
					&& /^(left|right|justify|auto)$/.test(X)
					&& /^(normal|none)$/.test(i)) {
				ad = aj.nodeValue.split(/(\b| )/)
			} else {
				ad = aj.nodeValue.split("")
			}
			switch (parseInt(ai, 10)) {
			case 401:
				ai = "bold";
				break;
			case 400:
				ai = "normal";
				break
			}
			am.setVariable("fillStyle", ao);
			am.setVariable("font", ac + " " + at + " " + ai + " " + ah + " "
					+ aq);
			if (ap) {
				am.setVariable("textAlign", "right")
			} else {
				am.setVariable("textAlign", "left")
			}
			W = aj;
			for (ar = 0, ak = ad.length; ar < ak; ar += 1) {
				V = null;
				if (L.rangeBounds) {
					if (au !== "none" || g(ad[ar]).length !== 0) {
						V = ad[ar];
						if (j.createRange) {
							ag = j.createRange();
							ag.setStart(aj, al);
							ag.setEnd(aj, al + V.length)
						} else {
							ag = z.createTextRange()
						}
						if (ag.getBoundingClientRect()) {
							aa = ag.getBoundingClientRect()
						} else {
							aa = {}
						}
					}
				} else {
					if (typeof W.nodeValue !== "string") {
						continue
					}
					Y = W.splitText(ad[ar].length);
					ab = W.parentNode;
					U = j.createElement("wrapper");
					ae = W.cloneNode(true);
					U.appendChild(W.cloneNode(true));
					ab.replaceChild(U, W);
					aa = _html2canvas.Util.Bounds(U);
					V = W.nodeValue;
					W = Y;
					ab.replaceChild(ae, U)
				}
				if (V !== null) {
					a(V, aa.left, aa.bottom, am)
				}
				switch (au) {
				case "underline":
					R(am, aa.left, Math.round(aa.top + an.baseline
							+ an.lineWidth), aa.width, 1, ao);
					break;
				case "overline":
					R(am, aa.left, aa.top, aa.width, 1, ao);
					break;
				case "line-through":
					R(am, aa.left,
							Math.ceil(aa.top + an.middle + an.lineWidth),
							aa.width, 1, ao);
					break
				}
				al += ad[ar].length
			}
		}
	}
	function D(i, W) {
		var V = j.createElement("boundelement"), r, U;
		V.style.display = "inline";
		r = i.style.listStyleType;
		i.style.listStyleType = "none";
		V.appendChild(j.createTextNode(W));
		i.insertBefore(V, i.firstChild);
		U = _html2canvas.Util.Bounds(V);
		i.removeChild(V);
		i.style.listStyleType = r;
		return U
	}
	function t(U) {
		var r = -1, V = 1, W = U.parentNode.childNodes;
		if (U.parentNode) {
			while (W[++r] !== U) {
				if (W[r].nodeType === 1) {
					V++
				}
			}
			return V
		} else {
			return -1
		}
	}
	function I(r, aa, V) {
		var U = v(r, "listStylePosition"), ab, Z, Y = v(r, "listStyleType"), W, ac, i, X = v(
				r, "fontWeight");
		if (/^(decimal|decimal-leading-zero|upper-alpha|upper-latin|upper-roman|lower-alpha|lower-greek|lower-latin|lower-roman)$/i
				.test(Y)) {
			W = t(r);
			switch (Y) {
			case "decimal":
				ac = W;
				break;
			case "decimal-leading-zero":
				if (W.toString().length === 1) {
					ac = W = "0" + W.toString()
				} else {
					ac = W.toString()
				}
				break;
			case "upper-roman":
				ac = _html2canvas.Generate.ListRoman(W);
				break;
			case "lower-roman":
				ac = _html2canvas.Generate.ListRoman(W).toLowerCase();
				break;
			case "lower-alpha":
				ac = _html2canvas.Generate.ListAlpha(W).toLowerCase();
				break;
			case "upper-alpha":
				ac = _html2canvas.Generate.ListAlpha(W);
				break
			}
			ac += ". ";
			i = D(r, ac);
			switch (X) {
			case 401:
				X = "bold";
				break;
			case 400:
				X = "normal";
				break
			}
			w.setVariable("fillStyle", v(r, "color"));
			w.setVariable("font", v(r, "fontVariant") + " " + X + " "
					+ v(r, "fontStyle") + " " + v(r, "fontSize") + " "
					+ v(r, "fontFamily"));
			if (U === "inside") {
				w.setVariable("textAlign", "left");
				ab = V.left
			} else {
				return
			}
			Z = i.bottom;
			a(ac, ab, Z, w)
		}
	}
	function u(r) {
		var i = b[r];
		if (i && i.succeeded === true) {
			return i.img
		} else {
			return false
		}
	}
	function k(V, X) {
		var i = Math.max(V.left, X.left), W = Math.max(V.top, X.top), r = Math
				.min((V.left + V.width), (X.left + X.width)), U = Math.min(
				(V.top + V.height), (X.top + X.height));
		return {
			left : i,
			top : W,
			width : r - i,
			height : U - W
		}
	}
	function K(U, i) {
		var r;
		if (!i) {
			r = h2czContext(0);
			return r
		}
		if (U !== "auto") {
			P = true;
			r = h2czContext(U);
			i.children.push(r);
			return r
		}
		return i
	}
	function o(V, af, aa, al) {
		var ad = aa.left, ac = aa.top, ae = aa.width, ai = aa.height, an, am, aj, ah, ak, X, ag, r, Z, Y = (function(
				ao) {
			var aq = [], ap = [ "Top", "Right", "Bottom", "Left" ], i;
			for (i = 0; i < 4; i += 1) {
				aq.push({
					width : x(ao, "border" + ap[i] + "Width"),
					color : v(ao, "border" + ap[i] + "Color")
				})
			}
			return aq
		}(V)), W = (function(ao) {
			var aq = [], ap = [ "TopLeft", "TopRight", "BottomRight",
					"BottomLeft" ], i;
			for (i = 0; i < 4; i += 1) {
				aq.push(v(ao, "border" + ap[i] + "Radius"))
			}
			return aq
		})(V);
		for (an = 0; an < 4; an += 1) {
			am = Y[an];
			r = [];
			if (am.width > 0) {
				aj = ad;
				ah = ac;
				ak = ae;
				X = ai - (Y[2].width);
				switch (an) {
				case 0:
					X = Y[0].width;
					ag = 0;
					r[ag++] = [ "line", aj, ah ];
					r[ag++] = [ "line", aj + ak, ah ];
					r[ag++] = [ "line", aj + ak - Y[1].width, ah + X ];
					r[ag++] = [ "line", aj + Y[3].width, ah + X ];
					break;
				case 1:
					aj = ad + ae - (Y[1].width);
					ak = Y[1].width;
					ag = 0;
					r[ag++] = [ "line", aj, ah + Y[0].width ];
					r[ag++] = [ "line", aj + ak, ah ];
					r[ag++] = [ "line", aj + ak, ah + X + Y[2].width ];
					r[ag++] = [ "line", aj, ah + X ];
					break;
				case 2:
					ah = (ah + ai) - (Y[2].width);
					X = Y[2].width;
					ag = 0;
					r[ag++] = [ "line", aj + Y[3].width, ah ];
					r[ag++] = [ "line", aj + ak - Y[2].width, ah ];
					r[ag++] = [ "line", aj + ak, ah + X ];
					r[ag++] = [ "line", aj, ah + X ];
					break;
				case 3:
					ak = Y[3].width;
					ag = 0;
					r[ag++] = [ "line", aj, ah ];
					r[ag++] = [ "line", aj + ak, ah + Y[0].width ];
					r[ag++] = [ "line", aj + ak, ah + X ];
					r[ag++] = [ "line", aj, ah + X + Y[2].width ];
					break
				}
				Z = {
					left : aj,
					top : ah,
					width : ak,
					height : X
				};
				if (al) {
					Z = k(Z, al)
				}
				if (Z.width > 0 && Z.height > 0) {
					if (am.color !== "transparent") {
						af.setVariable("fillStyle", am.color);
						var U = af.drawShape(), ab = r.length;
						for (ag = 0; ag < ab; ag++) {
							U[(ag === 0) ? "moveTo" : r[ag][0] + "To"].apply(
									null, r[ag].slice(1))
						}
						c += 1
					}
				}
			}
		}
		return Y
	}
	function M(V, r, ab) {
		var ac = j.createElement("valuewrap"), ad = [ "lineHeight",
				"textAlign", "fontFamily", "color", "fontSize", "paddingLeft",
				"paddingTop", "width", "height", "border", "borderLeftWidth",
				"borderTopWidth" ], Y, X, W, aa, U;
		for (Y = 0, aa = ad.length; Y < aa; Y += 1) {
			U = ad[Y];
			try {
				ac.style[U] = v(V, U)
			} catch (Z) {
				h2clog("html2canvas: Parse: Exception caught in renderFormValue: "
						+ Z.message)
			}
		}
		ac.style.borderColor = "black";
		ac.style.borderStyle = "solid";
		ac.style.display = "block";
		ac.style.position = "absolute";
		if (/^(submit|reset|button|text|password)$/.test(V.type)
				|| V.nodeName === "SELECT") {
			ac.style.lineHeight = v(V, "height")
		}
		ac.style.top = r.top + "px";
		ac.style.left = r.left + "px";
		if (V.nodeName === "SELECT") {
			X = V.options[V.selectedIndex].text
		} else {
			X = V.value
		}
		W = j.createTextNode(X);
		ac.appendChild(W);
		z.appendChild(ac);
		Q(V, W, ab);
		z.removeChild(ac)
	}
	function s(Z, r, X, W, Y, U, ab, aa, i, V) {
		Z.drawImage(r, X, W, Y, U, ab, aa, i, V);
		c += 1
	}
	function F(ab, X, Z, Y, r, aa, V, i) {
		var W = 0, U = 0;
		if (V - Z > 0) {
			W = V - Z
		}
		if (i - Y > 0) {
			U = i - Y
		}
		s(ab, X, W, U, r - W, aa - U, Z + W, Y + U, r - W, aa - U)
	}
	function d(ab, U, W, Y, X, Z, V) {
		var aa, i = Math.min(U.width, Z), r;
		W.top = W.top - Math.ceil(W.top / U.height) * U.height;
		for (r = (X + W.top); r < V + X;) {
			if (Math.floor(r + U.height) > V + X) {
				aa = (V + X) - r
			} else {
				aa = U.height
			}
			F(ab, U, Y + W.left, r, i, aa, Y, X);
			r = Math.floor(r + U.height)
		}
	}
	function f(ab, U, W, Y, X, Z, V) {
		var aa = Math.min(U.height, V), i, r;
		W.left = W.left - Math.ceil(W.left / U.width) * U.width;
		for (r = (Y + W.left); r < Z + Y;) {
			if (Math.floor(r + U.width) > Z + Y) {
				i = (Z + Y) - r
			} else {
				i = U.width
			}
			F(ab, U, r, (X + W.top), i, aa, Y, X);
			r = Math.floor(r + U.width)
		}
	}
	function T(r, i, ai) {
		var Y = v(r, "backgroundImage"), ae = v(r, "backgroundRepeat").split(
				",")[0], W, ab, U, V, aa, Z, ad, ac, ah, X, af, ag;
		if (!/data:image\/.*;base64,/i.test(Y)
				&& !/^(-webkit|-moz|linear-gradient|-o-)/.test(Y)) {
			Y = Y.split(",")[0]
		}
		if (typeof Y !== "undefined" && /^(1|none)$/.test(Y) === false) {
			Y = _html2canvas.Util.backgroundImage(Y);
			W = u(Y);
			ab = _html2canvas.Util.BackgroundPosition(r, i, W);
			if (W) {
				switch (ae) {
				case "repeat-x":
					f(ai, W, ab, i.left, i.top, i.width, i.height);
					break;
				case "repeat-y":
					d(ai, W, ab, i.left, i.top, i.width, i.height);
					break;
				case "no-repeat":
					V = i.width - ab.left;
					ah = i.height - ab.top;
					aa = ab.left;
					Z = ab.top;
					ad = ab.left + i.left;
					ac = ab.top + i.top;
					if (aa < 0) {
						aa = Math.abs(aa);
						ad += aa;
						V = Math.min(i.width, W.width - aa)
					} else {
						V = Math.min(V, W.width);
						aa = 0
					}
					if (Z < 0) {
						Z = Math.abs(Z);
						ac += Z;
						ah = Math.min(i.height, W.height - Z)
					} else {
						ah = Math.min(ah, W.height);
						Z = 0
					}
					if (ah > 0 && V > 0) {
						s(ai, W, aa, Z, V, ah, ad, ac, V, ah)
					}
					break;
				default:
					ab.top = ab.top - Math.ceil(ab.top / W.height) * W.height;
					for (U = (i.top + ab.top); U < i.height + i.top;) {
						X = Math.min(W.height, (i.height + i.top) - U);
						if (Math.floor(U + W.height) > X + U) {
							af = (X + U) - U
						} else {
							af = W.height
						}
						if (U < i.top) {
							ag = i.top - U;
							U = i.top
						} else {
							ag = 0
						}
						f(ai, W, ab, i.left, U, i.width, af);
						if (ag > 0) {
							ab.top += ag
						}
						U = Math.floor(U + W.height) - ag
					}
					break
				}
			} else {
				h2clog("html2canvas: Error loading background:" + Y)
			}
		}
	}
	function n(V, W) {
		var ab = _html2canvas.Util.Bounds(V), af = ab.left, ae = ab.top, ah = ab.width, al = ab.height, ai, r = v(
				V, "backgroundColor"), ag = v(V, "position"), ad, X = v(V,
				"opacity"), aa, Z, Y, ak, aj, U, an, am, i, ac;
		if (!W) {
			E = y();
			W = {
				opacity : 1
			}
		} else {
			E = {}
		}
		ad = K(v(V, "zIndex"), W.zIndex);
		aa = {
			ctx : h2cRenderContext(E.width || ah, E.height || al),
			zIndex : ad,
			opacity : X * W.opacity,
			cssPosition : ag
		};
		if (W.clip) {
			aa.clip = _html2canvas.Util.Extend({}, W.clip)
		}
		if (C.useOverflow === true
				&& /(hidden|scroll|auto)/.test(v(V, "overflow")) === true
				&& /(BODY)/i.test(V.nodeName) === false) {
			if (aa.clip) {
				aa.clip = k(aa.clip, ab)
			} else {
				aa.clip = ab
			}
		}
		Z = ad.children.push(aa);
		ak = ad.children[Z - 1].ctx;
		ak.setVariable("globalAlpha", aa.opacity);
		Y = o(V, ak, ab, false);
		aa.borders = Y;
		if (H.test(V.nodeName) && C.iframeDefault !== "transparent") {
			if (C.iframeDefault === "default") {
				r = "#efefef"
			} else {
				r = C.iframeDefault
			}
		}
		aj = {
			left : af + Y[3].width,
			top : ae + Y[0].width,
			width : ah - (Y[1].width + Y[3].width),
			height : al - (Y[0].width + Y[2].width)
		};
		if (aa.clip) {
			aj = k(aj, aa.clip)
		}
		if (aj.height > 0 && aj.width > 0) {
			R(ak, aj.left, aj.top, aj.width, aj.height, r);
			T(V, aj, ak)
		}
		switch (V.nodeName) {
		case "IMG":
			U = V.getAttribute("src");
			ai = u(U);
			if (ai) {
				an = x(V, "paddingLeft");
				am = x(V, "paddingTop");
				i = x(V, "paddingRight");
				ac = x(V, "paddingBottom");
				s(ak, ai, 0, 0, ai.width, ai.height, af + an + Y[3].width, ae
						+ am + Y[0].width, ab.width
						- (Y[1].width + Y[3].width + an + i), ab.height
						- (Y[0].width + Y[2].width + am + ac))
			} else {
				h2clog("html2canvas: Error loading <img>:" + U)
			}
			break;
		case "INPUT":
			if (/^(text|url|email|submit|button|reset)$/.test(V.type)
					&& V.value.length > 0) {
				M(V, ab, aa)
			}
			break;
		case "TEXTAREA":
			if (V.value.length > 0) {
				M(V, ab, aa)
			}
			break;
		case "SELECT":
			if (V.options.length > 0) {
				M(V, ab, aa)
			}
			break;
		case "LI":
			I(V, aa, aj);
			break;
		case "CANVAS":
			an = x(V, "paddingLeft");
			am = x(V, "paddingTop");
			i = x(V, "paddingRight");
			ac = x(V, "paddingBottom");
			s(ak, V, 0, 0, V.width, V.height, af + an + Y[3].width, ae + am
					+ Y[0].width,
					ab.width - (Y[1].width + Y[3].width + an + i), ab.height
							- (Y[0].width + Y[2].width + am + ac));
			break
		}
		return ad.children[Z - 1]
	}
	function A(V, r) {
		if (v(V, "display") !== "none" && v(V, "visibility") !== "hidden") {
			r = n(V, r) || r;
			w = r.ctx;
			if (!H.test(V.nodeName)) {
				var Y = _html2canvas.Util.Children(V), U, W, X;
				for (U = 0, X = Y.length; U < X; U += 1) {
					W = Y[U];
					if (W.nodeType === 1) {
						A(W, r)
					} else {
						if (W.nodeType === 3) {
							Q(V, W, r)
						}
					}
				}
			}
		}
	}
	B = n(p, null);
	if (L.svgRendering) {
		(function(i) {
			var r = new Image(), V = y(), U = "";
			function W(ac) {
				var ab = _html2canvas.Util.Children(ac), Y = ab.length, X, Z, ad, ae, aa;
				for (aa = 0; aa < Y; aa += 1) {
					ae = ab[aa];
					if (ae.nodeType === 3) {
						U += ae.nodeValue.replace(/\</g, "&lt;").replace(/\>/g,
								"&gt;")
					} else {
						if (ae.nodeType === 1) {
							if (!/^(script|meta|title)$/.test(ae.nodeName
									.toLowerCase())) {
								U += "<" + ae.nodeName.toLowerCase();
								if (ae.hasAttributes()) {
									X = ae.attributes;
									ad = X.length;
									for (Z = 0; Z < ad; Z += 1) {
										U += " " + X[Z].name + '="'
												+ X[Z].value + '"'
									}
								}
								U += ">";
								W(ae);
								U += "</" + ae.nodeName.toLowerCase() + ">"
							}
						}
					}
				}
			}
			W(i);
			r.src = [
					"data:image/svg+xml,",
					"<svg xmlns='http://www.w3.org/2000/svg' version='1.1' width='"
							+ V.width + "' height='" + V.height + "'>",
					"<foreignObject width='" + V.width + "' height='"
							+ V.height + "'>",
					"<html xmlns='http://www.w3.org/1999/xhtml' style='margin:0;'>",
					U.replace(/\#/g, "%23"), "</html>", "</foreignObject>",
					"</svg>" ].join("");
			r.onload = function() {
				B.svgRender = r
			}
		})(document.documentElement)
	}
	for (O = 0, q = p.children, J = q.length; O < J; O += 1) {
		A(q[O], B)
	}
	B.backgroundColor = v(document.documentElement, "backgroundColor");
	return B
};
function h2czContext(a) {
	return {
		zindex : a,
		children : []
	}
}
_html2canvas.Preload = function(b) {
	var j = {
		numLoaded : 0,
		numFailed : 0,
		numTotal : 0,
		cleanupDone : false
	}, p, q, o, d = 0, a = b.elements[0] || document.body, s = a.ownerDocument, h = s.images, k = h.length, e = s
			.createElement("a"), g = (function(i) {
		return (i.crossOrigin !== undefined)
	})(new Image()), m;
	e.href = window.location.href;
	p = e.protocol + e.host;
	function r(t) {
		e.href = t;
		e.href = e.href;
		var i = e.protocol + e.host;
		return (i === p)
	}
	function c() {
		h2clog("html2canvas: start: images: " + j.numLoaded + " / "
				+ j.numTotal + " (failed: " + j.numFailed + ")");
		if (!j.firstRun && j.numLoaded >= j.numTotal) {
			h2clog("Finished loading images: # " + j.numTotal + " (failed: "
					+ j.numFailed + ")");
			if (typeof b.complete === "function") {
				b.complete(j)
			}
		}
	}
	function l(v, u, w) {
		var i, x = b.proxy, t;
		e.href = v;
		v = e.href;
		i = "html2canvas_" + (d++);
		w.callbackname = i;
		if (x.indexOf("?") > -1) {
			x += "&"
		} else {
			x += "?"
		}
		x += "url=" + encodeURIComponent(v) + "&callback=" + i;
		t = s.createElement("script");
		window[i] = function(y) {
			if (y.substring(0, 6) === "error:") {
				w.succeeded = false;
				j.numLoaded++;
				j.numFailed++;
				c()
			} else {
				n(u, w);
				u.src = y
			}
			window[i] = undefined;
			try {
				delete window[i]
			} catch (z) {
			}
			t.parentNode.removeChild(t);
			t = null;
			delete w.script;
			delete w.callbackname
		};
		t.setAttribute("type", "text/javascript");
		t.setAttribute("src", x);
		w.script = t;
		window.document.body.appendChild(t)
	}
	function f(u) {
		var v = _html2canvas.Util.Children(u), x, A, t, y, w = false;
		try {
			var z = v.length;
			for (x = 0; x < z; x += 1) {
				f(v[x])
			}
		} catch (B) {
		}
		try {
			w = u.nodeType
		} catch (C) {
			w = false;
			h2clog("html2canvas: failed to access some element's nodeType - Exception: "
					+ C.message)
		}
		if (w === 1 || w === undefined) {
			try {
				A = _html2canvas.Util.getCSS(u, "backgroundImage")
			} catch (B) {
				h2clog("html2canvas: failed to get background-image - Exception: "
						+ B.message)
			}
			if (A && A !== "1" && A !== "none") {
				if (/^(-webkit|-o|-moz|-ms|linear)-/.test(A)) {
					y = _html2canvas.Generate.Gradient(A, _html2canvas.Util
							.Bounds(u));
					if (y !== undefined) {
						j[A] = {
							img : y,
							succeeded : true
						};
						j.numTotal++;
						j.numLoaded++;
						c()
					}
				} else {
					t = _html2canvas.Util.backgroundImage(A
							.match(/data:image\/.*;base64,/i) ? A : A
							.split(",")[0]);
					q.loadImage(t)
				}
			}
		}
	}
	function n(i, t) {
		i.onload = function() {
			if (t.timer !== undefined) {
				window.clearTimeout(t.timer)
			}
			j.numLoaded++;
			t.succeeded = true;
			i.onerror = i.onload = null;
			c()
		};
		i.onerror = function() {
			if (i.crossOrigin === "anonymous") {
				window.clearTimeout(t.timer);
				if (b.proxy) {
					var u = i.src;
					i = new Image();
					t.img = i;
					i.src = u;
					l(i.src, i, t);
					return
				}
			}
			j.numLoaded++;
			j.numFailed++;
			t.succeeded = false;
			i.onerror = i.onload = null;
			c()
		}
	}
	q = {
		loadImage : function(u) {
			var i, t;
			if (u && j[u] === undefined) {
				i = new Image();
				if (u.match(/data:image\/.*;base64,/i)) {
					i.src = u.replace(/url\(['"]{0,}|['"]{0,}\)$/ig, "");
					t = j[u] = {
						img : i
					};
					j.numTotal++;
					n(i, t)
				} else {
					if (r(u) || b.allowTaint === true) {
						t = j[u] = {
							img : i
						};
						j.numTotal++;
						n(i, t);
						i.src = u
					} else {
						if (g && !b.allowTaint && b.useCORS) {
							i.crossOrigin = "anonymous";
							t = j[u] = {
								img : i
							};
							j.numTotal++;
							n(i, t);
							i.src = u;
							i.customComplete = function() {
								if (!this.img.complete) {
									this.timer = window.setTimeout(
											this.img.customComplete, 100)
								} else {
									this.img.onerror()
								}
							}.bind(t);
							i.customComplete()
						} else {
							if (b.proxy) {
								t = j[u] = {
									img : i
								};
								j.numTotal++;
								l(u, i, t)
							}
						}
					}
				}
			}
		},
		cleanupDOM : function(u) {
			var i, v;
			if (!j.cleanupDone) {
				if (u && typeof u === "string") {
					h2clog("html2canvas: Cleanup because: " + u)
				} else {
					h2clog("html2canvas: Cleanup after timeout: " + b.timeout
							+ " ms.")
				}
				for (v in j) {
					if (j.hasOwnProperty(v)) {
						i = j[v];
						if (typeof i === "object" && i.callbackname
								&& i.succeeded === undefined) {
							window[i.callbackname] = undefined;
							try {
								delete window[i.callbackname]
							} catch (t) {
							}
							if (i.script && i.script.parentNode) {
								i.script.setAttribute("src", "about:blank");
								i.script.parentNode.removeChild(i.script)
							}
							j.numLoaded++;
							j.numFailed++;
							h2clog("html2canvas: Cleaned up failed img: '" + v
									+ "' Steps: " + j.numLoaded + " / "
									+ j.numTotal)
						}
					}
				}
				if (window.stop !== undefined) {
					window.stop()
				} else {
					if (document.execCommand !== undefined) {
						document.execCommand("Stop", false)
					}
				}
				if (document.close !== undefined) {
					document.close()
				}
				j.cleanupDone = true;
				if (!(u && typeof u === "string")) {
					c()
				}
			}
		},
		renderingDone : function() {
			if (m) {
				window.clearTimeout(m)
			}
		}
	};
	if (b.timeout > 0) {
		m = window.setTimeout(q.cleanupDOM, b.timeout)
	}
	h2clog("html2canvas: Preload starts: finding background-images");
	j.firstRun = true;
	f(a);
	h2clog("html2canvas: Preload: Finding images");
	for (o = 0; o < k; o += 1) {
		q.loadImage(h[o].getAttribute("src"))
	}
	j.firstRun = false;
	h2clog("html2canvas: Preload: Done.");
	if (j.numTotal === j.numLoaded) {
		c()
	}
	return q
};
function h2cRenderContext(b, a) {
	var c = [];
	return {
		storage : c,
		width : b,
		height : a,
		fillRect : function() {
			c.push({
				type : "function",
				name : "fillRect",
				"arguments" : arguments
			})
		},
		drawShape : function() {
			var d = [];
			c.push({
				type : "function",
				name : "drawShape",
				"arguments" : d
			});
			return {
				moveTo : function() {
					d.push({
						name : "moveTo",
						"arguments" : arguments
					})
				},
				lineTo : function() {
					d.push({
						name : "lineTo",
						"arguments" : arguments
					})
				},
				bezierCurveTo : function() {
					d.push({
						name : "bezierCurveTo",
						"arguments" : arguments
					})
				},
				quadraticCurveTo : function() {
					d.push({
						name : "quadraticCurveTo",
						"arguments" : arguments
					})
				}
			}
		},
		drawImage : function() {
			c.push({
				type : "function",
				name : "drawImage",
				"arguments" : arguments
			})
		},
		fillText : function() {
			c.push({
				type : "function",
				name : "fillText",
				"arguments" : arguments
			})
		},
		setVariable : function(d, e) {
			c.push({
				type : "variable",
				name : d,
				"arguments" : e
			})
		}
	}
}
_html2canvas.Renderer = function(c, b) {
	var a = [];
	function d(m) {
		var f = [], n = [], o = m.children, p, j, e, q, l, h, k, g;
		for (p = 0, l = o.length; p < l; p += 1) {
			h = o[p];
			if (h.children && h.children.length > 0) {
				f.push(h);
				n.push(h.zindex)
			} else {
				a.push(h)
			}
		}
		n.sort(function(r, i) {
			return r - i
		});
		for (j = 0, e = n.length; j < e; j += 1) {
			q = n[j];
			for (k = 0, g = f.length; k <= g; k += 1) {
				if (f[k].zindex === q) {
					h = f.splice(k, 1);
					d(h[0]);
					break
				}
			}
		}
	}
	d(c.zIndex);
	if (typeof b._renderer._create !== "function") {
		throw new Error("Invalid renderer defined")
	}
	return b._renderer._create(c, b, document, a, _html2canvas)
};
html2canvas = function(f, d) {
	var a, c, b = {
		logging : false,
		elements : f,
		proxy : Session.appDomain + "/submit/imagedatauriproxy",
		timeout : 0,
		useCORS : false,
		allowTaint : false,
		svgRendering : false,
		iframeDefault : "default",
		ignoreElements : "IFRAME|OBJECT|PARAM",
		useOverflow : true,
		letterRendering : false,
		flashcanvas : undefined,
		width : null,
		height : null,
		taintTest : true,
		renderer : "Canvas"
	}, e;
	b = _html2canvas.Util.Extend(d, b);
	if (typeof b.renderer === "string"
			&& _html2canvas.Renderer[b.renderer] !== undefined) {
		b._renderer = _html2canvas.Renderer[b.renderer](b)
	} else {
		if (typeof b.renderer === "function") {
			b._renderer = b.renderer(b)
		} else {
			throw ("Unknown renderer")
		}
	}
	_html2canvas.logging = b.logging;
	b.complete = function(g) {
		if (typeof b.onpreloaded === "function") {
			if (b.onpreloaded(g) === false) {
				return
			}
		}
		a = _html2canvas.Parse(g, b);
		if (typeof b.onparsed === "function") {
			if (b.onparsed(a) === false) {
				return
			}
		}
		c = _html2canvas.Renderer(a, b);
		if (typeof b.onrendered === "function") {
			b.onrendered(c)
		}
	};
	window.setTimeout(function() {
		_html2canvas.Preload(b)
	}, 0);
	return {
		render : function(g, h) {
			return _html2canvas.Renderer(g, _html2canvas.Util.Extend(h, b))
		},
		parse : function(g, h) {
			return _html2canvas.Parse(g, _html2canvas.Util.Extend(h, b))
		},
		preload : function(g) {
			return _html2canvas.Preload(_html2canvas.Util.Extend(g, b))
		},
		log : h2clog
	}
};
html2canvas.log = h2clog;
html2canvas.Renderer = {
	Canvas : undefined
};
_html2canvas.Renderer.Canvas = function(i) {
	i = i || {};
	var b = document.getElementById("baidufe_canvas_xl");
	if (b) {
		b.parentNode.removeChild(b)
	}
	b = document.createElement("canvas");
	b.setAttribute("id", "baidufe_canvas_xl");
	b.style.cssText = "position:absolute;left:-10000px;top:-10000px;";
	document.body.appendChild(b);
	var g = document, e = false, a = false, f = false, c, d = 2880;
	c = {
		_create : function(t, m, C, x, v) {
			if (!f) {
				a = arguments;
				return b
			}
			var w = b.getContext("2d"), l, y, k, B, o, p, u = document
					.createElement("canvas"), r = (u.getContext !== undefined), q, s, z = (r) ? u
					.getContext("2d")
					: {}, j = [], n;
			b.width = b.style.width = (!e) ? m.width || t.ctx.width : Math.min(
					d, (m.width || t.ctx.width));
			b.height = b.style.height = (!e) ? m.height || t.ctx.height : Math
					.min(d, (m.height || t.ctx.height));
			n = w.fillStyle;
			w.fillStyle = t.backgroundColor;
			w.fillRect(0, 0, b.width, b.height);
			w.fillStyle = n;
			if (m.svgRendering && t.svgRender !== undefined) {
				w.drawImage(t.svgRender, 0, 0)
			} else {
				for (y = 0, k = x.length; y < k; y += 1) {
					l = x.splice(0, 1)[0];
					l.canvasPosition = l.canvasPosition || {};
					w.textBaseline = "bottom";
					if (l.clip) {
						w.save();
						w.beginPath();
						w.rect(l.clip.left, l.clip.top, l.clip.width,
								l.clip.height);
						w.clip()
					}
					if (l.ctx.storage) {
						for (B = 0, q = l.ctx.storage.length; B < q; B += 1) {
							s = l.ctx.storage[B];
							switch (s.type) {
							case "variable":
								w[s.name] = s["arguments"];
								break;
							case "function":
								if (s.name === "fillRect") {
									if (!e
											|| s["arguments"][0]
													+ s["arguments"][2] < d
											&& s["arguments"][1]
													+ s["arguments"][3] < d) {
										w.fillRect.apply(w, s["arguments"])
									}
								} else {
									if (s.name === "drawShape") {
										(function(E) {
											var F, D = E.length;
											w.beginPath();
											for (F = 0; F < D; F++) {
												w[E[F].name].apply(w,
														E[F]["arguments"])
											}
											w.closePath();
											w.fill()
										})(s["arguments"])
									} else {
										if (s.name === "fillText") {
											if (!e || s["arguments"][1] < d
													&& s["arguments"][2] < d) {
												w.fillText.apply(w,
														s["arguments"])
											}
										} else {
											if (s.name === "drawImage") {
												if (s["arguments"][8] > 0
														&& s["arguments"][7]) {
													if (r && m.taintTest) {
														if (j
																.indexOf(s["arguments"][0].src) === -1) {
															z
																	.drawImage(
																			s["arguments"][0],
																			0,
																			0);
															try {
																z.getImageData(
																		0, 0,
																		1, 1)
															} catch (A) {
																u = C
																		.createElement("canvas");
																z = u
																		.getContext("2d");
																continue
															}
															j
																	.push(s["arguments"][0].src)
														}
													}
													w.drawImage.apply(w,
															s["arguments"])
												}
											}
										}
									}
								}
								break;
							default:
							}
						}
					}
					if (l.clip) {
						w.restore()
					}
				}
			}
			h2clog("html2canvas: Renderer: Canvas renderer done - returning canvas obj");
			k = m.elements.length;
			if (k === 1) {
				if (typeof m.elements[0] === "object"
						&& m.elements[0].nodeName !== "HTML" && e === false) {
					p = v.Util.Bounds(m.elements[0]);
					o = C.createElement("canvas");
					o.width = p.width;
					o.height = p.height;
					w = o.getContext("2d");
					w.drawImage(b, p.left, p.top, p.width, p.height, 0, 0,
							p.width, p.height);
					b = null;
					return o
				}
			}
			return b
		}
	};
	if (b.getContext) {
		h2clog("html2canvas: Renderer: using canvas renderer");
		f = true
	} else {
		e = true;
		h2clog("html2canvas: Renderer: canvas not available, using flashcanvas");
		if (typeof window.FlashCanvas !== "undefined") {
			h2clog("html2canvas: Renderer: Flashcanvas initialized");
			b = window.FlashCanvas.initElement(b);
			var h = 1;
			if (window && window.screen && window.screen.deviceXDPI
					&& window.screen.logicalXDPI) {
				h = window.screen.deviceXDPI * 1 / window.screen.logicalXDPI
			}
			if (h !== 1) {
				$(b).children("object").get(0).resize(Math.ceil(b.width * h),
						Math.ceil(b.height * h));
				b.getContext("2d").scale(h, h)
			}
			f = true;
			if (a !== false) {
				c._create.apply(null, a)
			}
		}
	}
	return c
};
if (window.ActiveXObject && !window.CanvasRenderingContext2D) {
	(function(window, document, undefined) {
		var NULL = null;
		var CANVAS = "canvas";
		var CANVAS_RENDERING_CONTEXT_2D = "CanvasRenderingContext2D";
		var CANVAS_GRADIENT = "CanvasGradient";
		var CANVAS_PATTERN = "CanvasPattern";
		var FLASH_CANVAS = "FlashCanvas";
		var G_VML_CANVAS_MANAGER = "G_vmlCanvasManager";
		var OBJECT_ID_PREFIX = "external";
		var ON_FOCUS = "onfocus";
		var ON_PROPERTY_CHANGE = "onpropertychange";
		var ON_READY_STATE_CHANGE = "onreadystatechange";
		var ON_UNLOAD = "onunload";
		var SWF_URL = Session.staticDomain + "/swf/flashcanvas.swf?v=5badf913";
		var INDEX_SIZE_ERR = 1;
		var NOT_SUPPORTED_ERR = 9;
		var INVALID_STATE_ERR = 11;
		var SYNTAX_ERR = 12;
		var TYPE_MISMATCH_ERR = 17;
		var SECURITY_ERR = 18;
		function Lookup(array) {
			for ( var i = 0, n = array.length; i < n; i++) {
				this[array[i]] = i
			}
		}
		var properties = new Lookup([ "toDataURL", "save", "restore", "scale",
				"rotate", "translate", "transform", "setTransform",
				"globalAlpha", "globalCompositeOperation", "strokeStyle",
				"fillStyle", "createLinearGradient", "createRadialGradient",
				"createPattern", "lineWidth", "lineCap", "lineJoin",
				"miterLimit", "shadowOffsetX", "shadowOffsetY", "shadowBlur",
				"shadowColor", "clearRect", "fillRect", "strokeRect",
				"beginPath", "closePath", "moveTo", "lineTo",
				"quadraticCurveTo", "bezierCurveTo", "arcTo", "rect", "arc",
				"fill", "stroke", "clip", "isPointInPath", "font", "textAlign",
				"textBaseline", "fillText", "strokeText", "measureText",
				"drawImage", "createImageData", "getImageData", "putImageData",
				"addColorStop", "direction", "resize" ]);
		var isReady = {};
		var images = {};
		var lock = {};
		var callbacks = {};
		var canvases = {};
		var spans = {};
		var CanvasRenderingContext2D = function(canvas, swf) {
			this.canvas = canvas;
			this._swf = swf;
			this._canvasId = swf.id.slice(8);
			this._initialize();
			this._gradientPatternId = 0;
			this._direction = "";
			this._font = "";
			var self = this;
			setInterval(function() {
				if (lock[self._canvasId] === 0) {
					self._executeCommand()
				}
			}, 30)
		};
		CanvasRenderingContext2D.prototype = {
			save : function() {
				this._setCompositing();
				this._setShadows();
				this._setStrokeStyle();
				this._setFillStyle();
				this._setLineStyles();
				this._setFontStyles();
				this._stateStack.push([ this._globalAlpha,
						this._globalCompositeOperation, this._strokeStyle,
						this._fillStyle, this._lineWidth, this._lineCap,
						this._lineJoin, this._miterLimit, this._shadowOffsetX,
						this._shadowOffsetY, this._shadowBlur,
						this._shadowColor, this._font, this._textAlign,
						this._textBaseline ]);
				this._queue.push(properties.save)
			},
			restore : function() {
				var stateStack = this._stateStack;
				if (stateStack.length) {
					var state = stateStack.pop();
					this.globalAlpha = state[0];
					this.globalCompositeOperation = state[1];
					this.strokeStyle = state[2];
					this.fillStyle = state[3];
					this.lineWidth = state[4];
					this.lineCap = state[5];
					this.lineJoin = state[6];
					this.miterLimit = state[7];
					this.shadowOffsetX = state[8];
					this.shadowOffsetY = state[9];
					this.shadowBlur = state[10];
					this.shadowColor = state[11];
					this.font = state[12];
					this.textAlign = state[13];
					this.textBaseline = state[14]
				}
				this._queue.push(properties.restore)
			},
			scale : function(x, y) {
				this._queue.push(properties.scale, x, y)
			},
			rotate : function(angle) {
				this._queue.push(properties.rotate, angle)
			},
			translate : function(x, y) {
				this._queue.push(properties.translate, x, y)
			},
			transform : function(m11, m12, m21, m22, dx, dy) {
				this._queue.push(properties.transform, m11, m12, m21, m22, dx,
						dy)
			},
			setTransform : function(m11, m12, m21, m22, dx, dy) {
				this._queue.push(properties.setTransform, m11, m12, m21, m22,
						dx, dy)
			},
			_setCompositing : function() {
				var queue = this._queue;
				if (this._globalAlpha !== this.globalAlpha) {
					this._globalAlpha = this.globalAlpha;
					queue.push(properties.globalAlpha, this._globalAlpha)
				}
				if (this._globalCompositeOperation !== this.globalCompositeOperation) {
					this._globalCompositeOperation = this.globalCompositeOperation;
					queue.push(properties.globalCompositeOperation,
							this._globalCompositeOperation)
				}
			},
			_setStrokeStyle : function() {
				if (this._strokeStyle !== this.strokeStyle) {
					var style = this._strokeStyle = this.strokeStyle;
					if (typeof style === "string") {
					} else {
						if (style instanceof CanvasGradient
								|| style instanceof CanvasPattern) {
							style = style.id
						} else {
							return
						}
					}
					this._queue.push(properties.strokeStyle, style)
				}
			},
			_setFillStyle : function() {
				if (this._fillStyle !== this.fillStyle) {
					var style = this._fillStyle = this.fillStyle;
					if (typeof style === "string") {
					} else {
						if (style instanceof CanvasGradient
								|| style instanceof CanvasPattern) {
							style = style.id
						} else {
							return
						}
					}
					this._queue.push(properties.fillStyle, style)
				}
			},
			createLinearGradient : function(x0, y0, x1, y1) {
				if (!(isFinite(x0) && isFinite(y0) && isFinite(x1) && isFinite(y1))) {
					throwException(NOT_SUPPORTED_ERR)
				}
				this._queue.push(properties.createLinearGradient, x0, y0, x1,
						y1);
				return new CanvasGradient(this)
			},
			createRadialGradient : function(x0, y0, r0, x1, y1, r1) {
				if (!(isFinite(x0) && isFinite(y0) && isFinite(r0)
						&& isFinite(x1) && isFinite(y1) && isFinite(r1))) {
					throwException(NOT_SUPPORTED_ERR)
				}
				if (r0 < 0 || r1 < 0) {
					throwException(INDEX_SIZE_ERR)
				}
				this._queue.push(properties.createRadialGradient, x0, y0, r0,
						x1, y1, r1);
				return new CanvasGradient(this)
			},
			createPattern : function(image, repetition) {
				if (!image) {
					throwException(TYPE_MISMATCH_ERR)
				}
				var tagName = image.tagName, src;
				var canvasId = this._canvasId;
				if (tagName) {
					tagName = tagName.toLowerCase();
					if (tagName === "img") {
						src = image.getAttribute("src", 2)
					} else {
						if (tagName === CANVAS || tagName === "video") {
							return
						} else {
							throwException(TYPE_MISMATCH_ERR)
						}
					}
				} else {
					if (image.src) {
						src = image.src
					} else {
						throwException(TYPE_MISMATCH_ERR)
					}
				}
				if (!(repetition === "repeat" || repetition === "no-repeat"
						|| repetition === "repeat-x"
						|| repetition === "repeat-y" || repetition === "" || repetition === NULL)) {
					throwException(SYNTAX_ERR)
				}
				this._queue.push(properties.createPattern, encodeXML(src),
						repetition);
				if (!images[canvasId][src] && isReady[canvasId]) {
					this._executeCommand();
					++lock[canvasId];
					images[canvasId][src] = true
				}
				return new CanvasPattern(this)
			},
			_setLineStyles : function() {
				var queue = this._queue;
				if (this._lineWidth !== this.lineWidth) {
					this._lineWidth = this.lineWidth;
					queue.push(properties.lineWidth, this._lineWidth)
				}
				if (this._lineCap !== this.lineCap) {
					this._lineCap = this.lineCap;
					queue.push(properties.lineCap, this._lineCap)
				}
				if (this._lineJoin !== this.lineJoin) {
					this._lineJoin = this.lineJoin;
					queue.push(properties.lineJoin, this._lineJoin)
				}
				if (this._miterLimit !== this.miterLimit) {
					this._miterLimit = this.miterLimit;
					queue.push(properties.miterLimit, this._miterLimit)
				}
			},
			_setShadows : function() {
				var queue = this._queue;
				if (this._shadowOffsetX !== this.shadowOffsetX) {
					this._shadowOffsetX = this.shadowOffsetX;
					queue.push(properties.shadowOffsetX, this._shadowOffsetX)
				}
				if (this._shadowOffsetY !== this.shadowOffsetY) {
					this._shadowOffsetY = this.shadowOffsetY;
					queue.push(properties.shadowOffsetY, this._shadowOffsetY)
				}
				if (this._shadowBlur !== this.shadowBlur) {
					this._shadowBlur = this.shadowBlur;
					queue.push(properties.shadowBlur, this._shadowBlur)
				}
				if (this._shadowColor !== this.shadowColor) {
					this._shadowColor = this.shadowColor;
					queue.push(properties.shadowColor, this._shadowColor)
				}
			},
			clearRect : function(x, y, w, h) {
				this._queue.push(properties.clearRect, x, y, w, h)
			},
			fillRect : function(x, y, w, h) {
				this._setCompositing();
				this._setShadows();
				this._setFillStyle();
				this._queue.push(properties.fillRect, x, y, w, h)
			},
			strokeRect : function(x, y, w, h) {
				this._setCompositing();
				this._setShadows();
				this._setStrokeStyle();
				this._setLineStyles();
				this._queue.push(properties.strokeRect, x, y, w, h)
			},
			beginPath : function() {
				this._queue.push(properties.beginPath)
			},
			closePath : function() {
				this._queue.push(properties.closePath)
			},
			moveTo : function(x, y) {
				this._queue.push(properties.moveTo, x, y)
			},
			lineTo : function(x, y) {
				this._queue.push(properties.lineTo, x, y)
			},
			quadraticCurveTo : function(cpx, cpy, x, y) {
				this._queue.push(properties.quadraticCurveTo, cpx, cpy, x, y)
			},
			bezierCurveTo : function(cp1x, cp1y, cp2x, cp2y, x, y) {
				this._queue.push(properties.bezierCurveTo, cp1x, cp1y, cp2x,
						cp2y, x, y)
			},
			arcTo : function(x1, y1, x2, y2, radius) {
				if (radius < 0 && isFinite(radius)) {
					throwException(INDEX_SIZE_ERR)
				}
				this._queue.push(properties.arcTo, x1, y1, x2, y2, radius)
			},
			rect : function(x, y, w, h) {
				this._queue.push(properties.rect, x, y, w, h)
			},
			arc : function(x, y, radius, startAngle, endAngle, anticlockwise) {
				if (radius < 0 && isFinite(radius)) {
					throwException(INDEX_SIZE_ERR)
				}
				this._queue.push(properties.arc, x, y, radius, startAngle,
						endAngle, anticlockwise ? 1 : 0)
			},
			fill : function() {
				this._setCompositing();
				this._setShadows();
				this._setFillStyle();
				this._queue.push(properties.fill)
			},
			stroke : function() {
				this._setCompositing();
				this._setShadows();
				this._setStrokeStyle();
				this._setLineStyles();
				this._queue.push(properties.stroke)
			},
			clip : function() {
				this._queue.push(properties.clip)
			},
			isPointInPath : function(x, y) {
			},
			_setFontStyles : function() {
				var queue = this._queue;
				if (this._font !== this.font) {
					try {
						var span = spans[this._canvasId];
						span.style.font = this._font = this.font;
						var style = span.currentStyle;
						var fontSize = span.offsetHeight;
						var font = [ style.fontStyle, style.fontWeight,
								fontSize, style.fontFamily ].join(" ");
						queue.push(properties.font, font)
					} catch (e) {
					}
				}
				if (this._textAlign !== this.textAlign) {
					this._textAlign = this.textAlign;
					queue.push(properties.textAlign, this._textAlign)
				}
				if (this._textBaseline !== this.textBaseline) {
					this._textBaseline = this.textBaseline;
					queue.push(properties.textBaseline, this._textBaseline)
				}
				if (this._direction !== this.canvas.currentStyle.direction) {
					this._direction = this.canvas.currentStyle.direction;
					queue.push(properties.direction, this._direction)
				}
			},
			fillText : function(text, x, y, maxWidth) {
				this._setCompositing();
				this._setFillStyle();
				this._setShadows();
				this._setFontStyles();
				this._queue.push(properties.fillText, encodeXML(text), x, y,
						maxWidth === undefined ? Infinity : maxWidth)
			},
			strokeText : function(text, x, y, maxWidth) {
				this._setCompositing();
				this._setStrokeStyle();
				this._setShadows();
				this._setFontStyles();
				this._queue.push(properties.strokeText, encodeXML(text), x, y,
						maxWidth === undefined ? Infinity : maxWidth)
			},
			measureText : function(text) {
				var span = spans[this._canvasId];
				try {
					span.style.font = this.font
				} catch (e) {
				}
				span.innerText = text.replace(/[ \n\f\r]/g, "\t");
				return new TextMetrics(span.offsetWidth)
			},
			drawImage : function(image, x1, y1, w1, h1, x2, y2, w2, h2) {
				if (!image) {
					throwException(TYPE_MISMATCH_ERR)
				}
				var tagName = image.tagName, src, argc = arguments.length;
				var canvasId = this._canvasId;
				if (tagName) {
					tagName = tagName.toLowerCase();
					if (tagName === "img") {
						src = image.getAttribute("src", 2)
					} else {
						if (tagName === CANVAS || tagName === "video") {
							return
						} else {
							throwException(TYPE_MISMATCH_ERR)
						}
					}
				} else {
					if (image.src) {
						src = image.src
					} else {
						throwException(TYPE_MISMATCH_ERR)
					}
				}
				this._setCompositing();
				this._setShadows();
				src = encodeXML(src);
				if (argc === 3) {
					this._queue.push(properties.drawImage, argc, src, x1, y1)
				} else {
					if (argc === 5) {
						this._queue.push(properties.drawImage, argc, src, x1,
								y1, w1, h1)
					} else {
						if (argc === 9) {
							if (w1 === 0 || h1 === 0) {
								throwException(INDEX_SIZE_ERR)
							}
							this._queue.push(properties.drawImage, argc, src,
									x1, y1, w1, h1, x2, y2, w2, h2)
						} else {
							return
						}
					}
				}
				if (!images[canvasId][src] && isReady[canvasId]) {
					this._executeCommand();
					++lock[canvasId];
					images[canvasId][src] = true
				}
			},
			createImageData : function() {
			},
			getImageData : function(sx, sy, sw, sh) {
			},
			putImageData : function(imagedata, dx, dy, dirtyX, dirtyY,
					dirtyWidth, dirtyHeight) {
			},
			loadImage : function(image, onload, onerror) {
				var tagName = image.tagName, src;
				var canvasId = this._canvasId;
				if (tagName) {
					if (tagName.toLowerCase() === "img") {
						src = image.getAttribute("src", 2)
					}
				} else {
					if (image.src) {
						src = image.src
					}
				}
				if (!src || images[canvasId][src]) {
					return
				}
				if (onload || onerror) {
					callbacks[canvasId][src] = [ image, onload, onerror ]
				}
				this._queue.push(properties.drawImage, 1, encodeXML(src));
				if (isReady[canvasId]) {
					this._executeCommand();
					++lock[canvasId];
					images[canvasId][src] = true
				}
			},
			_initialize : function() {
				this.globalAlpha = this._globalAlpha = 1;
				this.globalCompositeOperation = this._globalCompositeOperation = "source-over";
				this.strokeStyle = this._strokeStyle = "#000000";
				this.fillStyle = this._fillStyle = "#000000";
				this.lineWidth = this._lineWidth = 1;
				this.lineCap = this._lineCap = "butt";
				this.lineJoin = this._lineJoin = "miter";
				this.miterLimit = this._miterLimit = 10;
				this.shadowOffsetX = this._shadowOffsetX = 0;
				this.shadowOffsetY = this._shadowOffsetY = 0;
				this.shadowBlur = this._shadowBlur = 0;
				this.shadowColor = this._shadowColor = "rgba(0, 0, 0, 0.0)";
				this.font = this._font = "10px sans-serif";
				this.textAlign = this._textAlign = "start";
				this.textBaseline = this._textBaseline = "alphabetic";
				this._queue = [];
				this._stateStack = []
			},
			_flush : function() {
				var queue = this._queue;
				this._queue = [];
				return queue
			},
			_executeCommand : function() {
				var commands = this._flush();
				if (commands.length > 0) {
					return eval(this._swf
							.CallFunction('<invoke name="executeCommand" returntype="javascript"><arguments><string>'
									+ commands.join("&#0;")
									+ "</string></arguments></invoke>"))
				}
			},
			_resize : function(width, height) {
				this._executeCommand();
				this._initialize();
				if (width > 0) {
					this._swf.width = width
				}
				if (height > 0) {
					this._swf.height = height
				}
				this._queue.push(properties.resize, width, height)
			}
		};
		var CanvasGradient = function(ctx) {
			this._ctx = ctx;
			this.id = ctx._gradientPatternId++
		};
		CanvasGradient.prototype = {
			addColorStop : function(offset, color) {
				if (isNaN(offset) || offset < 0 || offset > 1) {
					throwException(INDEX_SIZE_ERR)
				}
				this._ctx._queue.push(properties.addColorStop, this.id, offset,
						color)
			}
		};
		var CanvasPattern = function(ctx) {
			this.id = ctx._gradientPatternId++
		};
		var TextMetrics = function(width) {
			this.width = width
		};
		var DOMException = function(code) {
			this.code = code;
			this.message = DOMExceptionNames[code]
		};
		DOMException.prototype = new Error;
		var DOMExceptionNames = {
			1 : "INDEX_SIZE_ERR",
			9 : "NOT_SUPPORTED_ERR",
			11 : "INVALID_STATE_ERR",
			12 : "SYNTAX_ERR",
			17 : "TYPE_MISMATCH_ERR",
			18 : "SECURITY_ERR"
		};
		function onReadyStateChange() {
			if (document.readyState === "complete") {
				document.detachEvent(ON_READY_STATE_CHANGE, onReadyStateChange);
				var canvases = document.getElementsByTagName(CANVAS);
				for ( var i = 0, n = canvases.length; i < n; ++i) {
					FlashCanvas.initElement(canvases[i])
				}
			}
		}
		function onFocus() {
			var swf = event.srcElement, canvas = swf.parentNode;
			swf.blur();
			canvas.focus()
		}
		function onPropertyChange() {
			var prop = event.propertyName;
			if (prop === "width" || prop === "height") {
				var canvas = event.srcElement;
				var value = canvas[prop];
				var number = parseInt(value, 10);
				if (isNaN(number) || number < 0) {
					number = (prop === "width") ? 300 : 150
				}
				if (value === number) {
					canvas.style[prop] = number + "px";
					canvas.getContext("2d")
							._resize(canvas.width, canvas.height)
				} else {
					canvas[prop] = number
				}
			}
		}
		function onUnload() {
			window.detachEvent(ON_UNLOAD, onUnload);
			for ( var canvasId in canvases) {
				var canvas = canvases[canvasId], swf = canvas.firstChild, prop;
				for (prop in swf) {
					if (typeof swf[prop] === "function") {
						swf[prop] = NULL
					}
				}
				for (prop in canvas) {
					if (typeof canvas[prop] === "function") {
						canvas[prop] = NULL
					}
				}
				swf.detachEvent(ON_FOCUS, onFocus);
				canvas.detachEvent(ON_PROPERTY_CHANGE, onPropertyChange)
			}
			window[CANVAS_RENDERING_CONTEXT_2D] = NULL;
			window[CANVAS_GRADIENT] = NULL;
			window[CANVAS_PATTERN] = NULL;
			window[FLASH_CANVAS] = NULL;
			window[G_VML_CANVAS_MANAGER] = NULL
		}
		var FlashCanvas = {
			initElement : function(canvas) {
				if (canvas.getContext) {
					return canvas
				}
				var canvasId = getUniqueId();
				var objectId = OBJECT_ID_PREFIX + canvasId;
				isReady[canvasId] = false;
				images[canvasId] = {};
				lock[canvasId] = 1;
				callbacks[canvasId] = {};
				setCanvasSize(canvas);
				var swfHtml = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="'
						+ location.protocol
						+ '//fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="100%" height="100%" id="'
						+ objectId
						+ '"><param name="allowScriptAccess" value="always"><param name="flashvars" value="id='
						+ objectId
						+ '"><param name="wmode" value="transparent"></object><span style="margin:0;padding:0;border:0;display:inline-block;position:static;height:1em;overflow:visible;white-space:nowrap"></span>';
				canvas.innerHTML = swfHtml;
				canvases[canvasId] = canvas;
				var swf = canvas.firstChild;
				spans[canvasId] = canvas.lastChild;
				var documentContains = document.body.contains;
				if (documentContains(canvas)) {
					swf.movie = SWF_URL
				} else {
					var intervalId = setInterval(function() {
						if (documentContains(canvas)) {
							clearInterval(intervalId);
							swf.movie = SWF_URL
						}
					}, 0)
				}
				if (document.compatMode === "BackCompat"
						|| !window.XMLHttpRequest) {
					spans[canvasId].style.overflow = "hidden"
				}
				var ctx = new CanvasRenderingContext2D(canvas, swf);
				canvas.getContext = function(contextId) {
					return contextId === "2d" ? ctx : NULL
				};
				canvas.toDataURL = function(type, quality) {
					if (("" + type).replace(/[A-Z]+/g, toLowerCase) === "image/jpeg") {
						ctx._queue.push(properties.toDataURL, type,
								typeof quality === "number" ? quality : "")
					} else {
						ctx._queue.push(properties.toDataURL, type)
					}
					return ctx._executeCommand()
				};
				swf.attachEvent(ON_FOCUS, onFocus);
				return canvas
			},
			saveImage : function(canvas) {
				var swf = canvas.firstChild;
				swf.saveImage()
			},
			setOptions : function(options) {
			},
			trigger : function(canvasId, type) {
				var canvas = canvases[canvasId];
				canvas.fireEvent("on" + type)
			},
			unlock : function(canvasId, url, error) {
				var canvas, swf, width, height;
				var _callback, image, callback;
				if (lock[canvasId]) {
					--lock[canvasId]
				}
				if (url === undefined) {
					canvas = canvases[canvasId];
					swf = canvas.firstChild;
					setCanvasSize(canvas);
					width = canvas.width;
					height = canvas.height;
					canvas.style.width = width + "px";
					canvas.style.height = height + "px";
					if (width > 0) {
						swf.width = width
					}
					if (height > 0) {
						swf.height = height
					}
					swf.resize(width, height);
					canvas.attachEvent(ON_PROPERTY_CHANGE, onPropertyChange);
					isReady[canvasId] = true;
					if (typeof canvas.onload === "function") {
						setTimeout(function() {
							canvas.onload()
						}, 0)
					}
				} else {
					if (_callback = callbacks[canvasId][url]) {
						image = _callback[0];
						callback = _callback[1 + error];
						delete callbacks[canvasId][url];
						if (typeof callback === "function") {
							callback.call(image)
						}
					}
				}
			}
		};
		function getScriptUrl() {
			var scripts = document.getElementsByTagName("script");
			var script = scripts[scripts.length - 1];
			if (document.documentMode >= 8) {
				return script.src
			} else {
				return script.getAttribute("src", 4)
			}
		}
		function getUniqueId() {
			return Math.random().toString(36).slice(2) || "0"
		}
		function encodeXML(str) {
			return ("" + str).replace(/&/g, "&amp;").replace(/</g, "&lt;")
		}
		function toLowerCase(str) {
			return str.toLowerCase()
		}
		function throwException(code) {
			throw new DOMException(code)
		}
		function setCanvasSize(canvas) {
			var width = parseInt(canvas.width, 10);
			var height = parseInt(canvas.height, 10);
			if (isNaN(width) || width < 0) {
				width = 300
			}
			if (isNaN(height) || height < 0) {
				height = 150
			}
			canvas.width = width;
			canvas.height = height
		}
		document.createElement(CANVAS);
		document.createStyleSheet().cssText = CANVAS
				+ "{display:inline-block;overflow:hidden;width:300px;height:150px}";
		if (document.readyState === "complete") {
			onReadyStateChange()
		} else {
			document.attachEvent(ON_READY_STATE_CHANGE, onReadyStateChange)
		}
		window.attachEvent(ON_UNLOAD, onUnload);
		if (SWF_URL.indexOf(location.protocol + "//" + location.host + "/") === 0) {
			var req = new ActiveXObject("Microsoft.XMLHTTP");
			req.open("GET", SWF_URL, false);
			req.send(NULL)
		}
		window[CANVAS_RENDERING_CONTEXT_2D] = CanvasRenderingContext2D;
		window[CANVAS_GRADIENT] = CanvasGradient;
		window[CANVAS_PATTERN] = CanvasPattern;
		window[FLASH_CANVAS] = FlashCanvas;
		window[G_VML_CANVAS_MANAGER] = {
			init : function() {
			},
			init_ : function() {
			},
			initElement : FlashCanvas.initElement
		};
		keep = [ CanvasRenderingContext2D.measureText,
				CanvasRenderingContext2D.loadImage ]
	})(window, document)
}
(function(a) {
	if (!a || !a.fn) {
		return
	}
	a.fn.html2canvas = function(b) {
		b = b || {};
		b.onrendered = b.onrendered || function(c) {
		};
		return html2canvas(this[0], b)
	}
})(window.jQuery);