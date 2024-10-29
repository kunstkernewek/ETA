// Function to format time in MM:SS format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Function to create progress bar
function createProgressBar() {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    progressContainer.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
        <div class="progress-time"></div>
    `;
    return progressContainer;
}

// Function to update playlist display for each segment
async function displaySegment(filename, offset, duration, fullDuration = null) {
    const playlist = document.getElementById("playlist");
    const segmentDiv = document.createElement("div");
    segmentDiv.classList.add("segment");

    // Format duration display
    let durationDisplay;
    if (duration === "full") {
        durationDisplay = formatTime(fullDuration);
    } else {
        durationDisplay = formatTime(duration * 60);
    }

    segmentDiv.innerHTML = `
        <strong>File:</strong> ${filename} <br>
        <strong>Offset:</strong> ${formatTime(offset)} <br>
        <strong>Duration:</strong> ${durationDisplay}
    `;

    // Add progress bar
    const progressBar = createProgressBar();
    segmentDiv.appendChild(progressBar);
    playlist.appendChild(segmentDiv);

    // Timer display
    await updateTimer(duration, fullDuration, progressBar);
}

// Function to update the timer display during playback
async function updateTimer(duration, fullDuration = null, progressBar) {
    // Clear any existing timer
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
    }

    // Set initial remaining time
    let remainingTime;
    let totalDuration;
    if (duration === "full" && fullDuration) {
        remainingTime = fullDuration;
        totalDuration = fullDuration;
    } else {
        remainingTime = duration * 60;
        totalDuration = duration * 60;
    }

    // Update display immediately before starting interval
    document.getElementById("current-time").innerText = formatTime(remainingTime);

    const progressFill = progressBar.querySelector('.progress-fill');
    const progressTime = progressBar.querySelector('.progress-time');

    window.timerInterval = setInterval(() => {
        if (!window.isPaused) {
            remainingTime -= 0.1;

            // Update progress bar
            const progress = ((totalDuration - remainingTime) / totalDuration) * 100;
            progressFill.style.width = `${progress}%`;
            progressTime.textContent = formatTime(remainingTime);

            if (remainingTime <= 0) {
                clearInterval(window.timerInterval);
                document.getElementById("current-time").innerText = "Changing...";
                progressFill.style.width = '100%';
            } else {
                document.getElementById("current-time").innerText = formatTime(remainingTime);
            }
        }
    }, 100);
}
