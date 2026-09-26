/* Progressive enhancement for the shared header; links work without JavaScript. */
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".header").forEach((header, index) => {
        const nav = header.querySelector("nav");
        const logo = header.querySelector(".logo");
        if (!nav || !logo) return;
        const mobile = window.matchMedia("(max-width: 767px)");
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "mobile-nav-toggle";
        if (!nav.id) nav.id = "easytools-navigation-" + index;
        toggle.setAttribute("aria-controls", nav.id);
        toggle.innerHTML = '<span aria-hidden="true"><i></i><i></i><i></i></span>';
        logo.after(toggle);
        header.classList.add("has-mobile-nav");

        function setOpen(open, restoreFocus = false) {
            open = mobile.matches && open;
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
            header.classList.toggle("mobile-nav-open", open);
            nav.inert = mobile.matches && !open;
            if (restoreFocus) toggle.focus();
        }
        toggle.addEventListener("click", () => {
            setOpen(toggle.getAttribute("aria-expanded") !== "true");
        });
        header.addEventListener("keydown", event => {
            if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
                event.preventDefault();
                setOpen(false, true);
            }
        });
        nav.addEventListener("click", event => {
            if (mobile.matches && event.target.closest("a")) setOpen(false, true);
        });
        document.addEventListener("click", event => {
            if (!header.contains(event.target)) setOpen(false);
        });
        mobile.addEventListener("change", () => {
            const focusInNav = nav.contains(document.activeElement);
            const focusOnToggle = document.activeElement === toggle;
            setOpen(false, mobile.matches && focusInNav);
            if (!mobile.matches && focusOnToggle) nav.querySelector("a")?.focus();
        });
        setOpen(false);
    });
});

/* Shared safeguards for the existing browser tools. */
window.EasyTools = (() => {
    let busy = false;
    function checkFiles(files) {
        const list = Array.from(files);
        if (list.length > 100 || list.some(file => file.size > 25 * 1024 * 1024) ||
            list.reduce((sum, file) => sum + file.size, 0) > 100 * 1024 * 1024) {
            throw new Error("Use up to 100 files, 25 MB per file and 100 MB in total.");
        }
    }
    function checkPixels(width, height) {
        if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1 ||
            width > 8192 || height > 8192 || width * height > 16000000) {
            throw new Error("Image or page is too large. Use at most 16 megapixels and 8192 pixels per side.");
        }
        return width * height;
    }
    function createImageBudget() {
        let pixels = 0;
        let outputBytes = 0;
        return {
            reserveImage(width, height, outputWidth = width, outputHeight = height) {
                const cost = Math.max(checkPixels(width, height), checkPixels(outputWidth, outputHeight));
                if (pixels + cost > 64000000) {
                    throw new RangeError("This batch exceeds 64 megapixels. Please process fewer images at a time.");
                }
                pixels += cost;
            },
            reserveOutput(bytes) {
                if (!Number.isFinite(bytes) || bytes < 0 || outputBytes + bytes > 100 * 1024 * 1024) {
                    throw new RangeError("This batch exceeds 100 MB of output. Please process fewer images or reduce the output dimensions.");
                }
                outputBytes += bytes;
            }
        };
    }
    function checkPages(count) {
        if (count < 1 || count > 100) throw new Error("Please use a PDF with 1 to 100 pages.");
    }
    function beginJob(primaryButton) {
        if (busy) throw new Error("Please wait for the current operation to finish.");
        busy = true;
        const controls = Array.from(document.querySelectorAll("input, select, textarea, button"))
            .filter(control => !control.closest(".easytools-privacy"));
        const previous = controls.map(control => control.disabled);
        controls.forEach(control => { control.disabled = true; });
        return () => {
            busy = false;
            controls.forEach((control, index) => { control.disabled = previous[index]; });
            if (primaryButton) primaryButton.disabled = false;
        };
    }
    document.addEventListener("DOMContentLoaded", () => {
        // Keep the existing upload appearance while making it keyboard operable.
        document.querySelectorAll('input[type="file"]').forEach(input => {
            const trigger = document.querySelector('label[for="' + input.id + '"]') ||
                document.getElementById("uploadArea");
            if (!trigger) return;
            trigger.tabIndex = 0;
            trigger.setAttribute("role", "button");
            if (!trigger.getAttribute("aria-label")) trigger.setAttribute("aria-label", "Choose files to upload");
            trigger.addEventListener("keydown", event => {
                if ((event.key === "Enter" || event.key === " ") && !busy) {
                    event.preventDefault();
                    input.click();
                }
            });
        });
    });
    for (const type of ["click", "drop", "change", "input"]) {
        document.addEventListener(type, event => {
            if (event.target.closest?.(".easytools-privacy")) return;
            if (busy && (type !== "click" || event.target.closest("button, input, select, textarea, label, .upload-area, .template-card"))) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return;
            }
            const files = type === "drop" ? event.dataTransfer?.files :
                type === "change" && event.target.type === "file" ? event.target.files : null;
            if (files) {
                try { checkFiles(files); }
                catch (error) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    if (event.target.type === "file") event.target.value = "";
                    alert(error.message);
                }
            }
        }, true);
    }
    async function copyText(text) {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                return;
            }
        } catch { /* Try the local fallback when clipboard permission is unavailable. */ }
        const previousFocus = document.activeElement;
        const selection = document.getSelection?.();
        const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange()) : [];
        const fieldSelection = previousFocus && typeof previousFocus.selectionStart === "number"
            ? [previousFocus.selectionStart, previousFocus.selectionEnd, previousFocus.selectionDirection] : null;
        const temporary = document.createElement("textarea");
        temporary.value = text;
        temporary.readOnly = true;
        temporary.tabIndex = -1;
        temporary.style.position = "fixed";
        temporary.style.opacity = "0";
        try {
            document.body.appendChild(temporary);
            temporary.select();
            if (!document.execCommand?.("copy")) throw new Error("Copy was not permitted.");
        } finally {
            temporary.value = "";
            temporary.remove();
            previousFocus?.focus?.({ preventScroll: true });
            if (selection) {
                selection.removeAllRanges();
                for (const range of ranges) selection.addRange(range);
            }
            if (fieldSelection) previousFocus.setSelectionRange(...fieldSelection);
        }
    }
    function countWords(text) {
        if (typeof Intl.Segmenter === "function") {
            return Array.from(new Intl.Segmenter(undefined, { granularity: "word" }).segment(text))
                .filter(part => part.isWordLike).length;
        }
        return (text.match(/[\p{L}\p{N}]+(?:['\u2019][\p{L}\p{N}]+)*/gu) || []).length;
    }
    function countCharacters(text) {
        return typeof Intl.Segmenter === "function"
            ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)).length
            : Array.from(text).length;
    }
    return { checkFiles, checkPixels, checkPages, beginJob, createImageBudget, copyText, countWords, countCharacters };
})();

/* Basic consent: no Analytics request before an affirmative choice.
 * This is not a certified advertising CMP. AdSense markers stay inert until
 * the owner's certified CMP integration is supplied and verified separately.
 */
(() => {
    const marker = document.querySelector('script[data-easytools-consent="analytics"]');
    if (!marker) return;
    const match = /^https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=(G-[A-Z0-9]+)$/.exec(marker.dataset.src || "");
    if (!match) return;
    const measurementId = match[1];
    const directory = window.location.pathname.slice(0, window.location.pathname.lastIndexOf("/") + 1);
    const storageKey = "EasyTools.analyticsConsent.v1:" + directory;
    const lifetime = 180 * 24 * 60 * 60 * 1000;
    let choice = null;
    let scriptElement = null;
    let scriptReady = false;
    let configured = false;
    let panel, settingsButton, status;
    window["ga-disable-" + measurementId] = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
        analytics_storage: "denied", ad_storage: "denied",
        ad_user_data: "denied", ad_personalization: "denied"
    });
    function parseChoice(value) {
        try {
            const parsed = JSON.parse(value);
            const now = Date.now();
            return parsed?.version === 1 && typeof parsed.analytics === "boolean" &&
                Number.isFinite(parsed.expires) && parsed.expires > now &&
                parsed.expires <= now + lifetime + 60000 ? parsed : null;
        } catch { return null; }
    }
    function readChoice() {
        try { return parseChoice(window.localStorage.getItem(storageKey)); }
        catch { return null; }
    }
    function clearAnalyticsCookies() {
        // Clear only this property's GA cookies, including cookies from the old setup.
        try {
            const names = document.cookie.split(";").map(value => value.trim().split("=")[0])
                .filter(name => name === "_ga" || name === "_ga_" + measurementId.slice(2));
            const paths = new Set(["/", directory, directory.replace(/\/$/, "") || "/"]);
            const domains = ["", window.location.hostname, "." + window.location.hostname];
            for (const name of names) for (const path of paths) for (const domain of domains) {
                document.cookie = name + "=; Max-Age=0; path=" + path +
                    (domain ? "; domain=" + domain : "") + "; SameSite=Lax";
            }
        } catch { /* Disabled browser storage must not interrupt the tools. */ }
    }
    function configureAnalytics() {
        if (!choice?.analytics || !scriptReady || configured) return;
        window.gtag("js", new Date());
        window.gtag("config", measurementId, {
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            cookie_expires: lifetime / 1000
        });
        configured = true;
    }
    function applyChoice(next) {
        choice = next;
        const allowed = choice?.analytics === true;
        window["ga-disable-" + measurementId] = !allowed;
        window.gtag("consent", "update", { analytics_storage: allowed ? "granted" : "denied" });
        if (!allowed) {
            clearAnalyticsCookies();
        } else if (!scriptElement) {
            scriptElement = document.createElement("script");
            scriptElement.async = true;
            scriptElement.src = marker.dataset.src;
            scriptElement.onload = () => { scriptReady = true; configureAnalytics(); };
            scriptElement.onerror = () => {
                scriptElement.remove();
                scriptElement = null;
                scriptReady = false;
                if (status) status.textContent = "Analytics could not load. Your tools still work.";
            };
            document.head.appendChild(scriptElement);
        } else {
            configureAnalytics();
        }
        if (panel) {
            panel.hidden = choice !== null;
            settingsButton.setAttribute("aria-expanded", String(!panel.hidden));
        }
    }
    function choose(analytics) {
        const next = { version: 1, analytics, expires: Date.now() + lifetime };
        let saved = true;
        try { window.localStorage.setItem(storageKey, JSON.stringify(next)); }
        catch { saved = false; }
        applyChoice(next);
        status.textContent = (analytics ? "Analytics allowed." : "Analytics declined.") +
            (saved ? " You can change this in Privacy settings." : " This choice applies to this page; browser storage is unavailable.");
        settingsButton.focus();
    }
    applyChoice(readChoice());
    document.addEventListener("DOMContentLoaded", () => {
        const container = document.createElement("section");
        container.className = "easytools-privacy";
        panel = document.createElement("div");
        panel.id = "easytools-privacy-panel";
        panel.tabIndex = -1;
        panel.setAttribute("role", "region");
        panel.setAttribute("aria-labelledby", "easytools-privacy-title");
        const title = document.createElement("h2");
        title.id = "easytools-privacy-title";
        title.textContent = "Analytics preferences";
        const description = document.createElement("p");
        description.textContent = "Allow Google Analytics cookies to help us understand page usage? Tools work with either choice. Advertising permission is separate. ";
        const policyLink = document.createElement("a");
        policyLink.href = "privacy.html";
        policyLink.textContent = "Privacy policy";
        description.appendChild(policyLink);
        const actions = document.createElement("div");
        actions.className = "easytools-privacy-actions";
        for (const [label, allowed] of [["Allow analytics", true], ["Decline analytics", false]]) {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = label;
            button.addEventListener("click", () => choose(allowed));
            actions.appendChild(button);
        }
        panel.append(title, description, actions);
        settingsButton = document.createElement("button");
        settingsButton.type = "button";
        settingsButton.textContent = "Privacy settings";
        settingsButton.setAttribute("aria-controls", panel.id);
        settingsButton.addEventListener("click", () => {
            panel.hidden = false;
            settingsButton.setAttribute("aria-expanded", "true");
            panel.focus();
        });
        status = document.createElement("p");
        status.setAttribute("role", "status");
        container.append(panel, settingsButton, status);
        const header = document.querySelector("body > header");
        if (header) header.insertAdjacentElement("afterend", container);
        else document.body.prepend(container);
        panel.hidden = choice !== null;
        settingsButton.setAttribute("aria-expanded", String(!panel.hidden));
    });
    window.addEventListener("storage", event => {
        if (event.key !== storageKey && event.key !== null) return;
        applyChoice(parseChoice(event.newValue));
        if (status) status.textContent = "Privacy preferences updated from another tab.";
    });
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden && choice && choice.expires <= Date.now()) applyChoice(null);
    });
})();
