const deviceWrapper = document.getElementById('device-wrapper');
const frameImg = document.getElementById('frame-img');
const appIframe = document.getElementById('app-iframe');
const urlInput = document.getElementById('url-input');
const refreshBtn = document.getElementById('refresh-btn');

const deviceBtns = document.querySelectorAll('[data-device]');
const orientationBtns = document.querySelectorAll('[data-orientation]');

let currentDevice = 'iphone';
let currentOrientation = 'portrait';

// Handle Device Switch
deviceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        deviceBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentDevice = btn.dataset.device;
        updateStage();
    });
});

// Handle Orientation Switch
orientationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        orientationBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentOrientation = btn.dataset.orientation;
        updateStage();
    });
});

function updateStage() {
    // Basic transition
    deviceWrapper.className = `${currentDevice} ${currentOrientation}`;
    
    // Update image source
    frameImg.src = `assets/${currentDevice}.png`;
    
    // Log for debugging
    console.log(`Switched to ${currentDevice} in ${currentOrientation} mode`);
}

// Handle Refresh
refreshBtn.addEventListener('click', () => {
    const url = urlInput.value;
    appIframe.src = url;
});

// Auto-refresh on Enter
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        refreshBtn.click();
    }
});

// Initial Setup
updateStage();
