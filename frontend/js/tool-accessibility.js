/* Progressive accessibility only. Existing tool calculations and exports are unchanged. */
(() => {
    "use strict";
    function initialise() {
        const main = document.querySelector("main");
        const status = document.getElementById("tool-accessibility-status");
        if (!main || !status) return;
        const tool = document.body.dataset.easytoolsTool;
        const byId = id => document.getElementById(id);
        const text = element => element?.textContent.replace(/\s+/g, " ").trim() || "";
        const visible = element => element && !element.hidden && element.getClientRects().length > 0;
        let timer;
        let previousPassword = byId("passwordOutput")?.value;
        let qrContent = "";
        let wasProcessing = false;

        function announce(message) {
            if (message && status.textContent !== message) status.textContent = message;
        }

        function repairGeneratedControls() {
            main.querySelectorAll("#itemsContainer .item-row").forEach((row, index) => {
                const inputs = row.querySelectorAll("input");
                ["Description", "Quantity", "Rate"].forEach((label, position) => {
                    inputs[position]?.setAttribute("aria-label", `${label} for item ${index + 1}`);
                });
                row.querySelector("button")?.setAttribute("aria-label", `Remove item ${index + 1}`);
            });
            main.querySelectorAll("#previewGrid img:not([alt])").forEach(img => {
                // The neighbouring filename already identifies this preview.
                img.alt = "";
            });
            main.querySelectorAll("#imageList .image-card").forEach((card, index) => {
                const img = card.querySelector("img");
                if (img) img.alt = `Selected image ${index + 1}`;
                card.querySelector(".remove-btn")?.setAttribute("aria-label", `Remove image ${index + 1}`);
            });
            main.querySelectorAll(".template-card, .compression-card, .mode-btn").forEach(control => {
                control.setAttribute("aria-pressed", String(control.classList.contains("active")));
            });
        }

        main.querySelectorAll(".template-card, .compression-card").forEach(control => {
            control.setAttribute("role", "button");
            control.tabIndex = 0;
            control.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (!event.repeat) control.click();
                }
            });
        });
        main.querySelectorAll(".template-options, .compression-options, .mode-tabs, .mode-switch").forEach(group => {
            group.setAttribute("role", "group");
            group.setAttribute("aria-label", group.classList.contains("template-options") ? "Resume template" :
                group.classList.contains("compression-options") ? "Compression level" : "Calculation mode");
        });
        main.querySelectorAll(".mode-btn[data-mode]").forEach(button => {
            button.setAttribute("aria-controls", button.dataset.mode);
        });

        function report() {
            repairGeneratedControls();
            const processing = byId("processing");
            if (visible(processing)) {
                wasProcessing = true;
                announce(text(processing));
                return;
            }
            if (tool === "password-generator") {
                const value = byId("passwordOutput")?.value;
                if (value && value !== previousPassword) {
                    previousPassword = value;
                    announce("A new password is ready in the Generated password field.");
                }
                return;
            }
            if (tool === "word-counter" || tool === "case-converter") {
                const words = text(byId("wordCount"));
                const characters = text(byId("characterCount"));
                announce(`${words} words. ${characters} characters.` + (tool === "word-counter" ?
                    ` ${text(byId("sentenceCount"))} sentences. ${text(byId("paragraphCount"))} paragraphs. Reading time: ${text(byId("readingTime"))}.` : ""));
                return;
            }
            if (tool === "unit-converter") {
                const to = byId("toUnit");
                announce(`Converted result: ${text(byId("resultValue"))} ${to?.selectedOptions[0]?.textContent || ""}.`);
                return;
            }
            if (tool === "invoice-generator") {
                announce(`Invoice total: ${text(byId("previewTotal"))}.`);
                return;
            }
            if (tool === "percentage-calculator") {
                const active = main.querySelector(".calculator-section.active .result-value");
                announce(`Result: ${text(active)}.`);
                return;
            }
            if (tool === "jpg-to-pdf") {
                if (visible(byId("status"))) announce(text(byId("status")));
                return;
            }
            if (tool === "resume-builder") {
                if (wasProcessing) announce("Resume generation finished. Check your downloads or any displayed error.");
                wasProcessing = false;
                return;
            }
            const result = byId("result");
            if (!visible(result)) return;
            if (tool === "qr-generator") {
                const alternative = byId("qr-accessible-content");
                const description = `Encoded content: ${qrContent}`;
                if (alternative && alternative.textContent !== description) alternative.textContent = description;
                announce("Your QR code is ready. Its encoded content is available alongside the image.");
            } else if (tool === "ai-rewriter") {
                announce("Rewritten text is ready. Review it in the result area before copying.");
            } else {
                announce(text(result).slice(0, 450));
            }
            wasProcessing = false;
        }
        function schedule(delay = 650) {
            clearTimeout(timer);
            timer = setTimeout(report, delay);
        }
        main.addEventListener("input", event => {
            if (!event.target.closest(".easytools-guide")) schedule();
        });
        main.addEventListener("change", () => schedule());
        const cropCanvas = byId("cropCanvas");
        if (cropCanvas) {
            const reportSelection = () => {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    const selection = byId("selectionInfo")?.value;
                    if (selection) announce(`Selected area: ${selection}.`);
                }, 400);
            };
            cropCanvas.addEventListener("keydown", event => {
                if (event.key.startsWith("Arrow")) reportSelection();
            });
            cropCanvas.addEventListener("pointerup", reportSelection);
        }
        main.addEventListener("click", event => {
            const control = event.target.closest("button, [role='button']");
            if (!control) return;
            if (tool === "qr-generator" && control.id === "generateBtn") qrContent = byId("qrText").value.trim();
            if (control.matches(".remove-item-btn, .remove-btn")) {
                // Existing rendering may replace the focused row; keep keyboard users in the list.
                setTimeout(() => {
                    if (!control.isConnected) {
                        (main.querySelector(".remove-item-btn, .remove-btn") || byId("addItemBtn") || byId("uploadArea"))?.focus();
                    }
                }, 0);
            }
            schedule();
        }, true);
        const observer = new MutationObserver(records => {
            const relevant = records.some(record => {
                const element = record.target.nodeType === Node.ELEMENT_NODE ? record.target : record.target.parentElement;
                return element && !element.closest(".easytools-guide, .easytools-sr-only, .easytools-privacy, #adModal, #adBox");
            });
            if (relevant) {
                repairGeneratedControls();
                schedule();
            }
        });
        observer.observe(main, { subtree: true, childList: true, characterData: true, attributes: true,
            attributeFilter: ["class", "style", "disabled"] });
        const copy = byId("copyBtn");
        if (copy) new MutationObserver(() => {
            if (/copied/i.test(text(copy))) announce("Copied to clipboard.");
        }).observe(copy, { childList: true, characterData: true, subtree: true });
        repairGeneratedControls();
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialise, { once: true });
    else initialise();
})();
