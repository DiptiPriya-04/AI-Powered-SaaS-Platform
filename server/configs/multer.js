import multer from "multer";

// For generic uploads (PDFs, images, etc.)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// For strict PDF-only uploads (e.g., chatWithPDF, resumeReview, calculateATSScore)
export const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const isPdf = file.mimetype === "application/pdf" || 
                  file.mimetype === "application/x-pdf" || 
                  (file.originalname && file.originalname.toLowerCase().endsWith(".pdf"));
    if (isPdf) cb(null, true);
    else cb(new Error("Only PDF documents are allowed"), false);
  },
});

// For strict image-only uploads (e.g., removeImageBackground, removeImageObject)
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images are allowed"), false);
  },
});