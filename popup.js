document.addEventListener('DOMContentLoaded', () => {
    const extractButton = document.getElementById('extractButton');
    const copyButton = document.getElementById('copyButton');
    const extractedTextDiv = document.getElementById('extractedText'); // This is the container div
    const extractedTextContentSpan = document.getElementById('extractedTextContent'); // This is the span for content
    const copyFeedbackDiv = document.getElementById('copyFeedback');

    // The content-display-area class already applies left alignment and scrolling.
    // No class toggling needed for alignment or scrolling in JS, just content updates.

    // Event listener for the Extract Text button
    if (extractButton) {
        extractButton.addEventListener('click', async () => {
            extractedTextContentSpan.textContent = 'Extracting...';
            copyFeedbackDiv.classList.remove('show');

            let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (tab) {
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content.js']
                    });

                    chrome.runtime.onMessage.addListener(function listener(message, sender, sendResponse) {
                        if (message.action === 'extractedText' && sender.tab.id === tab.id) {
                            extractedTextContentSpan.textContent = message.data || 'No text extracted.';
                            // No class toggling needed here either.
                            chrome.runtime.onMessage.removeListener(listener);
                            sendResponse({ status: "success" });
                        }
                    });

                } catch (error) {
                    console.error('Failed to execute script:', error);
                    extractedTextContentSpan.textContent = 'Error: Could not extract text.';
                }
            } else {
                extractedTextContentSpan.textContent = 'No active tab found.';
            }
        });
    } else {
        console.error("Extract button not found.");
    }

    // Event listener for the Copy Text button
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            const textToCopy = extractedTextContentSpan.textContent; // Get text from the span

            if (textToCopy.trim() === 'No text extracted yet.' || textToCopy.trim() === 'Extracting...' || textToCopy.trim().startsWith('Error:') || textToCopy.trim() === '') {
                copyFeedbackDiv.textContent = 'Nothing to copy!';
                copyFeedbackDiv.style.color = '#dc2626';
                copyFeedbackDiv.classList.add('show');
                setTimeout(() => {
                    copyFeedbackDiv.classList.remove('show');
                    copyFeedbackDiv.style.color = '#16a34a';
                }, 2000);
                return;
            }

            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = textToCopy;
            document.body.appendChild(tempTextArea);

            tempTextArea.select();
            tempTextArea.setSelectionRange(0, 99999);

            try {
                document.execCommand('copy');
                copyFeedbackDiv.textContent = 'Text copied!';
                copyFeedbackDiv.classList.add('show');
            } catch (err) {
                console.error('Failed to copy text:', err);
                copyFeedbackDiv.textContent = 'Failed to copy text.';
                copyFeedbackDiv.classList.add('show');
            } finally {
                document.body.removeChild(tempTextArea);
                setTimeout(() => {
                    copyFeedbackDiv.classList.remove('show');
                }, 2000);
            }
        });
    } else {
        console.error("Copy button not found.");
    }
});