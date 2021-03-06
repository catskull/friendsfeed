(function() {

	var settings,
		newsFeedSelector = '._5pcb',
		storySelector = '._5jmm',
		storyHeaderSelector = '._1qbu';

	var init = function() {
		document.body.addEventListener('DOMNodeInserted', function(event) {
			clearAddedFeed(event);
		});
		var storyElements = document.querySelectorAll(storySelector);
		[].forEach.call(storyElements, function(storyElement) {
			processStory(storyElement);
		});
	};

	safari.self.addEventListener("message", function(e) {
		if(e.name === "setSettings") {
			settings = e.message;
			init();
		}
	}, false);

	safari.self.tab.dispatchMessage("getSettings");

	function clearAddedFeed(event) {
		var storyElement = event.target.parentNode;
		processStory(storyElement);
	}

	function processStory(storyElement) {
		if(!isElement(storyElement)) return;
		if(!storyElement.classList.contains('_5jmm')) return;
		// Story with header
		if(storyElement.querySelector(storyHeaderSelector)) {
			var linkElements = storyElement.querySelectorAll(storyHeaderSelector + ' a'),
				authorElements = storyElement.querySelectorAll('._3x-2 ._5pbw._5vra a'),
				linkElementsHrefs = getArrayOfHrefs(linkElements),
				authorElementsHrefs = getArrayOfHrefs(authorElements),
				match = _.intersection(linkElementsHrefs, authorElementsHrefs);
			if(match.length == 0) {
				hideStory(storyElement);
				return;
			}
			// When a friend like a story of page he follows
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

	function hideStory(el) {
		if(settings.hideStory == 1) {
			el.style.display = "none";
		} else {
			el.style.opacity = .4;
		}
	}

	function isElement(obj) {
		return (typeof HTMLElement === "object" ? obj instanceof HTMLElement : obj && typeof obj === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName==="string");
	}

	function getArrayOfHrefs(elements) {
		var hrefs = [];
		[].forEach.call(elements, function(element) {
			hrefs.push(element.href.replace(/\?.+/, ''));
		});
		return hrefs;
	}

}());