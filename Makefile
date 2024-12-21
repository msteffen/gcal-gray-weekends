.PHONY: zip

zip: content.js icons/*.png manifest.json popup.css popup.html popup.js
	# N.B. "$$^" is the special make variable that expands to all perequisites with spaces between them
	zip extension.zip $^
