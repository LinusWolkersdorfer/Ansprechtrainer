import React, { useState } from "react";

export default function App() {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.images) {
      setImages(data.images);
      setCurrentIndex(0);
    }
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Hunderassen-Quiz</h1>
      <input type="file" onChange={handleFileChange} className="mb-2" />
      <button onClick={uploadFile} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
        PDF hochladen
      </button>
      {images.length > 0 && (
        <div className="flex flex-col items-center">
          <img
            src={`http://localhost:5000/images/${images[currentIndex]}`}
            alt="Quiz"
            className="max-w-full max-h-96 border rounded shadow-lg"
          />
          <button onClick={nextImage} className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
            Nächstes Bild
          </button>
        </div>
      )}
    </div>
  );
}
