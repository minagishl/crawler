(function () {
	// Verify if the URL is correct before starting
	if (!window.location.href.startsWith('https://x.com/home')) {
		console.error(
			'Script can only be run on https://x.com/home. Current URL:',
			window.location.href
		);
		return;
	}

	// Variable to hold saved URLs
	const savedUrls = new Set();
	let scrolling = true; // Flag to control scrolling

	function getElementByAriaLabel() {
		const element = document.querySelector('[aria-label="タイムライン: ホームタイムライン"]');
		if (element) {
			const posts = element.querySelectorAll('a[href]');
			const newUrls = Array.from(posts)
				.map((post) => post.href)
				.filter((url) => /https?:\/\/x\.com\/[\w]+\/status\/\d+$/.test(url))
				.filter((url) => !savedUrls.has(url)); // Get only links that are not saved

			// Add new links to `savedUrls`
			newUrls.forEach((url) => savedUrls.add(url));

			if (newUrls.length > 0) {
				const textToCopy = Array.from(savedUrls).join('\n');
				copyToClipboard(textToCopy);
				console.log('New URLs added and copied to clipboard:', newUrls);
			} else {
				console.log('No new URLs found.');
			}
		} else {
			console.log("No element found with aria-label='タイムライン: ホームタイムライン'");
		}
	}

	function copyToClipboard(text) {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard
				.writeText(text)
				.then(() => {
					console.log('URLs copied to clipboard:', text);
				})
				.catch((err) => {
					console.error('Failed to copy URLs to clipboard:', err);
					fallbackClipboardCopy(text);
				});
		} else {
			fallbackClipboardCopy(text);
		}
	}

	function fallbackClipboardCopy(text) {
		const textarea = document.createElement('textarea');
		textarea.value = text;
		document.body.appendChild(textarea);
		textarea.focus();
		textarea.select();
		try {
			document.execCommand('copy');
			console.log('URLs copied to clipboard (fallback):\n', text);
		} catch (err) {
			console.error('Failed to copy URLs to clipboard (fallback):', err);
		} finally {
			document.body.removeChild(textarea);
		}
	}

	function autoScrollAndCollect() {
		function scrollPage() {
			if (!scrolling) return; // Stop if scrolling is false
			window.scrollBy(0, window.innerHeight);
			setTimeout(() => {
				getElementByAriaLabel();
				scrollPage();
			}, 1000); // Change this value to adjust the scroll speed
		}

		scrollPage();

		// Message to provide stop functionality
		console.log(
			'Auto-scrolling and collecting started. To stop, call `stopAutoScroll()` in the console.'
		);
	}

	// Method to stop auto-scrolling
	window.stopAutoScroll = function () {
		scrolling = false;
		console.log('Auto-scrolling stopped.');
	};

	// Start the process
	autoScrollAndCollect();
})();
