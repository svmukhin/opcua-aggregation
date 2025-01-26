(function () {
	'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var vnode;
	var hasRequiredVnode;

	function requireVnode () {
		if (hasRequiredVnode) return vnode;
		hasRequiredVnode = 1;

		function Vnode(tag, key, attrs, children, text, dom) {
			return {tag: tag, key: key, attrs: attrs, children: children, text: text, dom: dom, domSize: undefined, state: undefined, events: undefined, instance: undefined}
		}
		Vnode.normalize = function(node) {
			if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
			if (node == null || typeof node === "boolean") return null
			if (typeof node === "object") return node
			return Vnode("#", undefined, undefined, String(node), undefined, undefined)
		};
		Vnode.normalizeChildren = function(input) {
			var children = [];
			if (input.length) {
				var isKeyed = input[0] != null && input[0].key != null;
				// Note: this is a *very* perf-sensitive check.
				// Fun fact: merging the loop like this is somehow faster than splitting
				// it, noticeably so.
				for (var i = 1; i < input.length; i++) {
					if ((input[i] != null && input[i].key != null) !== isKeyed) {
						throw new TypeError(
							isKeyed && (input[i] != null || typeof input[i] === "boolean")
								? "In fragments, vnodes must either all have keys or none have keys. You may wish to consider using an explicit keyed empty fragment, m.fragment({key: ...}), instead of a hole."
								: "In fragments, vnodes must either all have keys or none have keys."
						)
					}
				}
				for (var i = 0; i < input.length; i++) {
					children[i] = Vnode.normalize(input[i]);
				}
			}
			return children
		};

		vnode = Vnode;
		return vnode;
	}

	var hyperscriptVnode;
	var hasRequiredHyperscriptVnode;

	function requireHyperscriptVnode () {
		if (hasRequiredHyperscriptVnode) return hyperscriptVnode;
		hasRequiredHyperscriptVnode = 1;

		var Vnode = requireVnode();

		// Call via `hyperscriptVnode.apply(startOffset, arguments)`
		//
		// The reason I do it this way, forwarding the arguments and passing the start
		// offset in `this`, is so I don't have to create a temporary array in a
		// performance-critical path.
		//
		// In native ES6, I'd instead add a final `...args` parameter to the
		// `hyperscript` and `fragment` factories and define this as
		// `hyperscriptVnode(...args)`, since modern engines do optimize that away. But
		// ES5 (what Mithril.js requires thanks to IE support) doesn't give me that luxury,
		// and engines aren't nearly intelligent enough to do either of these:
		//
		// 1. Elide the allocation for `[].slice.call(arguments, 1)` when it's passed to
		//    another function only to be indexed.
		// 2. Elide an `arguments` allocation when it's passed to any function other
		//    than `Function.prototype.apply` or `Reflect.apply`.
		//
		// In ES6, it'd probably look closer to this (I'd need to profile it, though):
		// module.exports = function(attrs, ...children) {
		//     if (attrs == null || typeof attrs === "object" && attrs.tag == null && !Array.isArray(attrs)) {
		//         if (children.length === 1 && Array.isArray(children[0])) children = children[0]
		//     } else {
		//         children = children.length === 0 && Array.isArray(attrs) ? attrs : [attrs, ...children]
		//         attrs = undefined
		//     }
		//
		//     if (attrs == null) attrs = {}
		//     return Vnode("", attrs.key, attrs, children)
		// }
		hyperscriptVnode = function() {
			var attrs = arguments[this], start = this + 1, children;

			if (attrs == null) {
				attrs = {};
			} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
				attrs = {};
				start = this;
			}

			if (arguments.length === start + 1) {
				children = arguments[start];
				if (!Array.isArray(children)) children = [children];
			} else {
				children = [];
				while (start < arguments.length) children.push(arguments[start++]);
			}

			return Vnode("", attrs.key, attrs, children)
		};
		return hyperscriptVnode;
	}

	var hasOwn;
	var hasRequiredHasOwn;

	function requireHasOwn () {
		if (hasRequiredHasOwn) return hasOwn;
		hasRequiredHasOwn = 1;

		hasOwn = {}.hasOwnProperty;
		return hasOwn;
	}

	var hyperscript_1$1;
	var hasRequiredHyperscript$1;

	function requireHyperscript$1 () {
		if (hasRequiredHyperscript$1) return hyperscript_1$1;
		hasRequiredHyperscript$1 = 1;

		var Vnode = requireVnode();
		var hyperscriptVnode = requireHyperscriptVnode();
		var hasOwn = requireHasOwn();

		var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g;
		var selectorCache = Object.create(null);

		function isEmpty(object) {
			for (var key in object) if (hasOwn.call(object, key)) return false
			return true
		}

		function compileSelector(selector) {
			var match, tag = "div", classes = [], attrs = {};
			while (match = selectorParser.exec(selector)) {
				var type = match[1], value = match[2];
				if (type === "" && value !== "") tag = value;
				else if (type === "#") attrs.id = value;
				else if (type === ".") classes.push(value);
				else if (match[3][0] === "[") {
					var attrValue = match[6];
					if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\");
					if (match[4] === "class") classes.push(attrValue);
					else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true;
				}
			}
			if (classes.length > 0) attrs.className = classes.join(" ");
			if (isEmpty(attrs)) attrs = null;
			return selectorCache[selector] = {tag: tag, attrs: attrs}
		}

		function execSelector(state, vnode) {
			var attrs = vnode.attrs;
			var hasClass = hasOwn.call(attrs, "class");
			var className = hasClass ? attrs.class : attrs.className;

			vnode.tag = state.tag;

			if (state.attrs != null) {
				attrs = Object.assign({}, state.attrs, attrs);

				if (className != null || state.attrs.className != null) attrs.className =
					className != null
						? state.attrs.className != null
							? String(state.attrs.className) + " " + String(className)
							: className
						: state.attrs.className != null
							? state.attrs.className
							: null;
			} else {
				if (className != null) attrs.className = className;
			}

			if (hasClass) attrs.class = null;

			// workaround for #2622 (reorder keys in attrs to set "type" first)
			// The DOM does things to inputs based on the "type", so it needs set first.
			// See: https://github.com/MithrilJS/mithril.js/issues/2622
			if (state.tag === "input" && hasOwn.call(attrs, "type")) {
				attrs = Object.assign({type: attrs.type}, attrs);
			}

			vnode.attrs = attrs;

			return vnode
		}

		function hyperscript(selector) {
			if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
				throw Error("The selector must be either a string or a component.");
			}

			var vnode = hyperscriptVnode.apply(1, arguments);

			if (typeof selector === "string") {
				vnode.children = Vnode.normalizeChildren(vnode.children);
				if (selector !== "[") return execSelector(selectorCache[selector] || compileSelector(selector), vnode)
			}

			vnode.tag = selector;
			return vnode
		}

		hyperscript_1$1 = hyperscript;
		return hyperscript_1$1;
	}

	var trust;
	var hasRequiredTrust;

	function requireTrust () {
		if (hasRequiredTrust) return trust;
		hasRequiredTrust = 1;

		var Vnode = requireVnode();

		trust = function(html) {
			if (html == null) html = "";
			return Vnode("<", undefined, undefined, html, undefined, undefined)
		};
		return trust;
	}

	var fragment;
	var hasRequiredFragment;

	function requireFragment () {
		if (hasRequiredFragment) return fragment;
		hasRequiredFragment = 1;

		var Vnode = requireVnode();
		var hyperscriptVnode = requireHyperscriptVnode();

		fragment = function() {
			var vnode = hyperscriptVnode.apply(0, arguments);

			vnode.tag = "[";
			vnode.children = Vnode.normalizeChildren(vnode.children);
			return vnode
		};
		return fragment;
	}

	var hyperscript_1;
	var hasRequiredHyperscript;

	function requireHyperscript () {
		if (hasRequiredHyperscript) return hyperscript_1;
		hasRequiredHyperscript = 1;

		var hyperscript = requireHyperscript$1();

		hyperscript.trust = requireTrust();
		hyperscript.fragment = requireFragment();

		hyperscript_1 = hyperscript;
		return hyperscript_1;
	}

	var domFor_1;
	var hasRequiredDomFor;

	function requireDomFor () {
		if (hasRequiredDomFor) return domFor_1;
		hasRequiredDomFor = 1;

		var delayedRemoval = new WeakMap;

		function *domFor(vnode, object = {}) {
			// To avoid unintended mangling of the internal bundler,
			// parameter destructuring is not used here.
			var dom = vnode.dom;
			var domSize = vnode.domSize;
			var generation = object.generation;
			if (dom != null) do {
				var nextSibling = dom.nextSibling;

				if (delayedRemoval.get(dom) === generation) {
					yield dom;
					domSize--;
				}

				dom = nextSibling;
			}
			while (domSize)
		}

		domFor_1 = {
			delayedRemoval: delayedRemoval,
			domFor: domFor,
		};
		return domFor_1;
	}

	var render$1;
	var hasRequiredRender$1;

	function requireRender$1 () {
		if (hasRequiredRender$1) return render$1;
		hasRequiredRender$1 = 1;

		var Vnode = requireVnode();
		var df = requireDomFor();
		var delayedRemoval = df.delayedRemoval;
		var domFor = df.domFor;

		render$1 = function() {
			var nameSpace = {
				svg: "http://www.w3.org/2000/svg",
				math: "http://www.w3.org/1998/Math/MathML"
			};

			var currentRedraw;
			var currentRender;

			function getDocument(dom) {
				return dom.ownerDocument;
			}

			function getNameSpace(vnode) {
				return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
			}

			//sanity check to discourage people from doing `vnode.state = ...`
			function checkState(vnode, original) {
				if (vnode.state !== original) throw new Error("'vnode.state' must not be modified.")
			}

			//Note: the hook is passed as the `this` argument to allow proxying the
			//arguments without requiring a full array allocation to do so. It also
			//takes advantage of the fact the current `vnode` is the first argument in
			//all lifecycle methods.
			function callHook(vnode) {
				var original = vnode.state;
				try {
					return this.apply(original, arguments)
				} finally {
					checkState(vnode, original);
				}
			}

			// IE11 (at least) throws an UnspecifiedError when accessing document.activeElement when
			// inside an iframe. Catch and swallow this error, and heavy-handidly return null.
			function activeElement(dom) {
				try {
					return getDocument(dom).activeElement
				} catch (e) {
					return null
				}
			}
			//create
			function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
				for (var i = start; i < end; i++) {
					var vnode = vnodes[i];
					if (vnode != null) {
						createNode(parent, vnode, hooks, ns, nextSibling);
					}
				}
			}
			function createNode(parent, vnode, hooks, ns, nextSibling) {
				var tag = vnode.tag;
				if (typeof tag === "string") {
					vnode.state = {};
					if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks);
					switch (tag) {
						case "#": createText(parent, vnode, nextSibling); break
						case "<": createHTML(parent, vnode, ns, nextSibling); break
						case "[": createFragment(parent, vnode, hooks, ns, nextSibling); break
						default: createElement(parent, vnode, hooks, ns, nextSibling);
					}
				}
				else createComponent(parent, vnode, hooks, ns, nextSibling);
			}
			function createText(parent, vnode, nextSibling) {
				vnode.dom = getDocument(parent).createTextNode(vnode.children);
				insertDOM(parent, vnode.dom, nextSibling);
			}
			var possibleParents = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"};
			function createHTML(parent, vnode, ns, nextSibling) {
				var match = vnode.children.match(/^\s*?<(\w+)/im) || [];
				// not using the proper parent makes the child element(s) vanish.
				//     var div = document.createElement("div")
				//     div.innerHTML = "<td>i</td><td>j</td>"
				//     console.log(div.innerHTML)
				// --> "ij", no <td> in sight.
				var temp = getDocument(parent).createElement(possibleParents[match[1]] || "div");
				if (ns === "http://www.w3.org/2000/svg") {
					temp.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\">" + vnode.children + "</svg>";
					temp = temp.firstChild;
				} else {
					temp.innerHTML = vnode.children;
				}
				vnode.dom = temp.firstChild;
				vnode.domSize = temp.childNodes.length;
				// Capture nodes to remove, so we don't confuse them.
				var fragment = getDocument(parent).createDocumentFragment();
				var child;
				while (child = temp.firstChild) {
					fragment.appendChild(child);
				}
				insertDOM(parent, fragment, nextSibling);
			}
			function createFragment(parent, vnode, hooks, ns, nextSibling) {
				var fragment = getDocument(parent).createDocumentFragment();
				if (vnode.children != null) {
					var children = vnode.children;
					createNodes(fragment, children, 0, children.length, hooks, null, ns);
				}
				vnode.dom = fragment.firstChild;
				vnode.domSize = fragment.childNodes.length;
				insertDOM(parent, fragment, nextSibling);
			}
			function createElement(parent, vnode, hooks, ns, nextSibling) {
				var tag = vnode.tag;
				var attrs = vnode.attrs;
				var is = attrs && attrs.is;

				ns = getNameSpace(vnode) || ns;

				var element = ns ?
					is ? getDocument(parent).createElementNS(ns, tag, {is: is}) : getDocument(parent).createElementNS(ns, tag) :
					is ? getDocument(parent).createElement(tag, {is: is}) : getDocument(parent).createElement(tag);
				vnode.dom = element;

				if (attrs != null) {
					setAttrs(vnode, attrs, ns);
				}

				insertDOM(parent, element, nextSibling);

				if (!maybeSetContentEditable(vnode)) {
					if (vnode.children != null) {
						var children = vnode.children;
						createNodes(element, children, 0, children.length, hooks, null, ns);
						if (vnode.tag === "select" && attrs != null) setLateSelectAttrs(vnode, attrs);
					}
				}
			}
			function initComponent(vnode, hooks) {
				var sentinel;
				if (typeof vnode.tag.view === "function") {
					vnode.state = Object.create(vnode.tag);
					sentinel = vnode.state.view;
					if (sentinel.$$reentrantLock$$ != null) return
					sentinel.$$reentrantLock$$ = true;
				} else {
					vnode.state = undefined;
					sentinel = vnode.tag;
					if (sentinel.$$reentrantLock$$ != null) return
					sentinel.$$reentrantLock$$ = true;
					vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode);
				}
				initLifecycle(vnode.state, vnode, hooks);
				if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks);
				vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode));
				if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
				sentinel.$$reentrantLock$$ = null;
			}
			function createComponent(parent, vnode, hooks, ns, nextSibling) {
				initComponent(vnode, hooks);
				if (vnode.instance != null) {
					createNode(parent, vnode.instance, hooks, ns, nextSibling);
					vnode.dom = vnode.instance.dom;
					vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0;
				}
				else {
					vnode.domSize = 0;
				}
			}

			//update
			/**
			 * @param {Element|Fragment} parent - the parent element
			 * @param {Vnode[] | null} old - the list of vnodes of the last `render()` call for
			 *                               this part of the tree
			 * @param {Vnode[] | null} vnodes - as above, but for the current `render()` call.
			 * @param {Function[]} hooks - an accumulator of post-render hooks (oncreate/onupdate)
			 * @param {Element | null} nextSibling - the next DOM node if we're dealing with a
			 *                                       fragment that is not the last item in its
			 *                                       parent
			 * @param {'svg' | 'math' | String | null} ns) - the current XML namespace, if any
			 * @returns void
			 */
			// This function diffs and patches lists of vnodes, both keyed and unkeyed.
			//
			// We will:
			//
			// 1. describe its general structure
			// 2. focus on the diff algorithm optimizations
			// 3. discuss DOM node operations.

			// ## Overview:
			//
			// The updateNodes() function:
			// - deals with trivial cases
			// - determines whether the lists are keyed or unkeyed based on the first non-null node
			//   of each list.
			// - diffs them and patches the DOM if needed (that's the brunt of the code)
			// - manages the leftovers: after diffing, are there:
			//   - old nodes left to remove?
			// 	 - new nodes to insert?
			// 	 deal with them!
			//
			// The lists are only iterated over once, with an exception for the nodes in `old` that
			// are visited in the fourth part of the diff and in the `removeNodes` loop.

			// ## Diffing
			//
			// Reading https://github.com/localvoid/ivi/blob/ddc09d06abaef45248e6133f7040d00d3c6be853/packages/ivi/src/vdom/implementation.ts#L617-L837
			// may be good for context on longest increasing subsequence-based logic for moving nodes.
			//
			// In order to diff keyed lists, one has to
			//
			// 1) match nodes in both lists, per key, and update them accordingly
			// 2) create the nodes present in the new list, but absent in the old one
			// 3) remove the nodes present in the old list, but absent in the new one
			// 4) figure out what nodes in 1) to move in order to minimize the DOM operations.
			//
			// To achieve 1) one can create a dictionary of keys => index (for the old list), then iterate
			// over the new list and for each new vnode, find the corresponding vnode in the old list using
			// the map.
			// 2) is achieved in the same step: if a new node has no corresponding entry in the map, it is new
			// and must be created.
			// For the removals, we actually remove the nodes that have been updated from the old list.
			// The nodes that remain in that list after 1) and 2) have been performed can be safely removed.
			// The fourth step is a bit more complex and relies on the longest increasing subsequence (LIS)
			// algorithm.
			//
			// the longest increasing subsequence is the list of nodes that can remain in place. Imagine going
			// from `1,2,3,4,5` to `4,5,1,2,3` where the numbers are not necessarily the keys, but the indices
			// corresponding to the keyed nodes in the old list (keyed nodes `e,d,c,b,a` => `b,a,e,d,c` would
			//  match the above lists, for example).
			//
			// In there are two increasing subsequences: `4,5` and `1,2,3`, the latter being the longest. We
			// can update those nodes without moving them, and only call `insertNode` on `4` and `5`.
			//
			// @localvoid adapted the algo to also support node deletions and insertions (the `lis` is actually
			// the longest increasing subsequence *of old nodes still present in the new list*).
			//
			// It is a general algorithm that is fireproof in all circumstances, but it requires the allocation
			// and the construction of a `key => oldIndex` map, and three arrays (one with `newIndex => oldIndex`,
			// the `LIS` and a temporary one to create the LIS).
			//
			// So we cheat where we can: if the tails of the lists are identical, they are guaranteed to be part of
			// the LIS and can be updated without moving them.
			//
			// If two nodes are swapped, they are guaranteed not to be part of the LIS, and must be moved (with
			// the exception of the last node if the list is fully reversed).
			//
			// ## Finding the next sibling.
			//
			// `updateNode()` and `createNode()` expect a nextSibling parameter to perform DOM operations.
			// When the list is being traversed top-down, at any index, the DOM nodes up to the previous
			// vnode reflect the content of the new list, whereas the rest of the DOM nodes reflect the old
			// list. The next sibling must be looked for in the old list using `getNextSibling(... oldStart + 1 ...)`.
			//
			// In the other scenarios (swaps, upwards traversal, map-based diff),
			// the new vnodes list is traversed upwards. The DOM nodes at the bottom of the list reflect the
			// bottom part of the new vnodes list, and we can use the `v.dom`  value of the previous node
			// as the next sibling (cached in the `nextSibling` variable).


			// ## DOM node moves
			//
			// In most scenarios `updateNode()` and `createNode()` perform the DOM operations. However,
			// this is not the case if the node moved (second and fourth part of the diff algo). We move
			// the old DOM nodes before updateNode runs because it enables us to use the cached `nextSibling`
			// variable rather than fetching it using `getNextSibling()`.

			function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
				if (old === vnodes || old == null && vnodes == null) return
				else if (old == null || old.length === 0) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns);
				else if (vnodes == null || vnodes.length === 0) removeNodes(parent, old, 0, old.length);
				else {
					var isOldKeyed = old[0] != null && old[0].key != null;
					var isKeyed = vnodes[0] != null && vnodes[0].key != null;
					var start = 0, oldStart = 0;
					if (!isOldKeyed) while (oldStart < old.length && old[oldStart] == null) oldStart++;
					if (!isKeyed) while (start < vnodes.length && vnodes[start] == null) start++;
					if (isOldKeyed !== isKeyed) {
						removeNodes(parent, old, oldStart, old.length);
						createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns);
					} else if (!isKeyed) {
						// Don't index past the end of either list (causes deopts).
						var commonLength = old.length < vnodes.length ? old.length : vnodes.length;
						// Rewind if necessary to the first non-null index on either side.
						// We could alternatively either explicitly create or remove nodes when `start !== oldStart`
						// but that would be optimizing for sparse lists which are more rare than dense ones.
						start = start < oldStart ? start : oldStart;
						for (; start < commonLength; start++) {
							o = old[start];
							v = vnodes[start];
							if (o === v || o == null && v == null) continue
							else if (o == null) createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, nextSibling));
							else if (v == null) removeNode(parent, o);
							else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, nextSibling), ns);
						}
						if (old.length > commonLength) removeNodes(parent, old, start, old.length);
						if (vnodes.length > commonLength) createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns);
					} else {
						// keyed diff
						var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling;

						// bottom-up
						while (oldEnd >= oldStart && end >= start) {
							oe = old[oldEnd];
							ve = vnodes[end];
							if (oe.key !== ve.key) break
							if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
							if (ve.dom != null) nextSibling = ve.dom;
							oldEnd--, end--;
						}
						// top-down
						while (oldEnd >= oldStart && end >= start) {
							o = old[oldStart];
							v = vnodes[start];
							if (o.key !== v.key) break
							oldStart++, start++;
							if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns);
						}
						// swaps and list reversals
						while (oldEnd >= oldStart && end >= start) {
							if (start === end) break
							if (o.key !== ve.key || oe.key !== v.key) break
							topSibling = getNextSibling(old, oldStart, nextSibling);
							moveDOM(parent, oe, topSibling);
							if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns);
							if (++start <= --end) moveDOM(parent, o, nextSibling);
							if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns);
							if (ve.dom != null) nextSibling = ve.dom;
							oldStart++; oldEnd--;
							oe = old[oldEnd];
							ve = vnodes[end];
							o = old[oldStart];
							v = vnodes[start];
						}
						// bottom up once again
						while (oldEnd >= oldStart && end >= start) {
							if (oe.key !== ve.key) break
							if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
							if (ve.dom != null) nextSibling = ve.dom;
							oldEnd--, end--;
							oe = old[oldEnd];
							ve = vnodes[end];
						}
						if (start > end) removeNodes(parent, old, oldStart, oldEnd + 1);
						else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
						else {
							// inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
							var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li=0, i=0, pos = 2147483647, matched = 0, map, lisIndices;
							for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1;
							for (i = end; i >= start; i--) {
								if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1);
								ve = vnodes[i];
								var oldIndex = map[ve.key];
								if (oldIndex != null) {
									pos = (oldIndex < pos) ? oldIndex : -1; // becomes -1 if nodes were re-ordered
									oldIndices[i-start] = oldIndex;
									oe = old[oldIndex];
									old[oldIndex] = null;
									if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
									if (ve.dom != null) nextSibling = ve.dom;
									matched++;
								}
							}
							nextSibling = originalNextSibling;
							if (matched !== oldEnd - oldStart + 1) removeNodes(parent, old, oldStart, oldEnd + 1);
							if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
							else {
								if (pos === -1) {
									// the indices of the indices of the items that are part of the
									// longest increasing subsequence in the oldIndices list
									lisIndices = makeLisIndices(oldIndices);
									li = lisIndices.length - 1;
									for (i = end; i >= start; i--) {
										v = vnodes[i];
										if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling);
										else {
											if (lisIndices[li] === i - start) li--;
											else moveDOM(parent, v, nextSibling);
										}
										if (v.dom != null) nextSibling = vnodes[i].dom;
									}
								} else {
									for (i = end; i >= start; i--) {
										v = vnodes[i];
										if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling);
										if (v.dom != null) nextSibling = vnodes[i].dom;
									}
								}
							}
						}
					}
				}
			}
			function updateNode(parent, old, vnode, hooks, nextSibling, ns) {
				var oldTag = old.tag, tag = vnode.tag;
				if (oldTag === tag) {
					vnode.state = old.state;
					vnode.events = old.events;
					if (shouldNotUpdate(vnode, old)) return
					if (typeof oldTag === "string") {
						if (vnode.attrs != null) {
							updateLifecycle(vnode.attrs, vnode, hooks);
						}
						switch (oldTag) {
							case "#": updateText(old, vnode); break
							case "<": updateHTML(parent, old, vnode, ns, nextSibling); break
							case "[": updateFragment(parent, old, vnode, hooks, nextSibling, ns); break
							default: updateElement(old, vnode, hooks, ns);
						}
					}
					else updateComponent(parent, old, vnode, hooks, nextSibling, ns);
				}
				else {
					removeNode(parent, old);
					createNode(parent, vnode, hooks, ns, nextSibling);
				}
			}
			function updateText(old, vnode) {
				if (old.children.toString() !== vnode.children.toString()) {
					old.dom.nodeValue = vnode.children;
				}
				vnode.dom = old.dom;
			}
			function updateHTML(parent, old, vnode, ns, nextSibling) {
				if (old.children !== vnode.children) {
					removeDOM(parent, old, undefined);
					createHTML(parent, vnode, ns, nextSibling);
				}
				else {
					vnode.dom = old.dom;
					vnode.domSize = old.domSize;
				}
			}
			function updateFragment(parent, old, vnode, hooks, nextSibling, ns) {
				updateNodes(parent, old.children, vnode.children, hooks, nextSibling, ns);
				var domSize = 0, children = vnode.children;
				vnode.dom = null;
				if (children != null) {
					for (var i = 0; i < children.length; i++) {
						var child = children[i];
						if (child != null && child.dom != null) {
							if (vnode.dom == null) vnode.dom = child.dom;
							domSize += child.domSize || 1;
						}
					}
					if (domSize !== 1) vnode.domSize = domSize;
				}
			}
			function updateElement(old, vnode, hooks, ns) {
				var element = vnode.dom = old.dom;
				ns = getNameSpace(vnode) || ns;

				updateAttrs(vnode, old.attrs, vnode.attrs, ns);
				if (!maybeSetContentEditable(vnode)) {
					updateNodes(element, old.children, vnode.children, hooks, null, ns);
				}
			}
			function updateComponent(parent, old, vnode, hooks, nextSibling, ns) {
				vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode));
				if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
				updateLifecycle(vnode.state, vnode, hooks);
				if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks);
				if (vnode.instance != null) {
					if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling);
					else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, ns);
					vnode.dom = vnode.instance.dom;
					vnode.domSize = vnode.instance.domSize;
				}
				else if (old.instance != null) {
					removeNode(parent, old.instance);
					vnode.dom = undefined;
					vnode.domSize = 0;
				}
				else {
					vnode.dom = old.dom;
					vnode.domSize = old.domSize;
				}
			}
			function getKeyMap(vnodes, start, end) {
				var map = Object.create(null);
				for (; start < end; start++) {
					var vnode = vnodes[start];
					if (vnode != null) {
						var key = vnode.key;
						if (key != null) map[key] = start;
					}
				}
				return map
			}
			// Lifted from ivi https://github.com/ivijs/ivi/
			// takes a list of unique numbers (-1 is special and can
			// occur multiple times) and returns an array with the indices
			// of the items that are part of the longest increasing
			// subsequence
			var lisTemp = [];
			function makeLisIndices(a) {
				var result = [0];
				var u = 0, v = 0, i = 0;
				var il = lisTemp.length = a.length;
				for (var i = 0; i < il; i++) lisTemp[i] = a[i];
				for (var i = 0; i < il; ++i) {
					if (a[i] === -1) continue
					var j = result[result.length - 1];
					if (a[j] < a[i]) {
						lisTemp[i] = j;
						result.push(i);
						continue
					}
					u = 0;
					v = result.length - 1;
					while (u < v) {
						// Fast integer average without overflow.
						// eslint-disable-next-line no-bitwise
						var c = (u >>> 1) + (v >>> 1) + (u & v & 1);
						if (a[result[c]] < a[i]) {
							u = c + 1;
						}
						else {
							v = c;
						}
					}
					if (a[i] < a[result[u]]) {
						if (u > 0) lisTemp[i] = result[u - 1];
						result[u] = i;
					}
				}
				u = result.length;
				v = result[u - 1];
				while (u-- > 0) {
					result[u] = v;
					v = lisTemp[v];
				}
				lisTemp.length = 0;
				return result
			}

			function getNextSibling(vnodes, i, nextSibling) {
				for (; i < vnodes.length; i++) {
					if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
				}
				return nextSibling
			}

			// This handles fragments with zombie children (removed from vdom, but persisted in DOM through onbeforeremove)
			function moveDOM(parent, vnode, nextSibling) {
				if (vnode.dom != null) {
					var target;
					if (vnode.domSize == null) {
						// don't allocate for the common case
						target = vnode.dom;
					} else {
						target = getDocument(parent).createDocumentFragment();
						for (var dom of domFor(vnode)) target.appendChild(dom);
					}
					insertDOM(parent, target, nextSibling);
				}
			}

			function insertDOM(parent, dom, nextSibling) {
				if (nextSibling != null) parent.insertBefore(dom, nextSibling);
				else parent.appendChild(dom);
			}

			function maybeSetContentEditable(vnode) {
				if (vnode.attrs == null || (
					vnode.attrs.contenteditable == null && // attribute
					vnode.attrs.contentEditable == null // property
				)) return false
				var children = vnode.children;
				if (children != null && children.length === 1 && children[0].tag === "<") {
					var content = children[0].children;
					if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content;
				}
				else if (children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted.")
				return true
			}

			//remove
			function removeNodes(parent, vnodes, start, end) {
				for (var i = start; i < end; i++) {
					var vnode = vnodes[i];
					if (vnode != null) removeNode(parent, vnode);
				}
			}
			function removeNode(parent, vnode) {
				var mask = 0;
				var original = vnode.state;
				var stateResult, attrsResult;
				if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeremove === "function") {
					var result = callHook.call(vnode.state.onbeforeremove, vnode);
					if (result != null && typeof result.then === "function") {
						mask = 1;
						stateResult = result;
					}
				}
				if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
					var result = callHook.call(vnode.attrs.onbeforeremove, vnode);
					if (result != null && typeof result.then === "function") {
						// eslint-disable-next-line no-bitwise
						mask |= 2;
						attrsResult = result;
					}
				}
				checkState(vnode, original);
				var generation;
				// If we can, try to fast-path it and avoid all the overhead of awaiting
				if (!mask) {
					onremove(vnode);
					removeDOM(parent, vnode, generation);
				} else {
					generation = currentRender;
					for (var dom of domFor(vnode)) delayedRemoval.set(dom, generation);
					if (stateResult != null) {
						stateResult.finally(function () {
							// eslint-disable-next-line no-bitwise
							if (mask & 1) {
								// eslint-disable-next-line no-bitwise
								mask &= 2;
								if (!mask) {
									checkState(vnode, original);
									onremove(vnode);
									removeDOM(parent, vnode, generation);
								}
							}
						});
					}
					if (attrsResult != null) {
						attrsResult.finally(function () {
							// eslint-disable-next-line no-bitwise
							if (mask & 2) {
								// eslint-disable-next-line no-bitwise
								mask &= 1;
								if (!mask) {
									checkState(vnode, original);
									onremove(vnode);
									removeDOM(parent, vnode, generation);
								}
							}
						});
					}
				}
			}
			function removeDOM(parent, vnode, generation) {
				if (vnode.dom == null) return
				if (vnode.domSize == null) {
					// don't allocate for the common case
					if (delayedRemoval.get(vnode.dom) === generation) parent.removeChild(vnode.dom);
				} else {
					for (var dom of domFor(vnode, {generation})) parent.removeChild(dom);
				}
			}

			function onremove(vnode) {
				if (typeof vnode.tag !== "string" && typeof vnode.state.onremove === "function") callHook.call(vnode.state.onremove, vnode);
				if (vnode.attrs && typeof vnode.attrs.onremove === "function") callHook.call(vnode.attrs.onremove, vnode);
				if (typeof vnode.tag !== "string") {
					if (vnode.instance != null) onremove(vnode.instance);
				} else {
					var children = vnode.children;
					if (Array.isArray(children)) {
						for (var i = 0; i < children.length; i++) {
							var child = children[i];
							if (child != null) onremove(child);
						}
					}
				}
			}

			//attrs
			function setAttrs(vnode, attrs, ns) {
				for (var key in attrs) {
					setAttr(vnode, key, null, attrs[key], ns);
				}
			}
			function setAttr(vnode, key, old, value, ns) {
				if (key === "key" || key === "is" || value == null || isLifecycleMethod(key) || (old === value && !isFormAttribute(vnode, key)) && typeof value !== "object") return
				if (key[0] === "o" && key[1] === "n") return updateEvent(vnode, key, value)
				if (key.slice(0, 6) === "xlink:") vnode.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value);
				else if (key === "style") updateStyle(vnode.dom, old, value);
				else if (hasPropertyKey(vnode, key, ns)) {
					if (key === "value") {
						// Only do the coercion if we're actually going to check the value.
						/* eslint-disable no-implicit-coercion */
						var isFileInput = vnode.tag === "input" && vnode.attrs.type === "file";
						//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
						//setting input[type=file][value] to same value causes an error to be generated if it's non-empty
						if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === "" + value && (isFileInput || vnode.dom === activeElement(vnode.dom))) return
						//setting select[value] to same value while having select open blinks select dropdown in Chrome
						if (vnode.tag === "select" && old !== null && vnode.dom.value === "" + value) return
						//setting option[value] to same value while having select open blinks select dropdown in Chrome
						if (vnode.tag === "option" && old !== null && vnode.dom.value === "" + value) return
						//setting input[type=file][value] to different value is an error if it's non-empty
						// Not ideal, but it at least works around the most common source of uncaught exceptions for now.
						if (isFileInput && "" + value !== "") { console.error("`value` is read-only on file inputs!"); return }
						/* eslint-enable no-implicit-coercion */
					}
					// If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
					if (vnode.tag === "input" && key === "type") vnode.dom.setAttribute(key, value);
					else vnode.dom[key] = value;
				} else {
					if (typeof value === "boolean") {
						if (value) vnode.dom.setAttribute(key, "");
						else vnode.dom.removeAttribute(key);
					}
					else vnode.dom.setAttribute(key === "className" ? "class" : key, value);
				}
			}
			function removeAttr(vnode, key, old, ns) {
				if (key === "key" || key === "is" || old == null || isLifecycleMethod(key)) return
				if (key[0] === "o" && key[1] === "n") updateEvent(vnode, key, undefined);
				else if (key === "style") updateStyle(vnode.dom, old, null);
				else if (
					hasPropertyKey(vnode, key, ns)
					&& key !== "className"
					&& key !== "title" // creates "null" as title
					&& !(key === "value" && (
						vnode.tag === "option"
						|| vnode.tag === "select" && vnode.dom.selectedIndex === -1 && vnode.dom === activeElement(vnode.dom)
					))
					&& !(vnode.tag === "input" && key === "type")
				) {
					vnode.dom[key] = null;
				} else {
					var nsLastIndex = key.indexOf(":");
					if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1);
					if (old !== false) vnode.dom.removeAttribute(key === "className" ? "class" : key);
				}
			}
			function setLateSelectAttrs(vnode, attrs) {
				if ("value" in attrs) {
					if(attrs.value === null) {
						if (vnode.dom.selectedIndex !== -1) vnode.dom.value = null;
					} else {
						var normalized = "" + attrs.value; // eslint-disable-line no-implicit-coercion
						if (vnode.dom.value !== normalized || vnode.dom.selectedIndex === -1) {
							vnode.dom.value = normalized;
						}
					}
				}
				if ("selectedIndex" in attrs) setAttr(vnode, "selectedIndex", null, attrs.selectedIndex, undefined);
			}
			function updateAttrs(vnode, old, attrs, ns) {
				if (old && old === attrs) {
					console.warn("Don't reuse attrs object, use new object for every redraw, this will throw in next major");
				}
				if (attrs != null) {
					for (var key in attrs) {
						setAttr(vnode, key, old && old[key], attrs[key], ns);
					}
				}
				var val;
				if (old != null) {
					for (var key in old) {
						if (((val = old[key]) != null) && (attrs == null || attrs[key] == null)) {
							removeAttr(vnode, key, val, ns);
						}
					}
				}
			}
			function isFormAttribute(vnode, attr) {
				return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === activeElement(vnode.dom) || vnode.tag === "option" && vnode.dom.parentNode === activeElement(vnode.dom)
			}
			function isLifecycleMethod(attr) {
				return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
			}
			function hasPropertyKey(vnode, key, ns) {
				// Filter out namespaced keys
				return ns === undefined && (
					// If it's a custom element, just keep it.
					vnode.tag.indexOf("-") > -1 || vnode.attrs != null && vnode.attrs.is ||
					// If it's a normal element, let's try to avoid a few browser bugs.
					key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height"// && key !== "type"
					// Defer the property check until *after* we check everything.
				) && key in vnode.dom
			}

			//style
			function updateStyle(element, old, style) {
				if (old === style) ; else if (style == null) {
					// New style is missing, just clear it.
					element.style = "";
				} else if (typeof style !== "object") {
					// New style is a string, let engine deal with patching.
					element.style = style;
				} else if (old == null || typeof old !== "object") {
					// `old` is missing or a string, `style` is an object.
					element.style.cssText = "";
					// Add new style properties
					for (var key in style) {
						var value = style[key];
						if (value != null) {
							if (key.includes("-")) element.style.setProperty(key, String(value));
							else element.style[key] = String(value);
						}
					}
				} else {
					// Both old & new are (different) objects.
					// Update style properties that have changed
					for (var key in style) {
						var value = style[key];
						if (value != null && (value = String(value)) !== String(old[key])) {
							if (key.includes("-")) element.style.setProperty(key, value);
							else element.style[key] = value;
						}
					}
					// Remove style properties that no longer exist
					for (var key in old) {
						if (old[key] != null && style[key] == null) {
							if (key.includes("-")) element.style.removeProperty(key);
							else element.style[key] = "";
						}
					}
				}
			}

			// Here's an explanation of how this works:
			// 1. The event names are always (by design) prefixed by `on`.
			// 2. The EventListener interface accepts either a function or an object
			//    with a `handleEvent` method.
			// 3. The object does not inherit from `Object.prototype`, to avoid
			//    any potential interference with that (e.g. setters).
			// 4. The event name is remapped to the handler before calling it.
			// 5. In function-based event handlers, `ev.target === this`. We replicate
			//    that below.
			// 6. In function-based event handlers, `return false` prevents the default
			//    action and stops event propagation. We replicate that below.
			function EventDict() {
				// Save this, so the current redraw is correctly tracked.
				this._ = currentRedraw;
			}
			EventDict.prototype = Object.create(null);
			EventDict.prototype.handleEvent = function (ev) {
				var handler = this["on" + ev.type];
				var result;
				if (typeof handler === "function") result = handler.call(ev.currentTarget, ev);
				else if (typeof handler.handleEvent === "function") handler.handleEvent(ev);
				if (this._ && ev.redraw !== false) (0, this._)();
				if (result === false) {
					ev.preventDefault();
					ev.stopPropagation();
				}
			};

			//event
			function updateEvent(vnode, key, value) {
				if (vnode.events != null) {
					vnode.events._ = currentRedraw;
					if (vnode.events[key] === value) return
					if (value != null && (typeof value === "function" || typeof value === "object")) {
						if (vnode.events[key] == null) vnode.dom.addEventListener(key.slice(2), vnode.events, false);
						vnode.events[key] = value;
					} else {
						if (vnode.events[key] != null) vnode.dom.removeEventListener(key.slice(2), vnode.events, false);
						vnode.events[key] = undefined;
					}
				} else if (value != null && (typeof value === "function" || typeof value === "object")) {
					vnode.events = new EventDict();
					vnode.dom.addEventListener(key.slice(2), vnode.events, false);
					vnode.events[key] = value;
				}
			}

			//lifecycle
			function initLifecycle(source, vnode, hooks) {
				if (typeof source.oninit === "function") callHook.call(source.oninit, vnode);
				if (typeof source.oncreate === "function") hooks.push(callHook.bind(source.oncreate, vnode));
			}
			function updateLifecycle(source, vnode, hooks) {
				if (typeof source.onupdate === "function") hooks.push(callHook.bind(source.onupdate, vnode));
			}
			function shouldNotUpdate(vnode, old) {
				do {
					if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") {
						var force = callHook.call(vnode.attrs.onbeforeupdate, vnode, old);
						if (force !== undefined && !force) break
					}
					if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeupdate === "function") {
						var force = callHook.call(vnode.state.onbeforeupdate, vnode, old);
						if (force !== undefined && !force) break
					}
					return false
				} while (false); // eslint-disable-line no-constant-condition
				vnode.dom = old.dom;
				vnode.domSize = old.domSize;
				vnode.instance = old.instance;
				// One would think having the actual latest attributes would be ideal,
				// but it doesn't let us properly diff based on our current internal
				// representation. We have to save not only the old DOM info, but also
				// the attributes used to create it, as we diff *that*, not against the
				// DOM directly (with a few exceptions in `setAttr`). And, of course, we
				// need to save the children and text as they are conceptually not
				// unlike special "attributes" internally.
				vnode.attrs = old.attrs;
				vnode.children = old.children;
				vnode.text = old.text;
				return true
			}

			var currentDOM;

			return function(dom, vnodes, redraw) {
				if (!dom) throw new TypeError("DOM element being rendered to does not exist.")
				if (currentDOM != null && dom.contains(currentDOM)) {
					throw new TypeError("Node is currently being rendered to and thus is locked.")
				}
				var prevRedraw = currentRedraw;
				var prevDOM = currentDOM;
				var hooks = [];
				var active = activeElement(dom);
				var namespace = dom.namespaceURI;

				currentDOM = dom;
				currentRedraw = typeof redraw === "function" ? redraw : undefined;
				currentRender = {};
				try {
					// First time rendering into a node clears it out
					if (dom.vnodes == null) dom.textContent = "";
					vnodes = Vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes]);
					updateNodes(dom, dom.vnodes, vnodes, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace);
					dom.vnodes = vnodes;
					// `document.activeElement` can return null: https://html.spec.whatwg.org/multipage/interaction.html#dom-document-activeelement
					if (active != null && activeElement(dom) !== active && typeof active.focus === "function") active.focus();
					for (var i = 0; i < hooks.length; i++) hooks[i]();
				} finally {
					currentRedraw = prevRedraw;
					currentDOM = prevDOM;
				}
			}
		};
		return render$1;
	}

	var render;
	var hasRequiredRender;

	function requireRender () {
		if (hasRequiredRender) return render;
		hasRequiredRender = 1;

		render = requireRender$1()(typeof window !== "undefined" ? window : null);
		return render;
	}

	var mountRedraw$1;
	var hasRequiredMountRedraw$1;

	function requireMountRedraw$1 () {
		if (hasRequiredMountRedraw$1) return mountRedraw$1;
		hasRequiredMountRedraw$1 = 1;

		var Vnode = requireVnode();

		mountRedraw$1 = function(render, schedule, console) {
			var subscriptions = [];
			var pending = false;
			var offset = -1;

			function sync() {
				for (offset = 0; offset < subscriptions.length; offset += 2) {
					try { render(subscriptions[offset], Vnode(subscriptions[offset + 1]), redraw); }
					catch (e) { console.error(e); }
				}
				offset = -1;
			}

			function redraw() {
				if (!pending) {
					pending = true;
					schedule(function() {
						pending = false;
						sync();
					});
				}
			}

			redraw.sync = sync;

			function mount(root, component) {
				if (component != null && component.view == null && typeof component !== "function") {
					throw new TypeError("m.mount expects a component, not a vnode.")
				}

				var index = subscriptions.indexOf(root);
				if (index >= 0) {
					subscriptions.splice(index, 2);
					if (index <= offset) offset -= 2;
					render(root, []);
				}

				if (component != null) {
					subscriptions.push(root, component);
					render(root, Vnode(component), redraw);
				}
			}

			return {mount: mount, redraw: redraw}
		};
		return mountRedraw$1;
	}

	var mountRedraw;
	var hasRequiredMountRedraw;

	function requireMountRedraw () {
		if (hasRequiredMountRedraw) return mountRedraw;
		hasRequiredMountRedraw = 1;

		var render = requireRender();

		mountRedraw = requireMountRedraw$1()(render, typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : null, typeof console !== "undefined" ? console : null);
		return mountRedraw;
	}

	var build$1;
	var hasRequiredBuild$1;

	function requireBuild$1 () {
		if (hasRequiredBuild$1) return build$1;
		hasRequiredBuild$1 = 1;

		build$1 = function(object) {
			if (Object.prototype.toString.call(object) !== "[object Object]") return ""

			var args = [];
			for (var key in object) {
				destructure(key, object[key]);
			}

			return args.join("&")

			function destructure(key, value) {
				if (Array.isArray(value)) {
					for (var i = 0; i < value.length; i++) {
						destructure(key + "[" + i + "]", value[i]);
					}
				}
				else if (Object.prototype.toString.call(value) === "[object Object]") {
					for (var i in value) {
						destructure(key + "[" + i + "]", value[i]);
					}
				}
				else args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""));
			}
		};
		return build$1;
	}

	var build;
	var hasRequiredBuild;

	function requireBuild () {
		if (hasRequiredBuild) return build;
		hasRequiredBuild = 1;

		var buildQueryString = requireBuild$1();

		// Returns `path` from `template` + `params`
		build = function(template, params) {
			if ((/:([^\/\.-]+)(\.{3})?:/).test(template)) {
				throw new SyntaxError("Template parameter names must be separated by either a '/', '-', or '.'.")
			}
			if (params == null) return template
			var queryIndex = template.indexOf("?");
			var hashIndex = template.indexOf("#");
			var queryEnd = hashIndex < 0 ? template.length : hashIndex;
			var pathEnd = queryIndex < 0 ? queryEnd : queryIndex;
			var path = template.slice(0, pathEnd);
			var query = {};

			Object.assign(query, params);

			var resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, function(m, key, variadic) {
				delete query[key];
				// If no such parameter exists, don't interpolate it.
				if (params[key] == null) return m
				// Escape normal parameters, but not variadic ones.
				return variadic ? params[key] : encodeURIComponent(String(params[key]))
			});

			// In case the template substitution adds new query/hash parameters.
			var newQueryIndex = resolved.indexOf("?");
			var newHashIndex = resolved.indexOf("#");
			var newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex;
			var newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex;
			var result = resolved.slice(0, newPathEnd);

			if (queryIndex >= 0) result += template.slice(queryIndex, queryEnd);
			if (newQueryIndex >= 0) result += (queryIndex < 0 ? "?" : "&") + resolved.slice(newQueryIndex, newQueryEnd);
			var querystring = buildQueryString(query);
			if (querystring) result += (queryIndex < 0 && newQueryIndex < 0 ? "?" : "&") + querystring;
			if (hashIndex >= 0) result += template.slice(hashIndex);
			if (newHashIndex >= 0) result += (hashIndex < 0 ? "" : "&") + resolved.slice(newHashIndex);
			return result
		};
		return build;
	}

	var request$1;
	var hasRequiredRequest$1;

	function requireRequest$1 () {
		if (hasRequiredRequest$1) return request$1;
		hasRequiredRequest$1 = 1;

		var buildPathname = requireBuild();
		var hasOwn = requireHasOwn();

		request$1 = function($window, oncompletion) {
			function PromiseProxy(executor) {
				return new Promise(executor)
			}

			function makeRequest(url, args) {
				return new Promise(function(resolve, reject) {
					url = buildPathname(url, args.params);
					var method = args.method != null ? args.method.toUpperCase() : "GET";
					var body = args.body;
					var assumeJSON = (args.serialize == null || args.serialize === JSON.serialize) && !(body instanceof $window.FormData || body instanceof $window.URLSearchParams);
					var responseType = args.responseType || (typeof args.extract === "function" ? "" : "json");

					var xhr = new $window.XMLHttpRequest(), aborted = false, isTimeout = false;
					var original = xhr, replacedAbort;
					var abort = xhr.abort;

					xhr.abort = function() {
						aborted = true;
						abort.call(this);
					};

					xhr.open(method, url, args.async !== false, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined);

					if (assumeJSON && body != null && !hasHeader(args, "content-type")) {
						xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
					}
					if (typeof args.deserialize !== "function" && !hasHeader(args, "accept")) {
						xhr.setRequestHeader("Accept", "application/json, text/*");
					}
					if (args.withCredentials) xhr.withCredentials = args.withCredentials;
					if (args.timeout) xhr.timeout = args.timeout;
					xhr.responseType = responseType;

					for (var key in args.headers) {
						if (hasOwn.call(args.headers, key)) {
							xhr.setRequestHeader(key, args.headers[key]);
						}
					}

					xhr.onreadystatechange = function(ev) {
						// Don't throw errors on xhr.abort().
						if (aborted) return

						if (ev.target.readyState === 4) {
							try {
								var success = (ev.target.status >= 200 && ev.target.status < 300) || ev.target.status === 304 || (/^file:\/\//i).test(url);
								// When the response type isn't "" or "text",
								// `xhr.responseText` is the wrong thing to use.
								// Browsers do the right thing and throw here, and we
								// should honor that and do the right thing by
								// preferring `xhr.response` where possible/practical.
								var response = ev.target.response, message;

								if (responseType === "json") {
									// For IE and Edge, which don't implement
									// `responseType: "json"`.
									if (!ev.target.responseType && typeof args.extract !== "function") {
										// Handle no-content which will not parse.
										try { response = JSON.parse(ev.target.responseText); }
										catch (e) { response = null; }
									}
								} else if (!responseType || responseType === "text") {
									// Only use this default if it's text. If a parsed
									// document is needed on old IE and friends (all
									// unsupported), the user should use a custom
									// `config` instead. They're already using this at
									// their own risk.
									if (response == null) response = ev.target.responseText;
								}

								if (typeof args.extract === "function") {
									response = args.extract(ev.target, args);
									success = true;
								} else if (typeof args.deserialize === "function") {
									response = args.deserialize(response);
								}

								if (success) {
									if (typeof args.type === "function") {
										if (Array.isArray(response)) {
											for (var i = 0; i < response.length; i++) {
												response[i] = new args.type(response[i]);
											}
										}
										else response = new args.type(response);
									}
									resolve(response);
								}
								else {
									var completeErrorResponse = function() {
										try { message = ev.target.responseText; }
										catch (e) { message = response; }
										var error = new Error(message);
										error.code = ev.target.status;
										error.response = response;
										reject(error);
									};

									if (xhr.status === 0) {
										// Use setTimeout to push this code block onto the event queue
										// This allows `xhr.ontimeout` to run in the case that there is a timeout
										// Without this setTimeout, `xhr.ontimeout` doesn't have a chance to reject
										// as `xhr.onreadystatechange` will run before it
										setTimeout(function() {
											if (isTimeout) return
											completeErrorResponse();
										});
									} else completeErrorResponse();
								}
							}
							catch (e) {
								reject(e);
							}
						}
					};

					xhr.ontimeout = function (ev) {
						isTimeout = true;
						var error = new Error("Request timed out");
						error.code = ev.target.status;
						reject(error);
					};

					if (typeof args.config === "function") {
						xhr = args.config(xhr, args, url) || xhr;

						// Propagate the `abort` to any replacement XHR as well.
						if (xhr !== original) {
							replacedAbort = xhr.abort;
							xhr.abort = function() {
								aborted = true;
								replacedAbort.call(this);
							};
						}
					}

					if (body == null) xhr.send();
					else if (typeof args.serialize === "function") xhr.send(args.serialize(body));
					else if (body instanceof $window.FormData || body instanceof $window.URLSearchParams) xhr.send(body);
					else xhr.send(JSON.stringify(body));
				})
			}

			// In case the global Promise is some userland library's where they rely on
			// `foo instanceof this.constructor`, `this.constructor.resolve(value)`, or
			// similar. Let's *not* break them.
			PromiseProxy.prototype = Promise.prototype;
			PromiseProxy.__proto__ = Promise; // eslint-disable-line no-proto

			function hasHeader(args, name) {
				for (var key in args.headers) {
					if (hasOwn.call(args.headers, key) && key.toLowerCase() === name) return true
				}
				return false
			}

			return {
				request: function(url, args) {
					if (typeof url !== "string") { args = url; url = url.url; }
					else if (args == null) args = {};
					var promise = makeRequest(url, args);
					if (args.background === true) return promise
					var count = 0;
					function complete() {
						if (--count === 0 && typeof oncompletion === "function") oncompletion();
					}

					return wrap(promise)

					function wrap(promise) {
						var then = promise.then;
						// Set the constructor, so engines know to not await or resolve
						// this as a native promise. At the time of writing, this is
						// only necessary for V8, but their behavior is the correct
						// behavior per spec. See this spec issue for more details:
						// https://github.com/tc39/ecma262/issues/1577. Also, see the
						// corresponding comment in `request/tests/test-request.js` for
						// a bit more background on the issue at hand.
						promise.constructor = PromiseProxy;
						promise.then = function() {
							count++;
							var next = then.apply(promise, arguments);
							next.then(complete, function(e) {
								complete();
								if (count === 0) throw e
							});
							return wrap(next)
						};
						return promise
					}
				}
			}
		};
		return request$1;
	}

	var request;
	var hasRequiredRequest;

	function requireRequest () {
		if (hasRequiredRequest) return request;
		hasRequiredRequest = 1;

		var mountRedraw = requireMountRedraw();

		request = requireRequest$1()(typeof window !== "undefined" ? window : null, mountRedraw.redraw);
		return request;
	}

	var parse$1;
	var hasRequiredParse$1;

	function requireParse$1 () {
		if (hasRequiredParse$1) return parse$1;
		hasRequiredParse$1 = 1;

		function decodeURIComponentSave(str) {
			try {
				return decodeURIComponent(str)
			} catch(err) {
				return str
			}
		}

		parse$1 = function(string) {
			if (string === "" || string == null) return {}
			if (string.charAt(0) === "?") string = string.slice(1);

			var entries = string.split("&"), counters = {}, data = {};
			for (var i = 0; i < entries.length; i++) {
				var entry = entries[i].split("=");
				var key = decodeURIComponentSave(entry[0]);
				var value = entry.length === 2 ? decodeURIComponentSave(entry[1]) : "";

				if (value === "true") value = true;
				else if (value === "false") value = false;

				var levels = key.split(/\]\[?|\[/);
				var cursor = data;
				if (key.indexOf("[") > -1) levels.pop();
				for (var j = 0; j < levels.length; j++) {
					var level = levels[j], nextLevel = levels[j + 1];
					var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10));
					if (level === "") {
						var key = levels.slice(0, j).join();
						if (counters[key] == null) {
							counters[key] = Array.isArray(cursor) ? cursor.length : 0;
						}
						level = counters[key]++;
					}
					// Disallow direct prototype pollution
					else if (level === "__proto__") break
					if (j === levels.length - 1) cursor[level] = value;
					else {
						// Read own properties exclusively to disallow indirect
						// prototype pollution
						var desc = Object.getOwnPropertyDescriptor(cursor, level);
						if (desc != null) desc = desc.value;
						if (desc == null) cursor[level] = desc = isNumber ? [] : {};
						cursor = desc;
					}
				}
			}
			return data
		};
		return parse$1;
	}

	var parse;
	var hasRequiredParse;

	function requireParse () {
		if (hasRequiredParse) return parse;
		hasRequiredParse = 1;

		var parseQueryString = requireParse$1();

		// Returns `{path, params}` from `url`
		parse = function(url) {
			var queryIndex = url.indexOf("?");
			var hashIndex = url.indexOf("#");
			var queryEnd = hashIndex < 0 ? url.length : hashIndex;
			var pathEnd = queryIndex < 0 ? queryEnd : queryIndex;
			var path = url.slice(0, pathEnd).replace(/\/{2,}/g, "/");

			if (!path) path = "/";
			else {
				if (path[0] !== "/") path = "/" + path;
			}
			return {
				path: path,
				params: queryIndex < 0
					? {}
					: parseQueryString(url.slice(queryIndex + 1, queryEnd)),
			}
		};
		return parse;
	}

	var compileTemplate;
	var hasRequiredCompileTemplate;

	function requireCompileTemplate () {
		if (hasRequiredCompileTemplate) return compileTemplate;
		hasRequiredCompileTemplate = 1;

		var parsePathname = requireParse();

		// Compiles a template into a function that takes a resolved path (without query
		// strings) and returns an object containing the template parameters with their
		// parsed values. This expects the input of the compiled template to be the
		// output of `parsePathname`. Note that it does *not* remove query parameters
		// specified in the template.
		compileTemplate = function(template) {
			var templateData = parsePathname(template);
			var templateKeys = Object.keys(templateData.params);
			var keys = [];
			var regexp = new RegExp("^" + templateData.path.replace(
				// I escape literal text so people can use things like `:file.:ext` or
				// `:lang-:locale` in routes. This is all merged into one pass so I
				// don't also accidentally escape `-` and make it harder to detect it to
				// ban it from template parameters.
				/:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g,
				function(m, key, extra) {
					if (key == null) return "\\" + m
					keys.push({k: key, r: extra === "..."});
					if (extra === "...") return "(.*)"
					if (extra === ".") return "([^/]+)\\."
					return "([^/]+)" + (extra || "")
				}
			) + "$");
			return function(data) {
				// First, check the params. Usually, there isn't any, and it's just
				// checking a static set.
				for (var i = 0; i < templateKeys.length; i++) {
					if (templateData.params[templateKeys[i]] !== data.params[templateKeys[i]]) return false
				}
				// If no interpolations exist, let's skip all the ceremony
				if (!keys.length) return regexp.test(data.path)
				var values = regexp.exec(data.path);
				if (values == null) return false
				for (var i = 0; i < keys.length; i++) {
					data.params[keys[i].k] = keys[i].r ? values[i + 1] : decodeURIComponent(values[i + 1]);
				}
				return true
			}
		};
		return compileTemplate;
	}

	var censor;
	var hasRequiredCensor;

	function requireCensor () {
		if (hasRequiredCensor) return censor;
		hasRequiredCensor = 1;

		// Note: this is mildly perf-sensitive.
		//
		// It does *not* use `delete` - dynamic `delete`s usually cause objects to bail
		// out into dictionary mode and just generally cause a bunch of optimization
		// issues within engines.
		//
		// Ideally, I would've preferred to do this, if it weren't for the optimization
		// issues:
		//
		// ```js
		// const hasOwn = require("./hasOwn")
		// const magic = [
		//     "key", "oninit", "oncreate", "onbeforeupdate", "onupdate",
		//     "onbeforeremove", "onremove",
		// ]
		// module.exports = (attrs, extras) => {
		//     const result = Object.assign(Object.create(null), attrs)
		//     for (const key of magic) delete result[key]
		//     if (extras != null) for (const key of extras) delete result[key]
		//     return result
		// }
		// ```

		var hasOwn = requireHasOwn();
		// Words in RegExp literals are sometimes mangled incorrectly by the internal bundler, so use RegExp().
		var magic = new RegExp("^(?:key|oninit|oncreate|onbeforeupdate|onupdate|onbeforeremove|onremove)$");

		censor = function(attrs, extras) {
			var result = {};

			if (extras != null) {
				for (var key in attrs) {
					if (hasOwn.call(attrs, key) && !magic.test(key) && extras.indexOf(key) < 0) {
						result[key] = attrs[key];
					}
				}
			} else {
				for (var key in attrs) {
					if (hasOwn.call(attrs, key) && !magic.test(key)) {
						result[key] = attrs[key];
					}
				}
			}

			return result
		};
		return censor;
	}

	var router;
	var hasRequiredRouter;

	function requireRouter () {
		if (hasRequiredRouter) return router;
		hasRequiredRouter = 1;

		var Vnode = requireVnode();
		var m = requireHyperscript$1();

		var buildPathname = requireBuild();
		var parsePathname = requireParse();
		var compileTemplate = requireCompileTemplate();
		var censor = requireCensor();

		var sentinel = {};

		function decodeURIComponentSave(component) {
			try {
				return decodeURIComponent(component)
			} catch(e) {
				return component
			}
		}

		router = function($window, mountRedraw) {
			var callAsync = $window == null
				// In case Mithril.js' loaded globally without the DOM, let's not break
				? null
				: typeof $window.setImmediate === "function" ? $window.setImmediate : $window.setTimeout;
			var p = Promise.resolve();

			var scheduled = false;

			// state === 0: init
			// state === 1: scheduled
			// state === 2: done
			var ready = false;
			var state = 0;

			var compiled, fallbackRoute;

			var currentResolver = sentinel, component, attrs, currentPath, lastUpdate;

			var RouterRoot = {
				onbeforeupdate: function() {
					state = state ? 2 : 1;
					return !(!state || sentinel === currentResolver)
				},
				onremove: function() {
					$window.removeEventListener("popstate", fireAsync, false);
					$window.removeEventListener("hashchange", resolveRoute, false);
				},
				view: function() {
					if (!state || sentinel === currentResolver) return
					// Wrap in a fragment to preserve existing key semantics
					var vnode = [Vnode(component, attrs.key, attrs)];
					if (currentResolver) vnode = currentResolver.render(vnode[0]);
					return vnode
				},
			};

			var SKIP = route.SKIP = {};

			function resolveRoute() {
				scheduled = false;
				// Consider the pathname holistically. The prefix might even be invalid,
				// but that's not our problem.
				var prefix = $window.location.hash;
				if (route.prefix[0] !== "#") {
					prefix = $window.location.search + prefix;
					if (route.prefix[0] !== "?") {
						prefix = $window.location.pathname + prefix;
						if (prefix[0] !== "/") prefix = "/" + prefix;
					}
				}
				// This seemingly useless `.concat()` speeds up the tests quite a bit,
				// since the representation is consistently a relatively poorly
				// optimized cons string.
				var path = prefix.concat()
					.replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponentSave)
					.slice(route.prefix.length);
				var data = parsePathname(path);

				Object.assign(data.params, $window.history.state);

				function reject(e) {
					console.error(e);
					setPath(fallbackRoute, null, {replace: true});
				}

				loop(0);
				function loop(i) {
					// state === 0: init
					// state === 1: scheduled
					// state === 2: done
					for (; i < compiled.length; i++) {
						if (compiled[i].check(data)) {
							var payload = compiled[i].component;
							var matchedRoute = compiled[i].route;
							var localComp = payload;
							var update = lastUpdate = function(comp) {
								if (update !== lastUpdate) return
								if (comp === SKIP) return loop(i + 1)
								component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div";
								attrs = data.params, currentPath = path, lastUpdate = null;
								currentResolver = payload.render ? payload : null;
								if (state === 2) mountRedraw.redraw();
								else {
									state = 2;
									mountRedraw.redraw.sync();
								}
							};
							// There's no understating how much I *wish* I could
							// use `async`/`await` here...
							if (payload.view || typeof payload === "function") {
								payload = {};
								update(localComp);
							}
							else if (payload.onmatch) {
								p.then(function () {
									return payload.onmatch(data.params, path, matchedRoute)
								}).then(update, path === fallbackRoute ? null : reject);
							}
							else update("div");
							return
						}
					}

					if (path === fallbackRoute) {
						throw new Error("Could not resolve default route " + fallbackRoute + ".")
					}
					setPath(fallbackRoute, null, {replace: true});
				}
			}

			// Set it unconditionally so `m.route.set` and `m.route.Link` both work,
			// even if neither `pushState` nor `hashchange` are supported. It's
			// cleared if `hashchange` is used, since that makes it automatically
			// async.
			function fireAsync() {
				if (!scheduled) {
					scheduled = true;
					// TODO: just do `mountRedraw.redraw()` here and elide the timer
					// dependency. Note that this will muck with tests a *lot*, so it's
					// not as easy of a change as it sounds.
					callAsync(resolveRoute);
				}
			}

			function setPath(path, data, options) {
				path = buildPathname(path, data);
				if (ready) {
					fireAsync();
					var state = options ? options.state : null;
					var title = options ? options.title : null;
					if (options && options.replace) $window.history.replaceState(state, title, route.prefix + path);
					else $window.history.pushState(state, title, route.prefix + path);
				}
				else {
					$window.location.href = route.prefix + path;
				}
			}

			function route(root, defaultRoute, routes) {
				if (!root) throw new TypeError("DOM element being rendered to does not exist.")

				compiled = Object.keys(routes).map(function(route) {
					if (route[0] !== "/") throw new SyntaxError("Routes must start with a '/'.")
					if ((/:([^\/\.-]+)(\.{3})?:/).test(route)) {
						throw new SyntaxError("Route parameter names must be separated with either '/', '.', or '-'.")
					}
					return {
						route: route,
						component: routes[route],
						check: compileTemplate(route),
					}
				});
				fallbackRoute = defaultRoute;
				if (defaultRoute != null) {
					var defaultData = parsePathname(defaultRoute);

					if (!compiled.some(function (i) { return i.check(defaultData) })) {
						throw new ReferenceError("Default route doesn't match any known routes.")
					}
				}

				if (typeof $window.history.pushState === "function") {
					$window.addEventListener("popstate", fireAsync, false);
				} else if (route.prefix[0] === "#") {
					$window.addEventListener("hashchange", resolveRoute, false);
				}

				ready = true;
				mountRedraw.mount(root, RouterRoot);
				resolveRoute();
			}
			route.set = function(path, data, options) {
				if (lastUpdate != null) {
					options = options || {};
					options.replace = true;
				}
				lastUpdate = null;
				setPath(path, data, options);
			};
			route.get = function() {return currentPath};
			route.prefix = "#!";
			route.Link = {
				view: function(vnode) {
					// Omit the used parameters from the rendered element - they are
					// internal. Also, censor the various lifecycle methods.
					//
					// We don't strip the other parameters because for convenience we
					// let them be specified in the selector as well.
					var child = m(
						vnode.attrs.selector || "a",
						censor(vnode.attrs, ["options", "params", "selector", "onclick"]),
						vnode.children
					);
					var options, onclick, href;

					// Let's provide a *right* way to disable a route link, rather than
					// letting people screw up accessibility on accident.
					//
					// The attribute is coerced so users don't get surprised over
					// `disabled: 0` resulting in a button that's somehow routable
					// despite being visibly disabled.
					if (child.attrs.disabled = Boolean(child.attrs.disabled)) {
						child.attrs.href = null;
						child.attrs["aria-disabled"] = "true";
						// If you *really* do want add `onclick` on a disabled link, use
						// an `oncreate` hook to add it.
					} else {
						options = vnode.attrs.options;
						onclick = vnode.attrs.onclick;
						// Easier to build it now to keep it isomorphic.
						href = buildPathname(child.attrs.href, vnode.attrs.params);
						child.attrs.href = route.prefix + href;
						child.attrs.onclick = function(e) {
							var result;
							if (typeof onclick === "function") {
								result = onclick.call(e.currentTarget, e);
							} else if (onclick == null || typeof onclick !== "object") ; else if (typeof onclick.handleEvent === "function") {
								onclick.handleEvent(e);
							}

							// Adapted from React Router's implementation:
							// https://github.com/ReactTraining/react-router/blob/520a0acd48ae1b066eb0b07d6d4d1790a1d02482/packages/react-router-dom/modules/Link.js
							//
							// Try to be flexible and intuitive in how we handle links.
							// Fun fact: links aren't as obvious to get right as you
							// would expect. There's a lot more valid ways to click a
							// link than this, and one might want to not simply click a
							// link, but right click or command-click it to copy the
							// link target, etc. Nope, this isn't just for blind people.
							if (
								// Skip if `onclick` prevented default
								result !== false && !e.defaultPrevented &&
								// Ignore everything but left clicks
								(e.button === 0 || e.which === 0 || e.which === 1) &&
								// Let the browser handle `target=_blank`, etc.
								(!e.currentTarget.target || e.currentTarget.target === "_self") &&
								// No modifier keys
								!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
							) {
								e.preventDefault();
								e.redraw = false;
								route.set(href, null, options);
							}
						};
					}
					return child
				},
			};
			route.param = function(key) {
				return attrs && key != null ? attrs[key] : attrs
			};

			return route
		};
		return router;
	}

	var route;
	var hasRequiredRoute;

	function requireRoute () {
		if (hasRequiredRoute) return route;
		hasRequiredRoute = 1;

		var mountRedraw = requireMountRedraw();

		route = requireRouter()(typeof window !== "undefined" ? window : null, mountRedraw);
		return route;
	}

	var mithril;
	var hasRequiredMithril;

	function requireMithril () {
		if (hasRequiredMithril) return mithril;
		hasRequiredMithril = 1;

		var hyperscript = requireHyperscript();
		var request = requireRequest();
		var mountRedraw = requireMountRedraw();
		var domFor = requireDomFor();

		var m = function m() { return hyperscript.apply(this, arguments) };
		m.m = hyperscript;
		m.trust = hyperscript.trust;
		m.fragment = hyperscript.fragment;
		m.Fragment = "[";
		m.mount = mountRedraw.mount;
		m.route = requireRoute();
		m.render = requireRender();
		m.redraw = mountRedraw.redraw;
		m.request = request.request;
		m.parseQueryString = requireParse$1();
		m.buildQueryString = requireBuild$1();
		m.parsePathname = requireParse();
		m.buildPathname = requireBuild();
		m.vnode = requireVnode();
		m.censor = requireCensor();
		m.domFor = domFor.domFor;

		mithril = m;
		return mithril;
	}

	var mithrilExports = requireMithril();
	var m = /*@__PURE__*/getDefaultExportFromCjs(mithrilExports);

	const Header = {
	    view: () => m('nav', {
	        class: 'rounded-lg border overflow-hidden p-2 border-gray-400 mx-auto w-full max-w-screen-xl',
	    }, m('div', { class: 'flex items-center' }, [
	        m(m.route.Link, {
	            class: 'font-sans antialiased text-xl text-current mx-2 block py-1 font-semibold',
	            href: '/status',
	        }, 'UA Aggregation'),
	        m('div', { class: 'ml-auto mr-2 block' }, [
	            m('ul', {
	                class: 'm-2 flex flex-row gap-x-3 gap-y-1 m-0 items-center',
	            }, [
	                m('li', m(m.route.Link, {
	                    class: 'font-sans antialiased text-xl text-current p-1 hover:text-primary',
	                    href: '/status',
	                }, 'Status')),
	                m('li', m(m.route.Link, {
	                    class: 'font-sans antialiased text-xl text-current p-1 hover:text-primary',
	                    href: '/config/uaclient',
	                }, 'Config')),
	            ]),
	        ]),
	    ])),
	};

	const Footer = {
	    view: () => m('footer', {
	        class: 'rounded-lg border overflow-hidden p-2 border-gray-400 mx-auto w-full max-w-screen-xl',
	    }, m('p', { class: 'font-sans antialiased text-base text-current text-center' }, 'OPC UA Aggregation Client')),
	};

	const header = document.getElementById('header');
	const footer = document.getElementById('footer');
	const Layout = {
	    oninit: () => {
	        m.mount(header, Header);
	        m.mount(footer, Footer);
	    },
	    view: (vnode) => m('div', { class: 'w-full max-w-screen-xl' }, vnode.children),
	};

	/******************************************************************************
	Copyright (c) Microsoft Corporation.

	Permission to use, copy, modify, and/or distribute this software for any
	purpose with or without fee is hereby granted.

	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
	AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	PERFORMANCE OF THIS SOFTWARE.
	***************************************************************************** */
	/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


	function __awaiter(thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	}

	typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
	    var e = new Error(message);
	    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
	};

	const StatusTableRowComponent = {
	    view: (vnode) => {
	        var _a, _b, _c, _d;
	        return m('tr', { class: 'border-b border-gray-400 last:border-0' }, [
	            m('td', { class: 'p-3' }, (_a = vnode.attrs.status) === null || _a === undefined ? undefined : _a.sessionName),
	            m('td', { class: 'p-3' }, (_b = vnode.attrs.status) === null || _b === undefined ? undefined : _b.serverUri),
	            m('td', { class: 'p-3' }, (_c = vnode.attrs.status) === null || _c === undefined ? undefined : _c.connectError),
	            m('td', { class: 'p-3' }, m(m.route.Link, {
	                class: 'font-sans antialiased text-sm text-current font-medium hover:text-primary',
	                href: '/status/' + ((_d = vnode.attrs.status) === null || _d === undefined ? undefined : _d.id),
	            }, 'Details')),
	        ]);
	    },
	};
	const ClientStatusTableComponent = {
	    view: (vnode) => {
	        var _a;
	        return m('table', { class: 'w-full' }, [
	            m('thead', {
	                class: 'border-b border-gray-400 bg-gray-400 text-gray-900 text-sm font-medium',
	            }, [
	                m('tr', [
	                    m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Name'),
	                    m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Server Uri'),
	                    m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Connect Error'),
	                    m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Monitored Items'),
	                ]),
	            ]),
	            m('tbody', { class: 'group text-sm' }, (_a = vnode.attrs.statuses) === null || _a === undefined ? undefined : _a.map((status) => m(StatusTableRowComponent, { status }))),
	        ]);
	    },
	};

	const CardComponent = {
	    view: (vnode) => m('div', { class: 'm-2 p-2 overflow-hidden rounded-lg border border-gray-400' }, vnode.children),
	};

	const StatusPage = {
	    oninit: (vnode) => __awaiter(undefined, undefined, undefined, function* () { return yield vnode.attrs.statusModel.init(); }),
	    view: (vnode) => m('div', { class: 'flex flex-col' }, [
	        m(CardComponent, m(ClientStatusTableComponent, {
	            statuses: vnode.attrs.statusModel.list,
	        })),
	    ]),
	};

	const utils = {
	    formatTimestamp: (timestamp) => {
	        const date = new Date(timestamp);
	        const options = {
	            year: 'numeric',
	            month: 'short',
	            day: 'numeric',
	            hour: '2-digit',
	            minute: '2-digit',
	            second: '2-digit',
	        };
	        return date.toLocaleDateString('ru-RU', options);
	    },
	    formatStatusCode: (statusCode) => statusCode === 0 ? 'Good' : 'Bad',
	};

	const MonitoredItemRowComponent = {
	    view: (vnode) => m('tr', { class: 'border-b border-gray-400 last:border-0' }, [
	        m('td', { class: 'p-3' }, vnode.attrs.item.tagId),
	        m('td', { class: 'p-3' }, vnode.attrs.item.aggregationTag.value),
	        m('td', { class: 'p-3' }, utils.formatTimestamp(vnode.attrs.item.aggregationTag.timestamp)),
	        m('td', { class: 'p-3' }, utils.formatStatusCode(vnode.attrs.item.aggregationTag.statusCode)),
	    ]),
	};
	const MonitoredItemTableComponent = {
	    view: (vnode) => {
	        var _a;
	        return m('table', { class: 'w-full' }, [
	            m('thead', {
	                class: 'border-b border-gray-400 bg-gray-400 text-gray-900 text-sm font-medium',
	            }, m('tr', [
	                m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Node Id'),
	                m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Value'),
	                m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Timestamp'),
	                m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Quality'),
	            ])),
	            m('tbody', { class: 'group text-sm' }, (_a = vnode.attrs.items) === null || _a === undefined ? undefined : _a.map((item) => {
	                return m(MonitoredItemRowComponent, { item });
	            })),
	        ]);
	    },
	};

	const ClientStatusDetailsInfoComponent = {
	    view: (vnode) => {
	        var _a, _b, _c, _d;
	        return m('dl', { class: 'max-w-md divide-y divide-gray-400' }, [
	            m('div', { class: 'flex flex-col pb-3' }, [
	                m('dt', { class: 'mb-1 text-lg text-gray-400' }, 'Session ID: '),
	                m('dd', { class: 'text-lg font-semibold' }, (_a = vnode.attrs.status) === null || _a === undefined ? undefined : _a.id),
	            ]),
	            m('div', { class: 'flex flex-col pb-3' }, [
	                m('dt', { class: 'mb-1 text-lg text-gray-400' }, 'Session Name: '),
	                m('dd', { class: 'text-lg font-semibold' }, (_b = vnode.attrs.status) === null || _b === undefined ? undefined : _b.sessionName),
	            ]),
	            m('div', { class: 'flex flex-col pb-3' }, [
	                m('dt', { class: 'mb-1 text-lg text-gray-400' }, 'Session URI: '),
	                m('dd', { class: 'text-lg font-semibold' }, (_c = vnode.attrs.status) === null || _c === undefined ? undefined : _c.serverUri),
	            ]),
	            m('div', { class: 'flex flex-col pb-3' }, [
	                m('dt', { class: 'mb-1 text-lg text-gray-400' }, 'Connect Error: '),
	                m('dd', { class: 'text-lg font-semibold' }, (_d = vnode.attrs.status) === null || _d === undefined ? undefined : _d.connectError),
	            ]),
	        ]);
	    },
	};

	const StatusDetailsPage = {
	    oninit: (vnode) => __awaiter(undefined, undefined, undefined, function* () { return yield vnode.attrs.statusModel.load(vnode.attrs.id); }),
	    view: (vnode) => {
	        var _a;
	        return m('div', [
	            m('div', { class: 'flex flex-wrap' }, [
	                m(CardComponent, m(ClientStatusDetailsInfoComponent, {
	                    status: vnode.attrs.statusModel.current,
	                })),
	            ]),
	            m('div', { class: 'flex flex-col' }, [
	                m(CardComponent, m(MonitoredItemTableComponent, {
	                    items: (_a = vnode.attrs.statusModel.current) === null || _a === undefined ? undefined : _a.monitoredItems,
	                })),
	            ]),
	        ]);
	    },
	};

	const ConfigTableRowComponent = {
	    view: (vnode) => {
	        var _a, _b, _c, _d, _e;
	        return m('tr', { class: 'border-b border-gray-400 last:border-0' }, [
	            m('td', { class: 'p-3' }, (_a = vnode.attrs.config) === null || _a === undefined ? undefined : _a.sessionName),
	            m('td', { class: 'p-3' }, (_b = vnode.attrs.config) === null || _b === undefined ? undefined : _b.serverUri),
	            m('td', { class: 'p-3' }, (_c = vnode.attrs.config) === null || _c === undefined ? undefined : _c.description),
	            m('td', { class: 'p-3' }, ((_d = vnode.attrs.config) === null || _d === undefined ? undefined : _d.enabled) ? 'Enabled' : 'Disabled'),
	            m('td', { class: 'p-3' }, m(m.route.Link, {
	                class: 'font-sans antialiased text-sm text-current font-medium hover:text-primary',
	                href: '/config/uaclient/' + ((_e = vnode.attrs.config) === null || _e === undefined ? undefined : _e.id),
	            }, 'Details')),
	        ]);
	    },
	};
	const ClientConfigTableComponent = {
	    view: (vnode) => {
	        var _a;
	        return m('table', { class: 'w-full' }, [
	            m('thead', {
	                class: 'border-b border-gray-400 bg-gray-400 text-gray-900 text-sm font-medium',
	            }, [
	                m('tr', [
	                    m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Name'),
	                    m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Server Uri'),
	                    m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Description'),
	                    m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Enabled'),
	                    m('th', { class: 'px-2.5 py-2 text-start font-medium' }, 'Details'),
	                ]),
	            ]),
	            m('tbody', { class: 'group text-sm' }, (_a = vnode.attrs.configs) === null || _a === undefined ? undefined : _a.map((config) => m(ConfigTableRowComponent, { config }))),
	        ]);
	    },
	};

	const ConfigPage = {
	    oninit: (vnode) => __awaiter(undefined, undefined, undefined, function* () { return yield vnode.attrs.configModel.init(); }),
	    view: (vnode) => m('div', { class: 'flex flex-col' }, [
	        m(CardComponent, m(ClientConfigTableComponent, { configs: vnode.attrs.configModel.list })),
	    ]),
	};

	const ConfigDetailsPage = {
	    view: (vnode) => m('div', m('p', 'Config page for clients with id ' + vnode.attrs.key)),
	};

	class ClientStatusService {
	    constructor(_baseUrl = 'http://localhost:5000/api/aggregation/status') {
	        this._baseUrl = _baseUrl;
	    }
	    getClientStatuses() {
	        return __awaiter(this, undefined, undefined, function* () {
	            return yield m.request({
	                method: 'GET',
	                url: this._baseUrl,
	                withCredentials: true,
	            });
	        });
	    }
	    getClientStatus(id) {
	        return __awaiter(this, undefined, undefined, function* () {
	            return yield m.request({
	                method: 'GET',
	                url: this._baseUrl,
	                params: { sessionId: id },
	                withCredentials: true,
	            });
	        });
	    }
	}

	class StatusPageModel {
	    constructor(_service) {
	        this._service = _service;
	    }
	    init() {
	        return __awaiter(this, undefined, undefined, function* () {
	            this.list = yield this._service.getClientStatuses();
	        });
	    }
	    load(id) {
	        return __awaiter(this, undefined, undefined, function* () {
	            this.current = yield this._service.getClientStatus(id);
	        });
	    }
	}

	class ClientConfigService {
	    constructor(_baseUrl = 'http://localhost:5000/api/aggregation/config/') {
	        this._baseUrl = _baseUrl;
	    }
	    getClientConfigs() {
	        return __awaiter(this, undefined, undefined, function* () {
	            return yield m.request({
	                method: 'GET',
	                url: this._baseUrl + 'client',
	                withCredentials: true,
	            });
	        });
	    }
	    getClientConfig(id) {
	        return __awaiter(this, undefined, undefined, function* () {
	            return yield m.request({
	                method: 'GET',
	                url: this._baseUrl + 'client/' + id,
	                withCredentials: true,
	            });
	        });
	    }
	    getClientChannels(clientId) {
	        return __awaiter(this, undefined, undefined, function* () {
	            return yield m.request({
	                method: 'GET',
	                url: this._baseUrl + 'client/' + clientId + '/channel',
	            });
	        });
	    }
	    getChannel(id) {
	        return __awaiter(this, undefined, undefined, function* () {
	            return yield m.request({
	                method: 'GET',
	                url: this._baseUrl + 'client/channel/' + id,
	            });
	        });
	    }
	}

	class ConfigPageModel {
	    constructor(_service) {
	        this._service = _service;
	    }
	    init() {
	        return __awaiter(this, undefined, undefined, function* () {
	            this.list = yield this._service.getClientConfigs();
	        });
	    }
	    load(id) {
	        return __awaiter(this, undefined, undefined, function* () {
	            this.current = yield this._service.getClientConfig(id);
	        });
	    }
	    loadChannels() {
	        return __awaiter(this, undefined, undefined, function* () {
	            if (!this.current)
	                return;
	            this.current.channels = yield this._service.getClientChannels(this.current.id);
	        });
	    }
	}

	const content = document.getElementById('content');
	const statusService = new ClientStatusService('http://192.168.122.114:5000/api/aggregation/status');
	const statusModel = new StatusPageModel(statusService);
	const configService = new ClientConfigService('http://192.168.122.114:5000/api/aggregation/config/');
	const configModel = new ConfigPageModel(configService);
	const Routes = {
	    '/status': {
	        render: () => m(Layout, m(StatusPage, { statusModel })),
	    },
	    '/status/:key': {
	        render: (vnode) => m(Layout, m(StatusDetailsPage, {
	            statusModel,
	            id: vnode.attrs.key,
	        })),
	    },
	    '/config/uaclient': {
	        render: () => m(Layout, m(ConfigPage, { configModel })),
	    },
	    '/config/uaclient/:key': {
	        render: (vnode) => m(Layout, m(ConfigDetailsPage, vnode.attrs)),
	    },
	};
	m.route(content, '/status', Routes);

})();
