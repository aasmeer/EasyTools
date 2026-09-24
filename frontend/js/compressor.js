/* =========================================
   EASYTOOLS MULTI IMAGE COMPRESSOR
========================================= */


const fileInput =
    document.getElementById("fileInput");

const uploadArea =
    document.getElementById("uploadArea");

const fileCount =
    document.getElementById("fileCount");

const previewGrid =
    document.getElementById("previewGrid");

const settings =
    document.getElementById("settings");

const format =
    document.getElementById("format");

const targetSize =
    document.getElementById("targetSize");

const sizeUnit =
    document.getElementById("sizeUnit");

const quality =
    document.getElementById("quality");

const qualityValue =
    document.getElementById("qualityValue");

const widthInput =
    document.getElementById("width");

const heightInput =
    document.getElementById("height");

const maintainRatio =
    document.getElementById("maintainRatio");

const generateBtn =
    document.getElementById("generateBtn");

const clearBtn =
    document.getElementById("clearBtn");

const processing =
    document.getElementById("processing");

const progressText =
    document.getElementById("progressText");

const result =
    document.getElementById("result");

const resultCount =
    document.getElementById("resultCount");

const originalTotal =
    document.getElementById("originalTotal");

const zipSize =
    document.getElementById("zipSize");

const downloadBtn =
    document.getElementById("downloadBtn");


/* =========================================
   VARIABLES
========================================= */


let selectedFiles = [];

let firstImageWidth = 0;

let firstImageHeight = 0;

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
   TARGET BYTES
========================================= */


function getTargetBytes() {
    if (!targetSize.value.trim()) return null;
    const value = Number(targetSize.value);
    const bytes = value * (sizeUnit.value === "MB" ? 1024 * 1024 : 1024);
    if (!Number.isFinite(bytes) || bytes <= 0) {
        throw new RangeError("Please enter a positive, finite target file size, or leave it blank.");
    }
    return bytes;
}


/* =========================================
   FILE UPLOAD
========================================= */


fileInput.addEventListener(
    "change",
    function () {

        addFiles(
            Array.from(this.files)
        );

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


        const files =
            Array.from(
                event.dataTransfer.files
            );


        addFiles(files);

    }
);


/* =========================================
   ADD FILES
========================================= */


function addFiles(files) {
    try { EasyTools.checkFiles([...selectedFiles, ...Array.from(files)]); }
    catch (error) { alert(error.message); return; }

    const images =
        files.filter(function (file) {

            return file.type.startsWith(
                "image/"
            );

        });


    if (!images.length) {

        alert(
            "Please select JPG, PNG or WEBP images."
        );

        return;

    }


    selectedFiles =
        selectedFiles.concat(images);


    /*
        Limit to 20 images.
    */

    if (selectedFiles.length > 20) {

        selectedFiles =
            selectedFiles.slice(0, 20);

        alert(
            "Maximum 20 images can be uploaded at once."
        );

    }


    showFiles();

}


/* =========================================
   SHOW FILES
========================================= */


function showFiles() {

    previewGrid.innerHTML = "";


    fileCount.style.display =
        "block";


    fileCount.textContent =
        selectedFiles.length +
        " image" +
        (
            selectedFiles.length === 1
                ? ""
                : "s"
        ) +
        " selected";


    settings.style.display =
        "block";


    result.style.display =
        "none";


    processing.style.display =
        "none";


    selectedFiles.forEach(
        function (file, index) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "image-card";


            const img =
                document.createElement(
                    "img"
                );


            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "image-card-info";


            const name =
                document.createElement(
                    "div"
                );


            name.className =
                "image-card-name";


            name.textContent =
                file.name;


            const size =
                document.createElement(
                    "div"
                );


            size.className =
                "image-card-size";


            size.textContent =
                formatBytes(
                    file.size
                );


            info.appendChild(name);

            info.appendChild(size);


            card.appendChild(img);

            card.appendChild(info);


            previewGrid.appendChild(card);


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    img.src =
                        event.target.result;


                    /*
                        First image dimensions.
                    */

                    if (index === 0) {

                        const tempImg =
                            new Image();


                        tempImg.onload =
                            function () {

                                firstImageWidth =
                                    tempImg.width;

                                firstImageHeight =
                                    tempImg.height;


                                widthInput.value =
                                    firstImageWidth;

                                heightInput.value =
                                    firstImageHeight;

                            };


                        tempImg.src =
                            event.target.result;

                    }

                };


            reader.readAsDataURL(file);

        }
    );

}


/* =========================================
   QUALITY
========================================= */


quality.addEventListener(
    "input",
    function () {

        qualityValue.textContent =
            quality.value + "%";

    }
);


/* =========================================
   WIDTH
========================================= */


widthInput.addEventListener(
    "input",
    function () {

        if (!maintainRatio.checked)
            return;


        if (
            !firstImageWidth ||
            !firstImageHeight
        )
            return;


        const width =
            Number(
                widthInput.value
            );


        if (!Number.isInteger(width) || width <= 0)
            return;


        const ratio =
            firstImageHeight /
            firstImageWidth;


        heightInput.value =
            Math.max(1, Math.round(width * ratio));

    }
);


/* =========================================
   HEIGHT
========================================= */


heightInput.addEventListener(
    "input",
    function () {

        if (!maintainRatio.checked)
            return;


        if (
            !firstImageWidth ||
            !firstImageHeight
        )
            return;


        const height =
            Number(
                heightInput.value
            );


        if (!Number.isInteger(height) || height <= 0)
            return;


        const ratio =
            firstImageWidth /
            firstImageHeight;


        widthInput.value =
            Math.max(1, Math.round(height * ratio));

    }
);


/* =========================================
   CLEAR
========================================= */


clearBtn.addEventListener(
    "click",
    function () {

        selectedFiles = [];


        fileInput.value = "";


        previewGrid.innerHTML = "";


        fileCount.style.display =
            "none";


        settings.style.display =
            "none";


        result.style.display =
            "none";


        processing.style.display =
            "none";

    }
);


/* =========================================
   GENERATE BUTTON
========================================= */

generateBtn.addEventListener(
    "click",
    function () {

        if (!selectedFiles.length) {
            alert("Please select at least one image.");
            return;
        }

        if (!Number.isInteger(Number(widthInput.value)) || Number(widthInput.value) <= 0 ||
            !Number.isInteger(Number(heightInput.value)) || Number(heightInput.value) <= 0) {
            alert("Please enter positive whole-number dimensions.");
            return;
        }

        generateBtn.disabled = true;

        startProcessing();

    }
);




/* =========================================
   START PROCESSING
========================================= */


async function startProcessing() {
    const releaseJob = EasyTools.beginJob(generateBtn);
    try {


    processing.style.display =
        "block";


    result.style.display =
        "none";


    try {
        const files = selectedFiles.slice();
        const options = Object.freeze({
            width: Number(widthInput.value),
            height: Number(heightInput.value),
            maintainRatio: maintainRatio.checked,
            format: format.value,
            quality: Number(quality.value) / 100,
            targetBytes: getTargetBytes()
        });
        const budget = EasyTools.createImageBudget();
        EasyTools.checkFiles(files);

        const zip =
            new JSZip();


        let totalOriginalSize = 0;
        const usedNames = new Set();
        const oversized = [];


        for (
            let i = 0;
            i < files.length;
            i++
        ) {

            const file =
                files[i];


            totalOriginalSize +=
                file.size;


            progressText.textContent =
                "Processing image " +
                (i + 1) +
                " of " +
                files.length +
                "...";


            const blob =
                await processImage(file, options, budget);


            const filename =
                createOutputName(
                    file.name, usedNames, options.format
                );


            budget.reserveOutput(blob.size);
            if (options.targetBytes && blob.size > options.targetBytes) {
                oversized.push(filename + ": " + formatBytes(blob.size));
            }

            zip.file(
                filename,
                blob
            );

        }


        progressText.textContent =
            "Creating ZIP file...";


        const zipBlob =
            await zip.generateAsync(
                {
                    type: "blob",
                    compression: "DEFLATE",
                    compressionOptions: {
                        level: 6
                    }
                }
            );


        finishResult(
            zipBlob,
            totalOriginalSize,
            files.length
        );
        if (oversized.length) {
            const detail = ["png", "pdf"].includes(options.format)
                ? "PNG and PDF outputs do not support target-size optimization. " : "The available quality range could not reach that target. ";
            alert(oversized.length + " of " + files.length + " output files exceed the requested size of " +
                formatBytes(options.targetBytes) + " per file. " + detail +
                "The ZIP is still available. Reduce the dimensions or choose another format to make smaller files.\n\n" + oversized.join("\n"));
        }


    } catch (error) {

        console.error(error);


        processing.style.display =
            "none";


        generateBtn.disabled =
            false;


        alert(
            error instanceof RangeError ? error.message :
                "Something went wrong while processing the images."
        );

    }


    } finally {
        releaseJob();
    }
}


/* =========================================
   PROCESS SINGLE IMAGE
========================================= */


async function processImage(file, options, budget) {
    const img = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Could not read file."));
        reader.onabort = () => reject(new Error("Image loading was interrupted."));
        reader.onload = event => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error("Could not load image."));
            image.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
    let canvas;
    try {
        EasyTools.checkPixels(img.width, img.height);
        let width = options.width;
        let height = options.height;
        if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
            throw new RangeError("Please enter positive whole-number dimensions.");
        }
        if (options.maintainRatio) {
            const scale = Math.min(width / img.width, height / img.height);
            width = Math.max(1, Math.round(img.width * scale));
            height = Math.max(1, Math.round(img.height * scale));
        }
        budget.reserveImage(img.width, img.height, width, height);
        EasyTools.checkPixels(width, height);
        canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Your browser could not create an image canvas.");
        if (options.format === "jpg" || options.format === "pdf") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
        }
        ctx.drawImage(img, 0, 0, width, height);
        if (options.format === "pdf") return createPDF(canvas, width, height, options.quality);
        const mime = getMimeType(options.format);
        const blob = await canvasToBlob(canvas, mime, options.quality);
        if (options.targetBytes && blob.size > options.targetBytes && mime !== "image/png") {
            return await findTargetSize(canvas, mime, options.targetBytes, options.quality);
        }
        return blob;
    } finally {
        if (canvas) canvas.width = canvas.height = 0;
    }
}

function canvasToBlob(canvas, mime, quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Could not create image.")), mime, quality);
    });
}


/* =========================================
   MIME TYPE
========================================= */


function getMimeType(outputFormat = format.value) {

    if (
        outputFormat === "png"
    ) {

        return "image/png";

    }


    if (
        outputFormat === "webp"
    ) {

        return "image/webp";

    }


    return "image/jpeg";

}


/* =========================================
   TARGET SIZE COMPRESSION
========================================= */


async function findTargetSize(canvas, mime, target, startingQuality) {
    let low = 0.05;
    let high = startingQuality;
    let bestBlob = null;
    let blob;
    for (let attempts = 0; attempts < 9; attempts++) {
        const currentQuality = (low + high) / 2;
        blob = await canvasToBlob(canvas, mime, currentQuality);
        if (blob.size <= target) {
            bestBlob = blob;
            low = currentQuality;
        } else {
            high = currentQuality;
        }
    }
    return bestBlob || blob;
}


/* =========================================
   PDF
========================================= */


function createPDF(
    canvas,
    width,
    height,
    outputQuality = Number(quality.value) / 100
) {

    const {
        jsPDF
    } = window.jspdf;


    const imageData =
        canvas.toDataURL(
            "image/jpeg",
            outputQuality
        );


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


    return pdf.output("blob");

}


/* =========================================
   OUTPUT NAME
========================================= */


function createOutputName(originalName, usedNames = new Set(), outputFormat = format.value) {
    const stem = originalName.replace(/\.[^/.]+$/, "") + "-easytools";
    let name = stem + "." + outputFormat;
    let suffix = 2;
    while (usedNames.has(name.toLowerCase())) {
        name = stem + "-" + suffix++ + "." + outputFormat;
    }
    usedNames.add(name.toLowerCase());
    return name;
}


/* =========================================
   FINISH RESULT
========================================= */


function finishResult(
    zipBlob,
    totalOriginalSize,
    processedCount = selectedFiles.length
) {

    if (downloadURL) {

        URL.revokeObjectURL(
            downloadURL
        );

    }


    downloadURL =
        URL.createObjectURL(
            zipBlob
        );


    resultCount.textContent =
        processedCount;


    originalTotal.textContent =
        formatBytes(
            totalOriginalSize
        );


    zipSize.textContent =
        formatBytes(
            zipBlob.size
        );


    downloadBtn.href =
        downloadURL;


    downloadBtn.download =
        "easytools-images.zip";


    processing.style.display =
        "none";


    result.style.display =
        "block";


    generateBtn.disabled =
        false;

}