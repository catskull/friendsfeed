var hideStoryPreference = true,
	hideFriendsFeedNewsVersion = null,
	newsFeedSelector = '._5pcb',
	storySelector = '._5jmm',
	storyHeaderSelector = '._1qbu',
	headerUserSelector = '._2s25',
	footerSelector = '#pagelet_rhc_footer',
	loggedUserHref = null;

chrome.storage.sync.get({
	hideStory: true,
	hideFriendsFeedNewsVersion: null
}, function(preferences) {
	hideStoryPreference = preferences.hideStory;
	hideFriendsFeedNewsVersion = preferences.hideFriendsFeedNewsVersion;
	clearExistingFeed();
	clearSidebar();
});

document.body.addEventListener('DOMNodeInserted', function(event) {
	clearNewStories(event);
});

if(document.querySelector(headerUserSelector) && document.querySelector(headerUserSelector).href) {
	loggedUserHref = document.querySelector('._2s25').href.replace(/\?.+/, '');
}

function clearExistingFeed() {
	var storyElements = document.querySelectorAll(storySelector);
	[].forEach.call(storyElements, function(storyElement) {
		processStory(storyElement);
	});
	// On load we hide News Feed, to prevent blick of unwanted stories
	// Now when first stories are filtered, we can show it
	// document.querySelector('#stream_pagelet').classList.add('show');
	appendStyle('#stream_pagelet ._5pcb { height:auto; overflow:auto; }');
}

function clearNewStories(event) {
	var storyElement = event.target.parentNode;
	processStory(storyElement);
}

function processStory(storyElement) {
	if(!isElement(storyElement)) { return; }
	if(!storyElement.classList.contains('_5jmm')) { return; }
	// Define story header selector
	if(storyElement.querySelector('._1qbu')) {
		storyHeaderSelector = '._1qbu';
	}
	if(storyElement.querySelector('._5g-l')) {
		storyHeaderSelector = '._5g-l';
	}
	// Story with header
	if(storyElement.querySelector(storyHeaderSelector)) {
		var linkElements = storyElement.querySelectorAll(storyHeaderSelector + ' a'),
			authorElement = storyElement.querySelector('.u_uvt3d3qku a'), //.profileLink
			authorElements = storyElement.querySelectorAll('.u_uvt3d3qku a'),
			otherElement = storyElement.querySelector(storyHeaderSelector + ' a[data-tooltip-content]'),
			linkElementsHrefs = getArrayOfHrefs(linkElements),
			authorElementsHrefs = getArrayOfHrefs(authorElements);
		// When your firend, author of the post is in the N-others href
		if(otherElement && authorElement) {
			var authorName = authorElement.innerHTML,
				othersWhoReactedToStory = otherElement.dataset.tooltipContent.split("\n");
			if(othersWhoReactedToStory.indexOf(authorName) != -1) {
				// Author is reacting to his own story
				appendStoryReview(storyElement, 'Author is reacting to his own story');
				return;
			}
		}
		// Check if my friend commented on my post or his own post
		linkElementsHrefs.push(loggedUserHref);
		var match = _.intersection(linkElementsHrefs, authorElementsHrefs);
		if(match.length == 0) {
			appendStoryReview(storyElement, 'Friend didn\'t commented or liked on my post or his own post');
			hideStory(storyElement);
			return;
		}
		// Check for Sponsored label instead of Story's timestamp
		if(storyElement.querySelector('._5paw._4dcu')) {
			appendStoryReview(storyElement, 'Sponsored label instead of Story\'s timestamp');
			hideStory(storyElement);
			return;
		}
		appendStoryReview(storyElement, 'Story header seems to be fine');
		// return;
		// When a friend like/comment a story of page he follows
		// Doesn't work, as it also selects stories of pages your friend shared
		// if(storyElement.querySelector('button.PageLikeButton')) {
		// 	hideStory(storyElement);
		// 	return;
		// }
	}
	// Sponsored Post
	if(storyElement.querySelector('.t_uvt3d8jho.r_uvt3d8jhn') == false) { //'.c_uvt3dboud'
		appendStoryReview(storyElement, 'Sponsored Post');
		hideStory(storyElement);
		return;
	}
	// Sponsored Page
	if(storyElement.querySelector('.u_uvt3darru.m_uvt3dayxz')) { // children .v_uvt3d952g.m_uvt3dayxz // '.k_uvt3d5v0v'
		appendStoryReview(storyElement, 'Sponsored Page');
		hideStory(storyElement);
		return;
	}
	// People you may know
	// if(storyElement.querySelector('._1dwg._1w_m .mts')) {
	// 	appendStoryReview(storyElement, 'People you may know');
	// 	hideStory(storyElement);
	// 	return;
	// }
	// Popular across Facebook
	if(storyElement.querySelector('._5_xt') && !storyElement.querySelector('._5_xt > a')) {
		appendStoryReview(storyElement, 'Popular across Facebook');
		hideStory(storyElement);
		return;
	}
}

function clearSidebar() {
	// Run only on feed view
	if(window.location.pathname != "/") return;
	// Skip if already inserted
	// if(document.querySelector('#pagelet_friendsfeed')) return;
	// Check for footer element
	if(!document.querySelector(footerSelector)) return;
}

function hideStory(el) {
	if(hideStoryPreference) {
		el.style.width = "100px";
		el.style.height = "10px";
		el.style.overflow = "hidden";
		el.style.position = "fixed";
		el.style.top = "42px";
		el.style.left = 0;
		el.style.opacity = 0;
	} else {
		el.style.opacity = .4;
	}
}

// Used in development for debugging purposes
function appendStoryReview(el, message) {
	// Don't display in production
	return;
	var div = document.createElement("div");
	div.className = "ff_story_review";
	div.innerHTML = message;
	if(el) {
		el.querySelector('._4-u2').appendChild(div);
	}
}

function appendStyle(content) {
	var style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = content;
	document.getElementsByTagName('head')[0].appendChild(style);
}

function isElement(obj) {
	return (typeof HTMLElement === "object" ? obj instanceof HTMLElement : obj && typeof obj === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName==="string");
}

function getArrayOfHrefs(elements) {
	var hrefs = [];
	[].forEach.call(elements, function(element) {
		var href = element.href;
		if(['/profile.php', '/permalink.php'].indexOf(element.pathname) > -1) {
			var questionMarkPosition = href.indexOf('&');
			href = href.substring(0, questionMarkPosition != -1 ? questionMarkPosition : href.length);
		} else {
			href = element.href.replace(/\?.+/, '');
		}
		hrefs.push(href);
	});
	return hrefs;
}

function windowPopup(url, width, height) {
	var left = screen.width / 2 - width / 2,
	    top = screen.height / 2 - height / 2;
	window.open(url, "", "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=" + width + ",height=" + height + ",top=" + top + ",left=" + left);
}
