// ==========================================
// FINDIT - ADMIN DASHBOARD
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


// ==========================================
// SECTIONS
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
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();


        if (userError || !user) {

            window.location.href =
                "admin-login.html";

            return false;
        }


        const {
            data: profile,
            error: profileError
        } = await supabaseClient
            .from("profiles")
            .select("id, full_name, email, role")
            .eq("id", user.id)
            .single();


        if (profileError) {
            throw profileError;
        }


        if (!profile || profile.role !== "admin") {

            await supabaseClient.auth.signOut();

            await Swal.fire({
                icon: "error",
                title: "Access Denied",
                text: "Admin account required."
            });

            window.location.href =
                "admin-login.html";

            return false;
        }


        const name =
            profile.full_name || "Admin";


        if (adminName) {
            adminName.textContent = name;
        }


        if (welcomeName) {
            welcomeName.textContent = name;
        }


        return true;


    } catch (error) {

        console.error(
            "Admin Check Error:",
            error
        );

        window.location.href =
            "admin-login.html";

        return false;
    }
}


// ==========================================
// GET REPORT TYPE
// ==========================================

function getReportType(report) {

    return String(
        report.type ||
        report.report_type ||
        report.status_type ||
        ""
    )
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
            throw error;
        }


        const allReports =
            reports || [];


        // -------------------------------
        // COUNTS
        // -------------------------------

        const total =
            allReports.length;


        const lost =
            allReports.filter(report =>
                getReportType(report) === "lost"
            ).length;


        const found =
            allReports.filter(report =>
                getReportType(report) === "found"
            ).length;


        const resolved =
            allReports.filter(report =>
                isResolved(report)
            ).length;


        if (totalReports) {
            totalReports.textContent = total;
        }


        if (lostItems) {
            lostItems.textContent = lost;
        }


        if (foundItems) {
            foundItems.textContent = found;
        }


        if (resolvedItems) {
            resolvedItems.textContent = resolved;
        }


        // -------------------------------
        // RECENT REPORTS
        // -------------------------------

        displayReports(
            allReports.slice(0, 8),
            reportsTable
        );


    } catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );

    }
}


// ==========================================
// CREATE REPORT ROW
// ==========================================

function createReportRow(report) {

    const id =
        report.id;


    const title =
        report.title ||
        report.item ||
        report.item_name ||
        "Unknown Item";


    const category =
        report.category ||
        "Other";


    const type =
        getReportType(report);


    const status =
        getReportStatus(report);


    // --------------------------------------
    // TYPE
    // --------------------------------------

    let typeHTML = "";

    if (type === "lost") {

        typeHTML = `
            <span class="report-type lost">
                Lost
            </span>
        `;

    } else {

        typeHTML = `
            <span class="report-type found">
                Found
            </span>
        `;
    }


    // --------------------------------------
    // STATUS
    // --------------------------------------

    let statusHTML = "";

    if (isResolved(report)) {

        statusHTML = `
            <span class="report-status resolved">
                <i class="fa-solid fa-circle-check"></i>
                Resolved
            </span>
        `;

    } else {

        statusHTML = `
            <span class="report-status active">
                <i class="fa-solid fa-circle"></i>
                Active
            </span>
        `;
    }


    // --------------------------------------
    // ACTION
    // --------------------------------------

    let actionHTML = "";

    if (isResolved(report)) {

        actionHTML = `
            <button
                class="view-btn"
                onclick="viewReport(${id})"
            >
                <i class="fa-solid fa-eye"></i>
                View
            </button>
        `;

    } else {

        actionHTML = `
            <div class="report-actions">

                <button
                    class="view-btn"
                    onclick="viewReport(${id})"
                >
                    <i class="fa-solid fa-eye"></i>
                    View
                </button>

                <button
                    class="resolve-btn"
                    onclick="markAsResolved(${id})"
                >
                    <i class="fa-solid fa-circle-check"></i>
                    Resolve
                </button>

            </div>
        `;
    }


    // --------------------------------------
    // REPORT ROW
    // --------------------------------------

    return `
        <tr>

            <td>
                <strong>
                    ${escapeHTML(title)}
                </strong>
            </td>

            <td>
                ${escapeHTML(category)}
            </td>

            <td>
                ${typeHTML}
            </td>

            <td>
                ${statusHTML}
            </td>

            <td>
                ${actionHTML}
            </td>

        </tr>
    `;
}


// ==========================================
// DISPLAY REPORTS
// ==========================================

function displayReports(
    reports,
    table
) {

    if (!table) {
        return;
    }


    if (!reports || reports.length === 0) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="empty"
                >
                    No reports found.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        reports
            .map(report =>
                createReportRow(report)
            )
            .join("");
}


// ==========================================
// MARK AS RESOLVED
// ==========================================

window.markAsResolved = async function(id) {

    try {

        // ----------------------------------
        // CONFIRM
        // ----------------------------------

        const result =
            await Swal.fire({

                icon: "question",

                title: "Mark as Resolved?",

                text:
                    "Are you sure this item has been successfully resolved?",

                showCancelButton: true,

                confirmButtonText:
                    "Yes, Resolve It",

                cancelButtonText:
                    "Cancel",

                reverseButtons: true

            });


        if (!result.isConfirmed) {
            return;
        }


        // ----------------------------------
        // UPDATE SUPABASE
        // ----------------------------------

        const {
            error
        } = await supabaseClient
            .from("lost and found")
            .update({
                status: "resolved"
            })
            .eq("id", id);


        if (error) {
            throw error;
        }


        // ----------------------------------
        // SUCCESS
        // ----------------------------------

        await Swal.fire({

            icon: "success",

            title: "Resolved!",

            text:
                "The report has been marked as resolved.",

            timer: 1600,

            showConfirmButton: false

        });


        // ----------------------------------
        // REFRESH DASHBOARD
        // ----------------------------------

        await loadDashboard();


        // ----------------------------------
        // REFRESH RESOLVED SECTION
        // ----------------------------------

        if (
            resolvedSection &&
            resolvedSection.style.display !== "none"
        ) {

            await loadFilteredReports(
                "resolved"
            );

        }


    } catch (error) {

        console.error(
            "Resolve Error:",
            error
        );


        Swal.fire({

            icon: "error",

            title: "Update Failed",

            text:
                error.message ||
                "Could not mark this report as resolved."

        });

    }
};


// ==========================================
// SHOW SECTION
// ==========================================

function showSection(sectionName) {

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


    // --------------------------------------
    // SIDEBAR ACTIVE
    // --------------------------------------

    document
        .querySelectorAll(".nav-link")
        .forEach(link => {

            link.classList.remove(
                "active"
            );


            if (
                link.dataset.section ===
                sectionName
            ) {

                link.classList.add(
                    "active"
                );

            }

        });


    // --------------------------------------
    // LOAD SECTION
    // --------------------------------------

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
// SIDEBAR CLICK
// ==========================================

document
    .querySelectorAll(".nav-link")
    .forEach(link => {

        link.addEventListener(
            "click",
            function(e) {

                e.preventDefault();

                const section =
                    this.dataset.section;


                if (section) {

                    showSection(
                        section
                    );

                }

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


        displayReports(
            reports || [],
            table
        );


    } catch (error) {

        console.error(
            "Reports Error:",
            error
        );

    }
}


// ==========================================
// LOST / FOUND / RESOLVED
// ==========================================

async function loadFilteredReports(
    type
) {

    let table = null;


    if (type === "lost") {

        table =
            document.getElementById(
                "lostTable"
            );

    }


    if (type === "found") {

        table =
            document.getElementById(
                "foundTable"
            );

    }


    if (type === "resolved") {

        table =
            document.getElementById(
                "resolvedTable"
            );

    }


    if (!table) {
        return;
    }


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


        let filteredReports =
            reports || [];


        // ----------------------------------
        // LOST
        // ----------------------------------

        if (type === "lost") {

            filteredReports =
                filteredReports.filter(
                    report =>
                        getReportType(
                            report
                        ) === "lost"
                );

        }


        // ----------------------------------
        // FOUND
        // ----------------------------------

        if (type === "found") {

            filteredReports =
                filteredReports.filter(
                    report =>
                        getReportType(
                            report
                        ) === "found"
                );

        }


        // ----------------------------------
        // RESOLVED
        // ----------------------------------

        if (type === "resolved") {

            filteredReports =
                filteredReports.filter(
                    report =>
                        isResolved(
                            report
                        )
                );

        }


        displayReports(
            filteredReports,
            table
        );


    } catch (error) {

        console.error(
            "Filter Error:",
            error
        );

    }
}


// ==========================================
// USERS
// ==========================================

async function loadUsers() {

    const table =
        document.getElementById(
            "usersTable"
        );


    if (!table) {
        return;
    }


    try {

        const {
            data: users,
            error
        } = await supabaseClient
            .from("profiles")
            .select(
                "id, full_name, email, role"
            )
            .order("full_name", {
                ascending: true
            });


        if (error) {
            throw error;
        }


        if (!users || users.length === 0) {

            table.innerHTML = `
                <tr>

                    <td
                        colspan="3"
                        class="empty"
                    >
                        No users found.
                    </td>

                </tr>
            `;

            return;
        }


        table.innerHTML =
            users.map(user => `

                <tr>

                    <td>
                        ${escapeHTML(
                            user.full_name ||
                            "No Name"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            user.email ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            user.role ||
                            "user"
                        )}
                    </td>

                </tr>

            `).join("");


    } catch (error) {

        console.error(
            "Users Error:",
            error
        );

    }
}


// ==========================================
// VIEW REPORT
// ==========================================

window.viewReport = async function(id) {

    try {

        const {
            data: report,
            error
        } = await supabaseClient
            .from("lost and found")
            .select("*")
            .eq("id", id)
            .single();


        if (error) {
            throw error;
        }


        // ----------------------------------
        // REPORT DATA
        // ----------------------------------

        const title =
            report.title ||
            report.item ||
            report.item_name ||
            "Unknown Item";


        const type =
            getReportType(report) ||
            "unknown";


        const category =
            report.category ||
            "Other";


        const location =
            report.location ||
            "Not specified";


        const description =
            report.description ||
            "No description available.";


        const status =
            getReportStatus(report) ||
            "active";


        // ----------------------------------
        // IMAGE
        // IMPORTANT:
        // Supabase column = img-url
        // ----------------------------------

        const imageUrl =
            report["img-url"] ||
            "";


        // ----------------------------------
        // IMAGE HTML
        // ----------------------------------

        let imageHTML = "";


        if (imageUrl) {

            imageHTML = `
                <div style="
                    width: 100%;
                    margin-bottom: 20px;
                    text-align: center;
                ">

                    <img
                        src="${escapeHTML(imageUrl)}"
                        alt="${escapeHTML(title)}"
                        style="
                            width: 100%;
                            max-width: 340px;
                            height: 230px;
                            object-fit: cover;
                            border-radius: 14px;
                            display: block;
                            margin: 0 auto;
                            border: 1px solid rgba(255,255,255,0.12);
                            box-shadow: 0 8px 25px rgba(0,0,0,0.25);
                        "
                        onerror="
                            this.style.display='none';
                        "
                    >

                </div>
            `;

        }


        // ----------------------------------
        // SWEETALERT
        // ----------------------------------

        await Swal.fire({

            title:
                escapeHTML(title),

            html: `

                <div style="
                    text-align: left;
                    line-height: 1.8;
                ">

                    ${imageHTML}

                    <p>
                        <strong>Type:</strong>
                        ${escapeHTML(
                            capitalize(type)
                        )}
                    </p>

                    <p>
                        <strong>Category:</strong>
                        ${escapeHTML(category)}
                    </p>

                    <p>
                        <strong>Location:</strong>
                        ${escapeHTML(location)}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${escapeHTML(
                            capitalize(status)
                        )}
                    </p>

                    <p>
                        <strong>Description:</strong>
                        ${escapeHTML(
                            description
                        )}
                    </p>

                </div>

            `,

            confirmButtonText:
                "Close"

        });


    } catch (error) {

        console.error(
            "View Report Error:",
            error
        );


        Swal.fire({

            icon: "error",

            title: "Error",

            text:
                error.message ||
                "Unable to load report."

        });

    }
};


// ==========================================
// BUTTONS
// ==========================================

const allReportsBtn =
    document.getElementById(
        "allReportsBtn"
    );


if (allReportsBtn) {

    allReportsBtn.addEventListener(
        "click",
        () =>
            showSection("reports")
    );

}


const usersBtn =
    document.getElementById(
        "usersBtn"
    );


if (usersBtn) {

    usersBtn.addEventListener(
        "click",
        () =>
            showSection("users")
    );

}


const resolvedBtn =
    document.getElementById(
        "resolvedBtn"
    );


if (resolvedBtn) {

    resolvedBtn.addEventListener(
        "click",
        () =>
            showSection("resolved")
    );

}


const viewAllReportsBtn =
    document.getElementById(
        "viewAllReportsBtn"
    );


if (viewAllReportsBtn) {

    viewAllReportsBtn.addEventListener(
        "click",
        () =>
            showSection("reports")
    );

}


// ==========================================
// HELPERS
// ==========================================

function capitalize(value) {

    if (!value) {
        return "";
    }


    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function initAdminDashboard() {

    const isAdmin =
        await checkAdmin();


    if (!isAdmin) {
        return;
    }


    await loadDashboard();


    showSection(
        "dashboard"
    );
}


initAdminDashboard();