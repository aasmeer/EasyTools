import * as pdfjsLib
from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.2.108/pdf.min.mjs";


pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.2.108/pdf.worker.min.mjs";


const pdfInput =
    document.getElementById("pdfInput");

const fileInfo =
    document.getElementById("fileInfo");

const fileName =
    document.getElementById("fileName");

const fileSize =
    document.getElementById("fileSize");

const settings =
    document.getElementById("settings");

const compressionCards =
    document.querySelectorAll(
        ".compression-card"
    );

const qualitySlider =
    document.getElementById("quality");

const qualityValue =
    document.getElementById(
        "qualityValue"
    );

const generateBtn =
    document.getElementById(
        "generateBtn"
    );

const processing =
    document.getElementById(
        "processing"
    );

const progressText =
    document.getElementById(
        "progressText"
    );

const result =
    document.getElementById(
        "result"
    );

const originalSize =
    document.getElementById(
        "originalSize"
    );

const compressedSize =
    document.getElementById(
        "compressedSize"
    );

const savedPercent =
    document.getElementById(
        "savedPercent"
    );

const downloadBtn =
    document.getElementById(
        "downloadBtn"
    );

const adModal =
    document.getElementById(
        "adModal"
    );

const countdown =
    document.getElementById(
        "countdown"
    );


let selectedFile = null;

let renderScale = 1.2;

let downloadURL = null;


/* ============================
   FORMAT SIZE
============================ */

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


/* ============================
   PDF UPLOAD
============================ */

pdfInput.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];


        if (!file) {
            return;
        }


        if (
            file.type !==
            "application/pdf"
        ) {

            alert(
                "Please select a PDF file."
            );

            return;

        }


        selectedFile = file;


        fileName.textContent =
            file.name;


        fileSize.textContent =
            formatBytes(
                file.size
            );


        fileInfo.style.display =
            "block";


        settings.style.display =
            "block";


        result.style.display =
            "none";


        processing.style.display =
            "none";

    }
);


/* ============================
   COMPRESSION LEVEL
============================ */

compressionCards.forEach(
    function (card) {

        card.addEventListener(
            "click",
            function () {

                compressionCards.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                card.classList.add(
                    "active"
                );


                const quality =
                    Number(
                        card.dataset.quality
                    );


                renderScale =
                    Number(
                        card.dataset.scale
                    );


                qualitySlider.value =
                    Math.round(
                        quality * 100
                    );


                qualityValue.textContent =
                    Math.round(
                        quality * 100
                    ) + "%";

            }
        );

    }
);


/* ============================
   QUALITY SLIDER
============================ */

qualitySlider.addEventListener(
    "input",
    function () {

        qualityValue.textContent =
            qualitySlider.value +
            "%";

    }
);


/* ============================
   GENERATE
============================ */

generateBtn.addEventListener(
    "click",
    function () {

        if (!selectedFile) {

            alert(
                "Please select a PDF first."
            );

            return;

        }


        generateBtn.disabled =
            true;


        showAdvertisement();

    }
);


/* ============================
   DEMO AD
============================ */

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

                    clearInterval(
                        timer
                    );


                    adModal.style.display =
                        "none";


                    compressPDF();

                }

            },
            1000
        );

}


/* ============================
   COMPRESS PDF
============================ */

async function compressPDF() {

    processing.style.display =
        "block";


    result.style.display =
        "none";


    try {

        const arrayBuffer =
            await selectedFile
                .arrayBuffer();


        const loadingTask =
            pdfjsLib.getDocument({
                data: arrayBuffer
            });


        const pdfDocument =
            await loadingTask.promise;


        const {
            jsPDF
        } = window.jspdf;


        let outputPDF = null;


        const quality =
            Number(
                qualitySlider.value
            ) / 100;


        for (
            let pageNumber = 1;
            pageNumber <=
            pdfDocument.numPages;
            pageNumber++
        ) {

            progressText.textContent =
                "Processing page " +
                pageNumber +
                " of " +
                pdfDocument.numPages +
                "...";


            const page =
                await pdfDocument
                    .getPage(
                        pageNumber
                    );


            const viewport =
                page.getViewport({
                    scale: renderScale
                });


            const canvas =
                document.createElement(
                    "canvas"
                );


            const context =
                canvas.getContext(
                    "2d"
                );


            canvas.width =
                Math.round(
                    viewport.width
                );


            canvas.height =
                Math.round(
                    viewport.height
                );


            await page.render({

                canvasContext:
                    context,

                viewport:
                    viewport

            }).promise;


            const imageData =
                canvas.toDataURL(
                    "image/jpeg",
                    quality
                );


            const pageWidth =
                viewport.width *
                0.75;


            const pageHeight =
                viewport.height *
                0.75;


            const orientation =
                pageWidth >
                pageHeight
                    ? "landscape"
                    : "portrait";


            if (
                pageNumber === 1
            ) {

                outputPDF =
                    new jsPDF({

                        orientation:
                            orientation,

                        unit:
                            "pt",

                        format: [
                            pageWidth,
                            pageHeight
                        ],

                        compress:
                            true

                    });

            } else {

                outputPDF.addPage(
                    [
                        pageWidth,
                        pageHeight
                    ],
                    orientation
                );

            }


            outputPDF.addImage(

                imageData,

                "JPEG",

                0,

                0,

                pageWidth,

                pageHeight,

                undefined,

                "FAST"

            );

        }


        progressText.textContent =
            "Creating compressed PDF...";


        const compressedBlob =
            outputPDF.output(
                "blob"
            );


        showResult(
            compressedBlob
        );


    } catch (error) {

        console.error(error);


        processing.style.display =
            "none";


        generateBtn.disabled =
            false;


        alert(
            "PDF compression failed. Please try another PDF."
        );

    }

}


/* ============================
   RESULT
============================ */

function showResult(blob) {

    if (downloadURL) {

        URL.revokeObjectURL(
            downloadURL
        );

    }


    downloadURL =
        URL.createObjectURL(
            blob
        );


    const original =
        selectedFile.size;


    const compressed =
        blob.size;


    let saved =
        (
            (
                original -
                compressed
            )
            /
            original
        ) * 100;


    if (saved < 0) {

        saved = 0;

    }


    originalSize.textContent =
        formatBytes(
            original
        );


    compressedSize.textContent =
        formatBytes(
            compressed
        );


    savedPercent.textContent =
        Math.round(
            saved
        ) + "%";


    downloadBtn.href =
        downloadURL;


    const cleanName =
        selectedFile.name
            .replace(
                /\.pdf$/i,
                ""
            );


    downloadBtn.download =
        cleanName +
        "-compressed-easytools.pdf";


    processing.style.display =
        "none";


    result.style.display =
        "block";


    generateBtn.disabled =
        false;

}