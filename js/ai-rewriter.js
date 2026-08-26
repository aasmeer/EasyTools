/* ==========================================
   EASYTOOLS - AI TEXT REWRITER
========================================== */


/* ELEMENTS */

const inputText =
    document.getElementById("inputText");

const tone =
    document.getElementById("tone");

const length =
    document.getElementById("length");

const rewriteBtn =
    document.getElementById("rewriteBtn");

const processing =
    document.getElementById("processing");

const result =
    document.getElementById("result");

const resultText =
    document.getElementById("resultText");

const copyBtn =
    document.getElementById("copyBtn");

const adModal =
    document.getElementById("adModal");

const countdown =
    document.getElementById("countdown");


/* LIVE BACKEND */

const BACKEND_URL =
    "https://easytools-backend.onrender.com";


/* REWRITE BUTTON */

rewriteBtn.addEventListener(
    "click",
    function () {

        const text =
            inputText.value.trim();


        if (!text) {

            alert(
                "Please enter some text first."
            );

            inputText.focus();

            return;
        }


        if (text.length < 3) {

            alert(
                "Please enter a little more text."
            );

            return;
        }


        rewriteBtn.disabled =
            true;


        result.style.display =
            "none";


        showAdvertisement();

    }
);


/* AD */

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

                    rewriteText();
                }

            },
            1000
        );
}


/* REWRITE */

async function rewriteText() {

    processing.style.display =
        "block";

    result.style.display =
        "none";


    try {

        const response =
            await fetch(
                BACKEND_URL + "/rewrite",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        text:
                            inputText.value.trim(),

                        tone:
                            tone.value,

                        length:
                            length.value
                    })
                }
            );


        let data;


        try {

            data =
                await response.json();

        } catch {

            throw new Error(
                "AI service is temporarily unavailable."
            );
        }


        if (!response.ok) {

            const message =
                data.detail ||
                "AI service is temporarily unavailable.";


            throw new Error(
                message
            );
        }


        if (
            !data.success ||
            !data.result
        ) {

            throw new Error(
                "AI service is temporarily unavailable."
            );
        }


        resultText.textContent =
            data.result;


        processing.style.display =
            "none";


        result.style.display =
            "block";


        rewriteBtn.disabled =
            false;


        result.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


    } catch (error) {

        console.error(
            "EasyTools Rewrite Error:",
            error
        );


        processing.style.display =
            "none";


        rewriteBtn.disabled =
            false;


        if (
            error.message ===
            "Failed to fetch"
        ) {

            alert(
                "AI service is waking up.\n\n" +
                "Please wait a few seconds and try again."
            );

            return;
        }


        alert(
            error.message
        );
    }
}


/* COPY */

copyBtn.addEventListener(
    "click",
    async function () {

        const text =
            resultText.textContent.trim();


        if (!text) {

            alert(
                "There is no result to copy."
            );

            return;
        }


        try {

            await navigator.clipboard
                .writeText(text);


            copyBtn.textContent =
                "Copied ✓";


            setTimeout(
                function () {

                    copyBtn.textContent =
                        "Copy Result";

                },
                1500
            );


        } catch {

            const temporaryTextarea =
                document.createElement(
                    "textarea"
                );


            temporaryTextarea.value =
                text;


            document.body.appendChild(
                temporaryTextarea
            );


            temporaryTextarea.select();


            document.execCommand(
                "copy"
            );


            document.body.removeChild(
                temporaryTextarea
            );


            copyBtn.textContent =
                "Copied ✓";


            setTimeout(
                function () {

                    copyBtn.textContent =
                        "Copy Result";

                },
                1500
            );
        }
    }
);


/* BACKEND CHECK */

async function checkBackend() {

    try {

        await fetch(
            BACKEND_URL + "/"
        );

    } catch {

        console.warn(
            "EasyTools backend unavailable."
        );
    }
}


checkBackend();
