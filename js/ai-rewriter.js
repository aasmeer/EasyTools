/* ==========================================
   EASYTOOLS - AI TEXT REWRITER
========================================== */


/* ==========================================
   ELEMENTS
========================================== */

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


/* ==========================================
   LIVE BACKEND ADDRESS
========================================== */

const BACKEND_URL =
    "https://easytools-backend.onrender.com";


/* ==========================================
   REWRITE BUTTON
========================================== */

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

            inputText.focus();

            return;

        }


        rewriteBtn.disabled =
            true;


        result.style.display =
            "none";


        processing.style.display =
            "none";


        showAdvertisement();

    }
);


/* ==========================================
   DEMO ADVERTISEMENT
========================================== */

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

                    clearInterval(
                        timer
                    );


                    adModal.style.display =
                        "none";


                    rewriteText();

                }

            },
            1000
        );

}


/* ==========================================
   AI REWRITE REQUEST
========================================== */

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

        } catch (jsonError) {

            throw new Error(
                "Backend returned an invalid response."
            );

        }


        if (!response.ok) {

            console.error(
                "Backend Error:",
                data
            );


            let errorMessage =
                "Something went wrong.";


            if (data.detail) {

                if (
                    typeof data.detail ===
                    "string"
                ) {

                    errorMessage =
                        data.detail;

                } else {

                    errorMessage =
                        JSON.stringify(
                            data.detail
                        );

                }

            }


            throw new Error(
                errorMessage
            );

        }


        if (
            !data.success ||
            !data.result
        ) {

            throw new Error(
                "AI did not return a valid result."
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

            behavior:
                "smooth",

            block:
                "center"

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
                "Could not connect to EasyTools backend.\n\n" +
                "Please try again in a few seconds.\n" +
                "The free server may be waking up."
            );

            return;

        }


        alert(
            "Error:\n\n" +
            error.message
        );

    }

}


/* ==========================================
   COPY RESULT
========================================== */

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


        } catch (error) {

            console.error(
                "Copy Error:",
                error
            );


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


/* ==========================================
   BACKEND STATUS CHECK
========================================== */

async function checkBackend() {

    try {

        const response =
            await fetch(
                BACKEND_URL + "/"
            );


        if (!response.ok) {

            console.warn(
                "EasyTools backend returned an error."
            );

            return;

        }


        const data =
            await response.json();


        console.log(
            "EasyTools Backend:",
            data.message
        );


    } catch (error) {

        console.warn(
            "EasyTools backend is currently unavailable."
        );

    }

}


/* ==========================================
   RUN STATUS CHECK
========================================== */

checkBackend();