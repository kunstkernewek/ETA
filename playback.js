// Global audio control state
let currentAudio = null;
window.isPaused = false;
let globalVolume = 1.0;

function getRandomUniqueElement(arr, usedFiles) {
    const availableFiles = arr.filter(file => !usedFiles.includes(file));
    if (availableFiles.length === 0) return null;
    return availableFiles[Math.floor(Math.random() * availableFiles.length)];
}

async function getAudioDuration(filePath) {
    return new Promise((resolve) => {
        const audio = new Audio(filePath);
        audio.addEventListener('loadedmetadata', () => {
            resolve(audio.duration);
        });
    });
}

// Function to setup playback controls
function setupPlaybackControls() {
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'playback-controls';
    controlsDiv.innerHTML = `
        <button id="pauseButton" class="control-button">
            <span class="play-icon">▶</span>
        </button>
        <div class="volume-control">
            <input type="range" id="volumeSlider" min="0" max="100" value="100">
            <span id="volumeDisplay">100%</span>
        </div>
    `;

    document.getElementById('timer').insertBefore(controlsDiv, document.getElementById('timer').firstChild);

    // Setup pause button
    const pauseButton = document.getElementById('pauseButton');
    pauseButton.addEventListener('click', togglePause);

    // Setup volume control
    const volumeSlider = document.getElementById('volumeSlider');
    volumeSlider.addEventListener('input', (e) => {
        globalVolume = e.target.value / 100;
        document.getElementById('volumeDisplay').textContent = `${e.target.value}%`;
        if (currentAudio) {
            currentAudio.volume = globalVolume;
        }
    });
}

function togglePause() {
    window.isPaused = !window.isPaused;
    const pauseButton = document.getElementById('pauseButton');
    const playIcon = pauseButton.querySelector('.play-icon');

    if (window.isPaused) {
        playIcon.textContent = '▶';
        if (currentAudio) currentAudio.pause();
    } else {
        playIcon.textContent = '⏸';
        if (currentAudio) currentAudio.play();
    }
}

async function playAudioSegment(filePath, offset = 0, duration = null) {
    return new Promise(async (resolve) => {
        if (currentAudio) {
            currentAudio.pause();
        }

        currentAudio = new Audio(filePath);
        currentAudio.volume = globalVolume;
        const fullDuration = await getAudioDuration(filePath);

        currentAudio.currentTime = offset;
        if (!window.isPaused) {
            currentAudio.play();
        }

        const checkEnd = () => {
            currentAudio.removeEventListener("ended", checkEnd);
            resolve(fullDuration);
        };

        currentAudio.addEventListener("ended", checkEnd);

        if (duration) {
            setTimeout(() => {
                if (currentAudio) {
                    currentAudio.removeEventListener("ended", checkEnd);
                    currentAudio.pause();
                }
                resolve(duration);
            }, duration * 1000);
        }
    });
}

async function startSoundProject() {
    // Reset state
    document.getElementById("playlist").innerHTML = '';
    document.getElementById("current-time").innerText = '0:00';
    window.isPaused = false;

    // Setup controls if they don't exist
    if (!document.querySelector('.playback-controls')) {
        setupPlaybackControls();
    }

    // Rest of the startSoundProject function remains the same
    const usedMiddleFiles = [];

    // Step 1: Play a random beginning file
    const beginningFile = getRandomUniqueElement(fileList.beginning, []);
    const beginningDuration = await getAudioDuration(beginningFile);
    await displaySegment(beginningFile, 0, "full", beginningDuration);
    await playAudioSegment(beginningFile);

    // Step 2: Play 3 unique middle segments
    for (let i = 0; i < 3; i++) {
        const middleFile = getRandomUniqueElement(fileList.middle, usedMiddleFiles);
        if (!middleFile) break;

        usedMiddleFiles.push(middleFile);
        const offset = Math.random() * (123 - 12) + 12;
        const duration = (i === 0 ? Math.random() * (3 - 2) + 2 :
                         i === 1 ? Math.random() * (5 - 3) + 3 :
                                   Math.random() * (7 - 5) + 5) * 60;

        await displaySegment(middleFile, offset, duration / 60);
        await playAudioSegment(middleFile, offset, duration);
    }

    // Step 3: Play a random end file
    const endFile = getRandomUniqueElement(fileList.end, []);
    const endDuration = await getAudioDuration(endFile);
    await displaySegment(endFile, 0, "full", endDuration);
    await playAudioSegment(endFile);
}
