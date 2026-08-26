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

const originalDimensions =
    document.getElementById("originalDimensions");

const preview =
    document.getElementById("preview");

const previewImage =
    document.getElementById("previewImage");

const settings =
    document.getElementById("settings");

const widthInput =
    document.getElementById("widthInput");

const heightInput =
    document.getElementById("heightInput");

const maintainRatio =
    document.getElementById("maintainRatio");

const format =
    document.getElementById("format");

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

const originalResult =
    document.getElementById("originalResult");

const newDimensions =
    document.getElementById("newDimensions");

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


/* FORMAT BYTES */

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


/* FILE SELECT */

fileInput.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];

        if (!file) return;

        loadSelectedFile(file);
    }
);


/* DRAG DROP */

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

        if (!file) return;

        if (
            !file.type.startsWith("image/")
        ) {

            alert(
                "Please select an image file."
            );

            return;
        }

        loadSelectedFile(file);
    }
);


/* LOAD FILE */

function loadSelectedFile(file) {

    selectedFile = file;

    fileName.textContent =
        file.name;

    fileSize.textContent =
        "File size: " +
        formatBytes(file.size);

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


            const img =
                new Image();


            img.onload =
                function () {

                    originalWidth =
                        img.width;

                    originalHeight =
                        img.height;


                    widthInput.value =
                        originalWidth;

                    heightInput.value =
                        originalHeight;


                    originalDimensions.textContent =
                        "Dimensions: " +
                        originalWidth +
                        " × " +
                        originalHeight;
                };


            img.src =
                event.target.result;
        };


    reader.readAsDataURL(file);
}


/* QUALITY */

quality.addEventListener(
    "input",
    function () {

        qualityValue.textContent =
            quality.value + "%";
    }
);


/* MAINTAIN RATIO */

widthInput.addEventListener(
    "input",
    function () {

        if (!maintainRatio.checked)
            return;

        if (!originalWidth || !originalHeight)
            return;


        const newWidth =
            Number(widthInput.value);

        if (!newWidth) return;


        const ratio =
            originalHeight /
            originalWidth;


        heightInput.value =
            Math.round(
                newWidth * ratio
            );
    }
);


heightInput.addEventListener(
    "input",
    function () {

        if (!maintainRatio.checked)
            return;

        if (!originalWidth || !originalHeight)
            return;


        const newHeight =
            Number(heightInput.value);

        if (!newHeight) return;


        const ratio =
            originalWidth /
            originalHeight;


        widthInput.value =
            Math.round(
                newHeight * ratio
            );
    }
);


/* GENERATE */

generateBtn.addEventListener(
    "click",
    function () {

        if (!selectedFile) {

            alert(
                "Please select an image first."
            );

            return;
        }


        if (
            !widthInput.value ||
            !heightInput.value
        ) {

            alert(
                "Please enter width and height."
            );

            return;
        }


        generateBtn.disabled =
            true;


        showAdvertisement();
    }
);


/* DEMO AD */

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

                    resizeImage();
                }

            },
            1000
        );
}


/* RESIZE */

function resizeImage() {

    processing.style.display =
        "block";

    result.style.display =
        "none";


    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            const img =
                new Image();


            img.onload =
                function () {

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


                    canvas.width =
                        width;

                    canvas.height =
                        height;


                    const ctx =
                        canvas.getContext(
                            "2d"
                        );


                    if (
                        format.value === "jpg"
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


                    const mime =
                        getMimeType();


                    const q =
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
                                    "Image could not be resized."
                                );

                                return;
                            }


                            if (downloadURL) {

                                URL.revokeObjectURL(
                                    downloadURL
                                );
                            }


                            downloadURL =
                                URL.createObjectURL(
                                    blob
                                );


                            originalResult.textContent =
                                originalWidth +
                                " × " +
                                originalHeight;


                            newDimensions.textContent =
                                width +
                                " × " +
                                height;


                            newFileSize.textContent =
                                formatBytes(
                                    blob.size
                                );


                            downloadBtn.href =
                                downloadURL;


                            const cleanName =
                                selectedFile.name
                                    .replace(
                                        /\.[^/.]+$/,
                                        ""
                                    );


                            downloadBtn.download =
                                cleanName +
                                "-resized." +
                                format.value;


                            processing.style.display =
                                "none";


                            result.style.display =
                                "block";


                            generateBtn.disabled =
                                false;


                            result.scrollIntoView({
                                behavior: "smooth",
                                block: "center"
                            });

                        },
                        mime,
                        q
                    );
                };


            img.src =
                event.target.result;
        };


    reader.readAsDataURL(
        selectedFile
    );
}


/* MIME */

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