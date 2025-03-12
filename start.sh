#!/bin/bash

# Setze das Verzeichnis für das Backend
BACKEND_DIR="backend"

# Backend: Virtuelle Umgebung erstellen, wenn sie noch nicht existiert
echo "Prüfe virtuelle Umgebung für das Backend..."
cd $BACKEND_DIR  # Wechsle ins Backend-Verzeichnis

if [ ! -d "venv" ]; then
    echo "Erstelle virtuelle Umgebung..."
    python -m venv venv  # Erstelle die virtuelle Umgebung
fi

# Aktiviere die virtuelle Umgebung
echo "Aktiviere die virtuelle Umgebung..."
source venv/Scripts/activate  # Aktiviert die virtuelle Umgebung

# Installiere Backend-Abhängigkeiten (falls nicht bereits installiert)
echo "Installiere Backend-Abhängigkeiten..."
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt  # Installiert die Abhängigkeiten
else
    echo "Keine requirements.txt gefunden. Bitte erstelle eine."
fi

# Starte das Backend (Flask)
echo "Starte das Backend..."
python app.py &  # Starte das Backend im Hintergrund

# Gehe zurück ins Hauptverzeichnis
cd ..

# Frontend: Installiere Abhängigkeiten und starte das Frontend
echo "Starte das Frontend..."
cd frontend  # Wechsel ins Frontend-Verzeichnis
npm install  # Installiere die Frontend-Abhängigkeiten (falls noch nicht gemacht)
npm start  # Starte das Frontend
