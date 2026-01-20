# Bulk Image Downloader (Chrome Extension)

A lightweight Google Chrome extension (Manifest V3) that detects images on the current web page, displays them in a gallery view, and allows users to bulk download selected images as a single ZIP file.

## Features

-   **Automatic Detection**: Scans the active tab for images (filtering out small icons/tracking pixels).
-   **Gallery View**: Displays a thumbnail grid of found images in the popup.
-   **Bulk Selection**: "Select All"/"Deselect All" controls.
-   **One-Click Download**: Downloads selected images as a renamed sequence (e.g., `image_001.jpg`) inside a `images.zip` file.
-   **Blob/Data URI Support**: Handles standard URLs, Base64 images, and Blob URLs.

## Installation (Developer Mode)

Since this is not yet in the Chrome Web Store, you must install it in Developer Mode.

1.  Clone or download this repository.
2.  Ensure you have the `libs/jszip.min.js` file (included in this repo).
3.  Open Google Chrome and navigate to `chrome://extensions`.
4.  Enable **Developer Mode** (toggle in the top right corner).
5.  Click **Load unpacked** (top left).
6.  Select the root folder of this project (`Bulk-Image-Downloader`).

## Usage

1.  Navigate to a website with images (e.g., Unsplash, Pinterest, Google Images).
2.  Click the extension icon in the Chrome toolbar.
3.  The popup will open and scan for images.
4.  Select the images you wish to save.
5.  Click the **Download Selected** button.
6.  The extension will fetch the images, zip them, and trigger a download.

## Project Structure

-   `manifest.json`: Extension configuration (permissions, version).
-   `popup.html` & `popup.js`: The user interface and main logic (zipping/downloading).
-   `content.js`: The script injected into the page to scrape image sources.
-   `styles.css`: Styling for the popup grid.
-   `libs/`: Contains the `jszip.min.js` library required for zipping files.

## Dependencies

-   [JSZip](https://github.com/Stuk/jszip): Used for creating ZIP archives in the browser.

## License

[MIT](LICENSE)