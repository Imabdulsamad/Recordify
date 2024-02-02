document.addEventListener("DOMContentLoaded", () => {
    const captureButton = document.getElementById("captureButton");
    const errorContainer = document.getElementById("errorContainer");
    let recorder;
    let chunks = [];
    let isRecording = false;

    captureButton.addEventListener("click", async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia();
            recorder = new MediaRecorder(stream);
            chunks = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'capture.webm';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };

            recorder.onstart = () => {
                isRecording = true;
                captureButton.textContent = 'Stop Recording';
                startRecordingTimer();
            };

            recorder.start();

            const [video] = stream.getVideoTracks();

            video.addEventListener("ended", () => {
                recorder.stop();
            });
        } catch (error) {
            console.error("Error accessing screen capture:", error);
            displayErrorMessage("Error accessing screen capture. Please try again.");
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === 'Escape' && isRecording) {
            stopRecording();
        }
    });

    captureButton.addEventListener("click", () => {
        if (isRecording) {
            stopRecording();
        }
    });

    function stopRecording() {
        if (recorder && isRecording) {
            recorder.stop();
            isRecording = false;
            captureButton.textContent = 'Start Recording';
            stopRecordingTimer();
        }
    }

    function startRecordingTimer() {
        let startTime = Date.now();
        const timerElement = document.getElementById("timer");

        function updateTimer() {
            const elapsedTime = Date.now() - startTime;
            const seconds = Math.floor(elapsedTime / 1000);
            timerElement.textContent = `Recording: ${seconds}s`;
        }

        recorder.timerInterval = setInterval(updateTimer, 1000);
    }

    function stopRecordingTimer() {
        if (recorder.timerInterval) {
            clearInterval(recorder.timerInterval);
            const timerElement = document.getElementById("timer");
            timerElement.textContent = '';
        }
    }

    function displayErrorMessage(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';

        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000);
    }
});
