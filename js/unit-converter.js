const category =
    document.getElementById("category");

const inputValue =
    document.getElementById("inputValue");

const fromUnit =
    document.getElementById("fromUnit");

const toUnit =
    document.getElementById("toUnit");

const swapBtn =
    document.getElementById("swapBtn");

const resultValue =
    document.getElementById("resultValue");


const units = {

    length: {
        meter: 1,
        kilometer: 1000,
        centimeter: 0.01,
        millimeter: 0.001,
        inch: 0.0254,
        foot: 0.3048,
        yard: 0.9144,
        mile: 1609.344
    },

    weight: {
        kilogram: 1,
        gram: 0.001,
        milligram: 0.000001,
        pound: 0.45359237,
        ounce: 0.028349523125
    },

    speed: {
        "meter/second": 1,
        "kilometer/hour": 0.2777777778,
        "mile/hour": 0.44704
    },

    data: {
        byte: 1,
        kilobyte: 1024,
        megabyte: 1024 ** 2,
        gigabyte: 1024 ** 3,
        terabyte: 1024 ** 4
    }

};


function populateUnits() {

    fromUnit.innerHTML = "";
    toUnit.innerHTML = "";

    const type =
        category.value;


    let list;


    if (
        type === "temperature"
    ) {

        list = [
            "celsius",
            "fahrenheit",
            "kelvin"
        ];

    } else {

        list =
            Object.keys(
                units[type]
            );

    }


    list.forEach(
        function(unit) {

            const option1 =
                document.createElement(
                    "option"
                );

            option1.value =
                unit;

            option1.textContent =
                unit;


            const option2 =
                option1.cloneNode(
                    true
                );


            fromUnit.appendChild(
                option1
            );

            toUnit.appendChild(
                option2
            );

        }
    );


    if (
        toUnit.options.length > 1
    ) {

        toUnit.selectedIndex = 1;

    }


    convert();

}


function convertTemperature(
    value,
    from,
    to
) {

    let celsius;


    if (
        from === "celsius"
    ) {

        celsius = value;

    } else if (
        from === "fahrenheit"
    ) {

        celsius =
            (value - 32) *
            5 / 9;

    } else {

        celsius =
            value - 273.15;

    }


    if (
        to === "celsius"
    ) {

        return celsius;

    }


    if (
        to === "fahrenheit"
    ) {

        return (
            celsius *
            9 / 5
        ) + 32;

    }


    return celsius + 273.15;

}


function convert() {

    const value =
        Number(
            inputValue.value
        );


    if (
        !Number.isFinite(value)
    ) {

        resultValue.textContent =
            "0";

        return;

    }


    const type =
        category.value;


    let result;


    if (
        type ===
        "temperature"
    ) {

        result =
            convertTemperature(
                value,
                fromUnit.value,
                toUnit.value
            );

    } else {

        const base =
            value *
            units[type][
                fromUnit.value
            ];


        result =
            base /
            units[type][
                toUnit.value
            ];

    }


    resultValue.textContent =
        Number(
            result.toFixed(8)
        ).toLocaleString(
            "en-IN"
        );

}


category.addEventListener(
    "change",
    populateUnits
);


inputValue.addEventListener(
    "input",
    convert
);


fromUnit.addEventListener(
    "change",
    convert
);


toUnit.addEventListener(
    "change",
    convert
);


swapBtn.addEventListener(
    "click",
    function() {

        const temp =
            fromUnit.value;


        fromUnit.value =
            toUnit.value;


        toUnit.value =
            temp;


        convert();

    }
);


populateUnits();