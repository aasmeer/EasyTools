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

const adModal =
    document.getElementById("adModal");

const countdown =
    document.getElementById("countdown");


let selectedFile = null;

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

function loadFile(file) {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        alert(
            "Only JPG, PNG and WEBP images are supported."
        );

        return;

    }


    selectedFile =
        file;


    fileName.textContent =
        file.name;


    fileSize.textContent =
        "File size: " +
        formatBytes(
            file.size
        );


    fileFormat.textContent =
        "Format: " +
        getOriginalExtension(
            file
        );


    fileInfo.style.display =
        "block";


    settings.style.display =
        "block";


    result.style.display =
        "none";


    const reader =
        new FileReader();


    reader.onload =
        function (event) {


            previewImage.src =
                event.target.result;


            preview.style.display =
                "block";


            const image =
                new Image();


            image.onload =
                function () {


                    originalWidth =
                        image.width;


                    originalHeight =
                        image.height;


                    dimensions.textContent =
                        "Dimensions: " +
                        originalWidth +
                        " × " +
                        originalHeight;


                };


            image.src =
                event.target.result;

        };


    reader.readAsDataURL(
        file
    );

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


                    convertImage();

                }

            },
            1000
        );

}


/* =========================================
   CONVERT IMAGE
========================================= */

function convertImage() {

    processing.style.display =
        "block";


    const reader =
        new FileReader();


    reader.onload =
        function (event) {


            const image =
                new Image();


            image.onload =
                function () {


                    const canvas =
                        document.createElement(
                            "canvas"
                        );


                    canvas.width =
                        image.width;


                    canvas.height =
                        image.height;


                    const ctx =
                        canvas.getContext(
                            "2d"
                        );


                    /*
                        When output is JPG,
                        transparency must be replaced
                        with a solid background.
                    */

                    if (
                        outputFormat.value ===
                        "jpg"
                    ) {


                        ctx.fillStyle =
                            backgroundColor.value;


                        ctx.fillRect(
                            0,
                            0,
                            canvas.width,
                            canvas.height
                        );

                    }


                    ctx.drawImage(
                        image,
                        0,
                        0
                    );


                    const mimeType =
                        getMimeType();


                    const outputQuality =
                        Number(
                            quality.value
                        ) / 100;


                    canvas.toBlob(
                        function (blob) {


                            if (!blob) {


                                processing.style.display =
                                    "none";


                                generateBtn.disabled =
                                    false;


                                alert(
                                    "Image conversion failed."
                                );


                                return;

                            }


                            showResult(
                                blob
                            );


                        },
                        mimeType,
                        outputQuality
                    );

                };


            image.onerror =
                function () {


                    processing.style.display =
                        "none";


                    generateBtn.disabled =
                        false;


                    alert(
                        "Could not load the selected image."
                    );

                };


            image.src =
                event.target.result;

        };


    reader.readAsDataURL(
        selectedFile
    );

}


/* =========================================
   MIME
========================================= */

function getMimeType() {


    if (
        outputFormat.value ===
        "png"
    ) {

        return "image/png";

    }


    if (
        outputFormat.value ===
        "webp"
    ) {

        return "image/webp";

    }


    return "image/jpeg";

}


/* =========================================
   RESULT
========================================= */

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


    originalFormatResult.textContent =
        getOriginalExtension(
            selectedFile
        );


    newFormatResult.textContent =
        outputFormat.value
            .toUpperCase();


    newFileSize.textContent =
        formatBytes(
            blob.size
        );


    downloadBtn.href =
        downloadURL;


    const cleanName =
        selectedFile.name.replace(
            /\.[^/.]+$/,
            ""
        );


    downloadBtn.download =
        cleanName +
        "-converted." +
        outputFormat.value;


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