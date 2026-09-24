const fileInput =
    document.getElementById("fileInput");

const uploadArea =
    document.getElementById("uploadArea");

const fileInfo =
    document.getElementById("fileInfo");

const fileName =
    document.getElementById("fileName");

const fileSize =
    document.getElementById("fileSize");

const originalDimensions =
    document.getElementById("originalDimensions");

const preview =
    document.getElementById("preview");

const previewImage =
    document.getElementById("previewImage");

const settings =
    document.getElementById("settings");

const widthInput =
    document.getElementById("widthInput");

const heightInput =
    document.getElementById("heightInput");

const maintainRatio =
    document.getElementById("maintainRatio");

const format =
    document.getElementById("format");

const quality =
    document.getElementById("quality");

const qualityValue =
    document.getElementById("qualityValue");

const generateBtn =
    document.getElementById("generateBtn");

const processing =
    document.getElementById("processing");

const result =
    document.getElementById("result");

const originalResult =
    document.getElementById("originalResult");

const newDimensions =
    document.getElementById("newDimensions");

const newFileSize =
    document.getElementById("newFileSize");

const downloadBtn =
    document.getElementById("downloadBtn");




let selectedFile = null;
let loadedImage = null;
let imageLoadVersion = 0;
let originalWidth = 0;
let originalHeight = 0;
let downloadURL = null;


/* FORMAT BYTES */

function formatBytes(bytes) {

    if (bytes < 1024) {
        return bytes + " B";
    }

    if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " KB";
    }

    return (
        bytes /
        (1024 * 1024)
    ).toFixed(2) + " MB";
}


/* FILE SELECT */

fileInput.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];

        if (!file) return;

        loadSelectedFile(file);
    }
);


/* DRAG DROP */

uploadArea.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        uploadArea.classList.add(
            "dragging"
        );
    }
);


uploadArea.addEventListener(
    "dragleave",
    function () {

        uploadArea.classList.remove(
            "dragging"
        );
    }
);


uploadArea.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        uploadArea.classList.remove(
            "dragging"
        );

        const file =
            event.dataTransfer.files[0];

        if (!file) return;

        if (
            !file.type.startsWith("image/")
        ) {

            alert(
                "Please select an image file."
            );

            return;
        }

        loadSelectedFile(file);
    }
);


/* LOAD FILE */

async function loadSelectedFile(file) {
    const version = ++imageLoadVersion;
    selectedFile = null;
    loadedImage = null;
    originalWidth = originalHeight = 0;
    generateBtn.disabled = true;
    for (const panel of [fileInfo, preview, settings, result]) panel.style.display = "none";
    try {
        const decoded = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Could not read the selected file."));
            reader.onabort = () => reject(new Error("Reading the selected file was interrupted."));
            reader.onload = event => {
                const image = new Image();
                image.onerror = () => reject(new Error("Could not open this image. Please choose another file."));
                image.onload = () => resolve({ image, dataURL: event.target.result });
                image.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
        if (version !== imageLoadVersion) return;
        EasyTools.checkPixels(decoded.image.width, decoded.image.height);
        selectedFile = file;
        loadedImage = decoded.image;
        originalWidth = loadedImage.width;
        originalHeight = loadedImage.height;
        widthInput.value = originalWidth;
        heightInput.value = originalHeight;
        fileName.textContent = file.name;
        fileSize.textContent = "File size: " + formatBytes(file.size);
        originalDimensions.textContent = "Dimensions: " + originalWidth + " \u00d7 " + originalHeight;
        previewImage.src = decoded.dataURL;
        for (const panel of [fileInfo, preview, settings]) panel.style.display = "block";
    } catch (error) {
        if (version === imageLoadVersion) alert(error.message);
    } finally {
        if (version === imageLoadVersion) generateBtn.disabled = false;
    }
}


/* QUALITY */

quality.addEventListener(
    "input",
    function () {

        qualityValue.textContent =
            quality.value + "%";
    }
);


/* MAINTAIN RATIO */

widthInput.addEventListener(
    "input",
    function () {

        if (!maintainRatio.checked)
            return;

        if (!originalWidth || !originalHeight)
            return;


        const newWidth =
            Number(widthInput.value);

        if (!Number.isInteger(newWidth) || newWidth <= 0) return;


        const ratio =
            originalHeight /
            originalWidth;


        heightInput.value =
            Math.max(1, Math.round(newWidth * ratio));
    }
);


heightInput.addEventListener(
    "input",
    function () {

        if (!maintainRatio.checked)
            return;

        if (!originalWidth || !originalHeight)
            return;


        const newHeight =
            Number(heightInput.value);

        if (!Number.isInteger(newHeight) || newHeight <= 0) return;


        const ratio =
            originalWidth /
            originalHeight;


        widthInput.value =
            Math.max(1, Math.round(newHeight * ratio));
    }
);


/* GENERATE */

generateBtn.addEventListener(
    "click",
    function () {

        if (!selectedFile) {

            alert(
                "Please select an image first."
            );

            return;
        }


        if (
            !Number.isInteger(Number(widthInput.value)) || Number(widthInput.value) <= 0 ||
            !Number.isInteger(Number(heightInput.value)) || Number(heightInput.value) <= 0
        ) {

            alert(
                "Please enter positive whole-number dimensions."
            );

            return;
        }


        generateBtn.disabled =
            true;


        showAdvertisement();
    }
);


/* DEMO AD */

function showAdvertisement() {
    // Tool use never depends on viewing or interacting with an advertisement.
    return resizeImage();
}


/* RESIZE */

async function resizeImage() {
    let releaseJob;
    let canvas;
    try {
        const image = loadedImage;
        const file = selectedFile;
        if (!image || !file) throw new Error("Please select a valid image first.");
        const width = Number(widthInput.value);
        const height = Number(heightInput.value);
        if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
            throw new Error("Please enter positive whole-number dimensions.");
        }
        EasyTools.checkPixels(width, height);
        const extension = format.value;
        const outputQuality = Number(quality.value) / 100;
        releaseJob = EasyTools.beginJob(generateBtn);
        processing.style.display = "block";
        result.style.display = "none";
        canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Your browser could not create an image canvas.");
        if (extension === "jpg") {
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, width, height);
        }
        context.drawImage(image, 0, 0, width, height);
        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(value => value ? resolve(value) : reject(new Error("Image could not be resized.")),
                getMimeType(extension), outputQuality);
        });
        if (downloadURL) URL.revokeObjectURL(downloadURL);
        downloadURL = URL.createObjectURL(blob);
        originalResult.textContent = image.width + " \u00d7 " + image.height;
        newDimensions.textContent = width + " \u00d7 " + height;
        newFileSize.textContent = formatBytes(blob.size);
        downloadBtn.href = downloadURL;
        downloadBtn.download = file.name.replace(/\.[^/.]+$/, "") + "-resized." + extension;
        result.style.display = "block";
        result.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
        result.style.display = "none";
        alert(error.message || "Image could not be resized. Please try again.");
    } finally {
        if (canvas) canvas.width = canvas.height = 0;
        processing.style.display = "none";
        if (releaseJob) releaseJob();
        generateBtn.disabled = false;
    }
}


/* MIME */

function getMimeType(extension = format.value) {

    if (
        extension === "png"
    ) {

        return "image/png";
    }

    if (
        extension === "webp"
    ) {

        return "image/webp";
    }

    return "image/jpeg";
}