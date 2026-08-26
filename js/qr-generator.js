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

const adModal =
    document.getElementById("adModal");

const countdown =
    document.getElementById("countdown");


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


                    generateQRCode();

                }

            },
            1000
        );

}


/* ==============================
   QR GENERATION
============================== */

async function generateQRCode() {

    processing.style.display =
        "block";


    result.style.display =
        "none";


    try {

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
            "QR Code could not be generated."
        );

    }

}