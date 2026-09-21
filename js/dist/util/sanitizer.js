/*!
* CoreUI PRO sanitizer.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.Sanitizer = {}));
})(this, function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const DefaultAllowlist = {
		"*": [
			"class",
			"dir",
			"id",
			"lang",
			"role",
			/^aria-[\w-]*$/i
		],
		a: [
			"target",
			"href",
			"title",
			"rel"
		],
		area: [],
		b: [],
		br: [],
		col: [],
		code: [],
		dd: [],
		div: [],
		dl: [],
		dt: [],
		em: [],
		hr: [],
		h1: [],
		h2: [],
		h3: [],
		h4: [],
		h5: [],
		h6: [],
		i: [],
		img: [
			"src",
			"srcset",
			"alt",
			"title",
			"width",
			"height"
		],
		li: [],
		ol: [],
		p: [],
		pre: [],
		s: [],
		small: [],
		span: [],
		sub: [],
		sup: [],
		strong: [],
		u: [],
		ul: []
	};
	const SVGAllowlist = {
		...DefaultAllowlist,
		svg: [
			"id",
			"class",
			"xmlns",
			"version",
			"baseprofile",
			"width",
			"height",
			"viewbox",
			"preserveaspectratio",
			"aria-hidden",
			"role",
			"focusable",
			"fill",
			"stroke",
			"stroke-width",
			"stroke-linecap",
			"stroke-linejoin"
		],
		g: [
			"id",
			"class",
			"transform",
			"style"
		],
		path: [
			"id",
			"class",
			"d",
			"fill",
			"fill-opacity",
			"fill-rule",
			"stroke",
			"stroke-width",
			"stroke-linecap",
			"stroke-linejoin",
			"stroke-miterlimit",
			"stroke-dasharray",
			"stroke-dashoffset",
			"stroke-opacity"
		],
		circle: [
			"id",
			"class",
			"cx",
			"cy",
			"r",
			"fill",
			"fill-opacity",
			"stroke",
			"stroke-width",
			"stroke-opacity"
		],
		rect: [
			"id",
			"class",
			"x",
			"y",
			"width",
			"height",
			"rx",
			"ry",
			"fill",
			"fill-opacity",
			"stroke",
			"stroke-width",
			"stroke-opacity"
		],
		ellipse: [
			"id",
			"class",
			"cx",
			"cy",
			"rx",
			"ry",
			"fill",
			"fill-opacity",
			"stroke",
			"stroke-width",
			"stroke-opacity"
		],
		line: [
			"id",
			"class",
			"x1",
			"y1",
			"x2",
			"y2",
			"stroke",
			"stroke-width",
			"stroke-linecap",
			"stroke-opacity"
		],
		polygon: [
			"id",
			"class",
			"points",
			"fill",
			"fill-opacity",
			"stroke",
			"stroke-width",
			"stroke-opacity"
		],
		polyline: [
			"id",
			"class",
			"points",
			"fill",
			"fill-opacity",
			"stroke",
			"stroke-width",
			"stroke-opacity"
		],
		text: [
			"id",
			"class",
			"x",
			"y",
			"dx",
			"dy",
			"text-anchor",
			"font-family",
			"font-size",
			"font-weight",
			"fill",
			"fill-opacity",
			"stroke",
			"stroke-width",
			"stroke-opacity"
		],
		tspan: [
			"id",
			"class",
			"x",
			"y",
			"dx",
			"dy",
			"text-anchor",
			"font-family",
			"font-size",
			"font-weight",
			"fill",
			"fill-opacity",
			"stroke",
			"stroke-width",
			"stroke-opacity"
		],
		defs: [],
		symbol: [
			"id",
			"class",
			"viewbox",
			"preserveaspectratio"
		],
		use: [
			"id",
			"class",
			"x",
			"y",
			"width",
			"height",
			"href"
		],
		image: [
			"id",
			"class",
			"x",
			"y",
			"width",
			"height",
			"href",
			"preserveaspectratio",
			"xlink:href"
		],
		pattern: [
			"id",
			"class",
			"x",
			"y",
			"width",
			"height",
			"patternunits",
			"patterncontentunits",
			"patterntransform",
			"preserveaspectratio"
		],
		lineargradient: [
			"id",
			"class",
			"gradientunits",
			"x1",
			"y1",
			"x2",
			"y2",
			"spreadmethod",
			"gradienttransform"
		],
		radialgradient: [
			"id",
			"class",
			"gradientunits",
			"cx",
			"cy",
			"r",
			"fx",
			"fy",
			"spreadmethod",
			"gradienttransform"
		],
		mask: [
			"id",
			"class",
			"x",
			"y",
			"width",
			"height",
			"maskunits",
			"maskcontentunits",
			"masktransform"
		],
		clippath: [
			"id",
			"class",
			"clippathunits"
		],
		marker: [
			"id",
			"class",
			"markerunits",
			"markerwidth",
			"markerheight",
			"orient",
			"preserveaspectratio",
			"viewbox",
			"refx",
			"refy"
		],
		title: [],
		desc: []
	};
	const ESCAPE_HTML_MAP = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#x27;"
	};
	function escapeHtml(unsafeText) {
		return String(unsafeText).replace(/[&<>"']/g, (character) => ESCAPE_HTML_MAP[character]);
	}
	const uriAttributes = /* @__PURE__ */ new Set([
		"background",
		"cite",
		"href",
		"itemtype",
		"longdesc",
		"poster",
		"src",
		"xlink:href"
	]);
	/**
	* A pattern that recognizes URLs that are safe wrt. XSS in URL navigation
	* contexts.
	*
	* Shout-out to Angular https://github.com/angular/angular/blob/15.2.8/packages/core/src/sanitization/url_sanitizer.ts#L38
	*/
	const SAFE_URL_PATTERN = /^(?!(?:javascript|data|vbscript):)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;
	/**
	* A pattern that matches safe data URLs. Only matches image, video and audio
	* types — notably NOT `data:text/html`, which is an XSS vector.
	*
	* Shout-out to Angular https://github.com/angular/angular/blob/15.2.8/packages/core/src/sanitization/url_sanitizer.ts#L49
	*/
	const DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[\d+/a-z=]+$/i;
	const allowedAttribute = (attribute, allowedAttributeList) => {
		const attributeName = attribute.nodeName.toLowerCase();
		if (allowedAttributeList.includes(attributeName)) {
			if (uriAttributes.has(attributeName)) return Boolean(SAFE_URL_PATTERN.test(attribute.nodeValue) || DATA_URL_PATTERN.test(attribute.nodeValue));
			return true;
		}
		return allowedAttributeList.filter((attributeRegex) => attributeRegex instanceof RegExp).some((regex) => regex.test(attributeName));
	};
	function sanitizeHtml(unsafeHtml, allowList, sanitizeFunction) {
		if (!unsafeHtml.length) return unsafeHtml;
		if (sanitizeFunction && typeof sanitizeFunction === "function") return sanitizeFunction(unsafeHtml);
		const createdDocument = new window.DOMParser().parseFromString(unsafeHtml, "text/html");
		const elements = [].concat(...createdDocument.body.querySelectorAll("*"));
		for (const element of elements) {
			const elementName = element.nodeName.toLowerCase();
			if (!Object.keys(allowList).includes(elementName)) {
				element.remove();
				continue;
			}
			const attributeList = [].concat(...element.attributes);
			const allowedAttributes = [].concat(allowList["*"] || [], allowList[elementName] || []);
			for (const attribute of attributeList) if (!allowedAttribute(attribute, allowedAttributes)) element.removeAttribute(attribute.nodeName);
		}
		return createdDocument.body.innerHTML;
	}
	function sanitizeByConfig(unsafeHtml, config) {
		return config.sanitize ? sanitizeHtml(unsafeHtml, config.allowList ?? DefaultAllowlist, config.sanitizeFn) : unsafeHtml;
	}
	//#endregion
	exports.DefaultAllowlist = DefaultAllowlist;
	exports.SVGAllowlist = SVGAllowlist;
	exports.escapeHtml = escapeHtml;
	exports.sanitizeByConfig = sanitizeByConfig;
	exports.sanitizeHtml = sanitizeHtml;
});

//# sourceMappingURL=sanitizer.js.map