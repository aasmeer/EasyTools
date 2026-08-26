const textInput =
    document.getElementById("textInput");

const wordCount =
    document.getElementById("wordCount");

const characterCount =
    document.getElementById("characterCount");

const upperBtn =
    document.getElementById("upperBtn");

const lowerBtn =
    document.getElementById("lowerBtn");

const titleBtn =
    document.getElementById("titleBtn");

const sentenceBtn =
    document.getElementById("sentenceBtn");

const capitalizeBtn =
    document.getElementById("capitalizeBtn");

const toggleBtn =
    document.getElementById("toggleBtn");

const copyBtn =
    document.getElementById("copyBtn");

const clearBtn =
    document.getElementById("clearBtn");


function updateStats() {

    const text =
        textInput.value;


    const words =
        text.trim()
            ? text.trim()
                .split(/\s+/)
                .filter(Boolean)
            : [];


    wordCount.textContent =
        words.length;


    characterCount.textContent =
        text.length;

}


function titleCase(text) {

    return text
        .toLowerCase()
        .replace(
            /\b\w/g,
            function(letter) {
                return letter.toUpperCase();
            }
        );

}


function sentenceCase(text) {

    const lower =
        text.toLowerCase();


    return lower.replace(
        /(^\s*[a-z])|([.!?]\s+[a-z])/g,
        function(match) {
            return match.toUpperCase();
        }
    );

}


function capitalizeWords(text) {

    return text.replace(
        /\b[a-zA-Z]/g,
        function(letter) {
            return letter.toUpperCase();
        }
    );

}


function toggleCase(text) {

    return text
        .split("")
        .map(
            function(character) {

                if (
                    character ===
                    character.toUpperCase()
                ) {

                    return character
                        .toLowerCase();

                }

                return character
                    .toUpperCase();

            }
        )
        .join("");

}


function applyText(value) {

    textInput.value =
        value;

    updateStats();

    textInput.focus();

}


upperBtn.addEventListener(
    "click",
    function() {

        applyText(
            textInput.value
                .toUpperCase()
        );

    }
);


lowerBtn.addEventListener(
    "click",
    function() {

        applyText(
            textInput.value
                .toLowerCase()
        );

    }
);


titleBtn.addEventListener(
    "click",
    function() {

        applyText(
            titleCase(
                textInput.value
            )
        );

    }
);


sentenceBtn.addEventListener(
    "click",
    function() {

        applyText(
            sentenceCase(
                textInput.value
            )
        );

    }
);


capitalizeBtn.addEventListener(
    "click",
    function() {

        applyText(
            capitalizeWords(
                textInput.value
            )
        );

    }
);


toggleBtn.addEventListener(
    "click",
    function() {

        applyText(
            toggleCase(
                textInput.value
            )
        );

    }
);


copyBtn.addEventListener(
    "click",
    async function() {

        if (
            !textInput.value.trim()
        ) {

            alert(
                "There is no text to copy."
            );

            return;

        }


        try {

            await navigator.clipboard
                .writeText(
                    textInput.value
                );


            copyBtn.textContent =
                "Copied ✓";


            setTimeout(
                function() {

                    copyBtn.textContent =
                        "📋 Copy Text";

                },
                1500
            );


        } catch(error) {

            textInput.select();

            document.execCommand(
                "copy"
            );

        }

    }
);


clearBtn.addEventListener(
    "click",
    function() {

        textInput.value =
            "";

        updateStats();

        textInput.focus();

    }
);


textInput.addEventListener(
    "input",
    updateStats
);


updateStats();