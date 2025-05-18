const URL = "https://teachablemachine.withgoogle.com/models/GDWIDjNLs/";
let model, webcam, labelContainer, maxPredictions;
let uploadedImage = null;

async function loadModel() {
  if (!model) {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    console.log("Model loaded.");
  }
}

async function startLiveCamera() {
  await loadModel();
  const flip = true;
  webcam = new tmImage.Webcam(300, 300, flip);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam-container").innerHTML = "";
  document.getElementById("webcam-container").appendChild(webcam.canvas);

  labelContainer = document.getElementById("label-container");
  labelContainer.innerHTML = "";
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);
  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction = `${prediction[i].className}: ${prediction[i].probability.toFixed(2)}`;
    labelContainer.childNodes[i].innerHTML = classPrediction;
    if (prediction[i].probability > 0.8) {
      document.getElementById("result").innerText = `Result: ${prediction[i].className}`;
    }
  }
}

document.getElementById("uploadInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const img = document.getElementById("uploadedImage");
    img.src = reader.result;
    img.style.display = "block";
    const imageObject = new Image();
    imageObject.src = reader.result;
    imageObject.onload = () => {
      uploadedImage = imageObject;
    };
    document.getElementById("uploadStatus").innerText = "Image uploaded successfully.";
  };
  if (file) reader.readAsDataURL(file);
});

async function verifyUploadedImage() {
  if (!uploadedImage) {
    alert("Please upload an image first.");
    return;
  }
  await loadModel();
  const prediction = await model.predict(uploadedImage);
  let best = prediction[0];
  for (const pred of prediction) {
    if (pred.probability > best.probability) best = pred;
  }
  document.getElementById("result").innerText =
    `Result: ${best.className} (${(best.probability * 100).toFixed(2)}%)`;
}
