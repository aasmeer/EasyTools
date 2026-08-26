const uploadArea =
    document.getElementById("uploadArea");

const imageInput =
    document.getElementById("imageInput");

const imageList =
    document.getElementById("imageList");

const selectedTitle =
    document.getElementById("selectedTitle");

const pageSize =
    document.getElementById("pageSize");

const orientation =
    document.getElementById("orientation");

const marginSelect =
    document.getElementById("margin");

const generateBtn =
    document.getElementById("generateBtn");

const statusBox =
    document.getElementById("status");

const adBox =
    document.getElementById("adBox");


let selectedImages = [];


/* =========================
   UPLOAD CLICK
========================= */

uploadArea.addEventListener(
    "click",
    function () {

        imageInput.click();

    }
);


/* =========================
   FILE SELECT
========================= */

imageInput.addEventListener(
    "change",
    function () {

        addFiles(
            Array.from(imageInput.files)
        );

        imageInput.value = "";

    }
);


/* =========================
   DRAG & DROP
========================= */

uploadArea.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        uploadArea.classList.add(
            "dragover"
        );

    }
);


uploadArea.addEventListener(
    "dragleave",
    function () {

        uploadArea.classList.remove(
            "dragover"
        );

    }
);


uploadArea.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        uploadArea.classList.remove(
            "dragover"
        );

        const files =
            Array.from(
                event.dataTransfer.files
            );

        addFiles(files);

    }
);


/* =========================
   ADD FILES
========================= */

function addFiles(files) {

    const validFiles =
        files.filter(
            function (file) {

                return (
                    file.type === "image/jpeg" ||
                    file.type === "image/png"
                );

            }
        );


    if (validFiles.length === 0) {

        alert(
            "Please select JPG, JPEG or PNG images."
        );

        return;

    }


    validFiles.forEach(
        function (file) {

            selectedImages.push({
                file: file,
                url: URL.createObjectURL(file)
            });

        }
    );


    renderImages();

}


/* =========================
   RENDER IMAGES
========================= */

function renderImages() {

    imageList.innerHTML = "";


    selectedTitle.style.display =
        selectedImages.length
            ? "block"
            : "none";


    selectedImages.forEach(
        function (image, index) {

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

            img.src =
                image.url;


            const removeBtn =
                document.createElement(
                    "button"
                );

            removeBtn.className =
                "remove-btn";

            removeBtn.type =
                "button";

            removeBtn.textContent =
                "×";


            removeBtn.addEventListener(
                "click",
                function () {

                    removeImage(index);

                }
            );


            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "image-info";

            info.textContent =
                (index + 1) +
                ". " +
                image.file.name;


            const moveBox =
                document.createElement(
                    "div"
                );

            moveBox.className =
                "move-buttons";


            const leftBtn =
                document.createElement(
                    "button"
                );

            leftBtn.type =
                "button";

            leftBtn.textContent =
                "←";


            leftBtn.addEventListener(
                "click",
                function () {

                    moveImage(
                        index,
                        index - 1
                    );

                }
            );


            const rightBtn =
                document.createElement(
                    "button"
                );

            rightBtn.type =
                "button";

            rightBtn.textContent =
                "→";


            rightBtn.addEventListener(
                "click",
                function () {

                    moveImage(
                        index,
                        index + 1
                    );

                }
            );


            moveBox.appendChild(
                leftBtn
            );

            moveBox.appendChild(
                rightBtn
            );


            card.appendChild(
                img
            );

            card.appendChild(
                removeBtn
            );

            card.appendChild(
                info
            );

            card.appendChild(
                moveBox
            );


            imageList.appendChild(
                card
            );

        }
    );

}


/* =========================
   REMOVE IMAGE
========================= */

function removeImage(index) {

    URL.revokeObjectURL(
        selectedImages[index].url
    );


    selectedImages.splice(
        index,
        1
    );


    renderImages();

}


/* =========================
   MOVE IMAGE
========================= */

function moveImage(
    oldIndex,
    newIndex
) {

    if (
        newIndex < 0 ||
        newIndex >= selectedImages.length
    ) {

        return;

    }


    const item =
        selectedImages.splice(
            oldIndex,
            1
        )[0];


    selectedImages.splice(
        newIndex,
        0,
        item
    );


    renderImages();

}


/* =========================
   FILE TO DATA URL
========================= */

function fileToDataURL(file) {

    return new Promise(
        function (resolve, reject) {

            const reader =
                new FileReader();


            reader.onload =
                function () {

                    resolve(
                        reader.result
                    );

                };


            reader.onerror =
                reject;


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================
   LOAD IMAGE DIMENSIONS
========================= */

function loadImage(dataURL) {

    return new Promise(
        function (resolve, reject) {

            const image =
                new Image();


            image.onload =
                function () {

                    resolve(image);

                };


            image.onerror =
                reject;


            image.src =
                dataURL;

        }
    );

}


/* =========================
   GENERATE PDF
========================= */

generateBtn.addEventListener(
    "click",
    async function () {

        if (
            selectedImages.length === 0
        ) {

            alert(
                "Please upload at least one image."
            );

            return;

        }


        generateBtn.disabled =
            true;


        generateBtn.textContent =
            "Creating PDF...";


        statusBox.style.display =
            "block";


        statusBox.textContent =
            "Processing your images...";


        try {

            const {
                jsPDF
            } = window.jspdf;


            let pdf = null;


            const margin =
                Number(
                    marginSelect.value
                );


            for (
                let i = 0;
                i < selectedImages.length;
                i++
            ) {

                statusBox.textContent =
                    "Processing image " +
                    (i + 1) +
                    " of " +
                    selectedImages.length +
                    "...";


                const file =
                    selectedImages[i].file;


                const dataURL =
                    await fileToDataURL(
                        file
                    );


                const img =
                    await loadImage(
                        dataURL
                    );


                let currentOrientation =
                    orientation.value;


                if (
                    currentOrientation ===
                    "auto"
                ) {

                    currentOrientation =
                        img.width > img.height
                            ? "landscape"
                            : "portrait";

                }


                if (pdf === null) {

                    pdf =
                        new jsPDF({
                            orientation:
                                currentOrientation,
                            unit: "mm",
                            format:
                                pageSize.value
                        });

                } else {

                    pdf.addPage(
                        pageSize.value,
                        currentOrientation
                    );

                }


                const pageWidth =
                    pdf.internal
                    .pageSize
                    .getWidth();


                const pageHeight =
                    pdf.internal
                    .pageSize
                    .getHeight();


                const availableWidth =
                    Math.max(
                        1,
                        pageWidth -
                        margin * 2
                    );


                const availableHeight =
                    Math.max(
                        1,
                        pageHeight -
                        margin * 2
                    );


                const imageRatio =
                    img.width /
                    img.height;


                const pageRatio =
                    availableWidth /
                    availableHeight;


                let finalWidth;
                let finalHeight;


                if (
                    imageRatio >
                    pageRatio
                ) {

                    finalWidth =
                        availableWidth;

                    finalHeight =
                        finalWidth /
                        imageRatio;

                } else {

                    finalHeight =
                        availableHeight;

                    finalWidth =
                        finalHeight *
                        imageRatio;

                }


                const x =
                    (
                        pageWidth -
                        finalWidth
                    ) / 2;


                const y =
                    (
                        pageHeight -
                        finalHeight
                    ) / 2;


                let imageFormat =
                    "JPEG";


                if (
                    file.type ===
                    "image/png"
                ) {

                    imageFormat =
                        "PNG";

                }


                pdf.addImage(
                    dataURL,
                    imageFormat,
                    x,
                    y,
                    finalWidth,
                    finalHeight
                );

            }


            /*
            ==========================
            AD BEFORE DOWNLOAD
            ==========================
            Real ad code can replace
            this demo ad box later.
            */


            adBox.style.display =
                "flex";


            statusBox.textContent =
                "PDF ready! Download starting...";


            await new Promise(
                function (resolve) {

                    setTimeout(
                        resolve,
                        1000
                    );

                }
            );


            pdf.save(
                "EasyTools-images.pdf"
            );


            statusBox.textContent =
                "✓ PDF downloaded successfully.";


        } catch (error) {

            console.error(error);


            statusBox.textContent =
                "Something went wrong while creating the PDF.";


            alert(
                "Unable to create PDF. Please try again."
            );

        } finally {

            generateBtn.disabled =
                false;


            generateBtn.textContent =
                "Convert Images to PDF";

        }

    }
);