const businessName =
    document.getElementById("businessName");

const businessEmail =
    document.getElementById("businessEmail");

const businessAddress =
    document.getElementById("businessAddress");

const invoiceNumber =
    document.getElementById("invoiceNumber");

const invoiceDate =
    document.getElementById("invoiceDate");

const customerName =
    document.getElementById("customerName");

const customerEmail =
    document.getElementById("customerEmail");

const customerAddress =
    document.getElementById("customerAddress");

const gstRate =
    document.getElementById("gstRate");

const discountRate =
    document.getElementById("discountRate");

const notes =
    document.getElementById("notes");

const itemsContainer =
    document.getElementById("itemsContainer");

const addItemBtn =
    document.getElementById("addItemBtn");

const printBtn =
    document.getElementById("printBtn");

const resetBtn =
    document.getElementById("resetBtn");


const previewBusinessName =
    document.getElementById("previewBusinessName");

const previewBusinessEmail =
    document.getElementById("previewBusinessEmail");

const previewBusinessAddress =
    document.getElementById("previewBusinessAddress");

const previewInvoiceNumber =
    document.getElementById("previewInvoiceNumber");

const previewInvoiceDate =
    document.getElementById("previewInvoiceDate");

const previewFromName =
    document.getElementById("previewFromName");

const previewCustomerName =
    document.getElementById("previewCustomerName");

const previewCustomerEmail =
    document.getElementById("previewCustomerEmail");

const previewCustomerAddress =
    document.getElementById("previewCustomerAddress");

const previewItems =
    document.getElementById("previewItems");

const previewSubtotal =
    document.getElementById("previewSubtotal");

const previewDiscount =
    document.getElementById("previewDiscount");

const previewGST =
    document.getElementById("previewGST");

const previewTotal =
    document.getElementById("previewTotal");

const previewNotes =
    document.getElementById("previewNotes");


let items = [];


/* =========================
   CURRENCY
========================= */

function money(value) {
    if (!Number.isFinite(value) || value < 0) return "Invalid values";

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }
    ).format(value);

}


/* =========================
   DATE
========================= */

function setToday() {

    const today =
        new Date();

    const formatted = [
        String(today.getFullYear()).padStart(4, "0"),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    invoiceDate.value =
        formatted;

}


function readInvoiceNumber(input, maximum = Infinity) {
    const value = Number(input.value);
    const valid = !input.validity.badInput && Number.isFinite(value) && value >= 0 && value <= maximum;
    input.setCustomValidity(valid ? "" : maximum === 100
        ? "Enter a discount between 0 and 100 percent."
        : "Enter a finite number of zero or more.");
    input.setAttribute("aria-invalid", String(!valid));
    return valid ? value : NaN;
}

// Enforce the percentage bound without changing the form's layout.
discountRate.max = "100";

/* =========================
   ADD ITEM
========================= */

function addItem(
    name = "",
    qty = 1,
    rate = 0
) {

    items.push({
        name,
        qty,
        rate
    });

    renderItems();

}


/* =========================
   RENDER ITEM INPUTS
========================= */

function renderItems() {

    itemsContainer.innerHTML =
        "";


    items.forEach(
        function(item, index) {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "item-row";


            const nameInput =
                document.createElement(
                    "input"
                );

            nameInput.className =
                "item-name";

            nameInput.placeholder =
                "Item description";

            nameInput.value =
                item.name;


            const qtyInput =
                document.createElement(
                    "input"
                );

            qtyInput.type =
                "number";

            qtyInput.min =
                "0";

            qtyInput.step =
                "1";

            qtyInput.value =
                item.qty;


            const rateInput =
                document.createElement(
                    "input"
                );

            rateInput.type =
                "number";

            rateInput.min =
                "0";

            rateInput.step =
                "0.01";

            rateInput.value =
                item.rate;


            items[index].qty = readInvoiceNumber(qtyInput);
            items[index].rate = readInvoiceNumber(rateInput);

            const removeBtn =
                document.createElement(
                    "button"
                );

            removeBtn.type =
                "button";

            removeBtn.className =
                "remove-item-btn";

            removeBtn.textContent =
                "✕";


            nameInput.addEventListener(
                "input",
                function() {

                    items[index].name =
                        nameInput.value;

                    updatePreview();

                }
            );


            qtyInput.addEventListener(
                "input",
                function() {

                    items[index].qty =
                        readInvoiceNumber(qtyInput);

                    updatePreview();

                }
            );


            rateInput.addEventListener(
                "input",
                function() {

                    items[index].rate =
                        readInvoiceNumber(rateInput);

                    updatePreview();

                }
            );


            removeBtn.addEventListener(
                "click",
                function() {

                    if (
                        items.length === 1
                    ) {

                        alert(
                            "At least one item is required."
                        );

                        return;

                    }

                    items.splice(
                        index,
                        1
                    );

                    renderItems();

                }
            );


            row.appendChild(
                nameInput
            );

            row.appendChild(
                qtyInput
            );

            row.appendChild(
                rateInput
            );

            row.appendChild(
                removeBtn
            );


            itemsContainer.appendChild(
                row
            );

        }
    );


    updatePreview();

}


/* =========================
   UPDATE PREVIEW
========================= */

function updatePreview() {

    previewBusinessName.textContent =
        businessName.value.trim() ||
        "Your Business";


    previewFromName.textContent =
        businessName.value.trim() ||
        "Your Business";


    previewBusinessEmail.textContent =
        businessEmail.value.trim();


    previewBusinessAddress.textContent =
        businessAddress.value.trim();


    previewInvoiceNumber.textContent =
        invoiceNumber.value.trim() ||
        "-";


    previewInvoiceDate.textContent =
        invoiceDate.value ||
        "-";


    previewCustomerName.textContent =
        customerName.value.trim() ||
        "Customer Name";


    previewCustomerEmail.textContent =
        customerEmail.value.trim();


    previewCustomerAddress.textContent =
        customerAddress.value.trim();


    previewNotes.textContent =
        notes.value.trim() ||
        "Thank you for your business!";


    previewItems.innerHTML =
        "";


    let subtotal =
        0;


    items.forEach(
        function(item) {

            const amount =
                Number.isFinite(item.qty) && item.qty >= 0 &&
                Number.isFinite(item.rate) && item.rate >= 0
                    ? item.qty * item.rate : NaN;


            subtotal +=
                amount;


            const row =
                document.createElement(
                    "tr"
                );


            const nameCell =
                document.createElement(
                    "td"
                );

            nameCell.textContent =
                item.name ||
                "Item";


            const qtyCell =
                document.createElement(
                    "td"
                );

            qtyCell.className =
                "num";

            qtyCell.textContent =
                Number.isFinite(item.qty) && item.qty >= 0 ? item.qty : "Invalid";


            const rateCell =
                document.createElement(
                    "td"
                );

            rateCell.className =
                "num";

            rateCell.textContent =
                money(
                    item.rate
                );


            const amountCell =
                document.createElement(
                    "td"
                );

            amountCell.className =
                "num";

            amountCell.textContent =
                money(
                    amount
                );


            row.appendChild(
                nameCell
            );

            row.appendChild(
                qtyCell
            );

            row.appendChild(
                rateCell
            );

            row.appendChild(
                amountCell
            );


            previewItems.appendChild(
                row
            );

        }
    );


    const discountPercent = readInvoiceNumber(discountRate, 100);
    const gstPercent = readInvoiceNumber(gstRate);

    const discount =
        subtotal * (discountPercent / 100);


    const taxableAmount =
        subtotal -
        discount;


    const gst =
        taxableAmount * (gstPercent / 100);


    const total =
        taxableAmount +
        gst;


    previewSubtotal.textContent =
        money(
            subtotal
        );


    previewDiscount.textContent =
        money(
            discount
        );


    previewGST.textContent =
        money(
            gst
        );


    previewTotal.textContent =
        money(
            total
        );

    const valid = [subtotal, discount, gst, total].every(value => Number.isFinite(value) && value >= 0);
    if (!valid) {
        for (const field of [previewSubtotal, previewDiscount, previewGST, previewTotal]) {
            field.textContent = "Invalid values";
        }
    }
    return valid;
}


/* =========================
   RESET
========================= */

function resetInvoice() {

    businessName.value =
        "";

    businessEmail.value =
        "";

    businessAddress.value =
        "";

    invoiceNumber.value =
        "INV-001";

    customerName.value =
        "";

    customerEmail.value =
        "";

    customerAddress.value =
        "";

    gstRate.value =
        "18";

    discountRate.value =
        "0";

    notes.value =
        "Thank you for your business!";


    setToday();


    items =
        [
            {
                name: "Service",
                qty: 1,
                rate: 1000
            }
        ];


    renderItems();

}


/* =========================
   EVENTS
========================= */

[
    businessName,
    businessEmail,
    businessAddress,
    invoiceNumber,
    invoiceDate,
    customerName,
    customerEmail,
    customerAddress,
    gstRate,
    discountRate,
    notes
].forEach(
    function(element) {

        element.addEventListener(
            "input",
            updatePreview
        );

        element.addEventListener(
            "change",
            updatePreview
        );

    }
);


addItemBtn.addEventListener(
    "click",
    function() {

        addItem(
            "",
            1,
            0
        );

    }
);


printBtn.addEventListener(
    "click",
    function() {

        if (!updatePreview()) {
            const invalid = itemsContainer.querySelector("input:invalid") ||
                [discountRate, gstRate].find(input => !input.checkValidity());
            if (invalid) invalid.reportValidity();
            else alert("Invoice values exceed the supported numeric range. Please reduce the quantities or rates.");
            return;
        }
        window.print();

    }
);


resetBtn.addEventListener(
    "click",
    function() {

        const confirmed =
            confirm(
                "Reset the entire invoice?"
            );


        if (confirmed) {

            resetInvoice();

        }

    }
);


/* =========================
   INITIALIZE
========================= */

setToday();

notes.value =
    "Thank you for your business!";


items =
    [
        {
            name: "Service",
            qty: 1,
            rate: 1000
        }
    ];


renderItems();