/* =========================================
   EASYTOOLS MERGE PDF
========================================= */


const pdfInput =
    document.getElementById("pdfInput");

const uploadArea =
    document.getElementById("uploadArea");

const fileCount =
    document.getElementById("fileCount");

const filesList =
    document.getElementById("filesList");

const controls =
    document.getElementById("controls");

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

const resultFileCount =
    document.getElementById("resultFileCount");

const resultPages =
    document.getElementById("resultPages");

const resultSize =
    document.getElementById("resultSize");

const downloadBtn =
    document.getElementById("downloadBtn");

const adModal =
    document.getElementById("adModal");

const countdown =
    document.getElementById("countdown");


let selectedFiles = [];

let downloadURL = null;


/* =========================================
   FORMAT SIZE
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
   FILE INPUT
========================================= */

pdfInput.addEventListener(
    "change",
    function() {

        addFiles(
            Array.from(
                this.files
            )
        );

        this.value = "";

    }
);


/* =========================================
   DRAG DROP
========================================= */

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


        addFiles(
            Array.from(
                event.dataTransfer.files
            )
        );

    }
);


/* =========================================
   ADD FILES
========================================= */

function addFiles(files) {

    const pdfFiles =
        files.filter(
            function(file) {

                return (
                    file.type ===
                    "application/pdf"
                    ||
                    file.name
                        .toLowerCase()
                        .endsWith(".pdf")
                );

            }
        );


    if (!pdfFiles.length) {

        alert(
            "Please select PDF files."
        );

        return;

    }


    pdfFiles.forEach(
        function(file) {

            /*
                Prevent duplicate selection
                using name + size + modified time.
            */

            const alreadyExists =
                selectedFiles.some(
                    function(existing) {

                        return (
                            existing.name === file.name &&
                            existing.size === file.size &&
                            existing.lastModified === file.lastModified
                        );

                    }
                );


            if (!alreadyExists) {

                selectedFiles.push(
                    file
                );

            }

        }
    );


    /*
        Browser-side limit to avoid
        accidental huge memory usage.
    */

    if (selectedFiles.length > 20) {

        selectedFiles =
            selectedFiles.slice(
                0,
                20
            );


        alert(
            "Maximum 20 PDFs can be merged at once."
        );

    }


    renderFiles();

}


/* =========================================
   RENDER FILES
========================================= */

function renderFiles() {

    filesList.innerHTML =
        "";


    if (!selectedFiles.length) {

        fileCount.style.display =
            "none";


        controls.style.display =
            "none";


        result.style.display =
            "none";


        return;

    }


    fileCount.style.display =
        "block";


    fileCount.textContent =
        selectedFiles.length +
        " PDF" +
        (
            selectedFiles.length === 1
                ? ""
                : "s"
        ) +
        " selected";


    controls.style.display =
        "block";


    result.style.display =
        "none";


    selectedFiles.forEach(
        function(file, index) {


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "file-item";


            const main =
                document.createElement(
                    "div"
                );


            main.className =
                "file-main";


            const name =
                document.createElement(
                    "strong"
                );


            name.textContent =
                (index + 1) +
                ". " +
                file.name;


            const size =
                document.createElement(
                    "span"
                );


            size.textContent =
                formatBytes(
                    file.size
                );


            main.appendChild(
                name
            );


            main.appendChild(
                size
            );


            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "file-actions";


            const upBtn =
                document.createElement(
                    "button"
                );


            upBtn.className =
                "small-btn";


            upBtn.type =
                "button";


            upBtn.title =
                "Move up";


            upBtn.textContent =
                "↑";


            upBtn.disabled =
                index === 0;


            upBtn.addEventListener(
                "click",
                function() {

                    moveFileUp(
                        index
                    );

                }
            );


            const downBtn =
                document.createElement(
                    "button"
                );


            downBtn.className =
                "small-btn";


            downBtn.type =
                "button";


            downBtn.title =
                "Move down";


            downBtn.textContent =
                "↓";


            downBtn.disabled =
                index ===
                selectedFiles.length - 1;


            downBtn.addEventListener(
                "click",
                function() {

                    moveFileDown(
                        index
                    );

                }
            );


            const removeBtn =
                document.createElement(
                    "button"
                );


            removeBtn.className =
                "small-btn remove-btn";


            removeBtn.type =
                "button";


            removeBtn.title =
                "Remove PDF";


            removeBtn.textContent =
                "✕";


            removeBtn.addEventListener(
                "click",
                function() {

                    removeFile(
                        index
                    );

                }
            );


            actions.appendChild(
                upBtn
            );


            actions.appendChild(
                downBtn
            );


            actions.appendChild(
                removeBtn
            );


            item.appendChild(
                main
            );


            item.appendChild(
                actions
            );


            filesList.appendChild(
                item
            );

        }
    );

}


/* =========================================
   MOVE UP
========================================= */

function moveFileUp(index) {

    if (index <= 0) {

        return;

    }


    const temp =
        selectedFiles[
            index - 1
        ];


    selectedFiles[
        index - 1
    ] =
        selectedFiles[
            index
        ];


    selectedFiles[
        index
    ] =
        temp;


    renderFiles();

}


/* =========================================
   MOVE DOWN
========================================= */

function moveFileDown(index) {

    if (
        index >=
        selectedFiles.length - 1
    ) {

        return;

    }


    const temp =
        selectedFiles[
            index + 1
        ];


    selectedFiles[
        index + 1
    ] =
        selectedFiles[
            index
        ];


    selectedFiles[
        index
    ] =
        temp;


    renderFiles();

}


/* =========================================
   REMOVE FILE
========================================= */

function removeFile(index) {

    selectedFiles.splice(
        index,
        1
    );


    renderFiles();

}


/* =========================================
   CLEAR
========================================= */

clearBtn.addEventListener(
    "click",
    function() {

        selectedFiles =
            [];


        filesList.innerHTML =
            "";


        fileCount.style.display =
            "none";


        controls.style.display =
            "none";


        processing.style.display =
            "none";


        result.style.display =
            "none";


        if (downloadURL) {

            URL.revokeObjectURL(
                downloadURL
            );


            downloadURL =
                null;

        }

    }
);


/* =========================================
   GENERATE BUTTON
========================================= */

generateBtn.addEventListener(
    "click",
    function() {

        if (
            selectedFiles.length < 2
        ) {

            alert(
                "Please select at least 2 PDF files."
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


                    mergePDFs();

                }

            },
            1000
        );

}


/* =========================================
   MERGE PDF
========================================= */

async function mergePDFs() {

    processing.style.display =
        "block";


    try {

        const {
            PDFDocument
        } =
            PDFLib;


        const mergedPDF =
            await PDFDocument.create();


        let totalPages =
            0;


        for (
            let i = 0;
            i < selectedFiles.length;
            i++
        ) {

            const file =
                selectedFiles[i];


            progressText.textContent =
                "Adding PDF " +
                (i + 1) +
                " of " +
                selectedFiles.length +
                "...";


            const bytes =
                await file.arrayBuffer();


            const sourcePDF =
                await PDFDocument.load(
                    bytes
                );


            const pageIndices =
                sourcePDF.getPageIndices();


            const pages =
                await mergedPDF.copyPages(
                    sourcePDF,
                    pageIndices
                );


            pages.forEach(
                function(page) {

                    mergedPDF.addPage(
                        page
                    );

                }
            );


            totalPages +=
                pages.length;

        }


        progressText.textContent =
            "Creating merged PDF...";


        const mergedBytes =
            await mergedPDF.save();


        const mergedBlob =
            new Blob(
                [
                    mergedBytes
                ],
                {
                    type:
                        "application/pdf"
                }
            );


        showResult(
            mergedBlob,
            totalPages
        );


    } catch(error) {

        console.error(
            "Merge PDF Error:",
            error
        );


        processing.style.display =
            "none";


        generateBtn.disabled =
            false;


        alert(
            "PDF merge failed. One of the PDFs may be encrypted or unsupported."
        );

    }

}


/* =========================================
   RESULT
========================================= */

function showResult(
    blob,
    totalPages
) {

    if (downloadURL) {

        URL.revokeObjectURL(
            downloadURL
        );

    }


    downloadURL =
        URL.createObjectURL(
            blob
        );


    resultFileCount.textContent =
        selectedFiles.length;


    resultPages.textContent =
        totalPages;


    resultSize.textContent =
        formatBytes(
            blob.size
        );


    downloadBtn.href =
        downloadURL;


    downloadBtn.download =
        "easytools-merged.pdf";


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