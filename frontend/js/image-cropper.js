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
let imageLoadVersion = 0;
let cropExportBusy = false;
let downloadURL = null;

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

async function loadImage(file) {
    const version = ++imageLoadVersion;
    image = null;
    imageFile = null;
    isDragging = false;
    cropX = cropY = cropWidth = cropHeight = 0;
    canvas.width = canvas.height = 0;
    editor.style.display = "none";
    result.style.display = "none";
    cropBtn.disabled = true;
    resetBtn.disabled = true;

    try {
        if (!file.type.startsWith("image/")) {
            throw new Error("Please select an image file.");
        }
        if (!ctx) throw new Error("Your browser could not create an image canvas.");
        const decoded = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Could not read the selected image."));
            reader.onabort = () => reject(new Error("Image loading was interrupted."));
            reader.onload = event => {
                const candidate = new Image();
                candidate.onerror = () => reject(new Error("Could not load the selected image."));
                candidate.onload = () => resolve(candidate);
                candidate.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
        if (version !== imageLoadVersion) return;
        const scale = Math.min(1, 850 / decoded.width);
        canvas.width = Math.max(1, Math.round(decoded.width * scale));
        canvas.height = Math.max(1, Math.round(decoded.height * scale));
        image = decoded;
        imageFile = file;
        resetSelection();
        editor.style.display = "block";
    } catch (error) {
        if (version !== imageLoadVersion) return;
        image = null;
        imageFile = null;
        canvas.width = canvas.height = 0;
        alert(error.message || "Could not load the selected image.");
    } finally {
        if (version === imageLoadVersion) {
            cropBtn.disabled = !image;
            resetBtn.disabled = !image;
        }
    }
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

canvas.style.touchAction = "none";
canvas.tabIndex = 0;
canvas.setAttribute("aria-label", "Crop selection. Drag to select; arrow keys move selection, Shift plus arrows resize it.");

function boundedPosition(event) {
    const pos = getPosition(event);
    return { x: Math.max(0, Math.min(canvas.width, pos.x)),
             y: Math.max(0, Math.min(canvas.height, pos.y)) };
}
canvas.addEventListener("pointerdown", event => {
    if (!image || !event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const pos = boundedPosition(event);
    isDragging = true;
    startX = cropX = pos.x;
    startY = cropY = pos.y;
    cropWidth = cropHeight = 0;
});
canvas.addEventListener("pointermove", event => {
    if (!isDragging || !canvas.hasPointerCapture(event.pointerId)) return;
    const pos = boundedPosition(event);
    cropX = Math.min(startX, pos.x);
    cropY = Math.min(startY, pos.y);
    cropWidth = Math.abs(pos.x - startX);
    cropHeight = Math.abs(pos.y - startY);
    updateSelectionInfo();
    drawCanvas();
});
for (const eventName of ["pointerup", "pointercancel", "lostpointercapture"]) {
    canvas.addEventListener(eventName, event => {
        isDragging = false;
        if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    });
}
canvas.addEventListener("keydown", event => {
    if (!image || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const dx = event.key === "ArrowRight" ? 5 : event.key === "ArrowLeft" ? -5 : 0;
    const dy = event.key === "ArrowDown" ? 5 : event.key === "ArrowUp" ? -5 : 0;
    if (event.shiftKey) {
        cropWidth = Math.max(1, Math.min(canvas.width - cropX, cropWidth + dx));
        cropHeight = Math.max(1, Math.min(canvas.height - cropY, cropHeight + dy));
    } else {
        cropX = Math.max(0, Math.min(canvas.width - cropWidth, cropX + dx));
        cropY = Math.max(0, Math.min(canvas.height - cropHeight, cropY + dy));
    }
    updateSelectionInfo();
    drawCanvas();
});

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

    if (!image) return;

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

cropBtn.addEventListener("click", async function() {
    if (cropExportBusy) return;
    if (!image) {
        alert("Please upload an image first.");
        return;
    }
    if (cropWidth < 5 || cropHeight < 5) {
        alert("Please select an area to crop.");
        return;
    }

    const version = imageLoadVersion;
    const sourceImage = image;
    const file = imageFile;
    const extension = outputFormat.value;
    const outputQuality = Number(quality.value) / 100;
    let outputCanvas;
    cropExportBusy = true;
    cropBtn.disabled = true;
    result.style.display = "none";
    try {
        const sourceX = cropX / canvas.width * sourceImage.width;
        const sourceY = cropY / canvas.height * sourceImage.height;
        const sourceWidth = cropWidth / canvas.width * sourceImage.width;
        const sourceHeight = cropHeight / canvas.height * sourceImage.height;
        outputCanvas = document.createElement("canvas");
        outputCanvas.width = Math.round(sourceWidth);
        outputCanvas.height = Math.round(sourceHeight);
        const outputCtx = outputCanvas.getContext("2d");
        if (!outputCtx) throw new Error("Your browser could not create an image canvas.");
        if (extension === "jpg") {
            outputCtx.fillStyle = "#ffffff";
            outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
        }
        outputCtx.drawImage(sourceImage,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, outputCanvas.width, outputCanvas.height);
        const blob = await new Promise((resolve, reject) => {
            outputCanvas.toBlob(value => {
                if (value) resolve(value);
                else reject(new Error("Could not crop image."));
            }, getMimeType(extension), outputQuality);
        });
        if (version !== imageLoadVersion) return;
        const url = URL.createObjectURL(blob);
        if (downloadURL) URL.revokeObjectURL(downloadURL);
        downloadURL = url;
        resultImage.src = url;
        downloadBtn.href = url;
        downloadBtn.download = file.name.replace(/\.[^/.]+$/, "") + "-cropped." + extension;
        result.style.display = "block";
        result.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
        if (version === imageLoadVersion) {
            result.style.display = "none";
            alert(error.message || "Could not crop image.");
        }
    } finally {
        if (outputCanvas) outputCanvas.width = outputCanvas.height = 0;
        cropExportBusy = false;
        cropBtn.disabled = !image;
    }
});


/* =========================
   MIME
========================= */

function getMimeType(extension = outputFormat.value) {

    if (
        extension ===
        "png"
    ) {

        return "image/png";

    }


    if (
        extension ===
        "webp"
    ) {

        return "image/webp";

    }


    return "image/jpeg";

}