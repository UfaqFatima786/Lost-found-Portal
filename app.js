

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {

        mobileMenu.classList.toggle("show");

        const icon = menuBtn.querySelector("i");

        if (icon) {
            if (mobileMenu.classList.contains("show")) {
                icon.classList.remove("bi-list");
                icon.classList.add("bi-x-lg");
            } else {
                icon.classList.remove("bi-x-lg");
                icon.classList.add("bi-list");
            }
        }
    });
}

const lostCount = document.getElementById("lostCount");
const foundCount = document.getElementById("foundCount");
const recoveredCount = document.getElementById("recoveredCount");
const totalCount = document.getElementById("totalCount");

const lostItemsContainer =
    document.getElementById("lostItemsContainer");

const foundItemsContainer =
    document.getElementById("foundItemsContainer");

const resolvedItemsContainer =
    document.getElementById("resolvedItemsContainer");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const typeFilter =
    document.getElementById("typeFilter");

const searchBtn =
    document.getElementById("searchBtn");

let allReports = [];

function getReportType(report) {

    const rawType =
        report.type ??
        report.report_type ??
        report.status_type ??
        report.item_type ??
        report.kind ??
        "";

    const type = String(rawType)
        .toLowerCase()
        .trim();

    if (type.includes("lost")) {
        return "lost";
    }

    if (type.includes("found")) {
        return "found";
    }

    return "";
}


// ==========================================
// GET STATUS
// ==========================================

function getReportStatus(report) {

    return String(
        report.status ?? ""
    )
        .toLowerCase()
        .trim();
}


// ==========================================
// CHECK RESOLVED
// ==========================================

function isResolved(report) {

    const status = getReportStatus(report);

    return (
        status === "resolved" ||
        status === "recovered" ||
        status === "complete" ||
        status === "completed"
    );
}


// ==========================================
// LOAD REPORTS FROM SUPABASE
// ==========================================

async function loadReports() {

    console.log("=================================");
    console.log("Loading reports from Supabase...");
    console.log("=================================");

    try {

        // Make sure supabaseClient exists
        if (
            typeof supabaseClient === "undefined" ||
            !supabaseClient
        ) {

            console.error(
                "supabaseClient is not available."
            );

            showDatabaseError();

            return;
        }


        const {
            data,
            error
        } = await supabaseClient
            .from("lost and found")
            .select("*")
            .order("id", {
                ascending: false
            });


        // ==================================
        // SUPABASE ERROR
        // ==================================

        if (error) {

            console.error(
                "SUPABASE ERROR:",
                error
            );

            showDatabaseError();

            return;
        }


        // ==================================
        // DATA RECEIVED
        // ==================================

        allReports = data || [];

        console.log(
            "TOTAL REPORTS:",
            allReports.length
        );

        console.log(
            "REPORT DATA:",
            allReports
        );


        // ==================================
        // UPDATE COUNTS
        // ==================================

        updateStats(allReports);


        // ==================================
        // DISPLAY REPORTS
        // ==================================

        displayItems(allReports);

    }

    catch (error) {

        console.error(
            "LOAD REPORTS ERROR:",
            error
        );

        showDatabaseError();
    }
}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStats(reports) {

    const total =
        reports.length;


    // ==================================
    // LOST
    // ==================================

    const lost =
        reports.filter(report => {

            return (
                getReportType(report) === "lost" &&
                !isResolved(report)
            );

        }).length;


    // ==================================
    // FOUND
    // ==================================

    const found =
        reports.filter(report => {

            return (
                getReportType(report) === "found" &&
                !isResolved(report)
            );

        }).length;


    // ==================================
    // RESOLVED
    // ==================================

    const recovered =
        reports.filter(report => {

            return isResolved(report);

        }).length;


    // ==================================
    // UPDATE UI
    // ==================================

    if (lostCount) {
        lostCount.textContent = lost;
    }

    if (foundCount) {
        foundCount.textContent = found;
    }

    if (recoveredCount) {
        recoveredCount.textContent = recovered;
    }

    if (totalCount) {
        totalCount.textContent = total;
    }


    console.log(
        "STATISTICS:",
        {
            total: total,
            lost: lost,
            found: found,
            recovered: recovered
        }
    );
}


// ==========================================
// DISPLAY ITEMS
// ==========================================

function displayItems(reports) {

    if (
        !lostItemsContainer &&
        !foundItemsContainer &&
        !resolvedItemsContainer
    ) {

        console.error(
            "Report containers not found."
        );

        return;
    }


    // ==================================
    // LOST REPORTS
    // ==================================

    const lostReports =
        reports.filter(report => {

            return (
                getReportType(report) === "lost" &&
                !isResolved(report)
            );

        });


    // ==================================
    // FOUND REPORTS
    // ==================================

    const foundReports =
        reports.filter(report => {

            return (
                getReportType(report) === "found" &&
                !isResolved(report)
            );

        });


    // ==================================
    // RESOLVED REPORTS
    // ==================================

    const resolvedReports =
        reports.filter(report => {

            return isResolved(report);

        });


    console.log(
        "LOST REPORTS:",
        lostReports
    );

    console.log(
        "FOUND REPORTS:",
        foundReports
    );

    console.log(
        "RESOLVED REPORTS:",
        resolvedReports
    );


    // ==================================
    // LOST UI
    // ==================================

    if (lostItemsContainer) {

        if (lostReports.length === 0) {

            lostItemsContainer.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        <i class="bi bi-search"></i>
                    </div>

                    <h3>No lost items yet</h3>

                    <p>
                        Be the first person to report a lost item.
                    </p>

                    <a
                        href="report.html?type=lost"
                        class="empty-btn"
                    >
                        Report Lost Item
                    </a>

                </div>
            `;

        } else {

            lostItemsContainer.innerHTML =
                lostReports
                    .map(report =>
                        createItemCard(report)
                    )
                    .join("");
        }
    }


    // ==================================
    // FOUND UI
    // ==================================

    if (foundItemsContainer) {

        if (foundReports.length === 0) {

            foundItemsContainer.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon found-empty">
                        <i class="bi bi-box-seam"></i>
                    </div>

                    <h3>No found items yet</h3>

                    <p>
                        Found something?
                        Help return it to its owner.
                    </p>

                    <a
                        href="report.html?type=found"
                        class="empty-btn found-btn"
                    >
                        Report Found Item
                    </a>

                </div>
            `;

        } else {

            foundItemsContainer.innerHTML =
                foundReports
                    .map(report =>
                        createItemCard(report)
                    )
                    .join("");
        }
    }


    // ==================================
    // RESOLVED UI
    // ==================================

    if (resolvedItemsContainer) {

        if (resolvedReports.length === 0) {

            resolvedItemsContainer.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        <i class="bi bi-heart-fill"></i>
                    </div>

                    <h3>No resolved items yet</h3>

                    <p>
                        Recovered items will appear here.
                    </p>

                </div>
            `;

        } else {

            resolvedItemsContainer.innerHTML =
                resolvedReports
                    .map(report =>
                        createItemCard(report)
                    )
                    .join("");
        }
    }
}


// ==========================================
// CREATE ITEM CARD
// ==========================================

function createItemCard(report) {

    // ==================================
    // TITLE
    // ==================================

    const title =
        report.title ||
        report.item ||
        report.item_name ||
        "Unknown Item";


    // ==================================
    // CATEGORY
    // ==================================

    const category =
        report.category ||
        "Other";


    // ==================================
    // LOCATION
    // ==================================

    const location =
        report.location ||
        "Location not specified";


    // ==================================
    // DESCRIPTION
    // ==================================

    const description =
        report.description ||
        "No description available.";


    // ==================================
    // IMAGE
    // ==================================
    // Your actual column:
    // img-url
    // ==================================

    const image =
        report["img-url"] ||
        report.imgurl ||
        report.image_url ||
        report.image ||
        "";


    // ==================================
    // TYPE
    // ==================================

    const type =
        getReportType(report);


    // ==================================
    // RESOLVED
    // ==================================

    const resolved =
        isResolved(report);


    // ==================================
    // IMAGE HTML
    // ==================================

    let imageHTML = "";


    if (image) {

        imageHTML = `
            <div class="item-image">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(title)}"
                    onerror="
                        this.parentElement.classList.add('no-image');
                        this.style.display='none';
                    "
                >

            </div>
        `;

    } else {

        imageHTML = `
            <div class="item-image no-image">

                <i class="bi bi-image"></i>

            </div>
        `;
    }


    // ==================================
    // BADGE
    // ==================================

    let badgeHTML = "";


    if (resolved) {

        badgeHTML = `
            <span class="item-badge resolved-badge">

                <i class="bi bi-heart-fill"></i>

                Recovered

            </span>
        `;

    }

    else if (type === "lost") {

        badgeHTML = `
            <span class="item-badge lost-badge">

                <i class="bi bi-search"></i>

                Lost

            </span>
        `;

    }

    else if (type === "found") {

        badgeHTML = `
            <span class="item-badge found-badge">

                <i class="bi bi-check-circle"></i>

                Found

            </span>
        `;
    }


    // ==================================
    // CARD
    // ==================================

    return `
        <div class="item-card">

            ${imageHTML}

            <div class="item-card-content">

                <div class="item-card-top">

                    <h3>
                        ${escapeHTML(title)}
                    </h3>

                    ${badgeHTML}

                </div>


                <div class="item-meta">

                    <span>

                        <i class="bi bi-tag"></i>

                        ${escapeHTML(category)}

                    </span>


                    <span>

                        <i class="bi bi-geo-alt"></i>

                        ${escapeHTML(location)}

                    </span>

                </div>


                <p class="item-description">

                    ${escapeHTML(description)}

                </p>


                <div class="item-footer">

                    ${
                        resolved

                        ? `
                            <span class="recovered-label">

                                <i class="bi bi-heart-fill"></i>

                                Successfully Recovered

                            </span>
                        `

                        : `
                            <span>

                                <i class="bi bi-info-circle"></i>

                                ${
                                    type === "lost"

                                    ? "Looking for this item"

                                    : "Item has been found"
                                }

                            </span>
                        `
                    }

                </div>

            </div>

        </div>
    `;
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


// ==========================================
// SEARCH / FILTER
// ==========================================

function filterReports() {

    const searchValue =
        (searchInput?.value || "")
            .toLowerCase()
            .trim();


    const categoryValue =
        (categoryFilter?.value || "all")
            .toLowerCase()
            .trim();


    const typeValue =
        (typeFilter?.value || "all")
            .toLowerCase()
            .trim();


    const filteredReports =
        allReports.filter(report => {


            // ==============================
            // SEARCH DATA
            // ==============================

            const title =
                String(
                    report.title ||
                    report.item ||
                    report.item_name ||
                    ""
                )
                    .toLowerCase();


            const category =
                String(
                    report.category || ""
                )
                    .toLowerCase();


            const location =
                String(
                    report.location || ""
                )
                    .toLowerCase();


            const description =
                String(
                    report.description || ""
                )
                    .toLowerCase();


            // ==============================
            // SEARCH MATCH
            // ==============================

            const matchesSearch =
                !searchValue ||

                title.includes(searchValue) ||

                category.includes(searchValue) ||

                location.includes(searchValue) ||

                description.includes(searchValue);


            // ==============================
            // CATEGORY MATCH
            // ==============================

            const reportCategory =
                String(
                    report.category || ""
                )
                    .toLowerCase()
                    .trim();


            const matchesCategory =
                categoryValue === "all" ||

                reportCategory.includes(
                    categoryValue
                );


            // ==============================
            // TYPE MATCH
            // ==============================

            const reportType =
                getReportType(report);


            const matchesType =
                typeValue === "all" ||

                reportType === typeValue;


            return (
                matchesSearch &&
                matchesCategory &&
                matchesType
            );

        });


    displayItems(filteredReports);
}


// ==========================================
// SEARCH BUTTON
// ==========================================

if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        filterReports
    );
}


// ==========================================
// SEARCH ENTER
// ==========================================

if (searchInput) {

    searchInput.addEventListener(
        "keyup",
        event => {

            if (event.key === "Enter") {

                filterReports();

            }

        }
    );
}


// ==========================================
// CATEGORY FILTER
// ==========================================

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        filterReports
    );
}


// ==========================================
// TYPE FILTER
// ==========================================

if (typeFilter) {

    typeFilter.addEventListener(
        "change",
        filterReports
    );
}

function showDatabaseError() {

    const errorHTML = `
        <div class="empty-state">

            <div class="empty-icon">

                <i class="bi bi-exclamation-triangle"></i>

            </div>

            <h3>
                Unable to load reports
            </h3>

            <p>
                There was a problem loading reports
                from the database.
            </p>

        </div>
    `;


    if (lostItemsContainer) {

        lostItemsContainer.innerHTML =
            errorHTML;
    }


    if (foundItemsContainer) {

        foundItemsContainer.innerHTML =
            errorHTML;
    }


    if (resolvedItemsContainer) {

        resolvedItemsContainer.innerHTML =
            errorHTML;
    }
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadReports();

    }
);
