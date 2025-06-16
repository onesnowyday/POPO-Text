(async () => {
    let extractedContent = '';

    const mainDivSelector = 'div.read-txt'; //Extracting text from specific div class

    const excludedBlockquoteSelector = 'blockquote.copyright'; //Removing blockquote text

    const targetDiv = document.querySelector(mainDivSelector);

    if (targetDiv) {
        // Create a deep clone of the target div 
        const clonedDiv = targetDiv.cloneNode(true);

        // Find all blockquotes with the 'copyright' class within the cloned div
        const unwantedBlockquotes = clonedDiv.querySelectorAll(excludedBlockquoteSelector);

        // Remove each unwanted blockquote from the cloned div
        unwantedBlockquotes.forEach(blockquote => {
            blockquote.remove();
        });

        // Extract the text content from the cleaned-up cloned div
        extractedContent = clonedDiv.textContent.trim();

        // If after cleaning, there's still no content, provide a fallback message.
        if (!extractedContent) {
            extractedContent = `Found div '${mainDivSelector}' but it was empty or contained only excluded content after cleaning.`;
        }

    } else {
        extractedContent = `Could not find the specified main div with selector "${mainDivSelector}".`;
    }

    // --- End of customization section ---

    // Send the extracted text back to the popup script
    chrome.runtime.sendMessage({ action: 'extractedText', data: extractedContent });

})();