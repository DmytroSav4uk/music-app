const express = require('express');
const multer = require('multer');
const jsmediatags = require('jsmediatags');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/processAudio', upload.single('audioFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file provided' });
  }

  const audioBuffer = req.file.buffer;

  jsmediatags.read(audioBuffer, {
    onSuccess: (tag) => {
      if (tag.tags.picture) {
        const pictureData = tag.tags.picture.data;
        const pictureBuffer = Buffer.from(pictureData);

        // Send the image file directly in the response
        res.writeHead(200, {
          'Content-Type': 'image/jpeg', // Adjust content type based on your image format
          'Content-Length': pictureBuffer.length,
        });
        res.end(pictureBuffer);
      } else {
        res.status(404).json({ error: 'No image found in the audio file metadata' });
      }
    },
    onError: (error) => {
      res.status(500).json({ error: 'Error processing audio file', details: error });
    },
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
