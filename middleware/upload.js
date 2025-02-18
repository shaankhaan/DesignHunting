const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "public-read",  // Adjust based on your needs
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

module.exports = upload;
