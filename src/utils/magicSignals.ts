/**
 * Audio and Haptic feedback utilities for Magician Peek screen
 */

export function triggerHapticFeedback(pattern: number[] = [150, 80, 150, 80, 250]) {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn("Haptic vibration not allowed:", e);
    }
  }
}

export function speakSecretText(text: string, lang = "pt-BR", rate = 1.0, volume = 1.0) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel(); // Stop ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.volume = volume;
      
      // Try to find a natural Portuguese or matching language voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find((v) => v.lang.startsWith(lang.split("-")[0]));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  }
}
