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
    // Tool use never depends on viewing or interacting with an advertisement.
    return generatePDF();
}


/* ==========================================
   GENERATE PDF
========================================== */

async function generatePDF() {
    const releaseJob = EasyTools.beginJob(generateBtn);
    processing.style.display = "block";
    try {
        updatePreview();
        const text = node => node.textContent.trim();
        const content = [previewName, previewJob, previewContact, previewSummary,
            previewPosition, previewCompany, previewExperience, previewDegree, previewCollege];
        const skillText = skills.value.trim() || "Your Skills";
        // Browser PDF printing preserves scripts unsupported by the built-in PDF font.
        if ([...content.map(text), skillText].some(value => /[^\x20-\x7e\xa0-\xff\n\r\t\u2022\u2013\u2014\u2018\u2019\u201c\u201d]/.test(value))) {
            processing.style.display = "none";
            alert("Choose Save as PDF in the print dialog to preserve all characters in your resume.");
            window.print();
            return;
        }
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("p", "mm", "a4");
        pdf.setProperties({ title: text(previewName) + " - Resume", subject: "Professional resume" });
        const modern = resumePreview.classList.contains("template-modern");
        const margin = modern ? 12 : 15;
        const width = 210 - margin * 2;
        const bottom = 282;
        let y = 16;
        let pages = 1;
        function room(height) {
            if (y + height > bottom) {
                if (++pages > 100) throw new Error("Resume exceeds 100 pages.");
                pdf.addPage();
                y = 16;
            }
        }
        function lines(value, size, bold = false, color = "#374151") {
            pdf.setFont("helvetica", bold ? "bold" : "normal");
            pdf.setFontSize(size);
            pdf.setTextColor(color);
            const rows = pdf.splitTextToSize(value || " ", width);
            const height = size * 0.352778 * 1.5;
            for (const row of rows) {
                room(height);
                pdf.text(row, margin, y);
                y += height;
            }
        }
        const name = text(previewName);
        if (modern) {
            // Size the header from wrapped text rather than the current browser viewport.
            pdf.setFont("helvetica", "bold"); pdf.setFontSize(24);
            const nameRows = pdf.splitTextToSize(name, width);
            pdf.setFont("helvetica", "normal"); pdf.setFontSize(12);
            const jobRows = pdf.splitTextToSize(text(previewJob), width);
            pdf.setFontSize(9);
            const contactRows = pdf.splitTextToSize(text(previewContact), width);
            const headerHeight = 20 + nameRows.length * 12.7 + jobRows.length * 6.35 + contactRows.length * 4.7625;
            // Very long header fields are paginated as normal text.
            if (headerHeight <= 100) {
                pdf.setFillColor("#1e3a8a"); pdf.rect(0, 0, 210, headerHeight, "F");
                lines(name, 24, true, "#ffffff");
                lines(text(previewJob), 12, false, "#ffffff");
                y += 3;
                lines(text(previewContact), 9, false, "#ffffff");
                y = headerHeight + 12;
            } else {
                lines(name, 24, true, "#1e3a8a");
                lines(text(previewJob), 12);
                lines(text(previewContact), 9);
                y += 10;
            }
        } else {
            lines(name, 24, true, "#111827");
            lines(text(previewJob), 12);
            lines(text(previewContact), 9);
            y += 3;
            room(8);
            pdf.setDrawColor("#111827"); pdf.line(margin, y, 210 - margin, y);
            y += 10;
        }
        function section(title, entries) {
            room(28);
            lines(title.toUpperCase(), 11, true, modern ? "#1e3a8a" : "#111827");
            if (modern) {
                pdf.setDrawColor("#dbeafe"); pdf.line(margin, y - 2, 210 - margin, y - 2);
            }
            y += 3;
            for (const [value, size, bold] of entries) lines(value, size, bold);
            y += 8;
        }
        section("Professional Summary", [[text(previewSummary), 10, false]]);
        section("Experience", [[text(previewPosition), 11, true], [text(previewCompany), 9, false], [text(previewExperience), 10, false]]);
        section("Education", [[text(previewDegree), 11, true], [text(previewCollege), 9, false]]);
        section("Skills", [[skillText, 10, false]]);
        const fileName = fullName.value.trim().replace(/[^a-z0-9]/gi, "-").toLowerCase();
        pdf.save((fileName || "resume") + "-easytools.pdf");
    } catch (error) {
        console.error(error);
        alert("Resume PDF could not be generated. Please try again.");
    } finally {
        processing.style.display = "none";
        releaseJob();
    }
}


/* ==========================================
   INITIAL PREVIEW
========================================== */

updatePreview();