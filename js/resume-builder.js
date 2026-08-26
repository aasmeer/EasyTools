/* ==========================================
   EASYTOOLS RESUME BUILDER
========================================== */


const fullName =
    document.getElementById("fullName");

const jobTitle =
    document.getElementById("jobTitle");

const email =
    document.getElementById("email");

const phone =
    document.getElementById("phone");

const locationInput =
    document.getElementById("location");

const website =
    document.getElementById("website");

const summary =
    document.getElementById("summary");

const degree =
    document.getElementById("degree");

const college =
    document.getElementById("college");

const educationYear =
    document.getElementById("educationYear");

const position =
    document.getElementById("position");

const company =
    document.getElementById("company");

const experienceYear =
    document.getElementById("experienceYear");

const experience =
    document.getElementById("experience");

const skills =
    document.getElementById("skills");


const resumePreview =
    document.getElementById("resumePreview");

const previewName =
    document.getElementById("previewName");

const previewJob =
    document.getElementById("previewJob");

const previewContact =
    document.getElementById("previewContact");

const previewSummary =
    document.getElementById("previewSummary");

const previewPosition =
    document.getElementById("previewPosition");

const previewCompany =
    document.getElementById("previewCompany");

const previewExperience =
    document.getElementById("previewExperience");

const previewDegree =
    document.getElementById("previewDegree");

const previewCollege =
    document.getElementById("previewCollege");

const previewSkills =
    document.getElementById("previewSkills");


const templateCards =
    document.querySelectorAll(
        ".template-card"
    );


const generateBtn =
    document.getElementById(
        "generateBtn"
    );

const processing =
    document.getElementById(
        "processing"
    );

const adModal =
    document.getElementById(
        "adModal"
    );

const countdown =
    document.getElementById(
        "countdown"
    );


/* ==========================================
   SAFE TEXT
========================================== */

function valueOrDefault(
    value,
    defaultValue
) {

    const clean =
        value.trim();

    return clean
        ? clean
        : defaultValue;

}


/* ==========================================
   LIVE PREVIEW
========================================== */

function updatePreview() {

    previewName.textContent =
        valueOrDefault(
            fullName.value,
            "Your Name"
        );


    previewJob.textContent =
        valueOrDefault(
            jobTitle.value,
            "Job Title"
        );


    /* CONTACT */

    const contactParts = [];


    if (email.value.trim()) {

        contactParts.push(
            email.value.trim()
        );

    }


    if (phone.value.trim()) {

        contactParts.push(
            phone.value.trim()
        );

    }


    if (locationInput.value.trim()) {

        contactParts.push(
            locationInput.value.trim()
        );

    }


    if (website.value.trim()) {

        contactParts.push(
            website.value.trim()
        );

    }


    previewContact.textContent =
        contactParts.length
            ? contactParts.join(" • ")
            : "Email • Phone • Location";


    /* SUMMARY */

    previewSummary.textContent =
        valueOrDefault(
            summary.value,
            "Your professional summary will appear here."
        );


    /* EXPERIENCE */

    previewPosition.textContent =
        valueOrDefault(
            position.value,
            "Position"
        );


    const companyParts = [];


    if (company.value.trim()) {

        companyParts.push(
            company.value.trim()
        );

    }


    if (experienceYear.value.trim()) {

        companyParts.push(
            experienceYear.value.trim()
        );

    }


    previewCompany.textContent =
        companyParts.length
            ? companyParts.join(" • ")
            : "Company • Duration";


    previewExperience.textContent =
        valueOrDefault(
            experience.value,
            "Your work experience will appear here."
        );


    /* EDUCATION */

    previewDegree.textContent =
        valueOrDefault(
            degree.value,
            "Degree"
        );


    const collegeParts = [];


    if (college.value.trim()) {

        collegeParts.push(
            college.value.trim()
        );

    }


    if (educationYear.value.trim()) {

        collegeParts.push(
            educationYear.value.trim()
        );

    }


    previewCollege.textContent =
        collegeParts.length
            ? collegeParts.join(" • ")
            : "College • Year";


    /* SKILLS */

    updateSkills();

}


/* ==========================================
   SKILLS
========================================== */

function updateSkills() {

    previewSkills.innerHTML =
        "";


    const skillList =
        skills.value
            .split(",")
            .map(
                function(skill) {

                    return skill.trim();

                }
            )
            .filter(Boolean);


    if (!skillList.length) {

        const span =
            document.createElement(
                "span"
            );


        span.className =
            "skill";


        span.textContent =
            "Your Skills";


        previewSkills.appendChild(
            span
        );


        return;

    }


    skillList.forEach(
        function(skill) {

            const span =
                document.createElement(
                    "span"
                );


            span.className =
                "skill";


            span.textContent =
                skill;


            previewSkills.appendChild(
                span
            );

        }
    );

}


/* ==========================================
   INPUT LISTENERS
========================================== */

const inputs = [

    fullName,
    jobTitle,
    email,
    phone,
    locationInput,
    website,
    summary,
    degree,
    college,
    educationYear,
    position,
    company,
    experienceYear,
    experience,
    skills

];


inputs.forEach(
    function(input) {

        input.addEventListener(
            "input",
            updatePreview
        );

    }
);


/* ==========================================
   TEMPLATE SWITCHER
========================================== */

templateCards.forEach(
    function(card) {

        card.addEventListener(
            "click",
            function() {

                templateCards.forEach(
                    function(item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                card.classList.add(
                    "active"
                );


                const template =
                    card.dataset.template;


                if (
                    template === "clean"
                ) {

                    resumePreview.className =
                        "resume-preview template-clean";

                } else {

                    resumePreview.className =
                        "resume-preview template-modern";

                }

            }
        );

    }
);


/* ==========================================
   GENERATE BUTTON
========================================== */

generateBtn.addEventListener(
    "click",
    function() {

        if (
            !fullName.value.trim()
        ) {

            alert(
                "Please enter your full name."
            );


            fullName.focus();

            return;

        }


        generateBtn.disabled =
            true;


        showAdvertisement();

    }
);


/* ==========================================
   DEMO AD
========================================== */

function showAdvertisement() {

    adModal.style.display =
        "flex";


    let seconds = 5;


    countdown.textContent =
        seconds;


    const timer =
        setInterval(
            function() {

                seconds--;


                countdown.textContent =
                    seconds;


                if (
                    seconds <= 0
                ) {

                    clearInterval(
                        timer
                    );


                    adModal.style.display =
                        "none";


                    generatePDF();

                }

            },
            1000
        );

}


/* ==========================================
   GENERATE PDF
========================================== */

async function generatePDF() {

    processing.style.display =
        "block";


    try {

        /*
            Capture the resume preview
            as high-resolution image.
        */

        const canvas =
            await html2canvas(
                resumePreview,
                {

                    scale: 2,

                    useCORS: true,

                    backgroundColor:
                        "#ffffff"

                }
            );


        const imageData =
            canvas.toDataURL(
                "image/jpeg",
                0.95
            );


        const {
            jsPDF
        } = window.jspdf;


        const pdf =
            new jsPDF(
                "p",
                "mm",
                "a4"
            );


        const pdfWidth =
            pdf.internal
                .pageSize
                .getWidth();


        const pdfHeight =
            pdf.internal
                .pageSize
                .getHeight();


        const imageWidth =
            pdfWidth;


        const imageHeight =
            canvas.height *
            imageWidth /
            canvas.width;


        /*
            Multi-page handling.
        */

        let heightLeft =
            imageHeight;


        let positionY =
            0;


        pdf.addImage(
            imageData,
            "JPEG",
            0,
            positionY,
            imageWidth,
            imageHeight
        );


        heightLeft -=
            pdfHeight;


        while (
            heightLeft > 0
        ) {

            positionY =
                heightLeft -
                imageHeight;


            pdf.addPage();


            pdf.addImage(
                imageData,
                "JPEG",
                0,
                positionY,
                imageWidth,
                imageHeight
            );


            heightLeft -=
                pdfHeight;

        }


        /*
            File name
        */

        const fileName =
            fullName.value
                .trim()
                .replace(
                    /[^a-z0-9]/gi,
                    "-"
                )
                .toLowerCase();


        pdf.save(
            (
                fileName ||
                "resume"
            ) +
            "-easytools.pdf"
        );


        processing.style.display =
            "none";


        generateBtn.disabled =
            false;


    } catch(error) {

        console.error(
            error
        );


        processing.style.display =
            "none";


        generateBtn.disabled =
            false;


        alert(
            "Resume PDF could not be generated. Please try again."
        );

    }

}


/* ==========================================
   INITIAL PREVIEW
========================================== */

updatePreview();