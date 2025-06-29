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
    const translateElement = new google.translate.TranslateElement();
    
    // Note: Direct API translation is handled by Google Translate widget
    // This function ensures the output is displayed in the designated area
    outputText.textContent = 'Translating...';
    
    // Simulate translation output (Google Translate widget handles actual translation)
    setTimeout(() => {
        outputText.textContent = inputText; // Placeholder for translated text
    }, 1000);
}

// Ensure accessibility: Allow Enter key to trigger translation
document.getElementById('inputText').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        translateText();
    }
});