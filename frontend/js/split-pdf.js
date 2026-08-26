const uploadArea =
    document.getElementById("uploadArea");

const pdfInput =
    document.getElementById("pdfInput");

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

const pageRange =
    document.getElementById("pageRange");

const splitBtn =
    document.getElementById("splitBtn");

const processing =
    document.getElementById("processing");

const result =
    document.getElementById("result");

const resultInfo =
    document.getElementById("resultInfo");

const downloadBtn =
    document.getElementById("downloadBtn");

const adModal =
    document.getElementById("adModal");

const countdown =
    document.getElementById("countdown");


let selectedFile = null;
let sourcePDF = null;
let totalPages = 0;
let downloadURL = null;


/* =========================
   SIZE FORMAT
========================= */

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


/* =========================
   UPLOAD
========================= */

uploadArea.addEventListener(
    "click",
    function() {
        pdfInput.click();
    }
);


pdfInput.addEventListener(
    "change",
    function() {

        const file =
            this.files[0];

        if (!file) {
            return;
        }

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

        if (!file) {
            return;
        }

        loadPDF(file);

    }
);


/* =========================
   LOAD PDF
========================= */

async function loadPDF(file) {

    if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
    ) {

        alert(
            "Please select a PDF file."
        );

        return;
    }


    selectedFile = file;

    result.style.display =
        "none";


    try {

        const bytes =
            await file.arrayBuffer();


        sourcePDF =
            await PDFLib.PDFDocument.load(
                bytes
            );


        totalPages =
            sourcePDF.getPageCount();


        fileName.textContent =
            file.name;


        fileSize.textContent =
            "File size: " +
            formatBytes(
                file.size
            );


        pageCount.textContent =
            "Total pages: " +
            totalPages;


        fileInfo.style.display =
            "block";


        settings.style.display =
            "block";


        pageRange.value =
            "1-" +
            totalPages;


    } catch(error) {

        console.error(error);

        alert(
            "This PDF could not be opened. It may be encrypted or unsupported."
        );

    }

}


/* =========================
   PARSE PAGE RANGE
========================= */

function parsePageRange(
    input,
    maxPages
) {

    const pages =
        new Set();


    const parts =
        input
            .split(",")
            .map(
                function(part) {
                    return part.trim();
                }
            )
            .filter(Boolean);


    for (
        const part of parts
    ) {

        if (
            part.includes("-")
        ) {

            const range =
                part.split("-");


            if (
                range.length !== 2
            ) {

                throw new Error(
                    "Invalid page range."
                );

            }


            const start =
                Number(
                    range[0]
                );


            const end =
                Number(
                    range[1]
                );


            if (
                !Number.isInteger(start) ||
                !Number.isInteger(end) ||
                start < 1 ||
                end < 1 ||
                start > maxPages ||
                end > maxPages ||
                start > end
            ) {

                throw new Error(
                    "Invalid page range."
                );

            }


            for (
                let page = start;
                page <= end;
                page++
            ) {

                pages.add(
                    page
                );

            }

        } else {

            const page =
                Number(
                    part
                );


            if (
                !Number.isInteger(page) ||
                page < 1 ||
                page > maxPages
            ) {

                throw new Error(
                    "Invalid page number."
                );

            }


            pages.add(
                page
            );

        }

    }


    return Array.from(
        pages
    ).sort(
        function(a, b) {
            return a - b;
        }
    );

}


/* =========================
   SPLIT BUTTON
========================= */

splitBtn.addEventListener(
    "click",
    function() {

        if (!sourcePDF) {

            alert(
                "Please upload a PDF first."
            );

            return;

        }


        let selectedPages;


        try {

            selectedPages =
                parsePageRange(
                    pageRange.value,
                    totalPages
                );

        } catch(error) {

            alert(
                "Please enter valid pages. Example: 1-3, 5, 8-10"
            );

            return;

        }


        if (
            selectedPages.length === 0
        ) {

            alert(
                "Please select at least one page."
            );

            return;

        }


        splitBtn.disabled =
            true;


        showAdvertisement(
            selectedPages
        );

    }
);


/* =========================
   DEMO AD
========================= */

function showAdvertisement(
    selectedPages
) {

    adModal.style.display =
        "flex";


    let seconds =
        5;


    countdown.textContent =
        seconds;


    const timer =
        setInterval(
            function() {

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


                    createSplitPDF(
                        selectedPages
                    );

                }

            },
            1000
        );

}


/* =========================
   CREATE PDF
========================= */

async function createSplitPDF(
    selectedPages
) {

    processing.style.display =
        "block";

    result.style.display =
        "none";


    try {

        const outputPDF =
            await PDFLib.PDFDocument.create();


        const zeroBasedIndices =
            selectedPages.map(
                function(page) {
                    return page - 1;
                }
            );


        const copiedPages =
            await outputPDF.copyPages(
                sourcePDF,
                zeroBasedIndices
            );


        copiedPages.forEach(
            function(page) {

                outputPDF.addPage(
                    page
                );

            }
        );


        const outputBytes =
            await outputPDF.save();


        const blob =
            new Blob(
                [outputBytes],
                {
                    type:
                        "application/pdf"
                }
            );


        if (downloadURL) {

            URL.revokeObjectURL(
                downloadURL
            );

        }


        downloadURL =
            URL.createObjectURL(
                blob
            );


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
            "-split.pdf";


        resultInfo.textContent =
            selectedPages.length +
            " page" +
            (
                selectedPages.length === 1
                    ? ""
                    : "s"
            ) +
            " extracted successfully.";


        processing.style.display =
            "none";


        result.style.display =
            "block";


        splitBtn.disabled =
            false;


        result.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


    } catch(error) {

        console.error(error);


        processing.style.display =
            "none";


        splitBtn.disabled =
            false;


        alert(
            "Split PDF failed. Please try another PDF."
        );

    }

}