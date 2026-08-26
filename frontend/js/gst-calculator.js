const amountInput =
    document.getElementById("amountInput");

const gstRate =
    document.getElementById("gstRate");

const customRateWrap =
    document.getElementById("customRateWrap");

const customRate =
    document.getElementById("customRate");

const addModeBtn =
    document.getElementById("addModeBtn");

const removeModeBtn =
    document.getElementById("removeModeBtn");

const calculateBtn =
    document.getElementById("calculateBtn");

const baseAmount =
    document.getElementById("baseAmount");

const gstAmount =
    document.getElementById("gstAmount");

const cgstAmount =
    document.getElementById("cgstAmount");

const sgstAmount =
    document.getElementById("sgstAmount");

const finalAmount =
    document.getElementById("finalAmount");

const totalLabel =
    document.getElementById("totalLabel");


let mode =
    "add";


function formatCurrency(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(value);

}


function getRate() {

    if (
        gstRate.value ===
        "custom"
    ) {

        return Number(
            customRate.value
        );

    }

    return Number(
        gstRate.value
    );

}


function setMode(newMode) {

    mode =
        newMode;


    if (
        mode === "add"
    ) {

        addModeBtn.classList.add(
            "active"
        );

        removeModeBtn.classList.remove(
            "active"
        );

        totalLabel.textContent =
            "Final Amount";

    } else {

        removeModeBtn.classList.add(
            "active"
        );

        addModeBtn.classList.remove(
            "active"
        );

        totalLabel.textContent =
            "Original GST-Inclusive Amount";

    }


    calculateGST();

}


function calculateGST() {

    const amount =
        Number(
            amountInput.value
        );


    const rate =
        getRate();


    if (
        !amount ||
        amount < 0
    ) {

        showZero();

        return;

    }


    if (
        isNaN(rate) ||
        rate < 0
    ) {

        showZero();

        return;

    }


    let base = 0;
    let gst = 0;
    let total = 0;


    if (
        mode === "add"
    ) {

        base =
            amount;


        gst =
            base *
            rate /
            100;


        total =
            base +
            gst;

    } else {

        total =
            amount;


        base =
            total /
            (
                1 +
                rate / 100
            );


        gst =
            total -
            base;

    }


    const cgst =
        gst / 2;


    const sgst =
        gst / 2;


    baseAmount.textContent =
        formatCurrency(
            base
        );


    gstAmount.textContent =
        formatCurrency(
            gst
        );


    cgstAmount.textContent =
        formatCurrency(
            cgst
        );


    sgstAmount.textContent =
        formatCurrency(
            sgst
        );


    finalAmount.textContent =
        formatCurrency(
            total
        );

}


function showZero() {

    baseAmount.textContent =
        "₹0.00";

    gstAmount.textContent =
        "₹0.00";

    cgstAmount.textContent =
        "₹0.00";

    sgstAmount.textContent =
        "₹0.00";

    finalAmount.textContent =
        "₹0.00";

}


gstRate.addEventListener(
    "change",
    function() {

        if (
            gstRate.value ===
            "custom"
        ) {

            customRateWrap.style.display =
                "block";

        } else {

            customRateWrap.style.display =
                "none";

        }


        calculateGST();

    }
);


amountInput.addEventListener(
    "input",
    calculateGST
);


customRate.addEventListener(
    "input",
    calculateGST
);


addModeBtn.addEventListener(
    "click",
    function() {

        setMode(
            "add"
        );

    }
);


removeModeBtn.addEventListener(
    "click",
    function() {

        setMode(
            "remove"
        );

    }
);


calculateBtn.addEventListener(
    "click",
    calculateGST
);


calculateGST();