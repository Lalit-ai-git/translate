function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,hi,ur,kn,de,fr',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
}

function translateText() {
    const inputText = document.getElementById('inputText').value;
    const outputText = document.getElementById('outputText');
    
    if (!inputText.trim()) {
        outputText.textContent = 'Please enter text to translate';
        return;
    }

    outputText.textContent = 'Translating...';
    
    // Create a temporary element to hold the text for Google Translate
    const tempDiv = document.createElement('div');
    tempDiv.textContent = inputText;
    tempDiv.style.display = 'none';
    document.body.appendChild(tempDiv);

    // Use Google Translate to translate the temporary element
    const translateElement = new google.translate.TranslateElement();
    translateElement.translate(tempDiv, function(translatedText) {
        outputText.textContent = translatedText || inputText; // Fallback to input if translation fails
        document.body.removeChild(tempDiv); // Clean up
    });
}

// Ensure accessibility: Allow Enter key to trigger translation
document.getElementById('inputText').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        translateText();
    }
});
