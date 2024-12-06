"use client"

import { useState, useEffect } from 'react'
import Head from 'next/head'

// Check for SpeechRecognition API availability
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function Home() {
  const [query, setQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const [language, setLanguage] = useState('en-US') // Default language is English

  useEffect(() => {
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = language;  // Set language dynamically based on the selected language
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        setQuery(speechToText);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        alert('Error with speech recognition. Please try again.');
      };

      setRecognition(recognitionInstance);
    } else {
      alert('Speech Recognition not supported in this browser');
    }
  }, [language]); // Reinitialize when the language changes

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    alert(`Searching for: ${query}`);
  };

  const handleMicClick = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        recognition.start();
        setIsListening(true);
      }
    }
  };

  const toggleLanguage = () => {
    // Toggle between Kannada and English
    setLanguage((prevLang) => (prevLang === 'en-US' ? 'kn-IN' : 'en-US'));
  };

  return (
    <div>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-blue-500 flex flex-col items-center justify-start pt-20 px-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center border rounded-lg bg-white shadow-md px-4 py-2 w-[700px] pr-[50px]">
          
          {/* Language Toggle Button */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="bg-gray-300 text-gray-600 p-2 rounded-l-lg hover:bg-gray-400 transition duration-200"
            aria-label="Toggle Language"
          >
            {language === 'en-US' ? '🇮🇳 ಕನ್ನಡ' : '🇺🇸 English'}
          </button>

          {/* Microphone Button */}
          <button
            type="button"
            onClick={handleMicClick}
            className={`bg-gray-200 text-gray-600 rounded-l-lg p-2 hover:bg-gray-300 transition duration-200 ${isListening ? 'bg-green-200' : ''}`}
            aria-label="Microphone"
          >
            🎤
          </button>

          {/* Search Input */}
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder={language === 'en-US' ? "Search in English" : "ಕನ್ನಡದಲ್ಲಿ ಹುಡುಕು"}
            className="w-full px-4 py-2 text-gray-700 focus:outline-none"
            aria-label="Search input"
          />

          {/* Search Button */}
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-r-lg p-2 hover:bg-blue-600 transition duration-200"
            aria-label="Search"
          >
            🔍
          </button>
        </form>
      </main>
    </div>
  )
}
