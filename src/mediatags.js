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
    return res.status(200).json({ message: 'No audio file provided' });
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
        // Send response with message "no cover" instead of an error
        res.status(200).json({ message: 'no cover' });
      }
    },
    onError: (error) => {
      // Send response with message "Error processing audio file" instead of an error
      res.status(200).json({ message: 'Error processing audio file', details: error });
    },
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
