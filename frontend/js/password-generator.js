const passwordOutput =
    document.getElementById("passwordOutput");

const copyBtn =
    document.getElementById("copyBtn");

const lengthRange =
    document.getElementById("lengthRange");

const lengthValue =
    document.getElementById("lengthValue");

const uppercase =
    document.getElementById("uppercase");

const lowercase =
    document.getElementById("lowercase");

const numbers =
    document.getElementById("numbers");

const symbols =
    document.getElementById("symbols");

const generateBtn =
    document.getElementById("generateBtn");

const strengthText =
    document.getElementById("strengthText");

const strengthFill =
    document.getElementById("strengthFill");


const UPPERCASE =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const LOWERCASE =
    "abcdefghijklmnopqrstuvwxyz";

const NUMBERS =
    "0123456789";

const SYMBOLS =
    "!@#$%^&*()_+-=[]{};:,.?";


/* =========================
   SECURE RANDOM INTEGER
========================= */

function secureRandomIndex(max) {

    if (max <= 0) {
        return 0;
    }

    const array =
        new Uint32Array(1);

    const limit =
        Math.floor(
            0x100000000 / max
        ) * max;

    let value;

    do {

        crypto.getRandomValues(
            array
        );

        value =
            array[0];

    } while (
        value >= limit
    );


    return value % max;

}


/* =========================
   SHUFFLE
========================= */

function secureShuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            secureRandomIndex(
                i + 1
            );


        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];

    }


    return array;

}


/* =========================
   GENERATE
========================= */

function generatePassword() {

    let charset =
        "";

    const requiredChars =
        [];


    if (
        uppercase.checked
    ) {

        charset +=
            UPPERCASE;

        requiredChars.push(
            UPPERCASE[
                secureRandomIndex(
                    UPPERCASE.length
                )
            ]
        );

    }


    if (
        lowercase.checked
    ) {

        charset +=
            LOWERCASE;

        requiredChars.push(
            LOWERCASE[
                secureRandomIndex(
                    LOWERCASE.length
                )
            ]
        );

    }


    if (
        numbers.checked
    ) {

        charset +=
            NUMBERS;

        requiredChars.push(
            NUMBERS[
                secureRandomIndex(
                    NUMBERS.length
                )
            ]
        );

    }


    if (
        symbols.checked
    ) {

        charset +=
            SYMBOLS;

        requiredChars.push(
            SYMBOLS[
                secureRandomIndex(
                    SYMBOLS.length
                )
            ]
        );

    }


    if (!charset) {

        alert(
            "Please select at least one character type."
        );

        return;

    }


    const length =
        Number(
            lengthRange.value
        );


    const passwordChars =
        [...requiredChars];


    while (
        passwordChars.length <
        length
    ) {

        passwordChars.push(
            charset[
                secureRandomIndex(
                    charset.length
                )
            ]
        );

    }


    secureShuffle(
        passwordChars
    );


    const password =
        passwordChars
            .slice(
                0,
                length
            )
            .join("");


    passwordOutput.value =
        password;


    updateStrength(
        password
    );

}


/* =========================
   STRENGTH
========================= */

function updateStrength(password) {

    let score =
        0;


    if (
        password.length >= 8
    ) {
        score++;
    }


    if (
        password.length >= 12
    ) {
        score++;
    }


    if (
        password.length >= 16
    ) {
        score++;
    }


    if (
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password)
    ) {
        score++;
    }


    if (
        /\d/.test(password)
    ) {
        score++;
    }


    if (
        /[^A-Za-z0-9]/.test(password)
    ) {
        score++;
    }


    let label;
    let width;


    if (
        score <= 2
    ) {

        label =
            "Weak";

        width =
            "25%";

    } else if (
        score <= 4
    ) {

        label =
            "Good";

        width =
            "60%";

    } else {

        label =
            "Strong";

        width =
            "100%";

    }


    strengthText.textContent =
        label;


    strengthFill.style.width =
        width;

}


/* =========================
   COPY
========================= */

copyBtn.addEventListener(
    "click",
    async function() {

        if (
            !passwordOutput.value
        ) {

            alert(
                "Generate a password first."
            );

            return;

        }


        try {

            await navigator.clipboard
                .writeText(
                    passwordOutput.value
                );


            copyBtn.textContent =
                "Copied ✓";


            setTimeout(
                function() {

                    copyBtn.textContent =
                        "📋 Copy";

                },
                1500
            );


        } catch(error) {

            passwordOutput.select();

            document.execCommand(
                "copy"
            );

        }

    }
);


/* =========================
   EVENTS
========================= */

lengthRange.addEventListener(
    "input",
    function() {

        lengthValue.textContent =
            lengthRange.value;

        generatePassword();

    }
);


[
    uppercase,
    lowercase,
    numbers,
    symbols
].forEach(
    function(option) {

        option.addEventListener(
            "change",
            generatePassword
        );

    }
);


generateBtn.addEventListener(
    "click",
    generatePassword
);


/* =========================
   START
========================= */

generatePassword();