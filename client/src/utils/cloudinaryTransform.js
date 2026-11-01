/**
 * Cloudinary image transformation utilities for ASGARD-IRI
 * Provides automatic format selection (f_auto), quality optimization (q_auto),
 * and smart cropping (c_fill).
 */

export const isCloudinaryUrl = (url) => {
  return typeof url === 'string' && url.includes('res.cloudinary.com') && url.includes('/image/upload/');
};

/**
 * Generate a thumbnail URL with width constraint
 * @param {string} url - Original image URL
 * @param {number} width - Target width in px (default 400)
 * @returns {string} Transformed Cloudinary URL or original URL
 */
export const thumb = (url, width = 400) => {
  if (!isCloudinaryUrl(url)) return url || '';
  const transform = `w_${width},c_fill,f_auto,q_auto`;
  return url.replace('/image/upload/', `/image/upload/${transform}/`);
};

/**
 * Generate a cover image URL with width and height constraints
 * @param {string} url - Original image URL
 * @param {number} width - Target width in px (default 800)
 * @param {number} height - Target height in px (default 400)
 * @returns {string} Transformed Cloudinary URL or original URL
 */
export const cover = (url, width = 800, height = 400) => {
  if (!isCloudinaryUrl(url)) return url || '';
  const transform = `w_${width},h_${height},c_fill,f_auto,q_auto`;
  return url.replace('/image/upload/', `/image/upload/${transform}/`);
};

export default {
  thumb,
  cover,
  isCloudinaryUrl,
};
