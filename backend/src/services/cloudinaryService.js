const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
const configureCloudinary = () => {
  if (process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('✅ Cloudinary configured');
  } else {
    console.log('⚠️ Cloudinary not configured (optional for demo)');
  }
};

// Upload image to Cloudinary
const uploadImage = async (base64Data, folder = 'uploads') => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return { success: false, message: 'Cloudinary not configured' };
    }
    
    const result = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: 'auto'
    });
    
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    return { success: false, error: error.message };
  }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return { success: false, message: 'Cloudinary not configured' };
    }
    
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { configureCloudinary, uploadImage, deleteImage };
