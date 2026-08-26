const birthDate =
    document.getElementById("birthDate");

const targetDate =
    document.getElementById("targetDate");

const calculateBtn =
    document.getElementById("calculateBtn");

const result =
    document.getElementById("result");

const exactAge =
    document.getElementById("exactAge");

const totalMonths =
    document.getElementById("totalMonths");

const totalWeeks =
    document.getElementById("totalWeeks");

const totalDays =
    document.getElementById("totalDays");

const nextBirthday =
    document.getElementById("nextBirthday");

const bornDay =
    document.getElementById("bornDay");

const ageYears =
    document.getElementById("ageYears");


/* =========================
   TODAY
========================= */

function setToday() {

    const today =
        new Date();


    const localDate =
        new Date(
            today.getTime() -
            today.getTimezoneOffset() *
            60000
        );


    targetDate.value =
        localDate
            .toISOString()
            .split("T")[0];

}


setToday();


/* =========================
   PARSE DATE SAFELY
========================= */

function parseDate(value) {

    const parts =
        value.split("-");


    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );

}


/* =========================
   EXACT AGE
========================= */

function getExactAge(
    birth,
    target
) {

    let years =
        target.getFullYear() -
        birth.getFullYear();


    let months =
        target.getMonth() -
        birth.getMonth();


    let days =
        target.getDate() -
        birth.getDate();


    if (
        days < 0
    ) {

        months--;


        const previousMonth =
            new Date(
                target.getFullYear(),
                target.getMonth(),
                0
            );


        days +=
            previousMonth.getDate();

    }


    if (
        months < 0
    ) {

        years--;

        months +=
            12;

    }


    return {
        years,
        months,
        days
    };

}


/* =========================
   NEXT BIRTHDAY
========================= */

function getNextBirthdayDays(
    birth,
    target
) {

    let next =
        new Date(
            target.getFullYear(),
            birth.getMonth(),
            birth.getDate()
        );


    if (
        next < target
    ) {

        next =
            new Date(
                target.getFullYear() + 1,
                birth.getMonth(),
                birth.getDate()
            );

    }


    const difference =
        next -
        target;


    return Math.ceil(
        difference /
        (
            1000 *
            60 *
            60 *
            24
        )
    );

}


/* =========================
   CALCULATE
========================= */

function calculateAge() {

    if (
        !birthDate.value ||
        !targetDate.value
    ) {

        alert(
            "Please select both dates."
        );

        return;

    }


    const birth =
        parseDate(
            birthDate.value
        );


    const target =
        parseDate(
            targetDate.value
        );


    if (
        birth > target
    ) {

        alert(
            "Date of birth cannot be after the target date."
        );

        return;

    }


    const age =
        getExactAge(
            birth,
            target
        );


    exactAge.textContent =
        age.years +
        " Years, " +
        age.months +
        " Months, " +
        age.days +
        " Days";


    ageYears.textContent =
        age.years;


    const milliseconds =
        target.getTime() -
        birth.getTime();


    const days =
        Math.floor(
            milliseconds /
            (
                1000 *
                60 *
                60 *
                24
            )
        );


    totalDays.textContent =
        days.toLocaleString(
            "en-IN"
        );


    totalWeeks.textContent =
        Math.floor(
            days / 7
        ).toLocaleString(
            "en-IN"
        );


    totalMonths.textContent =
        (
            age.years *
            12 +
            age.months
        ).toLocaleString(
            "en-IN"
        );


    const birthdayDays =
        getNextBirthdayDays(
            birth,
            target
        );


    nextBirthday.textContent =
        birthdayDays === 0
            ? "Today 🎉"
            : birthdayDays +
              " days";


    bornDay.textContent =
        birth.toLocaleDateString(
            "en-IN",
            {
                weekday:
                    "long"
            }
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
    calculateAge
);


birthDate.addEventListener(
    "change",
    function() {

        if (
            birthDate.value &&
            targetDate.value
        ) {

            calculateAge();

        }

    }
);


targetDate.addEventListener(
    "change",
    function() {

        if (
            birthDate.value &&
            targetDate.value
        ) {

            calculateAge();

        }

    }
);