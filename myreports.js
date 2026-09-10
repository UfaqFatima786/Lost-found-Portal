const reportsContainer =
    document.getElementById("reportsContainer");
async function loadMyReports() {
    reportsContainer.innerHTML = `
        <div class="reports-loading" style="display:block;">
            <div class="loading-spinner"></div>
            <p>Loading your reports...</p>
        </div>
    `;
    const { data, error } = await supabaseClient
        .from("lost and found")
        .select("*")
        .order("id", {
            ascending: false
        });
    if (error) {
        console.error("Load Error:", error);
        reportsContainer.innerHTML = `
            <div class="reports-empty" style="display:flex;">
                <div class="empty-icon">
                    <i class="bi bi-exclamation-circle"></i>
                </div>
                <h3>Unable to Load Reports</h3>
                <p>${error.message}</p>
            </div>
        `;
        return;
    }
    console.log("My Reports:", data);
    if (!data || data.length === 0) {
        reportsContainer.innerHTML = `
            <div class="reports-empty" style="display:flex;">
                <div class="empty-icon">
                    <i class="bi bi-file-earmark-x"></i>
                </div>
                <h3>No Reports Yet</h3>
                <p>You haven't created any reports yet.</p>
            </div>
        `;
        return;
    }
    reportsContainer.innerHTML = "";
    data.forEach(item => {
        const card =
            document.createElement("div");
        card.className = "report-card";
        let lostFoundDate = "Not provided";
        if (item["date-lost-found"]) {
            const date =
                new Date(item["date-lost-found"]);
            lostFoundDate =
                date.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                });
        }
        let createdDate = "Not available";
        if (item.created_at) {
            const date =
                new Date(item.created_at);
            createdDate =
                date.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }) +
                " " +
                date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit"
                });
        }
        let imageHTML = `
            <div class="image-placeholder">
                <i class="bi bi-image"></i>
                <span>No Image</span>
            </div>
        `;
        if (item["img-url"]) {
            imageHTML = `
                <img
                    src="${item["img-url"]}"
                    alt="${item.title || "Report Image"}"
                    class="report-real-image"
                    loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                >
                <div
                    class="image-placeholder image-error-placeholder"
                    style="display:none;"
                >
                    <i class="bi bi-image"></i>
                    <span>Image unavailable</span>
                </div>
            `;
        }
        card.innerHTML = `
            <div class="report-image">
                <!-- LOST / FOUND BADGE -->
                <div class="report-type ${
                    item.type === "lost"
                        ? "lost-type"
                        : "found-type"
                }">
                    <i class="bi ${
                        item.type === "lost"
                            ? "bi-search"
                            : "bi-check-circle"
                    }"></i>
                    ${item.type
                        ? item.type.toUpperCase()
                        : "REPORT"
                    }

                </div>
                <!-- ACTUAL IMAGE -->
                ${imageHTML}
            </div>
            <div class="report-content">
                <div class="report-top">
                    <div>
                        <span class="category-label">
                            ${item.category || "Other"}
                        </span>
                        <h3>
                            ${item.title || "Untitled Report"}
                        </h3>
                    </div>
                    <span class="status-badge active-status">
                        ${item.status || "active"}
                    </span>
                </div>


                <!-- DESCRIPTION -->

                <p class="report-description">

                    ${
                        item.description ||
                        "No description provided."
                    }

                </p>


                <!-- LOCATION -->

                <div class="report-info">

                    <span>
                        <i class="bi bi-geo-alt"></i>

                        ${item.location || "Unknown"}

                    </span>

                </div>


                <!-- LOST / FOUND DATE -->

                <div class="report-info">

                    <span>
                        <i class="bi bi-calendar-event"></i>

                        <strong>
                            Lost/Found Date:
                        </strong>

                        ${lostFoundDate}

                    </span>

                </div>


                <!-- CREATED DATE -->

                <div class="report-info">

                    <span>
                        <i class="bi bi-clock"></i>

                        <strong>
                            Report Created:
                        </strong>

                        ${createdDate}

                    </span>

                </div>


                <!-- ACTION BUTTONS -->

                <div class="report-actions">

                    <button
                        class="edit-btn"
                        data-id="${item.id}"
                    >

                        <i class="bi bi-pencil"></i>

                        Edit

                    </button>


                    <button
                        class="delete-btn"
                        data-id="${item.id}"
                    >

                        <i class="bi bi-trash3"></i>

                        Delete

                    </button>

                </div>

            </div>
        `;


        reportsContainer.appendChild(card);

    });


    // ==========================================
    // EDIT BUTTONS
    // ==========================================

    document
        .querySelectorAll(".edit-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    editReport(id);

                }
            );

        });


    // ==========================================
    // DELETE BUTTONS
    // ==========================================

    document
        .querySelectorAll(".delete-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    deleteReport(id);

                }
            );

        });

}


// ==========================================
// EDIT REPORT
// ==========================================

async function editReport(id) {

    const { data, error } =
        await supabaseClient
            .from("lost and found")
            .select("*")
            .eq("id", id)
            .single();


    if (error) {

        console.error(error);

        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Report load nahi ho saki."
        });

        return;
    }


    const newTitle = prompt(
        "Enter new item title:",
        data.title
    );


    if (newTitle === null) {
        return;
    }


    const newCategory = prompt(
        "Enter new category:",
        data.category
    );


    if (newCategory === null) {
        return;
    }


    const newLocation = prompt(
        "Enter new location:",
        data.location
    );


    if (newLocation === null) {
        return;
    }


    const newDescription = prompt(
        "Enter new description:",
        data.description || ""
    );


    if (newDescription === null) {
        return;
    }


    const { error: updateError } =
        await supabaseClient
            .from("lost and found")
            .update({

                title: newTitle.trim(),

                category: newCategory.trim(),

                location: newLocation.trim(),

                description: newDescription.trim()

            })
            .eq("id", id);


    if (updateError) {

        console.error(
            "Update Error:",
            updateError
        );


        Swal.fire({

            icon: "error",

            title: "Update Failed!",

            text:
                "Report update nahi ho saki.\n\n" +
                updateError.message

        });

        return;
    }


    // ==========================================
    // UPDATE SUCCESS
    // ==========================================

    await Swal.fire({

        icon: "success",

        title: "Congratulations!",

        text:
            "Your report has been successfully updated!",

        confirmButtonText: "OK"

    });


    loadMyReports();

}


// ==========================================
// DELETE REPORT
// ==========================================

async function deleteReport(id) {

    const result =
        await Swal.fire({

            icon: "warning",

            title: "Delete Report?",

            text:
                "Are you sure you want to delete this report?",

            showCancelButton: true,

            confirmButtonText: "Yes, Delete",

            cancelButtonText: "Cancel"

        });


    if (!result.isConfirmed) {

        return;
    }


    const { error } =
        await supabaseClient
            .from("lost and found")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(
            "Delete Error:",
            error
        );


        Swal.fire({

            icon: "error",

            title: "Delete Failed!",

            text:
                "Report delete nahi ho saki.\n\n" +
                error.message

        });

        return;
    }
    await Swal.fire({

        icon: "success",

        title: "Deleted!",

        text:
            "🗑️ Report successfully deleted!",

        confirmButtonText: "OK"

    });
    loadMyReports();

}

loadMyReports();
loadReportStats();

async function loadReportStats() {

    const { data, error } = await supabaseClient
        .from("lost and found")
        .select("type, status");

    if (error) {
        console.error("Stats Error:", error);
        return;
    }

    const totalReports = data.length;

    const lostItems = data.filter(
        item => item.type === "lost"
    ).length;

    const foundItems = data.filter(
        item => item.type === "found"
    ).length;

    const resolvedItems = data.filter(
        item => item.status === "resolved"
    ).length;


    document.getElementById("totalReports").textContent =
        totalReports;

    document.getElementById("lostItems").textContent =
        lostItems;

    document.getElementById("foundItems").textContent =
        foundItems;

    document.getElementById("resolvedItems").textContent =
        resolvedItems;
}

loadMyReports();
loadReportStats();