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

let pdfLoadVersion = 0;

async function loadPDF(file) {
    const loadVersion = ++pdfLoadVersion;
    const previousDocument = pdfDocument;
    let loadingTask;
    selectedFile = null;
    pdfDocument = null;
    settings.style.display = "none";
    fileInfo.style.display = "none";
    generateBtn.disabled = true;




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
        if (previousDocument) await previousDocument.destroy();
        if (loadVersion !== pdfLoadVersion) return;

        const buffer =
            await file.arrayBuffer();


        loadingTask =
            pdfjsLib.getDocument({
                data: buffer
            });


        const loadedPDF = await loadingTask.promise;
        if (loadVersion !== pdfLoadVersion) {
            if (loadedPDF.destroy) await loadedPDF.destroy();
            return;
        }
        pdfDocument = loadedPDF;
        selectedFile = file;
        generateBtn.disabled = false;


        pageCount.textContent =
            "Pages: " +
            pdfDocument.numPages;


        settings.style.display =
            "block";


    } catch(error) {
        if (loadingTask) {
            try { await loadingTask.destroy(); } catch { /* Preserve the load error. */ }
        }
        if (loadVersion !== pdfLoadVersion) return;
        selectedFile = null;
        pdfDocument = null;
        settings.style.display = "none";
        fileInfo.style.display = "none";

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
    // Tool use never depends on viewing or interacting with an advertisement.
    return convertPDF();
}


/* =========================
   CONVERT PDF
========================= */

async function convertPDF() {
    let activeCanvas = null;
    let activePage = null;
    const releaseJob = EasyTools.beginJob(generateBtn);
    try {


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


        EasyTools.checkPages(pdfDocument.numPages);
        let renderedPixels = 0;

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


            activePage = page;

            const viewport =
                page.getViewport({
                    scale: scale
                });


            renderedPixels += EasyTools.checkPixels(viewport.width, viewport.height);
            if (renderedPixels > 64000000) {
                throw new Error("This job exceeds the 64 megapixel limit. Use fewer pages or a lower resolution.");
            }

            const canvas =
                document.createElement(
                    "canvas"
                );


            activeCanvas = canvas;

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


            if (!context) throw new Error("Your browser could not create an image canvas.");

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
                    viewport,

                background: background.value

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
            canvas.width = canvas.height = 0;
            activeCanvas = null;
            page.cleanup();
            activePage = null;

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
        revokeOldURLs();
        pagesGrid.innerHTML = "";
        result.style.display = "none";

        console.error(error);


        processing.style.display =
            "none";


        generateBtn.disabled =
            false;


        alert(
            "PDF to JPG conversion failed."
        );

    }


    } finally {
        try {
            if (activeCanvas) activeCanvas.width = activeCanvas.height = 0;
            if (activePage) activePage.cleanup();
        } catch (error) {
            console.warn("PDF page resources could not be fully released.");
        } finally {
            releaseJob();
        }
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
    if (zipURL) {
        URL.revokeObjectURL(zipURL);
        zipURL = null;
    }

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