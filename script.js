document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Language code mapping for speech synthesis
    const languageCodeMap = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'kn': 'kn-IN',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'es': 'es-ES',
        'bn': 'bn-IN',
        'te': 'te-IN',
        'ta': 'ta-IN',
        'gu': 'gu-IN',
        'mr': 'mr-IN',
        'sa': 'sa-IN'
    };

    // Translation elements
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
        translateBtn.classList.add('loading');
        translateBtn.textContent = 'Translating';
        
        try {
            // First try to detect language if auto is selected
            let detectedLang = sourceLang;
            if (sourceLang === 'auto') {
                detectedLang = await detectLanguage(text);
                if (!detectedLang) {
                    throw new Error('Could not detect language');
                }
            }
            
            // Using MyMemory Translation API
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${detectedLang === 'auto' ? '' : detectedLang + '|'}${targetLang}`
            );
            
            if (!response.ok) {
                throw new Error('Translation failed');
            }
            
            const data = await response.json();
            if (data.responseData) {
                translatedText.value = data.responseData.translatedText;
                
                // Update detected language in UI if auto was used
                if (sourceLang === 'auto' && data.responseData.detectedLanguage) {
                    const detectedLangCode = data.responseData.detectedLanguage.lang;
                    const langOption = document.querySelector(`#source-language option[value="${detectedLangCode}"]`);
                    if (langOption) {
                        sourceLanguage.value = detectedLangCode;
                    }
                }
            } else {
                throw new Error('No translation data received');
            }
        } catch (error) {
            console.error('Translation error:', error);
            translatedText.value = 'Translation failed. Please try again later.';
        } finally {
            translateBtn.disabled = false;
            translateBtn.classList.remove('loading');
            translateBtn.textContent = 'Translate';
        }
    }
    
    // Language detection
    async function detectLanguage(text) {
        try {
            // Try with MyMemory API first
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=|en`
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data.responseData && data.responseData.detectedLanguage) {
                    return data.responseData.detectedLanguage.lang;
                }
            }
            
            return null;
        } catch (error) {
            console.error('Language detection failed:', error);
            return null;
        }
    }
    
    // Text-to-speech function
    function speakText() {
        if (!translatedText.value) {
            alert('No translation to speak');
            return;
        }
        
        if (!window.speechSynthesis) {
            alert('Text-to-speech is not supported in your browser');
            return;
        }
        
        const targetLang = targetLanguage.value;
        const utterance = new SpeechSynthesisUtterance(translatedText.value);
        
        // Use mapped language code or fallback to targetLang
        utterance.lang = languageCodeMap[targetLang] || targetLang;
        
        // Error handling
        utterance.onerror = function(event) {
            console.error('Speech synthesis error:', event);
            alert('Text-to-speech failed. Please try again.');
        };
        
        // Wait for voices to be loaded
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            findAndSetVoice(utterance, voices);
            window.speechSynthesis.speak(utterance);
        } else {
            window.speechSynthesis.onvoiceschanged = function() {
                const voices = window.speechSynthesis.getVoices();
                findAndSetVoice(utterance, voices);
                window.speechSynthesis.speak(utterance);
                window.speechSynthesis.onvoiceschanged = null;
            };
        }
    }
    
    // Helper function to find the best voice
    function findAndSetVoice(utterance, voices) {
        // Try to find exact match
        const targetVoice = voices.find(voice => 
            voice.lang === utterance.lang || 
            voice.lang.startsWith(utterance.lang.split('-')[0])
        );
        
        if (targetVoice) {
            utterance.voice = targetVoice;
        } else {
            // Fallback to any available voice
            utterance.voice = voices[0];
        }
    }
    
    // Event listeners
    translateBtn.addEventListener('click', translateText);
    speakBtn.addEventListener('click', speakText);
    
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
    
    // Clear all
    clearBtn.addEventListener('click', function() {
        sourceText.value = '';
        translatedText.value = '';
        wordCount.textContent = '0 words';
    });
    
    // Add keyboard shortcut for translation (Ctrl+Enter)
    sourceText.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            translateText();
        }
    });
});
