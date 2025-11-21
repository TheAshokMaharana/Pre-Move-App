const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// -------------------- Cloudinary configuration --------------------
cloudinary.config({
  cloud_name: 'dfqledkbu',       // Dashboard me milta hai
  api_key: '948233998584225',    // Dashboard → API Keys
  api_secret: 'TQJPKoj371MI9trs5dRvDr1oaGc'
});

// -------------------- Folder containing images --------------------
const folderPath = "C:/Users/elePLACAE/Downloads/images/images/living_room";

// Read all files in the folder
fs.readdir(folderPath, (err, files) => {
  if (err) return console.error('Folder read error:', err);

  // Filter only image files (jpg, jpeg, png)
  const images = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));

  console.log(`Found ${images.length} images. Uploading...`);

  images.forEach(file => {
    const filePath = path.join(folderPath, file);

    // Upload to Cloudinary with original filename
    cloudinary.uploader.upload(filePath, {
      upload_preset: 'premove_Inventory_Item',   // aapka preset
      public_id: path.parse(file).name,         // original filename without extension
      folder: 'premove_inventory'               // optional: folder in Cloudinary
    })
    .then(result => {
      console.log('Uploaded:', file, '→', result.secure_url);
    })
    .catch(err => {
      console.error('Error uploading', file, err);
    });
  });
});
