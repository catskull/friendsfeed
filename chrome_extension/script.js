var hideStoryPreference = true,
	newsFeedSelector = '._5pcb',
	storySelector = '._5jmm',
	storyHeaderSelector = '._1qbu',
	headerUserSelector = '._2s25',
	footerSelector = '#pagelet_rhc_footer',
	loggedUserHref = null;

chrome.storage.sync.get({
	hideStory: true
}, function(preferences) {
	hideStoryPreference = preferences.hideStory;
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
	if(!isElement(storyElement)) return;
	if(!storyElement.classList.contains('_5jmm')) return;
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
			authorElement = storyElement.querySelector('._5va4 ._5pbw._5vra a'), //.profileLink
			authorElements = storyElement.querySelectorAll('._5va4 ._5pbw._5vra a'),
			otherElement = storyElement.querySelector(storyHeaderSelector + ' a[data-tooltip-content]'),
			linkElementsHrefs = getArrayOfHrefs(linkElements),
			authorElementsHrefs = getArrayOfHrefs(authorElements);
		// When your firend, author of the post is in the N-others href
		if(otherElement && authorElement) {
			var authorName = authorElement.innerHTML,
				othersWhoReactedToStory = otherElement.dataset.tooltipContent.split("\n");
			if(othersWhoReactedToStory.indexOf(authorName) != -1) {
				// Author is reacting to his own story
				return;
			}
		}
		// When your friend comments on your post or his own post
		linkElementsHrefs.push(loggedUserHref);
		var match = _.intersection(linkElementsHrefs, authorElementsHrefs);
		if(match.length == 0) {
			hideStory(storyElement);
			return;
		}
		// Check for Sponsored label instead of Story's timestamp
		if(storyElement.querySelector('._5paw._4dcu') && storyElement.querySelector('.PageLikeButton')) {
			hideStory(storyElement);
			return;
		}
		return;
		// When a friend like/comment a story of page he follows
		// Doesn't work, as it also selects stories of pages your friend shared
		// if(storyElement.querySelector('button.PageLikeButton')) {
		// 	hideStory(storyElement);
		// 	return;
		// }
	}
	// Sponsored Post
	if(storyElement.querySelector('._5g-l')) {
		hideStory(storyElement);
		return;
	}
	// Sponsored Page
	if(storyElement.querySelector('._3e_2._m8c')) {
		hideStory(storyElement);
		return;
	}
	// People you may know
	if(storyElement.querySelector('._1dwg._1w_m .mts')) {
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
		el.style.display = "none";
	} else {
		el.style.opacity = .4;
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
