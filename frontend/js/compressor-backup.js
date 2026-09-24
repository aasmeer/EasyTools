const fileInput = document.getElementById("fileInput");

const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");

const preview = document.getElementById("preview");
const previewImage = document.getElementById("previewImage");

const settings = document.getElementById("settings");

const format = document.getElementById("format");

const targetSize = document.getElementById("targetSize");
const sizeUnit = document.getElementById("sizeUnit");

const quality = document.getElementById("quality");
const qualityValue = document.getElementById("qualityValue");

const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");

const maintainRatio = document.getElementById("maintainRatio");

const generateBtn = document.getElementById("generateBtn");


const processing = document.getElementById("processing");

const result = document.getElementById("result");

const originalSize = document.getElementById("originalSize");
const compressedSize = document.getElementById("compressedSize");
const savedPercent = document.getElementById("savedPercent");

const resultFormat = document.getElementById("resultFormat");

const downloadBtn = document.getElementById("downloadBtn");


let selectedFile = null;
let loadedImage = null;
let imageLoadVersion = 0;

let originalWidth = 0;
let originalHeight = 0;

let downloadURL = null;


/* --------------------------------
   SIZE FORMAT
-------------------------------- */

function formatBytes(bytes) {

    if (bytes < 1024) {

        return bytes + " B";

    }

    if (bytes < 1024 * 1024) {

        return (bytes / 1024).toFixed(1) + " KB";

    }

    return (bytes / (1024 * 1024)).toFixed(2) + " MB";

}


/* --------------------------------
   TARGET SIZE
-------------------------------- */

function getTargetBytes() {
    if (!targetSize.value.trim()) return null;
    const value = Number(targetSize.value);
    const bytes = value * (sizeUnit.value === "MB" ? 1024 * 1024 : 1024);
    if (!Number.isFinite(bytes) || bytes <= 0) {
        throw new RangeError("Please enter a positive, finite target file size, or leave it blank.");
    }
    return bytes;
}


/* --------------------------------
   FILE UPLOAD
-------------------------------- */

fileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) loadImage(file);
});

async function loadImage(file) {
    const version = ++imageLoadVersion;
    selectedFile = null;
    loadedImage = null;
    originalWidth = originalHeight = 0;
    fileInfo.style.display = preview.style.display = settings.style.display = result.style.display = "none";
    generateBtn.disabled = true;
    try {
        const decoded = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Could not read the selected image."));
            reader.onabort = () => reject(new Error("Image loading was interrupted."));
            reader.onload = event => {
                const img = new Image();
                img.onerror = () => reject(new Error("Could not load the selected image."));
                img.onload = () => resolve({ img, dataURL: event.target.result });
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
        if (version !== imageLoadVersion) return;
        EasyTools.checkPixels(decoded.img.width, decoded.img.height);
        loadedImage = decoded.img;
        selectedFile = file;
        originalWidth = loadedImage.width;
        originalHeight = loadedImage.height;
        widthInput.value = originalWidth;
        heightInput.value = originalHeight;
        fileName.textContent = file.name;
        fileSize.textContent = formatBytes(file.size);
        previewImage.src = decoded.dataURL;
        fileInfo.style.display = preview.style.display = settings.style.display = "block";
    } catch (error) {
        if (version === imageLoadVersion) alert(error.message || "Could not load the selected image.");
    } finally {
        if (version === imageLoadVersion) generateBtn.disabled = false;
    }
}


/* --------------------------------
   QUALITY
-------------------------------- */

quality.addEventListener("input", function () {

    qualityValue.textContent =
        quality.value + "%";

});


/* --------------------------------
   MAINTAIN RATIO
-------------------------------- */

widthInput.addEventListener("input", function () {

    if (!maintainRatio.checked) return;

    if (!originalWidth || !originalHeight) return;


    const newWidth =
        Number(widthInput.value);


    if (!Number.isInteger(newWidth) || newWidth <= 0) return;


    const ratio =
        originalHeight / originalWidth;


    heightInput.value =
        Math.max(1, Math.round(newWidth * ratio));

});


heightInput.addEventListener("input", function () {

    if (!maintainRatio.checked) return;

    if (!originalWidth || !originalHeight) return;


    const newHeight =
        Number(heightInput.value);


    if (!Number.isInteger(newHeight) || newHeight <= 0) return;


    const ratio =
        originalWidth / originalHeight;


    widthInput.value =
        Math.max(1, Math.round(newHeight * ratio));

});


/* --------------------------------
   GENERATE
-------------------------------- */

generateBtn.addEventListener("click", function () {

    if (!selectedFile) {

        alert("Please select an image first.");

        return;

    }


    if (!Number.isInteger(Number(widthInput.value)) || Number(widthInput.value) <= 0 ||
        !Number.isInteger(Number(heightInput.value)) || Number(heightInput.value) <= 0) {

        alert("Please enter positive whole-number dimensions.");

        return;

    }


    generateBtn.disabled = true;


    showAdvertisement();

});


/* --------------------------------
   AD
-------------------------------- */

function showAdvertisement() {
    // Tool use never depends on viewing or interacting with an advertisement.
    return generateFile();
}


/* --------------------------------
   GENERATE FILE
-------------------------------- */

async function generateFile() {
    let canvas;
    let releaseJob;
    try {
        if (!selectedFile || !loadedImage) throw new Error("Please select an image first.");
        const width = Number(widthInput.value);
        const height = Number(heightInput.value);
        if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
            throw new Error("Please enter positive whole-number dimensions.");
        }
        EasyTools.checkPixels(width, height);
        releaseJob = EasyTools.beginJob(generateBtn);
        processing.style.display = "block";
        result.style.display = "none";
        const extension = format.value;
        const target = getTargetBytes();
        canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Your browser could not create an image canvas.");
        if (extension === "jpg" || extension === "pdf") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
        }
        ctx.drawImage(loadedImage, 0, 0, width, height);
        const blob = extension === "pdf"
            ? generatePDF(canvas, width, height)
            : await generateImage(canvas);
        finishResult(blob, extension);
        if (target && blob.size > target) {
            const detail = ["png", "pdf"].includes(extension)
                ? "PNG and PDF outputs do not support target-size optimization. " : "The available quality range could not reach that target. ";
            alert("The output is " + formatBytes(blob.size) + ", above the requested " + formatBytes(target) + ". " +
                detail + "The download is still available. Reduce the dimensions or choose another format to make a smaller file.");
        }
    } catch (error) {
        result.style.display = "none";
        alert(error.message || "Something went wrong while generating the file.");
    } finally {
        if (canvas) canvas.width = canvas.height = 0;
        processing.style.display = "none";
        if (releaseJob) releaseJob();
        generateBtn.disabled = false;
    }
}

function canvasToBlob(canvas, mime, outputQuality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob) resolve(blob);
            else reject(new Error("Could not generate the image."));
        }, mime, outputQuality);
    });
}

async function generateImage(canvas) {
    const mime = getMimeType();
    const target = getTargetBytes();
    const currentQuality = Number(quality.value) / 100;
    const blob = await canvasToBlob(canvas, mime, currentQuality);
    if (target && blob.size > target && mime !== "image/png") {
        return findTargetSize(canvas, mime, target, currentQuality);
    }
    return blob;
}

async function findTargetSize(canvas, mime, target, startingQuality) {
    let low = 0.05;
    let high = startingQuality;
    let bestBlob = null;
    let blob;
    for (let attempts = 0; attempts < 8; attempts++) {
        const q = (low + high) / 2;
        blob = await canvasToBlob(canvas, mime, q);
        if (blob.size <= target) {
            bestBlob = blob;
            low = q;
        } else {
            high = q;
        }
    }
    return bestBlob || blob;
}


/* --------------------------------
   MIME TYPE
-------------------------------- */

function getMimeType() {

    switch (format.value) {

        case "png":
            return "image/png";

        case "webp":
            return "image/webp";

        default:
            return "image/jpeg";

    }

}


/* --------------------------------
   EXTENSION
-------------------------------- */



/* --------------------------------
   PDF
-------------------------------- */

function generatePDF(
    canvas,
    width,
    height
) {

    const {
        jsPDF
    } = window.jspdf;


    const imageData =
        canvas.toDataURL(
            "image/jpeg",
            Number(quality.value) / 100
        );


    /*
        Convert pixels to PDF points.
    */

    const pdfWidth =
        width * 0.75;

    const pdfHeight =
        height * 0.75;


    const pdf =
        new jsPDF({

            orientation:
                width >= height
                    ? "landscape"
                    : "portrait",

            unit: "pt",

            format: [
                pdfWidth,
                pdfHeight
            ]

        });


    pdf.addImage(
        imageData,
        "JPEG",
        0,
        0,
        pdfWidth,
        pdfHeight
    );


    const blob =
        pdf.output("blob");


    return blob;

}


/* --------------------------------
   RESULT
-------------------------------- */

function finishResult(
    blob,
    extension
) {

    if (downloadURL) {

        URL.revokeObjectURL(
            downloadURL
        );

    }


    downloadURL =
        URL.createObjectURL(blob);


    const original =
        selectedFile.size;


    const generated =
        blob.size;


    let saved =
        ((original - generated)
        / original) * 100;




    originalSize.textContent =
        formatBytes(original);


    compressedSize.textContent =
        formatBytes(generated);


    savedPercent.textContent =
        original > 0 ? Math.round(saved) + "%" : "N/A";


    resultFormat.textContent =
        extension.toUpperCase();


    downloadBtn.href =
        downloadURL;


    downloadBtn.download =
        createFileName(extension);


    processing.style.display =
        "none";


    result.style.display =
        "block";


    generateBtn.disabled =
        false;

}


/* --------------------------------
   FILE NAME
-------------------------------- */

function createFileName(extension) {

    const originalName =
        selectedFile.name
            .replace(/\.[^/.]+$/, "");


    return (
        originalName +
        "-easytools." +
        extension
    );

}


/* --------------------------------
   ERROR
-------------------------------- */
