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

        const card = document.createElement("div");

        card.className = "report-card";

        card.innerHTML = `

            <div class="report-image">

                <div class="report-type ${item.type === "lost"
                ? "lost-type"
                : "found-type"
            }">

                    <i class="bi ${item.type === "lost"
                ? "bi-search"
                : "bi-check-circle"
            }"></i>

                    ${item.type.toUpperCase()}

                </div>

                <div class="image-placeholder">

                    <i class="bi bi-image"></i>

                </div>

            </div>


            <div class="report-content">

                <div class="report-top">

                    <div>

                        <span class="category-label">
                            ${item.category || "Other"}
                        </span>

                        <h3>
                            ${item.title}
                        </h3>

                    </div>

                    <span class="status-badge active-status">
                        ${item.status || "active"}
                    </span>

                </div>


                <p class="report-description">
                    ${item.description ||
            "No description provided."
            }
                </p>


                <div class="report-info">

                    <span>
                        <i class="bi bi-geo-alt"></i>
                        ${item.location || "Unknown"}
                    </span>

                </div>


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

async function editReport(id) {
    const { data, error } = await supabaseClient
        .from("lost and found")
        .select("*")
        .eq("id", id)
        .single();


    if (error) {

        console.error(error);

        alert("Report load nahi ho saki.");

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

        alert(
            "Report update nahi ho saki.\n\n" +
            updateError.message
        );

        return;
    }


    alert(
        "✅ Report successfully updated!"
    );

    loadMyReports();
}

async function deleteReport(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this report?"
    );

    if (!confirmDelete) {
        return;
    }

    const { error } = await supabaseClient
        .from("lost and found")
        .delete()
        .eq("id", id);

    if (error) {

        console.error("Delete Error:", error);

        alert(
            "Report delete nahi ho saki.\n\n" +
            error.message
        );

        return;
    }

    alert("🗑️ Report successfully deleted!");

    loadMyReports();
}

loadMyReports();