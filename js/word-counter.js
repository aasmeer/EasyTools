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


    // WORD COUNT
    const words = trimmedText
        ? trimmedText.split(/\s+/).filter(Boolean)
        : [];

    wordCount.textContent = words.length;


    // CHARACTER COUNT
    characterCount.textContent = text.length;


    // CHARACTER COUNT WITHOUT SPACES
    characterNoSpaceCount.textContent =
        text.replace(/\s/g, "").length;


    // SENTENCE COUNT
    let sentences = [];

    if (trimmedText) {

        sentences = trimmedText
            .split(/[.!?]+/)
            .map(function(sentence) {
                return sentence.trim();
            })
            .filter(Boolean);

    }

    sentenceCount.textContent = sentences.length;


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
    const minutes = words.length / wordsPerMinute;

    if (words.length === 0) {

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
copyBtn.addEventListener(
    "click",
    async function() {

        const text = textInput.value;

        if (!text.trim()) {

            alert("There is no text to copy.");

            return;

        }

        try {

            await navigator.clipboard.writeText(text);

            copyBtn.textContent = "Copied ✓";

            setTimeout(
                function() {

                    copyBtn.textContent = "📋 Copy Text";

                },
                1500
            );

        } catch (error) {

            const temporaryTextarea =
                document.createElement("textarea");

            temporaryTextarea.value = text;

            document.body.appendChild(
                temporaryTextarea
            );

            temporaryTextarea.select();

            document.execCommand("copy");

            document.body.removeChild(
                temporaryTextarea
            );

            copyBtn.textContent = "Copied ✓";

            setTimeout(
                function() {

                    copyBtn.textContent = "📋 Copy Text";

                },
                1500
            );

        }

    }
);


// INITIAL COUNT
updateCounts();