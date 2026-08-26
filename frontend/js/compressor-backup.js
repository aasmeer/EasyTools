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

const adModal = document.getElementById("adModal");
const countdown = document.getElementById("countdown");

const processing = document.getElementById("processing");

const result = document.getElementById("result");

const originalSize = document.getElementById("originalSize");
const compressedSize = document.getElementById("compressedSize");
const savedPercent = document.getElementById("savedPercent");

const resultFormat = document.getElementById("resultFormat");

const downloadBtn = document.getElementById("downloadBtn");


let selectedFile = null;

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

    const value = Number(targetSize.value);

    if (!value || value <= 0) {

        return null;

    }

    if (sizeUnit.value === "MB") {

        return value * 1024 * 1024;

    }

    return value * 1024;

}


/* --------------------------------
   FILE UPLOAD
-------------------------------- */

fileInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;


    selectedFile = file;


    fileName.textContent = file.name;

    fileSize.textContent =
        formatBytes(file.size);


    fileInfo.style.display = "block";

    settings.style.display = "block";

    result.style.display = "none";

    processing.style.display = "none";


    const reader = new FileReader();


    reader.onload = function (event) {

        previewImage.src =
            event.target.result;

        preview.style.display = "block";


        const img = new Image();


        img.onload = function () {

            originalWidth = img.width;

            originalHeight = img.height;


            widthInput.value =
                originalWidth;

            heightInput.value =
                originalHeight;

        };


        img.src =
            event.target.result;

    };


    reader.readAsDataURL(file);

});


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


    if (!newWidth) return;


    const ratio =
        originalHeight / originalWidth;


    heightInput.value =
        Math.round(newWidth * ratio);

});


heightInput.addEventListener("input", function () {

    if (!maintainRatio.checked) return;

    if (!originalWidth || !originalHeight) return;


    const newHeight =
        Number(heightInput.value);


    if (!newHeight) return;


    const ratio =
        originalWidth / originalHeight;


    widthInput.value =
        Math.round(newHeight * ratio);

});


/* --------------------------------
   GENERATE
-------------------------------- */

generateBtn.addEventListener("click", function () {

    if (!selectedFile) {

        alert("Please select an image first.");

        return;

    }


    if (!widthInput.value ||
        !heightInput.value) {

        alert("Please enter image dimensions.");

        return;

    }


    generateBtn.disabled = true;


    showAdvertisement();

});


/* --------------------------------
   AD
-------------------------------- */

function showAdvertisement() {

    adModal.style.display = "flex";


    let seconds = 5;


    countdown.textContent =
        seconds;


    const timer =
        setInterval(function () {

            seconds--;

            countdown.textContent =
                seconds;


            if (seconds <= 0) {

                clearInterval(timer);

                adModal.style.display =
                    "none";

                generateFile();

            }

        }, 1000);

}


/* --------------------------------
   GENERATE FILE
-------------------------------- */

function generateFile() {

    processing.style.display =
        "block";

    result.style.display =
        "none";


    const reader =
        new FileReader();


    reader.onload = function (event) {

        const img =
            new Image();


        img.onload = function () {

            const width =
                Number(widthInput.value);

            const height =
                Number(heightInput.value);


            const canvas =
                document.createElement("canvas");


            const ctx =
                canvas.getContext("2d");


            canvas.width =
                width;

            canvas.height =
                height;


            /*
                White background for JPG/PDF.
                This prevents transparent images
                from becoming black.
            */

            if (
                format.value === "jpg" ||
                format.value === "pdf"
            ) {

                ctx.fillStyle = "#ffffff";

                ctx.fillRect(
                    0,
                    0,
                    width,
                    height
                );

            }


            ctx.drawImage(
                img,
                0,
                0,
                width,
                height
            );


            if (format.value === "pdf") {

                generatePDF(
                    canvas,
                    width,
                    height
                );

                return;

            }


            generateImage(
                canvas
            );

        };


        img.src =
            event.target.result;

    };


    reader.readAsDataURL(selectedFile);

}


/* --------------------------------
   IMAGE GENERATION
-------------------------------- */

function generateImage(canvas) {

    const mime =
        getMimeType();


    const target =
        getTargetBytes();


    let currentQuality =
        Number(quality.value) / 100;


    canvas.toBlob(

        async function (blob) {

            if (!blob) {

                finishWithError();

                return;

            }


            /*
                Try to reach target size.
            */

            if (
                target &&
                blob.size > target &&
                mime !== "image/png"
            ) {

                blob =
                    await findTargetSize(
                        canvas,
                        mime,
                        target,
                        currentQuality
                    );

            }


            finishResult(
                blob,
                getExtension()
            );

        },

        mime,

        currentQuality

    );

}


/* --------------------------------
   FIND TARGET SIZE
-------------------------------- */

function findTargetSize(
    canvas,
    mime,
    target,
    startingQuality
) {

    return new Promise(function (resolve) {

        let low = 0.05;

        let high = startingQuality;

        let bestBlob = null;

        let attempts = 0;


        function attempt() {

            attempts++;


            const q =
                (low + high) / 2;


            canvas.toBlob(

                function (blob) {

                    if (!blob) {

                        resolve(bestBlob);

                        return;

                    }


                    /*
                        Close enough.
                    */

                    if (
                        blob.size <= target
                    ) {

                        bestBlob =
                            blob;

                        low =
                            q;

                    } else {

                        high =
                            q;

                    }


                    /*
                        Stop after 8 attempts.
                    */

                    if (
                        attempts >= 8
                    ) {

                        resolve(
                            bestBlob || blob
                        );

                        return;

                    }


                    attempt();

                },

                mime,

                q

            );

        }


        attempt();

    });

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

function getExtension() {

    return format.value;

}


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


    finishResult(
        blob,
        "pdf"
    );

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


    if (saved < 0) {

        saved = 0;

    }


    originalSize.textContent =
        formatBytes(original);


    compressedSize.textContent =
        formatBytes(generated);


    savedPercent.textContent =
        Math.round(saved) + "%";


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

function finishWithError() {

    processing.style.display =
        "none";

    generateBtn.disabled =
        false;

    alert(
        "Something went wrong while generating the file."
    );

}