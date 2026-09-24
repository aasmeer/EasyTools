const loanAmount =
    document.getElementById("loanAmount");

const interestRate =
    document.getElementById("interestRate");

const tenureValue =
    document.getElementById("tenureValue");

const tenureType =
    document.getElementById("tenureType");

const calculateBtn =
    document.getElementById("calculateBtn");

const result =
    document.getElementById("result");

const monthlyEmi =
    document.getElementById("monthlyEmi");

const principalAmount =
    document.getElementById("principalAmount");

const totalInterest =
    document.getElementById("totalInterest");

const totalPayment =
    document.getElementById("totalPayment");


/* =========================
   FORMAT CURRENCY
========================= */

function formatCurrency(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(value);

}


/* =========================
   CALCULATE EMI
========================= */

function calculateEMI() {

    const principal =
        Number(
            loanAmount.value
        );


    const annualRate =
        Number(
            interestRate.value
        );


    const tenure =
        Number(
            tenureValue.value
        );


    if (
        !Number.isFinite(principal) ||
        principal <= 0 ||
        !Number.isFinite(annualRate) ||
        annualRate < 0 ||
        !Number.isFinite(tenure) ||
        tenure <= 0
    ) {

        result.style.display = "none";

        alert(
            "Please enter valid loan details."
        );

        return;

    }


    let months;


    if (
        tenureType.value ===
        "years"
    ) {

        months =
            tenure * 12;

    } else {

        months =
            tenure;

    }


    if (!Number.isFinite(months) || months <= 0) {
        result.style.display = "none";
        alert("Loan duration is outside the supported numeric range.");
        return;
    }

    const monthlyRate =
        annualRate /
        12 /
        100;


    let emi;


    if (
        monthlyRate === 0
    ) {

        emi =
            principal /
            months;

    } else {

        // Equivalent amortization formula without an overflowing positive power.
        // log1p/expm1 also retain precision when the interest rate is very small.
        const denominator = -Math.expm1(-months * Math.log1p(monthlyRate));
        emi = principal * (monthlyRate / denominator);

    }


    const payment =
        emi *
        months;


    const interest = Math.max(0, payment - principal);

    if (![emi, payment, interest].every(Number.isFinite) || emi <= 0 || payment <= 0) {
        result.style.display = "none";
        alert("These loan values exceed the supported numeric range. Please use smaller values.");
        return;
    }


    monthlyEmi.textContent =
        formatCurrency(
            emi
        );


    principalAmount.textContent =
        formatCurrency(
            principal
        );


    totalInterest.textContent =
        formatCurrency(
            interest
        );


    totalPayment.textContent =
        formatCurrency(
            payment
        );


    result.style.display =
        "block";


    result.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =========================
   EVENTS
========================= */

calculateBtn.addEventListener(
    "click",
    calculateEMI
);


[
    loanAmount,
    interestRate,
    tenureValue
].forEach(
    function(input) {

        input.addEventListener(
            "input",
            function() {

                if (
                    loanAmount.value &&
                    interestRate.value &&
                    tenureValue.value
                ) {

                    calculateEMI();

                }

            }
        );

    }
);


tenureType.addEventListener(
    "change",
    function() {

        if (
            loanAmount.value &&
            interestRate.value &&
            tenureValue.value
        ) {

            calculateEMI();

        }

    }
);