/* =========================================
   EASYTOOLS IMAGE CONVERTER
========================================= */


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

const fileFormat =
    document.getElementById("fileFormat");

const dimensions =
    document.getElementById("dimensions");

const preview =
    document.getElementById("preview");

const previewImage =
    document.getElementById("previewImage");

const settings =
    document.getElementById("settings");

const outputFormat =
    document.getElementById("outputFormat");

const backgroundColor =
    document.getElementById("backgroundColor");

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

const originalFormatResult =
    document.getElementById("originalFormatResult");

const newFormatResult =
    document.getElementById("newFormatResult");

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


/* =========================================
   FORMAT BYTES
========================================= */

function formatBytes(bytes) {

    if (bytes < 1024) {

        return bytes + " B";

    }

    if (bytes < 1024 * 1024) {

        return (
            bytes / 1024
        ).toFixed(1) + " KB";

    }

    return (
        bytes /
        (1024 * 1024)
    ).toFixed(2) + " MB";

}


/* =========================================
   FILE EXTENSION
========================================= */

function getOriginalExtension(file) {

    const name =
        file.name.toLowerCase();


    if (
        name.endsWith(".png")
    ) {

        return "PNG";

    }


    if (
        name.endsWith(".webp")
    ) {

        return "WEBP";

    }


    return "JPG";

}


/* =========================================
   FILE SELECT
========================================= */

fileInput.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];


        if (!file) {

            return;

        }


        loadFile(file);

    }
);


/* =========================================
   DRAG & DROP
========================================= */

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


        if (!file) {

            return;

        }


        if (
            !file.type.startsWith("image/")
        ) {

            alert(
                "Please select a JPG, PNG or WEBP image."
            );

            return;

        }


        loadFile(file);

    }
);


/* =========================================
   LOAD IMAGE
========================================= */

async function loadFile(file) {
    const version = ++imageLoadVersion;
    selectedFile = null;
    loadedImage = null;
    originalWidth = 0;
    originalHeight = 0;
    fileInfo.style.display = "none";
    preview.style.display = "none";
    settings.style.display = "none";
    result.style.display = "none";
    generateBtn.disabled = true;

    try {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            throw new Error("Only JPG, PNG and WEBP images are supported.");
        }
        const decoded = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Could not read the selected image."));
            reader.onabort = () => reject(new Error("Image loading was interrupted."));
            reader.onload = event => {
                const image = new Image();
                image.onerror = () => reject(new Error("Could not load the selected image."));
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
        fileName.textContent = file.name;
        fileSize.textContent = "File size: " + formatBytes(file.size);
        fileFormat.textContent = "Format: " + getOriginalExtension(file);
        dimensions.textContent = "Dimensions: " + originalWidth + " \u00d7 " + originalHeight;
        previewImage.src = decoded.dataURL;
        fileInfo.style.display = "block";
        preview.style.display = "block";
        settings.style.display = "block";
    } catch (error) {
        if (version === imageLoadVersion) alert(error.message || "Could not load the selected image.");
    } finally {
        if (version === imageLoadVersion) generateBtn.disabled = false;
    }
}


/* =========================================
   QUALITY
========================================= */

quality.addEventListener(
    "input",
    function () {

        qualityValue.textContent =
            quality.value +
            "%";

    }
);


/* =========================================
   CONVERT BUTTON
========================================= */

generateBtn.addEventListener(
    "click",
    function () {


        if (!selectedFile) {

            alert(
                "Please select an image first."
            );

            return;

        }


        generateBtn.disabled =
            true;


        result.style.display =
            "none";


        showAdvertisement();

    }
);


/* =========================================
   DEMO AD
========================================= */

function showAdvertisement() {
    // Tool use never depends on viewing or interacting with an advertisement.
    return convertImage();
}


/* =========================================
   CONVERT IMAGE
========================================= */

async function convertImage() {
    let canvas = null;
    let releaseJob = null;
    try {
        const file = selectedFile;
        const image = loadedImage;
        if (!file || !image) throw new Error("Please select an image first.");
        EasyTools.checkPixels(image.width, image.height);
        const extension = outputFormat.value;
        const outputQuality = Number(quality.value) / 100;
        const background = backgroundColor.value;
        releaseJob = EasyTools.beginJob(generateBtn);
        processing.style.display = "block";
        result.style.display = "none";
        canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Your browser could not create an image canvas.");
        if (extension === "jpg") {
            ctx.fillStyle = background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(image, 0, 0);
        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(value => {
                if (value) resolve(value);
                else reject(new Error("Image conversion failed."));
            }, getMimeType(extension), outputQuality);
        });
        showResult(blob, file, extension);
    } catch (error) {
        result.style.display = "none";
        alert(error.message || "Image conversion failed.");
    } finally {
        if (canvas) { canvas.width = 0; canvas.height = 0; }
        processing.style.display = "none";
        if (releaseJob) releaseJob();
        generateBtn.disabled = false;
    }
}


/* =========================================
   MIME
========================================= */

function getMimeType(extension = outputFormat.value) {


    if (
        extension ===
        "png"
    ) {

        return "image/png";

    }


    if (
        extension ===
        "webp"
    ) {

        return "image/webp";

    }


    return "image/jpeg";

}


/* =========================================
   RESULT
========================================= */

function showResult(blob, file = selectedFile, extension = outputFormat.value) {


    if (downloadURL) {

        URL.revokeObjectURL(
            downloadURL
        );

    }


    downloadURL =
        URL.createObjectURL(
            blob
        );


    originalFormatResult.textContent =
        getOriginalExtension(
            file
        );


    newFormatResult.textContent =
        extension
            .toUpperCase();


    newFileSize.textContent =
        formatBytes(
            blob.size
        );


    downloadBtn.href =
        downloadURL;


    const cleanName =
        file.name.replace(
            /\.[^/.]+$/,
            ""
        );


    downloadBtn.download =
        cleanName +
        "-converted." +
        extension;


    processing.style.display =
        "none";


    result.style.display =
        "block";


    generateBtn.disabled =
        false;


    result.scrollIntoView({

        behavior:
            "smooth",

        block:
            "center"

    });

}