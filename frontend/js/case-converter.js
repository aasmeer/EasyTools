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


    wordCount.textContent = EasyTools.countWords(text);
    characterCount.textContent = EasyTools.countCharacters(text);

}


function capitalizeWords(text) {
    return text.replace(/(^|[^\p{L}\p{M}\p{N}_])([\p{L}])/gu,
        (match, prefix, letter) => prefix + letter.toUpperCase());
}

function titleCase(text) {
    return capitalizeWords(text.toLowerCase());
}

function sentenceCase(text) {
    return text.toLowerCase().replace(/(^\s*["'\u201c\u2018(\[]*|[.!?\u3002\uff01\uff1f]\s*["'\u201c\u2018(\[]*)(\p{L})/gu,
        (match, prefix, letter) => prefix + letter.toUpperCase());
}


function toggleCase(text) {

    return Array.from(text)
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


const originalCopyLabel = copyBtn.textContent;
let copyResetTimer;
copyBtn.addEventListener("click", async function() {
    const text = textInput.value;
    if (!text.trim()) {
        alert("There is no text to copy.");
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