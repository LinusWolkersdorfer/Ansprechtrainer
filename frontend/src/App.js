import React, { useState, useEffect } from "react";
import './App.css'

export default function App() {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [file, setFile] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/files")
      .then((res) => res.json())
      .then((data) => setAvailableFiles(data.files));
  }, []);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setSelectedFile(uploadedFile.name);  // Speichern des Dateinamens
    uploadFile(uploadedFile); // Direkt nach der Auswahl die Datei hochladen
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.value);
  };

  const uploadFile = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      if (data.images) {
        setImages(data.images);
        setCurrentIndex(0);
        setCorrectCount(0);
        setWrongCount(0);
        setShowSolution(false);
        setShowResults(false);
      }
    } catch (error) {
      console.error("Fehler beim Hochladen der Datei:", error);
    }
  };

  const loadSelectedFile = async () => {
    if (!selectedFile) return;
    try {
      const response = await fetch(`http://localhost:5000/load?file=${selectedFile}`);
      const data = await response.json();
      if (data.images) {
        setImages(data.images);
        setCurrentIndex(0);
        setCorrectCount(0);
        setWrongCount(0);
        setShowSolution(false);
        setShowResults(false);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Datei:", error);
    }
  };

  useEffect(() => {
    if (availableFiles.length > 0 && !selectedFile) {
      setSelectedFile(availableFiles[0]);
      loadSelectedFile();
    }
  }, [availableFiles]);

  const revealSolution = () => {
    setCurrentIndex(currentIndex + 1);
    setShowSolution(true);
  };

  const nextImage = (wasCorrect) => {
    if (wasCorrect) setCorrectCount(correctCount + 1);
    else setWrongCount(wrongCount + 1);
    
    if (currentIndex + 1 >= images.length) {
      setShowResults(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setShowSolution(false);
    }
  };

  const restartQuiz = async () => {  // Füge async hier hinzu
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setShowResults(false);
    setShowSolution(false);
  
    // Call the shuffle endpoint to shuffle the images
    if (selectedFile) {
      try {
        const response = await fetch(`http://localhost:5000/shuffle/${selectedFile}`, {
          method: 'POST',
        });
        const data = await response.json();
        setImages(data.images);  // Update the images with the new shuffled order
      } catch (error) {
        console.error("Fehler beim Mischen der Bilder:", error);
      }
    }
  };
  

  return (
    <div className="container">
      <h1 className="title">Ansprechtrainer</h1>

      <div className="file-upload">
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="file-input" 
          id="file-upload" 
        />
        <label htmlFor="file-upload">pdf auswählen</label>
      </div>

      {/* Textfeld für die angezeigte Datei */}
      {selectedFile && (
        <div className="selected-file">
          <p>Ausgewählte Datei: <strong>{selectedFile.replace('.pdf', '')}</strong></p>
        </div>
      )}

      {showResults ? (
        <div className="results">
          <h2 className="results-title">Ergebniss:</h2>
          <h3 className="results-subtitle">
            {correctCount === correctCount + wrongCount
              ? "Perfekt!"
              : correctCount / (correctCount + wrongCount) > 0.9
              ? "Sehr gut!"
              : "Du solltest noch üben"}
          </h3>
          <p className="results-summary">
            Richtig: {correctCount} | Falsch: {wrongCount}
          </p>
          <button onClick={restartQuiz} className="btn-restart">
            Nochmal spielen
          </button>
        </div>
      ) : (
        images.length > 0 && (
          <div className="quiz-container">
            <p className="progress">
              Fortschritt: {Math.floor(currentIndex / 2) + 1} / {images.length / 2}
            </p>
            <img
              src={`http://localhost:5000/images/${images[currentIndex]}`}
              alt="Quiz"
              className="quiz-image"
            />
            {!showSolution ? (
              <div className="btn-container">
                <button onClick={revealSolution} className="btn-reveal">
                  Auflösen
                </button>
              </div>
            ) : (
              <div className="btn-container">
                <button onClick={() => nextImage(true)} className="btn-correct">
                  Gewusst
                </button>
                <button onClick={() => nextImage(false)} className="btn-wrong">
                  Nicht gewusst
                </button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
