const uploadArea =
    document.getElementById("uploadArea");

const imageInput =
    document.getElementById("imageInput");

const editor =
    document.getElementById("editor");

const canvas =
    document.getElementById("cropCanvas");

const ctx =
    canvas.getContext("2d");

const outputFormat =
    document.getElementById("outputFormat");

const quality =
    document.getElementById("quality");

const selectionInfo =
    document.getElementById("selectionInfo");

const cropBtn =
    document.getElementById("cropBtn");

const resetBtn =
    document.getElementById("resetBtn");

const result =
    document.getElementById("result");

const resultImage =
    document.getElementById("resultImage");

const downloadBtn =
    document.getElementById("downloadBtn");


let image = null;

let imageFile = null;

let isDragging = false;

let startX = 0;
let startY = 0;

let cropX = 0;
let cropY = 0;
let cropWidth = 0;
let cropHeight = 0;


/* =========================
   UPLOAD
========================= */

uploadArea.addEventListener(
    "click",
    function() {

        imageInput.click();

    }
);


imageInput.addEventListener(
    "change",
    function() {

        const file =
            this.files[0];

        if (!file) {
            return;
        }

        loadImage(file);

    }
);


/* =========================
   LOAD IMAGE
========================= */

function loadImage(file) {

    if (
        !file.type.startsWith("image/")
    ) {

        alert(
            "Please select an image file."
        );

        return;

    }


    imageFile =
        file;


    const reader =
        new FileReader();


    reader.onload =
        function(event) {

            image =
                new Image();


            image.onload =
                function() {

                    const maxWidth =
                        850;


                    let displayWidth =
                        image.width;


                    let displayHeight =
                        image.height;


                    if (
                        displayWidth >
                        maxWidth
                    ) {

                        const ratio =
                            maxWidth /
                            displayWidth;


                        displayWidth =
                            maxWidth;


                        displayHeight =
                            image.height *
                            ratio;

                    }


                    canvas.width =
                        Math.round(
                            displayWidth
                        );


                    canvas.height =
                        Math.round(
                            displayHeight
                        );


                    resetSelection();


                    editor.style.display =
                        "block";


                    result.style.display =
                        "none";

                };


            image.src =
                event.target.result;

        };


    reader.readAsDataURL(
        file
    );

}


/* =========================
   DRAW
========================= */

function drawCanvas() {

    if (!image) {
        return;
    }


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
    );


    if (
        cropWidth > 0 &&
        cropHeight > 0
    ) {

        ctx.save();


        ctx.fillStyle =
            "rgba(0,0,0,0.45)";


        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        ctx.clearRect(
            cropX,
            cropY,
            cropWidth,
            cropHeight
        );


        ctx.drawImage(
            image,

            cropX / canvas.width * image.width,
            cropY / canvas.height * image.height,

            cropWidth / canvas.width * image.width,
            cropHeight / canvas.height * image.height,

            cropX,
            cropY,
            cropWidth,
            cropHeight
        );


        ctx.strokeStyle =
            "#2563eb";


        ctx.lineWidth =
            3;


        ctx.strokeRect(
            cropX,
            cropY,
            cropWidth,
            cropHeight
        );


        ctx.restore();

    }

}


/* =========================
   POINTER POSITION
========================= */

function getPosition(event) {

    const rect =
        canvas.getBoundingClientRect();


    const scaleX =
        canvas.width /
        rect.width;


    const scaleY =
        canvas.height /
        rect.height;


    return {

        x:
            (
                event.clientX -
                rect.left
            ) *
            scaleX,

        y:
            (
                event.clientY -
                rect.top
            ) *
            scaleY

    };

}


/* =========================
   SELECT AREA
========================= */

canvas.addEventListener(
    "mousedown",
    function(event) {

        const pos =
            getPosition(event);


        isDragging =
            true;


        startX =
            pos.x;


        startY =
            pos.y;


        cropX =
            startX;


        cropY =
            startY;


        cropWidth =
            0;


        cropHeight =
            0;

    }
);


canvas.addEventListener(
    "mousemove",
    function(event) {

        if (!isDragging) {
            return;
        }


        const pos =
            getPosition(event);


        cropX =
            Math.min(
                startX,
                pos.x
            );


        cropY =
            Math.min(
                startY,
                pos.y
            );


        cropWidth =
            Math.abs(
                pos.x -
                startX
            );


        cropHeight =
            Math.abs(
                pos.y -
                startY
            );


        updateSelectionInfo();

        drawCanvas();

    }
);


canvas.addEventListener(
    "mouseup",
    function() {

        isDragging =
            false;

    }
);


canvas.addEventListener(
    "mouseleave",
    function() {

        isDragging =
            false;

    }
);


/* =========================
   SELECTION INFO
========================= */

function updateSelectionInfo() {

    if (
        cropWidth < 1 ||
        cropHeight < 1
    ) {

        selectionInfo.value =
            "Drag on image";

        return;

    }


    const actualWidth =
        Math.round(
            cropWidth /
            canvas.width *
            image.width
        );


    const actualHeight =
        Math.round(
            cropHeight /
            canvas.height *
            image.height
        );


    selectionInfo.value =
        actualWidth +
        " × " +
        actualHeight +
        " px";

}


/* =========================
   RESET
========================= */

function resetSelection() {

    cropX =
        0;


    cropY =
        0;


    cropWidth =
        canvas.width;


    cropHeight =
        canvas.height;


    updateSelectionInfo();

    drawCanvas();

}


resetBtn.addEventListener(
    "click",
    resetSelection
);


/* =========================
   CROP
========================= */

cropBtn.addEventListener(
    "click",
    function() {

        if (!image) {

            alert(
                "Please upload an image first."
            );

            return;

        }


        if (
            cropWidth < 5 ||
            cropHeight < 5
        ) {

            alert(
                "Please select an area to crop."
            );

            return;

        }


        const sourceX =
            cropX /
            canvas.width *
            image.width;


        const sourceY =
            cropY /
            canvas.height *
            image.height;


        const sourceWidth =
            cropWidth /
            canvas.width *
            image.width;


        const sourceHeight =
            cropHeight /
            canvas.height *
            image.height;


        const outputCanvas =
            document.createElement(
                "canvas"
            );


        outputCanvas.width =
            Math.round(
                sourceWidth
            );


        outputCanvas.height =
            Math.round(
                sourceHeight
            );


        const outputCtx =
            outputCanvas.getContext(
                "2d"
            );


        if (
            outputFormat.value ===
            "jpg"
        ) {

            outputCtx.fillStyle =
                "#ffffff";


            outputCtx.fillRect(
                0,
                0,
                outputCanvas.width,
                outputCanvas.height
            );

        }


        outputCtx.drawImage(
            image,

            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,

            0,
            0,
            outputCanvas.width,
            outputCanvas.height
        );


        const mime =
            getMimeType();


        const outputQuality =
            Number(
                quality.value
            ) / 100;


        outputCanvas.toBlob(
            function(blob) {

                if (!blob) {

                    alert(
                        "Could not crop image."
                    );

                    return;

                }


                const url =
                    URL.createObjectURL(
                        blob
                    );


                resultImage.src =
                    url;


                downloadBtn.href =
                    url;


                const cleanName =
                    imageFile.name.replace(
                        /\.[^/.]+$/,
                        ""
                    );


                downloadBtn.download =
                    cleanName +
                    "-cropped." +
                    outputFormat.value;


                result.style.display =
                    "block";


                result.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            },

            mime,

            outputQuality
        );

    }
);


/* =========================
   MIME
========================= */

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