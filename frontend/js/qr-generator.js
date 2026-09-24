const qrText =
    document.getElementById("qrText");

const qrSize =
    document.getElementById("qrSize");

const errorLevel =
    document.getElementById("errorLevel");

const darkColor =
    document.getElementById("darkColor");

const lightColor =
    document.getElementById("lightColor");

const darkColorValue =
    document.getElementById("darkColorValue");

const lightColorValue =
    document.getElementById("lightColorValue");

const generateBtn =
    document.getElementById("generateBtn");

const processing =
    document.getElementById("processing");

const result =
    document.getElementById("result");

const qrCanvas =
    document.getElementById("qrCanvas");

const downloadBtn =
    document.getElementById("downloadBtn");




/* ==============================
   COLOR VALUES
============================== */

darkColor.addEventListener(
    "input",
    function () {

        darkColorValue.textContent =
            darkColor.value;

    }
);


lightColor.addEventListener(
    "input",
    function () {

        lightColorValue.textContent =
            lightColor.value;

    }
);


/* ==============================
   GENERATE BUTTON
============================== */

generateBtn.addEventListener(
    "click",
    function () {

        const text =
            qrText.value.trim();


        if (!text) {

            alert(
                "Please enter a URL or text."
            );

            qrText.focus();

            return;

        }


        generateBtn.disabled =
            true;


        result.style.display =
            "none";


        showAdvertisement();

    }
);


/* ==============================
   DEMO AD
============================== */

function showAdvertisement() {
    // Tool use never depends on viewing or interacting with an advertisement.
    return generateQRCode();
}


/* ==============================
   QR GENERATION
============================== */

function validateQRColors(dark, light) {
    function luminance(color) {
        if (!/^#[0-9a-f]{6}$/i.test(color)) {
            throw new RangeError("Please choose valid QR and background colors.");
        }
        const channels = [1, 3, 5].map(offset => {
            const value = parseInt(color.slice(offset, offset + 2), 16) / 255;
            return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
        return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    }
    const foreground = luminance(dark);
    const background = luminance(light);
    if (foreground >= background || (background + 0.05) / (foreground + 0.05) < 4.5) {
        throw new RangeError("Choose a dark QR color and a light background with at least 4.5:1 contrast so the code can be scanned.");
    }
}

async function generateQRCode() {

    processing.style.display =
        "block";


    result.style.display =
        "none";


    try {
        validateQRColors(darkColor.value, lightColor.value);

        const size =
            Number(qrSize.value);


        const text =
            qrText.value.trim();


        await QRCode.toCanvas(

            qrCanvas,

            text,

            {

                width:
                    size,

                margin:
                    2,

                errorCorrectionLevel:
                    errorLevel.value,

                color: {

                    dark:
                        darkColor.value,

                    light:
                        lightColor.value

                }

            }

        );


        const imageURL =
            qrCanvas.toDataURL(
                "image/png"
            );


        downloadBtn.href =
            imageURL;


        downloadBtn.download =
            "easytools-qr-code.png";


        processing.style.display =
            "none";


        result.style.display =
            "block";


        generateBtn.disabled =
            false;


    } catch (error) {

        console.error(error);


        processing.style.display =
            "none";


        generateBtn.disabled =
            false;


        alert(
            error instanceof RangeError ? error.message : "QR Code could not be generated."
        );

    }

}