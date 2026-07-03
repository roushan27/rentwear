const getImageUrl = (fileOrUrl) => {
  if (!fileOrUrl) return '';

  if (typeof fileOrUrl === 'string') {
    return fileOrUrl.trim();
  }

  if (typeof fileOrUrl === 'object') {
    return fileOrUrl.secure_url || fileOrUrl.url || fileOrUrl.path || fileOrUrl.location || '';
  }

  return '';
};

const getImageUrls = (files = []) => {
  return (Array.isArray(files) ? files : [files])
    .map(getImageUrl)
    .filter(Boolean);
};

module.exports = { getImageUrl, getImageUrls };
