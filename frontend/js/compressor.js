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

const adModal =
    document.getElementById("adModal");

const countdown =
    document.getElementById("countdown");

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

    const value =
        Number(targetSize.value);


    if (!value || value <= 0) {

        return null;

    }


    if (sizeUnit.value === "MB") {

        return value *
            1024 *
            1024;

    }


    return value * 1024;

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


        if (!width)
            return;


        const ratio =
            firstImageHeight /
            firstImageWidth;


        heightInput.value =
            Math.round(
                width * ratio
            );

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


        if (!height)
            return;


        const ratio =
            firstImageWidth /
            firstImageHeight;


        widthInput.value =
            Math.round(
                height * ratio
            );

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

            alert(
                "Please select at least one image."
            );

            return;

        }


        if (
            !widthInput.value ||
            !heightInput.value
        ) {

            alert(
                "Please enter image dimensions."
            );

            return;

        }


        generateBtn.disabled =
            true;


        showAdvertisement();

    }
);


/* =========================================
   ADVERTISEMENT
========================================= */


function showAdvertisement() {

    adModal.style.display =
        "flex";


    let seconds = 5;


    countdown.textContent =
        seconds;


    const timer =
        setInterval(
            function () {

                seconds--;

                countdown.textContent =
                    seconds;


                if (seconds <= 0) {

                    clearInterval(timer);


                    adModal.style.display =
                        "none";


                    startProcessing();

                }

            },
            1000
        );

}


/* =========================================
   START PROCESSING
========================================= */


async function startProcessing() {

    processing.style.display =
        "block";


    result.style.display =
        "none";


    try {

        const zip =
            new JSZip();


        let totalOriginalSize = 0;


        for (
            let i = 0;
            i < selectedFiles.length;
            i++
        ) {

            const file =
                selectedFiles[i];


            totalOriginalSize +=
                file.size;


            progressText.textContent =
                "Processing image " +
                (i + 1) +
                " of " +
                selectedFiles.length +
                "...";


            const blob =
                await processImage(file);


            const filename =
                createOutputName(
                    file.name
                );


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
            totalOriginalSize
        );


    } catch (error) {

        console.error(error);


        processing.style.display =
            "none";


        generateBtn.disabled =
            false;


        alert(
            "Something went wrong while processing the images."
        );

    }

}


/* =========================================
   PROCESS SINGLE IMAGE
========================================= */


function processImage(file) {

    return new Promise(
        function (resolve, reject) {

            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    const img =
                        new Image();


                    img.onload =
                        async function () {

                            try {

                                const width =
                                    Number(
                                        widthInput.value
                                    );

                                const height =
                                    Number(
                                        heightInput.value
                                    );


                                const canvas =
                                    document.createElement(
                                        "canvas"
                                    );


                                const ctx =
                                    canvas.getContext(
                                        "2d"
                                    );


                                canvas.width =
                                    width;

                                canvas.height =
                                    height;


                                /*
                                    White background
                                    for JPG/PDF.
                                */

                                if (
                                    format.value === "jpg" ||
                                    format.value === "pdf"
                                ) {

                                    ctx.fillStyle =
                                        "#ffffff";

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


                                /*
                                    PDF
                                */

                                if (
                                    format.value === "pdf"
                                ) {

                                    const pdfBlob =
                                        createPDF(
                                            canvas,
                                            width,
                                            height
                                        );


                                    resolve(
                                        pdfBlob
                                    );


                                    return;

                                }


                                /*
                                    Image
                                */

                                const mime =
                                    getMimeType();


                                const target =
                                    getTargetBytes();


                                const startQuality =
                                    Number(
                                        quality.value
                                    ) / 100;


                                canvas.toBlob(
                                    async function (blob) {

                                        if (!blob) {

                                            reject(
                                                new Error(
                                                    "Could not create image."
                                                )
                                            );

                                            return;

                                        }


                                        /*
                                            Target size
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
                                                    startQuality
                                                );

                                        }


                                        resolve(blob);

                                    },
                                    mime,
                                    startQuality
                                );


                            } catch (error) {

                                reject(error);

                            }

                        };


                    img.onerror =
                        function () {

                            reject(
                                new Error(
                                    "Could not load image."
                                )
                            );

                        };


                    img.src =
                        event.target.result;

                };


            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "Could not read file."
                        )
                    );

                };


            reader.readAsDataURL(file);

        }
    );

}


/* =========================================
   MIME TYPE
========================================= */


function getMimeType() {

    if (
        format.value === "png"
    ) {

        return "image/png";

    }


    if (
        format.value === "webp"
    ) {

        return "image/webp";

    }


    return "image/jpeg";

}


/* =========================================
   TARGET SIZE COMPRESSION
========================================= */


function findTargetSize(
    canvas,
    mime,
    target,
    startingQuality
) {

    return new Promise(
        function (resolve) {

            let low = 0.05;

            let high =
                startingQuality;


            let bestBlob = null;

            let attempts = 0;


            function attempt() {

                attempts++;


                const currentQuality =
                    (
                        low + high
                    ) / 2;


                canvas.toBlob(
                    function (blob) {

                        if (!blob) {

                            resolve(
                                bestBlob
                            );

                            return;

                        }


                        if (
                            blob.size <= target
                        ) {

                            bestBlob =
                                blob;

                            low =
                                currentQuality;

                        } else {

                            high =
                                currentQuality;

                        }


                        if (
                            attempts >= 9
                        ) {

                            resolve(
                                bestBlob || blob
                            );

                            return;

                        }


                        attempt();

                    },
                    mime,
                    currentQuality
                );

            }


            attempt();

        }
    );

}


/* =========================================
   PDF
========================================= */


function createPDF(
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
            Number(
                quality.value
            ) / 100
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


function createOutputName(
    originalName
) {

    const cleanName =
        originalName.replace(
            /\.[^/.]+$/,
            ""
        );


    return (
        cleanName +
        "-easytools." +
        format.value
    );

}


/* =========================================
   FINISH RESULT
========================================= */


function finishResult(
    zipBlob,
    totalOriginalSize
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
        selectedFiles.length;


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