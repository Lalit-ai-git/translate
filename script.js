document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Translation functionality
    const sourceText = document.getElementById('source-text');
    const translatedText = document.getElementById('translated-text');
    const sourceLanguage = document.getElementById('source-language');
    const targetLanguage = document.getElementById('target-language');
    const translateBtn = document.getElementById('translate-btn');
    const swapBtn = document.getElementById('swap-languages');
    const copyBtn = document.getElementById('copy-translation');
    const speakBtn = document.getElementById('speak-translation');
    const clearBtn = document.getElementById('clear-all');
    const wordCount = document.querySelector('.word-count');
    
    // Word count update
    sourceText.addEventListener('input', function() {
        const text = sourceText.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        wordCount.textContent = `${words} words`;
    });
    
    // Translate function
    async function translateText() {
        const text = sourceText.value.trim();
        if (!text) {
            alert('Please enter text to translate');
            return;
        }
        
        const sourceLang = sourceLanguage.value;
        const targetLang = targetLanguage.value;
        
        translateBtn.disabled = true;
        translateBtn.textContent = 'Translating...';
        
        try {
            // Using LibreTranslate free API (you might need to set up your own instance)
            const response = await fetch('https://libretranslate.de/translate', {
                method: 'POST',
                body: JSON.stringify({
                    q: text,
                    source: sourceLang === 'auto' ? 'auto' : sourceLang,
                    target: targetLang,
                    format: 'text'
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Translation failed');
            }
            
            const data = await response.json();
            translatedText.value = data.translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            translatedText.value = 'Translation failed. Please try again later.';
            // Fallback to a different API if the first one fails
            try {
                const fallbackResponse = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang === 'auto' ? '' : sourceLang + '|'}${targetLang}`);
                const fallbackData = await fallbackResponse.json();
                if (fallbackData.responseData) {
                    translatedText.value = fallbackData.responseData.translatedText;
                } else {
                    throw new Error('Fallback translation failed');
                }
            } catch (fallbackError) {
                console.error('Fallback translation error:', fallbackError);
                translatedText.value = 'All translation services failed. Please try again later.';
            }
        } finally {
            translateBtn.disabled = false;
            translateBtn.textContent = 'Translate';
        }
    }
    
    // Event listeners
    translateBtn.addEventListener('click', translateText);
    
    // Swap languages
    swapBtn.addEventListener('click', function() {
        const currentSourceLang = sourceLanguage.value;
        const currentTargetLang = targetLanguage.value;
        
        // Don't swap if source is auto-detect
        if (currentSourceLang !== 'auto') {
            sourceLanguage.value = currentTargetLang;
            targetLanguage.value = currentSourceLang;
            
            // Also swap text if there's translation
            if (translatedText.value) {
                const temp = sourceText.value;
                sourceText.value = translatedText.value;
                translatedText.value = temp;
                wordCount.textContent = `${sourceText.value.trim() ? sourceText.value.trim().split(/\s+/).length : 0} words`;
            }
        }
    });
    
    // Copy translation
    copyBtn.addEventListener('click', function() {
        if (translatedText.value) {
            translatedText.select();
            document.execCommand('copy');
            
            // Visual feedback
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        }
    });
    
    // Speak translation
    speakBtn.addEventListener('click', function() {
        if (translatedText.value) {
            const utterance = new SpeechSynthesisUtterance(translatedText.value);
            utterance.lang = targetLanguage.value; // Set language for proper pronunciation
            
            // Try to find a voice for the target language
            const voices = window.speechSynthesis.getVoices();
            const targetVoice = voices.find(voice => voice.lang.startsWith(targetLanguage.value));
            
            if (targetVoice) {
                utterance.voice = targetVoice;
            }
            
            window.speechSynthesis.speak(utterance);
        }
    });
    
    // Clear all
    clearBtn.addEventListener('click', function() {
        sourceText.value = '';
        translatedText.value = '';
        wordCount.textContent = '0 words';
    });
    
    // Initialize speech synthesis voices
    if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = function() {
            // Voices are loaded
        };
    }
    
    // Auto-detect language if that option is selected
    sourceLanguage.addEventListener('change', function() {
        if (sourceLanguage.value === 'auto' && sourceText.value.trim()) {
            detectLanguage(sourceText.value);
        }
    });
    
    // Language detection function
    async function detectLanguage(text) {
        try {
            const response = await fetch('https://libretranslate.de/detect', {
                method: 'POST',
                body: JSON.stringify({
                    q: text
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data[0] && data[0].language) {
                    // Update the source language dropdown if the detected language is in our list
                    const detectedLang = data[0].language;
                    const langOption = document.querySelector(`#source-language option[value="${detectedLang}"]`);
                    if (langOption) {
                        sourceLanguage.value = detectedLang;
                    }
                }
            }
        } catch (error) {
            console.error('Language detection failed:', error);
        }
    }
    
    // Add keyboard shortcut for translation (Ctrl+Enter)
    sourceText.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            translateText();
        }
    });
});
