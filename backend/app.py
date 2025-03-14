from flask import Flask, request, jsonify, send_from_directory
import os
import fitz  # PyMuPDF
import random
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
IMAGE_FOLDER = 'images'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(IMAGE_FOLDER, exist_ok=True)

# Global variable to store image sequences
image_sequences = {}

def convert_pdf_to_images(pdf_path):
    doc = fitz.open(pdf_path)
    image_paths = []
    for i in range(len(doc)):
        page = doc[i]
        pix = page.get_pixmap()
        img_path = os.path.join(IMAGE_FOLDER, f'page_{i+1}.png')
        pix.save(img_path)
        image_paths.append(img_path)
    return image_paths

def generate_image_sequence(images):
    # Paare von Bildern erstellen (jeweils zwei aufeinanderfolgende Bilder)
    pairs = [(images[i], images[i+1]) for i in range(0, len(images), 2)]
    
    # Paare mischen, aber innerhalb eines Paares die Reihenfolge der Bilder beibehalten
    random.shuffle(pairs)
    
    # Die Paare in eine flache Liste umwandeln, damit sie der Reihenfolge des Quiz entsprechen
    return [img for pair in pairs for img in pair]


@app.route('/upload', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    pdf_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(pdf_path)
    
    images = convert_pdf_to_images(pdf_path)
    image_sequences[file.filename] = generate_image_sequence(images)  # Store the generated sequence for this file
    return jsonify({'images': [os.path.basename(img) for img in image_sequences[file.filename]]})

@app.route('/images/<filename>')
def get_image(filename):
    return send_from_directory(IMAGE_FOLDER, filename)

@app.route('/shuffle/<filename>', methods=['POST'])
def shuffle_images(filename):
    if filename not in image_sequences:
        return jsonify({'error': 'No images found for this file'}), 400
    
    # Shuffle the images for the given file
    image_sequences[filename] = generate_image_sequence(image_sequences[filename])
    return jsonify({'images': [os.path.basename(img) for img in image_sequences[filename]]})

if __name__ == '__main__':
    app.run(debug=True)
