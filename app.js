// Declare global variables
let model; // To store the loaded Teachable Machine model
let webcamCanvas, ctx;
let userMove = "";

// Load the Teachable Machine model
async function loadModel() {
    const modelURL = './model/model.json';
    const metadataURL = './model/metadata.json';

    try {
        // Load model and metadata
        model = await tmImage.load(modelURL, metadataURL);
        console.log("Model loaded successfully!");
    } catch (err) {
        console.error("Error loading model:", err);
    }
}

// Initialize the webcam and canvas
function initCamera() {
    const video = document.getElementById('video');
    webcamCanvas = document.getElementById('canvas');
    ctx = webcamCanvas.getContext('2d');

    // Request access to the webcam
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
        })
        .catch((err) => {
            console.error("Error accessing webcam:", err);
        });
}

// Capture image and predict gesture
async function predictGesture() {
    if (!model) {
        alert("Model is not loaded yet. Please wait!");
        return;
    }

    // Capture the current frame from the video
    ctx.drawImage(document.getElementById('video'), 0, 0, 640, 480);

    try {
        // Use the model to make predictions
        const predictions = await model.predict(webcamCanvas);

        // Log predictions and find the most probable class
        console.log(predictions);
        let maxProb = 0;

        predictions.forEach(prediction => {
            if (prediction.probability > maxProb) {
                maxProb = prediction.probability;
                userMove = prediction.className;
            }
        });

        // Check if the gesture is recognized
        if (maxProb < 0.6) {
            alert("Gesture not recognized. Try again!");
            return;
        }

        console.log("Your gesture:", userMove);

        // Generate computer move and evaluate the game
        generateComputerMove();
    } catch (err) {
        console.error("Prediction error:", err);
    }
}

// Generate the computer's move
function generateComputerMove() {
    const moves = ["Rock", "Paper", "Scissors"];
    const computerMove = moves[Math.floor(Math.random() * moves.length)];
    console.log("Computer Move:", computerMove);

    // Evaluate the winner
    evaluateWinner(userMove, computerMove);
}

// Evaluate the winner
function evaluateWinner(user, computer) {
    let result = "";

    if (user === computer) {
        result = "It's a tie!";
    } else if (
        (user === "Rock" && computer === "Scissors") ||
        (user === "Paper" && computer === "Rock") ||
        (user === "Scissors" && computer === "Paper")
    ) {
        result = "You win!";
    } else {
        result = "Computer wins!";
    }

    // Display the results
    displayResults(user, computer, result);
}

// Display results on the webpage
function displayResults(user, computer, result) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `
        <p><strong>Your Move:</strong> ${user}</p>
        <p><strong>Computer's Move:</strong> ${computer}</p>
        <p><strong>Result:</strong> ${result}</p>
    `;
}

// Run when the page loads
window.onload = () => {
    loadModel();
    initCamera();
};
