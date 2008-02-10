/* So how does this work?
 *
 * In the html-code you need to have 3 classes:
 *  - 'prefix'-trigger      (onclick target)
 *  - 'prefix'-icon         (the image that shows the state)
 *  - 'prefix'-object       (the node that is shown or hidden)
 *
 * The 'prefix' depends on the prefix you use, so you can have multiple
 * types of collapsables with different callbacks.
 *
 * Callbacks are called when the trigger is triggered. There are two callbacks:
 * one for collapsing and one for expanding.
 */
var sidebar_arrow_collapsed = new Image();
var sidebar_arrow_halfway = new Image();
var sidebar_arrow_expanded = new Image();

function setupCollapsables(docroot, prefix, collapseFun, expandFun) {
	var collapsables = collapsables_findClassNames(docroot, prefix + '-trigger');

	sidebar_arrow_collapsed.src = media_url + '/img/arrow-collapsed.png';
	sidebar_arrow_halfway.src = media_url + '/img/arrow-halfway.png';
	sidebar_arrow_expanded.src = media_url + '/img/arrow-expanded.png';

	for (var idx = 0; idx < collapsables.length; ++idx) {
		image = collapsables_getImage(prefix, collapsables[idx]);

		// if no image, assume not collapsable (sometimes needed for bootstrap)
		if (image && image.src) {
			if (image.src == sidebar_arrow_expanded.src) {
				collapsables[idx].onclick =
					function() { arrowCollapse(prefix, this, collapseFun, expandFun); }
				collapsables_collapse(prefix, collapsables[idx], false);
			} else {
				collapsables[idx].onclick =
					function() { arrowExpand(prefix, this, collapseFun, expandFun); }
				collapsables_collapse(prefix, collapsables[idx], true);
			}

			// prevent selecting trigger (looks ugly)
			collapsables[idx].onmousedown = function() { return false; }
			collapsables[idx].onselectstart = function() { return false; } // ie
		}
	}
}

function collapsables_findClassNames(node, classname)
{
	var classNodes = [];
	for (var idx = 0; idx < node.childNodes.length; ++idx) {
		if (node.childNodes[idx].className == classname)
			classNodes.push(node.childNodes[idx]);

		var nodes = collapsables_findClassNames(node.childNodes[idx], classname);
		classNodes = classNodes.concat(nodes);
	}

	return classNodes;
}

function collapsables_findFirstClassName(node, classname)
{
	classNodes = collapsables_findClassNames(node, classname);
	return classNodes[0];
}

function collapsables_getRoot(prefix, node)
{
	while (node.className != prefix)
		node = node.parentNode;

	return node;
}

function collapsables_getTrigger(prefix, node)
{
	var root = collapsables_getRoot(prefix, node);
	return collapsables_findFirstClassName(root, prefix + '-trigger');
}

function collapsables_getCollapsee(prefix, node)
{
	var root = collapsables_getRoot(prefix, node);
	return collapsables_findFirstClassName(root, prefix + '-object');
}

function collapsables_getImage(prefix, node)
{
	var root = collapsables_getRoot(prefix, node);
	return collapsables_findFirstClassName(root, prefix + '-icon');
}

function collapsables_isCollapsed(prefix, node)
{
	var image = collapsables_getImage(prefix, node);
	if (image.src == sidebar_arrow_collapsed.src)
		return true;

	return false;
}

function arrowCollapse(prefix, triggered, collapseFun, expandFun)
{
	arrowChange(prefix, triggered, true, collapseFun, expandFun);
}

function arrowExpand(prefix, triggered, collapseFun, expandFun)
{
	arrowChange(prefix, triggered, false, collapseFun, expandFun);
}

function arrowChange(prefix, triggered, collapse, collapseFun, expandFun)
{
	// animate image
	var image = collapsables_getImage(prefix, triggered);
	image.src = sidebar_arrow_halfway.src;
	if (collapse) {
		setTimeout(
			function() { image.src = sidebar_arrow_collapsed.src; }, 100);
	} else {
		setTimeout(
			function() { image.src = sidebar_arrow_expanded.src; }, 100);
	}
	collapsables_collapse(prefix, triggered, collapse);

	// triggered isn't necessarily the trigger itself, can be a
	// childnode, so get the real trigger node
	var trigger = collapsables_getTrigger(prefix, triggered);
	if (collapse) {
		if (collapseFun)
			collapseFun(trigger);

		trigger.onclick =
			function() { arrowExpand(prefix, this, collapseFun, expandFun); }
	} else {
		if (expandFun)
			expandFun(trigger);

		trigger.onclick =
			function() { arrowCollapse(prefix, this, collapseFun, expandFun); }
	}
}

function collapsables_collapse(prefix, triggered, collapse)
{
	// do the collapse
	var collapsee = collapsables_getCollapsee(prefix, triggered);
	if (collapse) {
		collapsee.style.display = 'none';
	} else {
		collapsee.style.display = '';
	}

	// force refresh on certain browsers
	root = collapsables_getRoot(prefix, triggered);
	root.style.display = 'none';
	root.style.display = '';
}

