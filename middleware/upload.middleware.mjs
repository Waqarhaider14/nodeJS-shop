import multer from 'multer';
import path from 'path';

// Set up multer storage to save the image files to the public folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public'); // Save the images directly to the "public" folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});

// Create the multer upload middleware
const upload = multer({ storage: storage }).single('picture');

export default upload;
