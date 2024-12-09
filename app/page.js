"use client";

import { useState, useEffect } from "react";
import { FiMic, FiSend } from "react-icons/fi";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS styles
import Head from "next/head";
import JSZip from "jszip"; // Import JSZip for zip file creation
import FileSaver from "file-saver"; // Import FileSaver.js to save the zip file
import MonacoEditor from "@monaco-editor/react"; // Import Monaco Editor

export default function Home() {
  const [searchText, setSearchText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [language, setLanguage] = useState("en-US");

  useEffect(() => {
    if (typeof window !== "undefined") {
      AOS.init({
        duration: 1000,
        easing: "ease-in-out",
        once: true,
      });

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser.");
        return;
      }

      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = language;
      recognitionInstance.interimResults = true;
      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchText(transcript);
      };

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [language]);

  const handleMicClick = async () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    }
    setHasInteracted(true);
  };

  const handleSendClick = async () => {
    if (!searchText) return;

    const requestData = {
      input: searchText,
      timestamp: new Date().toISOString(),
    };

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/gemini-1.5-flash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        setAiResponse(data.aiResponse);
      } else {
        setError("Error: Could not process your request.");
      }
    } catch (error) {
      setError("Error: Unable to reach the server.");
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage((prevLanguage) => (prevLanguage === "en-US" ? "kn-IN" : "en-US"));
  };

  const downloadCode = () => {
    // Create a new instance of JSZip
    const zip = new JSZip();

    // Add files to the zip
    zip.file("index.js", `// Example JavaScript file\nconsole.log("Hello World!");`);
    zip.file("package.json", `{
      "name": "my-project",
      "version": "1.0.0",
      "scripts": {
        "start": "react-scripts start"
      }
    }`);

    const src = zip.folder("src");
    src.file("App.js", `// Your App.js content\nconsole.log("App Component");`);
    src.file("Header.js", `// Your Header.js content\nconsole.log("Header Component");`);

    // Generate the zip file asynchronously
    zip.generateAsync({ type: "blob" }).then(function (content) {
      FileSaver.saveAs(content, "my_project.zip");
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 min-h-screen">
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-start pt-20 px-4">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex items-center border rounded-lg bg-white shadow-lg px-6 py-4 w-[700px] max-w-full mb-8"
          data-aos="fade-up"
        >
          <button
            type="button"
            onClick={toggleLanguage}
            className="bg-gray-200 text-gray-600 p-3 rounded-l-lg hover:bg-gray-300 transition duration-200"
            aria-label="Toggle Language"
          >
            {language === "en-US" ? "🇮🇳 ಕನ್ನಡ" : "🇺🇸 English"}
          </button>

          <button
            type="button"
            onClick={handleMicClick}
            className={`bg-gray-200 text-gray-600 rounded-l-lg p-3 hover:bg-gray-300 transition duration-200 ${isListening ? "bg-green-300" : ""}`}
            aria-label="Microphone"
          >
            {isListening ? "🎤 (Listening...)" : "🎤"}
          </button>

          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={language === "en-US" ? "Search in English" : "ಕನ್ನಡದಲ್ಲಿ ಹುಡುಕು"}
            className={`w-full px-4 py-3 text-gray-700 focus:outline-none border rounded-r-lg transition-all duration-300 ease-in-out ${hasInteracted ? "max-w-xl mt-5" : "w-[400px]"}`}
            aria-label="Search input"
          />

          <button
            type="button"
            onClick={handleSendClick}
            className="bg-blue-500 text-white rounded-r-lg p-3 ml-2 hover:bg-blue-600 transition duration-200"
            aria-label="Search"
          >
            <FiSend size={24} />
          </button>
        </form>

        {loading && (
          <div className="mt-4 p-4 bg-green-300 border border-blue-300 rounded-md shadow-md" data-aos="fade-up">
            <p className="text-blue-600">Loading...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-md shadow-md" data-aos="fade-up">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* AI Response */}
        {aiResponse && !loading && (
          <div className="mt-6 p-6 bg-white text-black border rounded-md shadow-md w-full max-w-3xl" data-aos="fade-up">
            <h3 className="font-bold text-xl text-blue-600 mb-3">FEBE:</h3>
            <MonacoEditor
              height="400px"
              language="javascript"
              value={aiResponse}
              theme="vs-dark"
              options={{
                readOnly: true, // Disable editing
                wordWrap: "on",
                wrappingIndent: "same",
              }}
            />
          </div>
        )}

        {/* Code Download Button */}
        <button
          onClick={downloadCode}
          className="mt-6 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
        >
          Download Project Code
        </button>
      </main>
    </div>
  );
}
