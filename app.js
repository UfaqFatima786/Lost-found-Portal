//  const menuBtn = document.getElementById("menuBtn");
//         const mobileMenu = document.getElementById("mobileMenu");

//         menuBtn.addEventListener("click", () => {

//             mobileMenu.classList.toggle("show");

//             const icon = menuBtn.querySelector("i");

//             if (mobileMenu.classList.contains("show")) {
//                 icon.classList.remove("bi-list");
//                 icon.classList.add("bi-x-lg");
//             } else {
//                 icon.classList.remove("bi-x-lg");
//                 icon.classList.add("bi-list");
//             }

//         });

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (menuBtn && mobileMenu) {

    menuBtn.addEventListener("click", () => {

        mobileMenu.classList.toggle("show");

        const icon = menuBtn.querySelector("i");

        if (mobileMenu.classList.contains("show")) {

            icon.classList.remove("bi-list");
            icon.classList.add("bi-x-lg");

        } else {

            icon.classList.remove("bi-x-lg");
            icon.classList.add("bi-list");

        }

    });

}


// ==========================================
// SUPABASE
// ==========================================

const supabase = supabaseClient;


// ==========================================
// DOM ELEMENTS
// ==========================================

const lostCount =
    document.getElementById("lostCount");

const foundCount =
    document.getElementById("foundCount");

const recoveredCount =
    document.getElementById("recoveredCount");

const totalCount =
    document.getElementById("totalCount");


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


// ==========================================
// GLOBAL DATA
// ==========================================

let allReports = [];


// ==========================================
// LOAD REPORTS
// ==========================================

async function loadReports() {

    try {

        const { data, error } = await supabase

            .from("lost and found")

            .select("*")

            .order("id", {
                ascending: false
            });


        if (error) {

            console.error(
                "Supabase Error:",
                error
            );

            return;

        }


        allReports = data || [];


        console.log(
            "Reports loaded:",
            allReports
        );


        updateStats(allReports);

        displayItems(allReports);


    } catch (error) {

        console.error(
            "Load Reports Error:",
            error
        );

    }

}


// ==========================================
// UPDATE DASHBOARD STATS
// ==========================================

function updateStats(reports) {

    const total =
        reports.length;


    const lost =
        reports.filter(report =>

            getReportType(report) === "lost"

        ).length;


    const found =
        reports.filter(report =>

            getReportType(report) === "found"

        ).length;


    const recovered =
        reports.filter(report =>

            isResolved(report)

        ).length;


    if (lostCount) {

        lostCount.textContent =
            lost;

    }


    if (foundCount) {

        foundCount.textContent =
            found;

    }


    if (recoveredCount) {

        recoveredCount.textContent =
            recovered;

    }


    if (totalCount) {

        totalCount.textContent =
            total;

    }

}


// ==========================================
// GET REPORT TYPE
// ==========================================

function getReportType(report) {

    const type =

        report.type ||

        report.report_type ||

        report.status_type ||

        "";


    return String(type)
        .toLowerCase()
        .trim();

}


// ==========================================
// GET REPORT STATUS
// ==========================================

function getReportStatus(report) {

    return String(

        report.status || ""

    )
        .toLowerCase()
        .trim();

}


// ==========================================
// CHECK RESOLVED
// ==========================================

function isResolved(report) {

    const status =
        getReportStatus(report);


    return [

        "resolved",

        "recovered",

        "complete",

        "completed"

    ].includes(status);

}


// ==========================================
// DISPLAY ITEMS
// ==========================================

function displayItems(reports) {

    if (
        !lostItemsContainer ||
        !foundItemsContainer
    ) {

        return;

    }


    // ======================================
    // ACTIVE LOST ITEMS
    // ======================================

    const lostReports =

        reports.filter(report =>

            getReportType(report) === "lost" &&

            !isResolved(report)

        );


    // ======================================
    // ACTIVE FOUND ITEMS
    // ======================================

    const foundReports =

        reports.filter(report =>

            getReportType(report) === "found" &&

            !isResolved(report)

        );


    // ======================================
    // RESOLVED ITEMS
    // ======================================

    const resolvedReports =

        reports.filter(report =>

            isResolved(report)

        );


    // ======================================
    // LOST ITEMS
    // ======================================

    if (lostReports.length === 0) {

        lostItemsContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">

                    <i class="bi bi-search"></i>

                </div>

                <h3>
                    No lost items yet
                </h3>

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

                .slice(0, 8)

                .map(report =>

                    createItemCard(report)

                )

                .join("");

    }


    // ======================================
    // FOUND ITEMS
    // ======================================

    if (foundReports.length === 0) {

        foundItemsContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon found-empty">

                    <i class="bi bi-box-seam"></i>

                </div>

                <h3>
                    No found items yet
                </h3>

                <p>
                    Found something? Help return it to its owner.
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

                .slice(0, 8)

                .map(report =>

                    createItemCard(report)

                )

                .join("");

    }


    // ======================================
    // RESOLVED ITEMS
    // ======================================

    if (resolvedItemsContainer) {

        if (resolvedReports.length === 0) {

            resolvedItemsContainer.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">

                        <i class="bi bi-heart-fill"></i>

                    </div>

                    <h3>
                        No resolved items yet
                    </h3>

                    <p>
                        Recovered items will appear here.
                    </p>

                </div>

            `;

        } else {

            resolvedItemsContainer.innerHTML =

                resolvedReports

                    .slice(0, 8)

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

    const title =

        report.title ||

        report.item ||

        report.item_name ||

        "Unknown Item";


    const category =

        report.category ||

        "Other";


    const location =

        report.location ||

        report["location"] ||

        "Location not specified";


    const description =

        report.description ||

        "No description available.";


    const image =

        report["img-url"] ||

        report.imgurl ||

        report.image_url ||

        report.image ||

        "";


    const type =

        getReportType(report);


    const resolved =

        isResolved(report);


    // ======================================
    // IMAGE
    // ======================================

    let imageHTML = "";


    if (image) {

        imageHTML = `

            <img

                src="${escapeHTML(image)}"

                alt="${escapeHTML(title)}"

                onerror="this.style.display='none'"

            >

        `;

    } else {

        imageHTML = `

            <div class="item-image-placeholder">

                <i class="bi bi-image"></i>

            </div>

        `;

    }


    // ======================================
    // STATUS
    // ======================================

    const statusHTML =

        resolved

            ? `

                <span class="item-status resolved-status">

                    <i class="bi bi-check-circle-fill"></i>

                    Resolved

                </span>

            `

            : `

                <span class="item-status active-status">

                    <i class="bi bi-circle-fill"></i>

                    Active

                </span>

            `;


    // ======================================
    // TYPE LABEL
    // ======================================

    const typeLabel =

        type === "lost"

            ? "Lost"

            : "Found";


    return `

        <div class="item-card">


            <!-- IMAGE -->

            <div class="item-image">

                ${imageHTML}


                <span class="item-type ${type}-type">

                    ${typeLabel}

                </span>

            </div>


            <!-- CONTENT -->

            <div class="item-content">


                <div class="item-card-top">

                    <h3>

                        ${escapeHTML(title)}

                    </h3>


                    ${statusHTML}

                </div>


                <p class="item-category">

                    <i class="bi bi-tag"></i>

                    ${escapeHTML(category)}

                </p>


                <p class="item-location">

                    <i class="bi bi-geo-alt"></i>

                    ${escapeHTML(location)}

                </p>


                <p class="item-description">

                    ${escapeHTML(description)}

                </p>


                <div class="item-footer">


                    <span>

                        <i class="bi bi-${
                            type === "lost"
                                ? "search"
                                : "box-seam"
                        }"></i>

                        ${typeLabel} Item

                    </span>


                    ${
                        resolved

                            ? `

                                <span class="resolved-text">

                                    <i class="bi bi-heart-fill"></i>

                                    Recovered

                                </span>

                              `

                            : ""

                    }


                </div>


            </div>


        </div>

    `;

}


// ==========================================
// SEARCH + FILTER
// ==========================================

function applyFilters() {

    const search =

        searchInput

            ? searchInput.value
                .toLowerCase()
                .trim()

            : "";


    const category =

        categoryFilter

            ? categoryFilter.value
                .toLowerCase()

            : "all";


    const type =

        typeFilter

            ? typeFilter.value
                .toLowerCase()

            : "all";


    const filteredReports =

        allReports.filter(report => {


            const title =

                String(

                    report.title ||

                    report.item ||

                    report.item_name ||

                    ""

                )
                    .toLowerCase();


            const reportCategory =

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


            const reportType =

                getReportType(report);


            // ----------------------------------
            // SEARCH
            // ----------------------------------

            const matchesSearch =

                !search ||

                title.includes(search) ||

                reportCategory.includes(search) ||

                location.includes(search) ||

                description.includes(search);


            // ----------------------------------
            // CATEGORY
            // ----------------------------------

            const matchesCategory =

                category === "all" ||

                reportCategory === category;


            // ----------------------------------
            // TYPE
            // ----------------------------------

            const matchesType =

                type === "all" ||

                reportType === type;


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

        applyFilters

    );

}


// ==========================================
// LIVE SEARCH
// ==========================================

if (searchInput) {

    searchInput.addEventListener(

        "input",

        applyFilters

    );

}


// ==========================================
// CATEGORY FILTER
// ==========================================

if (categoryFilter) {

    categoryFilter.addEventListener(

        "change",

        applyFilters

    );

}


// ==========================================
// TYPE FILTER
// ==========================================

if (typeFilter) {

    typeFilter.addEventListener(

        "change",

        applyFilters

    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}

document.addEventListener(

    "DOMContentLoaded",

    loadReports

);