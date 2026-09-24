const textInput = document.getElementById("textInput");

const wordCount = document.getElementById("wordCount");
const characterCount = document.getElementById("characterCount");
const characterNoSpaceCount = document.getElementById("characterNoSpaceCount");
const sentenceCount = document.getElementById("sentenceCount");
const paragraphCount = document.getElementById("paragraphCount");
const readingTime = document.getElementById("readingTime");

const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");


function updateCounts() {

    const text = textInput.value;
    const trimmedText = text.trim();


    const words = EasyTools.countWords(text);
    wordCount.textContent = words;
    characterCount.textContent = EasyTools.countCharacters(text);
    characterNoSpaceCount.textContent = EasyTools.countCharacters(text.replace(/\s/gu, ""));

    const sentences = typeof Intl.Segmenter === "function"
        ? Array.from(new Intl.Segmenter(undefined, { granularity: "sentence" }).segment(trimmedText), part => part.segment)
        : trimmedText.split(/[.!?\u3002\uff01\uff1f]+/u);
    sentenceCount.textContent = sentences.filter(sentence => /[\p{L}\p{N}]/u.test(sentence)).length;


    // PARAGRAPH COUNT
    let paragraphs = [];

    if (trimmedText) {

        paragraphs = text
            .split(/\n\s*\n/)
            .map(function(paragraph) {
                return paragraph.trim();
            })
            .filter(Boolean);

    }

    paragraphCount.textContent = paragraphs.length;


    // READING TIME
    const wordsPerMinute = 200;
    const minutes = words / wordsPerMinute;

    if (words === 0) {

        readingTime.textContent = "0 min";

    } else if (minutes < 1) {

        readingTime.textContent = "< 1 min";

    } else {

        readingTime.textContent =
            Math.ceil(minutes) + " min";

    }

}


// LIVE COUNT
textInput.addEventListener(
    "input",
    updateCounts
);


// CLEAR BUTTON
clearBtn.addEventListener(
    "click",
    function() {

        textInput.value = "";

        updateCounts();

        textInput.focus();

    }
);


// COPY BUTTON
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


// INITIAL COUNT
updateCounts();