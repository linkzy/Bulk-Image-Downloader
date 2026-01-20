// content.js

// This function will be executed by the popup.
// It finds images, filters them, and returns an array of URLs.

(async function() {
  const settings = {
    minWidth: 50,
    minHeight: 50
  };

  // Helper to convert Blob URL to Base64 Data URI
  async function blobToBase64(blobUrl) {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Failed to convert blob:', blobUrl, error);
      return null;
    }
  }

  const images = document.querySelectorAll('img');
  const uniqueSrcs = new Set();
  const results = [];

  // We use a for...of loop to handle async operations sequentially
  for (const img of images) {
    // 1. Basic Src Check
    if (!img.src) continue;

    // 2. Filter by size
    if (img.naturalWidth < settings.minWidth || img.naturalHeight < settings.minHeight) {
      continue;
    }

    // 3. Avoid duplicates
    if (uniqueSrcs.has(img.src)) continue;
    uniqueSrcs.add(img.src);

    let finalSrc = img.src;

    // 4. Handle Blob URLs
    // Blobs are only accessible in this context, so we must convert them to Base64
    if (finalSrc.startsWith('blob:')) {
      const base64 = await blobToBase64(finalSrc);
      if (base64) {
        finalSrc = base64;
      } else {
        continue; // Skip if conversion failed
      }
    }

    results.push(finalSrc);
  }

  return results;
})();
