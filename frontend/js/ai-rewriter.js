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


        if (inputText.value.length > 10000) {
            alert("Please limit your text to 10,000 characters per rewrite.");
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
    // Tool use never depends on viewing or interacting with an advertisement.
    return rewriteText();
}


/* ==========================================
   AI REWRITE REQUEST
========================================== */

async function rewriteText() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

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
                    signal: controller.signal,

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
            if (controller.signal.aborted) throw jsonError;

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
            !data || !data.success ||
            typeof data.result !== "string" || !data.result.trim()
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


        if (controller.signal.aborted) {
            alert("The rewrite request timed out. Please try again.");
            return;
        }

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

    } finally {
        clearTimeout(timeout);
        processing.style.display = "none";
        rewriteBtn.disabled = false;
    }

}


/* ==========================================
   COPY RESULT
========================================== */

const originalCopyLabel = copyBtn.textContent;
let copyResetTimer;
copyBtn.addEventListener("click", async function() {
    const text = resultText.textContent.trim();
    if (!text.trim()) {
        alert("There is no result to copy.");
        return;
    }
    try {
        await EasyTools.copyText(text);
        clearTimeout(copyResetTimer);
        copyBtn.textContent = "Copied \u2713";
        copyResetTimer = setTimeout(() => { copyBtn.textContent = originalCopyLabel; }, 1500);
    } catch (error) {
        clearTimeout(copyResetTimer);
        copyBtn.textContent = originalCopyLabel;
        alert("Copy could not be completed. Please select the text and copy it manually.");
    }
});


/* ==========================================
   BACKEND STATUS CHECK
========================================== */

async function checkBackend() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {

        const response =
            await fetch(
                BACKEND_URL + "/",
                { signal: controller.signal }
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

    } finally {
        clearTimeout(timeout);
    }

}


/* ==========================================
   RUN STATUS CHECK
========================================== */

checkBackend();