function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,hi,ur,kn,de,fr',
        autoDisplay: false
    });
}

async function detectLanguage(text) {
    try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=ld&q=${encodeURIComponent(text)}`);
        const data = await response.json();
        const detectedLang = data[2];
        const langNames = {
            'en': 'English',
            'hi': 'Hindi',
            'ur': 'Urdu',
            'kn': 'Kannada',
            'de': 'German',
            'fr': 'French'
        };
        return langNames[detectedLang] || detectedLang;
    } catch (error) {
        console.error('Language detection error:', error);
        return 'Unknown';
    }
}

async function translateText() {
    const inputText = document.getElementById('inputText').value;
    const targetLang = document.getElementById('targetLanguage').value;
    const outputText = document.getElementById('outputText');

    if (!inputText.trim()) {
        outputText.textContent = 'Please enter text to translate.';
        return;
    }

    outputText.textContent = 'Translating...';

    try {
        // Send the entire text for translation, preserving new lines and sentence structure
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(inputText)}`);
        const data = await response.json();
       –

        // Combine all translated segments, preserving line breaks and sentence structure
        let translatedText = '';
        if (Array.isArray(data[0])) {
            translatedText = data[0].map(segment => segment[0]).join('');
        } else {
            translatedText = data[0] || 'Translation error';
        }
        outputText.textContent = translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        outputText.textContent = 'Error translating text. Please try again.';
    }
}

async function updateDetectedLanguage() {
    const inputText = document.getElementById('inputText').value;
    const detectedLanguage = document.getElementById('detectedLanguage');
    const charCount = document.getElementById('charCount');

    charCount.textContent = inputText.length;

    if (inputText.trim()) {
        const lang = await detectLanguage(inputText);
        detectedLanguage.textContent = `Detected Language: ${lang}`;
    } else {
        detectedLanguage.textContent = 'Detected Language: None';
    }
}

// Event listeners
document.getElementById('inputText').addEventListener('input', updateDetectedLanguage);
document.getElementById('inputText').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        // Prevent default Enter behavior (new line) and trigger translation
        e.preventDefault();
        translateText();
    }
    // Allow Shift+Enter for new lines
});

// Initialize character count
document.getElementById('charCount').textContent = '0';
