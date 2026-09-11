// ==========================================
// ADMIN DASHBOARD
// ==========================================


// ==========================================
// DOM ELEMENTS
// ==========================================

const reportsTable =
    document.getElementById("reportsTable");

const totalReports =
    document.getElementById("totalReports");

const lostItems =
    document.getElementById("lostItems");

const foundItems =
    document.getElementById("foundItems");

const resolvedItems =
    document.getElementById("resolvedItems");

const adminName =
    document.getElementById("adminName");

const welcomeName =
    document.getElementById("welcomeName");

const logoutBtn =
    document.getElementById("logoutBtn");


// ==========================================
// SECTION ELEMENTS
// ==========================================

const dashboardSection =
    document.getElementById("dashboardSection");

const reportsSection =
    document.getElementById("reportsSection");

const usersSection =
    document.getElementById("usersSection");

const lostSection =
    document.getElementById("lostSection");

const foundSection =
    document.getElementById("foundSection");

const resolvedSection =
    document.getElementById("resolvedSection");


// ==========================================
// CHECK ADMIN
// ==========================================

async function checkAdmin() {

    try {

        const {
            data: {
                user
            }
        } = await supabaseClient.auth.getUser();


        if (!user) {

            window.location.href =
                "admin-login.html";

            return false;
        }


        const {
            data: profile,
            error
        } = await supabaseClient
            .from("profiles")
            .select("id, full_name, email, role")
            .eq("id", user.id)
            .single();


        if (error) {

            console.error(
                "Profile error:",
                error
            );

            await supabaseClient.auth.signOut();

            window.location.href =
                "admin-login.html";

            return false;
        }


        // ==========================================
        // ADMIN ROLE CHECK
        // ==========================================

        if (profile.role !== "admin") {

            await supabaseClient.auth.signOut();


            if (typeof Swal !== "undefined") {

                await Swal.fire({
                    icon: "error",
                    title: "Access Denied",
                    text: "Admin account required."
                });

            } else {

                alert(
                    "Access denied. Admin account required."
                );

            }


            window.location.href =
                "admin-login.html";

            return false;
        }


        // ==========================================
        // ADMIN NAME
        // ==========================================

        const name =
            profile.full_name ||
            profile.email?.split("@")[0] ||
            "Admin";


        if (adminName) {

            adminName.textContent =
                name;

        }


        if (welcomeName) {

            welcomeName.textContent =
                name;

        }


        return true;


    } catch (error) {

        console.error(
            "Admin check error:",
            error
        );


        window.location.href =
            "admin-login.html";

        return false;

    }

}



// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard() {

    try {

        const {
            data: reports,
            error
        } = await supabaseClient
            .from("lost and found")
            .select("*")
            .order("id", {
                ascending: false
            });


        if (error) {

            console.error(
                "Reports error:",
                error
            );

            throw error;
        }


        const allReports =
            reports || [];


        // ==========================================
        // TOTAL REPORTS
        // ==========================================

        totalReports.textContent =
            allReports.length;


        // ==========================================
        // LOST COUNT
        // ==========================================

        const lostCount =
            allReports.filter(report => {

                const type =
                    String(
                        report.type ||
                        report.report_type ||
                        report.status_type ||
                        ""
                    ).toLowerCase();


                return type === "lost";

            }).length;


        lostItems.textContent =
            lostCount;


        // ==========================================
        // FOUND COUNT
        // ==========================================

        const foundCount =
            allReports.filter(report => {

                const type =
                    String(
                        report.type ||
                        report.report_type ||
                        report.status_type ||
                        ""
                    ).toLowerCase();


                return type === "found";

            }).length;


        foundItems.textContent =
            foundCount;


        // ==========================================
        // RESOLVED COUNT
        // ==========================================

        const resolvedCount =
            allReports.filter(report => {

                return isResolved(report);

            }).length;


        resolvedItems.textContent =
            resolvedCount;


        // ==========================================
        // RECENT REPORTS
        // ==========================================

        displayReports(
            allReports.slice(0, 8)
        );


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        if (reportsTable) {

            reportsTable.innerHTML = `
                <tr>
                    <td colspan="5" class="empty">
                        Unable to load reports.
                    </td>
                </tr>
            `;

        }

    }

}



// ==========================================
// DISPLAY RECENT REPORTS
// ==========================================

function displayReports(reports) {

    if (!reportsTable) {
        return;
    }


    if (!reports.length) {

        reportsTable.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    No reports found.
                </td>
            </tr>
        `;

        return;
    }


    reportsTable.innerHTML =
        reports.map(report => {

            return createReportRow(report);

        }).join("");

}



// ==========================================
// CREATE REPORT ROW
// ==========================================

function createReportRow(report) {


    // ==========================================
    // TITLE
    // ==========================================

    const title =
        report.title ||
        report.item ||
        report.item_name ||
        "Unnamed Item";


    // ==========================================
    // CATEGORY
    // ==========================================

    const category =
        report.category ||
        "General";


    // ==========================================
    // TYPE
    // ==========================================

    const rawType =
        String(
            report.type ||
            report.report_type ||
            report.status_type ||
            ""
        ).toLowerCase();


    const type =
        rawType === "found"
            ? "Found"
            : "Lost";


    const typeClass =
        type === "Found"
            ? "type-found"
            : "type-lost";


    // ==========================================
    // STATUS
    // ==========================================

    const rawStatus =
        String(
            report.status ||
            report.report_status ||
            "Pending"
        ).toLowerCase();


    let statusText =
        "Pending";

    let statusClass =
        "status-pending";


    if (isResolved(report)) {

        statusText =
            "Resolved";

        statusClass =
            "status-resolved";

    } else if (rawStatus) {

        statusText =
            capitalize(rawStatus);

        statusClass =
            "status-default";

    }


    // ==========================================
    // IMAGE
    // ==========================================

    const image =
        report["img-url"] ||
        report.imgurl ||
        report.image_url ||
        report.image ||
        "";


    const imageHTML =
        image
            ? `
                <img
                    src="${escapeHTML(image)}"
                    class="report-image"
                    alt="Item"
                    onerror="
                        this.src =
                        'https://placehold.co/80x80?text=Item'
                    "
                >
            `
            : `
                <div
                    class="report-image"
                    style="
                        display:grid;
                        place-items:center;
                        color:#635bff;
                    "
                >
                    <i class="fa-solid fa-image"></i>
                </div>
            `;


    return `

        <tr>

            <td>

                <div class="report-name">

                    ${imageHTML}

                    <div>

                        <strong
                            title="${escapeHTML(title)}"
                        >
                            ${escapeHTML(title)}
                        </strong>

                        <small>
                            ID #${report.id}
                        </small>

                    </div>

                </div>

            </td>


            <td>
                ${escapeHTML(category)}
            </td>


            <td>

                <span class="
                    type-badge
                    ${typeClass}
                ">
                    ${type}
                </span>

            </td>


            <td>

                <span class="
                    status-badge
                    ${statusClass}
                ">
                    ${statusText}
                </span>

            </td>


            <td>

                <button
                    class="action-btn"
                    onclick="viewReport(${report.id})"
                    title="View Report"
                >

                    <i class="fa-solid fa-eye"></i>

                </button>

            </td>

        </tr>

    `;

}



// ==========================================
// CHECK RESOLVED
// ==========================================

function isResolved(report) {

    const status =
        String(
            report.status ||
            report.report_status ||
            ""
        ).toLowerCase();


    return (
        status === "resolved" ||
        status === "recovered" ||
        status === "complete" ||
        status === "completed"
    );

}



// ==========================================
// SHOW SECTION
// ==========================================

function showSection(sectionName) {


    // ==========================================
    // HIDE ALL SECTIONS
    // ==========================================

    const sections = [
        dashboardSection,
        reportsSection,
        usersSection,
        lostSection,
        foundSection,
        resolvedSection
    ];


    sections.forEach(section => {

        if (section) {

            section.style.display =
                "none";

        }

    });


    // ==========================================
    // SHOW SELECTED SECTION
    // ==========================================

    const sectionMap = {

        dashboard:
            dashboardSection,

        reports:
            reportsSection,

        users:
            usersSection,

        lost:
            lostSection,

        found:
            foundSection,

        resolved:
            resolvedSection

    };


    const selectedSection =
        sectionMap[sectionName];


    if (selectedSection) {

        selectedSection.style.display =
            "block";

    }


    // ==========================================
    // ACTIVE SIDEBAR
    // ==========================================

    document
        .querySelectorAll(".nav-link")
        .forEach(link => {

            link.classList.remove(
                "active"
            );

        });


    const activeLink =
        document.querySelector(
            `.nav-link[data-section="${sectionName}"]`
        );


    if (activeLink) {

        activeLink.classList.add(
            "active"
        );

    }


    // ==========================================
    // LOAD DATA
    // ==========================================

    if (sectionName === "reports") {

        loadAllReports();

    }


    if (sectionName === "users") {

        loadUsers();

    }


    if (sectionName === "lost") {

        loadFilteredReports("lost");

    }


    if (sectionName === "found") {

        loadFilteredReports("found");

    }


    if (sectionName === "resolved") {

        loadFilteredReports("resolved");

    }

}



// ==========================================
// SIDEBAR NAVIGATION
// ==========================================

document
    .querySelectorAll(".nav-link")
    .forEach(link => {


        link.addEventListener(
            "click",
            function (e) {

                e.preventDefault();


                const section =
                    this.dataset.section;


                showSection(section);

            }
        );

    });



// ==========================================
// ALL REPORTS
// ==========================================

async function loadAllReports() {

    const table =
        document.getElementById(
            "allReportsTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = `
        <tr>
            <td colspan="5" class="empty">
                Loading reports...
            </td>
        </tr>
    `;


    try {

        const {
            data: reports,
            error
        } = await supabaseClient
            .from("lost and found")
            .select("*")
            .order("id", {
                ascending: false
            });


        if (error) {
            throw error;
        }


        displayReportsInTable(
            reports || [],
            table
        );


    } catch (error) {

        console.error(
            "All reports error:",
            error
        );


        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    Unable to load reports.
                </td>
            </tr>
        `;

    }

}



// ==========================================
// FILTERED REPORTS
// ==========================================

async function loadFilteredReports(type) {


    let tableId;


    if (type === "lost") {

        tableId =
            "lostTable";

    }


    if (type === "found") {

        tableId =
            "foundTable";

    }


    if (type === "resolved") {

        tableId =
            "resolvedTable";

    }


    const table =
        document.getElementById(
            tableId
        );


    if (!table) {
        return;
    }


    table.innerHTML = `
        <tr>
            <td colspan="5" class="empty">
                Loading...
            </td>
        </tr>
    `;


    try {

        const {
            data: reports,
            error
        } = await supabaseClient
            .from("lost and found")
            .select("*")
            .order("id", {
                ascending: false
            });


        if (error) {
            throw error;
        }


        const allReports =
            reports || [];


        let filteredReports =
            [];


        // ==========================================
        // LOST
        // ==========================================

        if (type === "lost") {

            filteredReports =
                allReports.filter(report => {

                    const reportType =
                        String(
                            report.type ||
                            report.report_type ||
                            report.status_type ||
                            ""
                        ).toLowerCase();


                    return reportType === "lost";

                });

        }


        // ==========================================
        // FOUND
        // ==========================================

        if (type === "found") {

            filteredReports =
                allReports.filter(report => {

                    const reportType =
                        String(
                            report.type ||
                            report.report_type ||
                            report.status_type ||
                            ""
                        ).toLowerCase();


                    return reportType === "found";

                });

        }


        // ==========================================
        // RESOLVED
        // ==========================================

        if (type === "resolved") {

            filteredReports =
                allReports.filter(report => {

                    return isResolved(report);

                });

        }


        displayReportsInTable(
            filteredReports,
            table
        );


    } catch (error) {

        console.error(
            "Filtered reports error:",
            error
        );


        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    Unable to load data.
                </td>
            </tr>
        `;

    }

}



// ==========================================
// DISPLAY REPORTS IN SECTION TABLE
// ==========================================

function displayReportsInTable(
    reports,
    table
) {


    if (!reports.length) {

        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    No reports found.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        reports.map(report => {

            return createReportRow(report);

        }).join("");

}



// ==========================================
// LOAD USERS
// ==========================================

async function loadUsers() {


    const table =
        document.getElementById(
            "usersTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = `
        <tr>
            <td colspan="3" class="empty">
                Loading users...
            </td>
        </tr>
    `;


    try {

        const {
            data: users,
            error
        } = await supabaseClient
            .from("profiles")
            .select(
                "id, full_name, email, role"
            )
            .order(
                "full_name",
                {
                    ascending: true
                }
            );


        if (error) {
            throw error;
        }


        if (!users || !users.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="3" class="empty">
                        No users found.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML =
            users.map(user => {


                const role =
                    user.role ||
                    "user";


                return `

                    <tr>

                        <td>

                            <strong>
                                ${escapeHTML(
                                    user.full_name ||
                                    "Unknown User"
                                )}
                            </strong>

                        </td>


                        <td>

                            ${escapeHTML(
                                user.email ||
                                "No email"
                            )}

                        </td>


                        <td>

                            <span class="
                                status-badge
                                status-default
                            ">

                                ${escapeHTML(
                                    capitalize(role)
                                )}

                            </span>

                        </td>

                    </tr>

                `;

            }).join("");


    } catch (error) {

        console.error(
            "Users error:",
            error
        );


        table.innerHTML = `
            <tr>
                <td colspan="3" class="empty">
                    Unable to load users.
                </td>
            </tr>
        `;

    }

}



// ==========================================
// VIEW REPORT
// ==========================================

window.viewReport =
    async function (id) {

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("lost and found")
                .select("*")
                .eq("id", id)
                .single();


            if (error) {
                throw error;
            }


            const title =
                data.title ||
                data.item ||
                data.item_name ||
                "Unnamed Item";


            const description =
                data.description ||
                "No description available.";


            const location =
                data.location ||
                "Not provided";


            const category =
                data.category ||
                "Not provided";


            // ==========================================
            // SWEET ALERT
            // ==========================================

            if (
                typeof Swal !== "undefined"
            ) {

                Swal.fire({

                    title:
                        `Report #${id}`,

                    html: `

                        <div style="
                            text-align:left;
                            line-height:1.8;
                        ">

                            <strong>
                                Item:
                            </strong>

                            ${escapeHTML(title)}

                            <br>

                            <strong>
                                Category:
                            </strong>

                            ${escapeHTML(category)}

                            <br>

                            <strong>
                                Location:
                            </strong>

                            ${escapeHTML(location)}

                            <br><br>

                            <strong>
                                Description:
                            </strong>

                            <br>

                            ${escapeHTML(description)}

                        </div>

                    `,

                    icon:
                        "info",

                    confirmButtonText:
                        "Close"

                });

            } else {

                alert(

                    `Report #${id}\n\n` +

                    `Item: ${title}\n` +

                    `Category: ${category}\n` +

                    `Location: ${location}\n\n` +

                    `Description:\n${description}`

                );

            }


        } catch (error) {

            console.error(
                "View report error:",
                error
            );


            if (
                typeof Swal !== "undefined"
            ) {

                Swal.fire({

                    icon:
                        "error",

                    title:
                        "Unable to open report",

                    text:
                        "Something went wrong."

                });

            } else {

                alert(
                    "Unable to open this report."
                );

            }

        }

    };



// ==========================================
// QUICK ACTIONS
// ==========================================

const allReportsBtn =
    document.getElementById(
        "allReportsBtn"
    );

const usersBtn =
    document.getElementById(
        "usersBtn"
    );

const resolvedBtn =
    document.getElementById(
        "resolvedBtn"
    );

const viewAllReportsBtn =
    document.getElementById(
        "viewAllReportsBtn"
    );



// ==========================================
// ALL REPORTS BUTTON
// ==========================================

if (allReportsBtn) {

    allReportsBtn.addEventListener(
        "click",
        () => {

            showSection(
                "reports"
            );

        }
    );

}



// ==========================================
// USERS BUTTON
// ==========================================

if (usersBtn) {

    usersBtn.addEventListener(
        "click",
        () => {

            showSection(
                "users"
            );

        }
    );

}



// ==========================================
// RESOLVED BUTTON
// ==========================================

if (resolvedBtn) {

    resolvedBtn.addEventListener(
        "click",
        () => {

            showSection(
                "resolved"
            );

        }
    );

}



// ==========================================
// VIEW ALL REPORTS
// ==========================================

if (viewAllReportsBtn) {

    viewAllReportsBtn.addEventListener(
        "click",
        () => {

            showSection(
                "reports"
            );

        }
    );

}



// ==========================================
// LOGOUT
// ==========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {


            let confirmLogout =
                true;


            if (
                typeof Swal !== "undefined"
            ) {

                const result =
                    await Swal.fire({

                        icon:
                            "question",

                        title:
                            "Logout?",

                        text:
                            "Are you sure you want to logout?",

                        showCancelButton:
                            true,

                        confirmButtonText:
                            "Yes, Logout",

                        cancelButtonText:
                            "Cancel"

                    });


                confirmLogout =
                    result.isConfirmed;

            } else {

                confirmLogout =
                    confirm(
                        "Are you sure you want to logout?"
                    );

            }


            if (!confirmLogout) {
                return;
            }


            await supabaseClient.auth.signOut();


            sessionStorage.clear();


            window.location.href =
                "admin-login.html";

        }
    );

}



// ==========================================
// HELPER - CAPITALIZE
// ==========================================

function capitalize(text) {

    if (!text) {
        return "";
    }


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}



// ==========================================
// HELPER - ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}



// ==========================================
// INITIALIZE ADMIN DASHBOARD
// ==========================================

async function initAdminDashboard() {


    const isAdmin =
        await checkAdmin();


    if (!isAdmin) {
        return;
    }


    // Load dashboard data
    await loadDashboard();


    // Always start on dashboard
    showSection(
        "dashboard"
    );

}


initAdminDashboard();