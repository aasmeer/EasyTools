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

// Treat date inputs as calendar dates, independent of daylight-saving offsets.
function calendarDate(year, month, day) {
    const date = new Date(0);
    date.setUTCFullYear(year, month, day);
    return date;
}

function parseDate(value) {
    const parts = /^(\d{4,})-(\d{2})-(\d{2})$/.exec(value);
    if (!parts) return new Date(NaN);
    const year = Number(parts[1]);
    const month = Number(parts[2]) - 1;
    const day = Number(parts[3]);
    const date = calendarDate(year, month, day);
    if (year < 1 || date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month || date.getUTCDate() !== day) return new Date(NaN);
    return date;
}

// Month-end anniversaries use the last day when a month is shorter.
// This also treats February 28 as a leap-day birthday's non-leap anniversary.
function addCalendarMonths(date, count) {
    const first = calendarDate(date.getUTCFullYear(), date.getUTCMonth() + count, 1);
    const lastDay = calendarDate(first.getUTCFullYear(), first.getUTCMonth() + 1, 0).getUTCDate();
    return calendarDate(first.getUTCFullYear(), first.getUTCMonth(), Math.min(date.getUTCDate(), lastDay));
}

function calendarDaysBetween(start, end) {
    return (end.getTime() - start.getTime()) / 86400000;
}


/* =========================
   EXACT AGE
========================= */

function getExactAge(birth, target) {
    let wholeMonths = (target.getUTCFullYear() - birth.getUTCFullYear()) * 12 +
        target.getUTCMonth() - birth.getUTCMonth();
    if (addCalendarMonths(birth, wholeMonths) > target) wholeMonths--;
    const anniversary = addCalendarMonths(birth, wholeMonths);
    return {
        years: Math.floor(wholeMonths / 12),
        months: wholeMonths % 12,
        days: calendarDaysBetween(anniversary, target)
    };
}


/* =========================
   NEXT BIRTHDAY
========================= */

function getNextBirthdayDays(birth, target) {
    const yearMonths = (target.getUTCFullYear() - birth.getUTCFullYear()) * 12;
    let next = addCalendarMonths(birth, yearMonths);
    if (next < target) next = addCalendarMonths(birth, yearMonths + 12);
    return calendarDaysBetween(target, next);
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


    if (!Number.isFinite(birth.getTime()) || !Number.isFinite(target.getTime())) {
        result.style.display = "none";
        alert("Please select valid calendar dates.");
        return;
    }

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


    const days = calendarDaysBetween(birth, target);


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
                    "long",
                timeZone: "UTC"
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