document.addEventListener('DOMContentLoaded', () => {
    const pasteButton = document.getElementById('pasteButton');
    const openUrlButton = document.getElementById('openUrlButton');
    const copyUrlButton = document.getElementById('copyUrlButton');
    const urlDisplay = document.getElementById('urlDisplay');
    const status = document.getElementById('status');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let currentUrl = '';

    pasteButton.addEventListener('click', async () => {
        try {
            const clipboardItems = await navigator.clipboard.read();
            
            for (const clipboardItem of clipboardItems) {
                for (const type of clipboardItem.types) {
                    if (type.startsWith('image/')) {
                        const blob = await clipboardItem.getType(type);
                        const imageUrl = URL.createObjectURL(blob);
                        const image = new Image();
                        
                        image.onload = () => {
                            canvas.width = image.width;
                            canvas.height = image.height;
                            ctx.drawImage(image, 0, 0);
                            
                            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            const code = jsQR(imageData.data, imageData.width, imageData.height);
                            
                            if (code) {
                                currentUrl = code.data;
                                urlDisplay.textContent = currentUrl;
                                openUrlButton.disabled = false;
                                copyUrlButton.disabled = false;
                                status.textContent = 'URL successfully extracted!';
                                status.classList.remove('error');
                            } else {
                                status.textContent = 'No QR code found in the image';
                                status.classList.add('error');
                            }
                            
                            URL.revokeObjectURL(imageUrl);
                        };
                        
                        image.src = imageUrl;
                        return;
                    }
                }
            }
            
            status.textContent = 'No image found in clipboard';
            status.classList.add('error');
        } catch (error) {
            console.error('Error:', error);
            status.textContent = 'Error reading from clipboard: ' + error.message;
            status.classList.add('error');
        }
    });

    openUrlButton.addEventListener('click', () => {
        if (currentUrl) {
            window.open(currentUrl, '_blank');
        }
    });

    copyUrlButton.addEventListener('click', async () => {
        if (currentUrl) {
            try {
                await navigator.clipboard.writeText(currentUrl);
                status.textContent = 'URL copied to clipboard!';
                status.classList.remove('error');
            } catch (error) {
                status.textContent = 'Error copying to clipboard: ' + error.message;
                status.classList.add('error');
            }
        }
    });
});
