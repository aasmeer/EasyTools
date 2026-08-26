const modeButtons =
    document.querySelectorAll(
        ".mode-btn"
    );

const sections =
    document.querySelectorAll(
        ".calculator-section"
    );


/* =========================
   MODE SWITCH
========================= */

modeButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                const mode =
                    button.dataset.mode;


                modeButtons.forEach(
                    function(btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                sections.forEach(
                    function(section) {

                        section.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                document
                    .getElementById(mode)
                    .classList.add(
                        "active"
                    );

            }
        );

    }
);


/* =========================
   FORMAT NUMBER
========================= */

function formatNumber(value) {

    if (
        !Number.isFinite(value)
    ) {
        return "0";
    }


    return Number(
        value.toFixed(4)
    ).toLocaleString(
        "en-IN"
    );

}


/* =========================
   X% OF NUMBER
========================= */

const percentValue =
    document.getElementById(
        "percentValue"
    );

const numberValue =
    document.getElementById(
        "numberValue"
    );

const percentOfBtn =
    document.getElementById(
        "percentOfBtn"
    );

const percentOfResult =
    document.getElementById(
        "percentOfResult"
    );


function calculatePercentOf() {

    const percent =
        Number(
            percentValue.value
        );


    const number =
        Number(
            numberValue.value
        );


    if (
        !Number.isFinite(percent) ||
        !Number.isFinite(number)
    ) {

        percentOfResult.textContent =
            "0";

        return;

    }


    const result =
        (
            percent /
            100
        ) *
        number;


    percentOfResult.textContent =
        formatNumber(
            result
        );

}


percentOfBtn.addEventListener(
    "click",
    calculatePercentOf
);


percentValue.addEventListener(
    "input",
    calculatePercentOf
);


numberValue.addEventListener(
    "input",
    calculatePercentOf
);


/* =========================
   WHAT PERCENT?
========================= */

const partValue =
    document.getElementById(
        "partValue"
    );

const wholeValue =
    document.getElementById(
        "wholeValue"
    );

const whatPercentBtn =
    document.getElementById(
        "whatPercentBtn"
    );

const whatPercentResult =
    document.getElementById(
        "whatPercentResult"
    );


function calculateWhatPercent() {

    const part =
        Number(
            partValue.value
        );


    const whole =
        Number(
            wholeValue.value
        );


    if (
        !Number.isFinite(part) ||
        !Number.isFinite(whole) ||
        whole === 0
    ) {

        whatPercentResult.textContent =
            "0%";

        return;

    }


    const result =
        (
            part /
            whole
        ) *
        100;


    whatPercentResult.textContent =
        formatNumber(
            result
        ) +
        "%";

}


whatPercentBtn.addEventListener(
    "click",
    calculateWhatPercent
);


partValue.addEventListener(
    "input",
    calculateWhatPercent
);


wholeValue.addEventListener(
    "input",
    calculateWhatPercent
);


/* =========================
   PERCENT CHANGE
========================= */

const oldValue =
    document.getElementById(
        "oldValue"
    );

const newValue =
    document.getElementById(
        "newValue"
    );

const changeBtn =
    document.getElementById(
        "changeBtn"
    );

const changeResult =
    document.getElementById(
        "changeResult"
    );


function calculateChange() {

    const oldNumber =
        Number(
            oldValue.value
        );


    const newNumber =
        Number(
            newValue.value
        );


    if (
        !Number.isFinite(oldNumber) ||
        !Number.isFinite(newNumber) ||
        oldNumber === 0
    ) {

        changeResult.textContent =
            "0%";

        return;

    }


    const change =
        (
            (
                newNumber -
                oldNumber
            ) /
            Math.abs(
                oldNumber
            )
        ) *
        100;


    let label =
        "";


    if (
        change > 0
    ) {

        label =
            " increase";

    } else if (
        change < 0
    ) {

        label =
            " decrease";

    }


    changeResult.textContent =
        formatNumber(
            Math.abs(
                change
            )
        ) +
        "%" +
        label;

}


changeBtn.addEventListener(
    "click",
    calculateChange
);


oldValue.addEventListener(
    "input",
    calculateChange
);


newValue.addEventListener(
    "input",
    calculateChange
);