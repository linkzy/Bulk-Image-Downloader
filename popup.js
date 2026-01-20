document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const selectAllBtn = document.getElementById('select-all');
    const deselectAllBtn = document.getElementById('deselect-all');
    const downloadBtn = document.getElementById('download-btn');
    const statusMsg = document.getElementById('status-msg');
    const countDisplay = document.getElementById('image-count');
    const loadingState = document.getElementById('loading');
    const emptyState = document.getElementById('empty-state');

    let allImageUrls = [];
    
    // 1. Initialize: Find current tab and inject script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        
        // Show loading
        loadingState.classList.remove('hidden');

        // Inject content.js
        chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            files: ['content.js']
        }, (results) => {
            loadingState.classList.add('hidden');
            
            if (chrome.runtime.lastError || !results || !results[0]) {
                statusMsg.textContent = "Error scanning page: " + (chrome.runtime.lastError?.message || "Unknown error");
                return;
            }

            const images = results[0].result;
            displayImages(images);
        });
    });

    // 2. Display Images in Grid
    function displayImages(images) {
        allImageUrls = images;
        gallery.innerHTML = ''; // basic clear
        updateCount(images.length);

        if (images.length === 0) {
            emptyState.classList.remove('hidden');
            downloadBtn.disabled = true;
            return;
        }

        images.forEach((url, index) => {
            const card = document.createElement('div');
            card.className = 'image-card selected'; // Default to selected
            
            const img = document.createElement('img');
            img.src = url;
            
            const checkbox = document.createElement('checkbox'); // Semantic helper, actual input below
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = true;
            input.dataset.url = url;
            
            // Toggle selection on click
            input.addEventListener('change', () => {
                if (input.checked) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
                updateDownloadButton();
            });
            
            // Also toggle when clicking the image wrapper (UX improvement)
            card.addEventListener('click', (e) => {
                if (e.target !== input) {
                    input.checked = !input.checked;
                    input.dispatchEvent(new Event('change'));
                }
            });

            card.appendChild(img);
            card.appendChild(input);
            gallery.appendChild(card);
        });

        updateDownloadButton();
    }

    // 3. Selection Logic
    selectAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.image-card input[type="checkbox"]').forEach(box => {
            box.checked = true;
            box.dispatchEvent(new Event('change'));
        });
    });

    deselectAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.image-card input[type="checkbox"]').forEach(box => {
            box.checked = false;
            box.dispatchEvent(new Event('change'));
        });
    });

    function updateCount(count) {
        countDisplay.textContent = `${count} image${count !== 1 ? 's' : ''}`;
    }

    function updateDownloadButton() {
        const selected = document.querySelectorAll('.image-card input[type="checkbox"]:checked');
        downloadBtn.textContent = `Download Selected (${selected.length})`;
        downloadBtn.disabled = selected.length === 0;
    }

    // 4. Download Logic (The Core)
    downloadBtn.addEventListener('click', async () => {
        const selectedInputs = document.querySelectorAll('.image-card input[type="checkbox"]:checked');
        const urlsToDownload = Array.from(selectedInputs).map(input => input.dataset.url);

        if (urlsToDownload.length === 0) return;

        downloadBtn.disabled = true;
        statusMsg.textContent = "Fetching images...";
        statusMsg.style.color = "#333";

        try {
            const zip = new JSZip();
            const folder = zip.folder("images");
            
            let successCount = 0;
            let failCount = 0;

            // Fetch images in parallel
            const fetchPromises = urlsToDownload.map(async (url, index) => {
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error('Network response was not ok');
                    
                    const blob = await response.blob();
                    
                    // Determine extension from MIME type or URL
                    let extension = blob.type.split('/')[1] || 'jpg';
                    if (extension === 'jpeg') extension = 'jpg';
                    // Sanitize weird svg+xml types
                    if (extension.includes('+')) extension = extension.split('+')[0];

                    // Naming: image_001.jpg
                    const filename = `image_${String(index + 1).padStart(3, '0')}.${extension}`;
                    
                    folder.file(filename, blob);
                    successCount++;
                    statusMsg.textContent = `Fetched ${successCount}/${urlsToDownload.length}...`;
                } catch (err) {
                    console.error("Failed to load image", url, err);
                    failCount++;
                }
            });

            await Promise.all(fetchPromises);

            if (successCount === 0) {
                statusMsg.textContent = "Failed to fetch any images.";
                statusMsg.style.color = "red";
                downloadBtn.disabled = false;
                return;
            }

            statusMsg.textContent = "Zipping...";
            
            // Generate Zip
            const content = await zip.generateAsync({ type: "blob" });
            
            // Trigger Download
            const zipUrl = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = zipUrl;
            link.download = "images.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Cleanup
            setTimeout(() => URL.revokeObjectURL(zipUrl), 100);

            statusMsg.textContent = "Done! Downloading...";
            statusMsg.style.color = "green";
            
        } catch (error) {
            console.error(error);
            statusMsg.textContent = "Error creating zip: " + error.message;
            statusMsg.style.color = "red";
        } finally {
            downloadBtn.disabled = false;
        }
    });
});
