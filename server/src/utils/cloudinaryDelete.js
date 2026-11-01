const cloudinary = require('../config/cloudinary');

/**
 * Deletes an asset from Cloudinary by its publicId and resourceType ('image' or 'raw').
 * Fails safely without throwing so deletion failure does not block the primary operation.
 */
async function deleteFromCloudinary(publicId, resourceType = 'image') {
  if (!publicId) return;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log(`[Cloudinary] Deleted ${resourceType} "${publicId}":`, result);
    return result;
  } catch (err) {
    console.error(`[Cloudinary] Failed to delete ${resourceType} "${publicId}":`, err.message);
  }
}

module.exports = { deleteFromCloudinary };
