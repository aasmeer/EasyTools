import * as pdfjsLib
from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.2.108/pdf.min.mjs";


pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.2.108/pdf.worker.min.mjs";


const pdfInput =
    document.getElementById("pdfInput");

const uploadArea =
    document.getElementById("uploadArea");

const fileInfo =
    document.getElementById("fileInfo");

const fileName =
    document.getElementById("fileName");

const fileSize =
    document.getElementById("fileSize");

const pageCount =
    document.getElementById("pageCount");

const settings =
    document.getElementById("settings");

const scaleSelect =
    document.getElementById("scale");

const background =
    document.getElementById("background");

const quality =
    document.getElementById("quality");

const qualityValue =
    document.getElementById("qualityValue");

const generateBtn =
    document.getElementById("generateBtn");

const processing =
    document.getElementById("processing");

const progressText =
    document.getElementById("progressText");

const result =
    document.getElementById("result");

const resultSummary =
    document.getElementById("resultSummary");

const pagesGrid =
    document.getElementById("pagesGrid");

const downloadAllBtn =
    document.getElementById("downloadAllBtn");

const adModal =
    document.getElementById("adModal");

const countdown =
    document.getElementById("countdown");


let selectedFile = null;

let pdfDocument = null;

let zipURL = null;

let pageURLs = [];


/* =========================
   FORMAT SIZE
========================= */

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


/* =========================
   SELECT FILE
========================= */

pdfInput.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];

        if (!file) return;

        loadPDF(file);

    }
);


/* =========================
   DRAG DROP
========================= */

uploadArea.addEventListener(
    "dragover",
    function(event) {

        event.preventDefault();

        uploadArea.classList.add(
            "dragging"
        );

    }
);


uploadArea.addEventListener(
    "dragleave",
    function() {

        uploadArea.classList.remove(
            "dragging"
        );

    }
);


uploadArea.addEventListener(
    "drop",
    function(event) {

        event.preventDefault();

        uploadArea.classList.remove(
            "dragging"
        );


        const file =
            event.dataTransfer.files[0];


        if (!file) return;


        if (
            file.type !==
            "application/pdf"
        ) {

            alert(
                "Please select a PDF file."
            );

            return;

        }


        loadPDF(file);

    }
);


/* =========================
   LOAD PDF
========================= */

async function loadPDF(file) {

    selectedFile =
        file;


    result.style.display =
        "none";


    fileName.textContent =
        file.name;


    fileSize.textContent =
        "File size: " +
        formatBytes(
            file.size
        );


    fileInfo.style.display =
        "block";


    try {

        const buffer =
            await file.arrayBuffer();


        const loadingTask =
            pdfjsLib.getDocument({
                data: buffer
            });


        pdfDocument =
            await loadingTask.promise;


        pageCount.textContent =
            "Pages: " +
            pdfDocument.numPages;


        settings.style.display =
            "block";


    } catch(error) {

        console.error(error);


        settings.style.display =
            "none";


        alert(
            "This PDF could not be opened."
        );

    }

}


/* =========================
   QUALITY
========================= */

quality.addEventListener(
    "input",
    function () {

        qualityValue.textContent =
            quality.value +
            "%";

    }
);


/* =========================
   GENERATE
========================= */

generateBtn.addEventListener(
    "click",
    function () {

        if (
            !selectedFile ||
            !pdfDocument
        ) {

            alert(
                "Please select a PDF first."
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


/* =========================
   DEMO AD
========================= */

function showAdvertisement() {

    adModal.style.display =
        "flex";


    let seconds =
        5;


    countdown.textContent =
        seconds;


    const timer =
        setInterval(
            function () {

                seconds--;


                countdown.textContent =
                    seconds;


                if (
                    seconds <= 0
                ) {

                    clearInterval(
                        timer
                    );


                    adModal.style.display =
                        "none";


                    convertPDF();

                }

            },
            1000
        );

}


/* =========================
   CONVERT PDF
========================= */

async function convertPDF() {

    processing.style.display =
        "block";


    pagesGrid.innerHTML =
        "";


    revokeOldURLs();


    try {

        const zip =
            new JSZip();


        const scale =
            Number(
                scaleSelect.value
            );


        const jpgQuality =
            Number(
                quality.value
            ) / 100;


        for (
            let pageNumber = 1;
            pageNumber <= pdfDocument.numPages;
            pageNumber++
        ) {

            progressText.textContent =
                "Converting page " +
                pageNumber +
                " of " +
                pdfDocument.numPages +
                "...";


            const page =
                await pdfDocument.getPage(
                    pageNumber
                );


            const viewport =
                page.getViewport({
                    scale: scale
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


            context.fillStyle =
                background.value;


            context.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            await page.render({

                canvasContext:
                    context,

                viewport:
                    viewport

            }).promise;


            const blob =
                await canvasToBlob(
                    canvas,
                    jpgQuality
                );


            const fileName =
                "page-" +
                pageNumber +
                ".jpg";


            zip.file(
                fileName,
                blob
            );


            addPageCard(
                blob,
                pageNumber
            );

        }


        progressText.textContent =
            "Creating ZIP file...";


        const zipBlob =
            await zip.generateAsync({

                type:
                    "blob",

                compression:
                    "DEFLATE",

                compressionOptions: {
                    level: 6
                }

            });


        if (zipURL) {

            URL.revokeObjectURL(
                zipURL
            );

        }


        zipURL =
            URL.createObjectURL(
                zipBlob
            );


        downloadAllBtn.href =
            zipURL;


        const cleanName =
            selectedFile.name
                .replace(
                    /\.pdf$/i,
                    ""
                );


        downloadAllBtn.download =
            cleanName +
            "-jpg-pages.zip";


        resultSummary.textContent =
            pdfDocument.numPages +
            " page" +
            (
                pdfDocument.numPages === 1
                    ? ""
                    : "s"
            ) +
            " converted successfully.";


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
                "start"

        });


    } catch(error) {

        console.error(error);


        processing.style.display =
            "none";


        generateBtn.disabled =
            false;


        alert(
            "PDF to JPG conversion failed."
        );

    }

}


/* =========================
   CANVAS TO BLOB
========================= */

function canvasToBlob(
    canvas,
    qualityValue
) {

    return new Promise(
        function(resolve, reject) {

            canvas.toBlob(
                function(blob) {

                    if (!blob) {

                        reject(
                            new Error(
                                "Could not create JPG."
                            )
                        );

                        return;

                    }


                    resolve(blob);

                },

                "image/jpeg",

                qualityValue

            );

        }
    );

}


/* =========================
   PAGE CARD
========================= */

function addPageCard(
    blob,
    pageNumber
) {

    const url =
        URL.createObjectURL(
            blob
        );


    pageURLs.push(
        url
    );


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "page-card";


    const img =
        document.createElement(
            "img"
        );


    img.src =
        url;


    img.alt =
        "PDF page " +
        pageNumber;


    const info =
        document.createElement(
            "div"
        );


    info.className =
        "page-info";


    const title =
        document.createElement(
            "strong"
        );


    title.textContent =
        "Page " +
        pageNumber;


    const size =
        document.createElement(
            "div"
        );


    size.style.color =
        "#6b7280";


    size.style.fontSize =
        "12px";


    size.style.marginBottom =
        "10px";


    size.textContent =
        formatBytes(
            blob.size
        );


    const download =
        document.createElement(
            "a"
        );


    download.className =
        "page-download";


    download.href =
        url;


    download.download =
        "page-" +
        pageNumber +
        ".jpg";


    download.textContent =
        "Download JPG";


    info.appendChild(
        title
    );


    info.appendChild(
        size
    );


    info.appendChild(
        download
    );


    card.appendChild(
        img
    );


    card.appendChild(
        info
    );


    pagesGrid.appendChild(
        card
    );

}


/* =========================
   CLEAN OLD URLS
========================= */

function revokeOldURLs() {

    pageURLs.forEach(
        function(url) {

            URL.revokeObjectURL(
                url
            );

        }
    );


    pageURLs =
        [];

}