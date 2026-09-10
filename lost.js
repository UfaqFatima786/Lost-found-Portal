
const lostContainer = document.getElementById("lostItems");

async function loadLostItems() {

    const { data, error } = await supabaseClient
        .from("lost and found")
        .select("*")
        .eq("type", "lost")
        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.error("Supabase Error:", error);

        lostContainer.innerHTML = `
            <div class="no-items">
                <i class="bi bi-exclamation-circle"></i>
                <h3>Something went wrong</h3>
                <p>Unable to load lost items.</p>
            </div>
        `;

        return;
    }

    console.log("Lost Items:", data);
    if (!data || data.length === 0) {

        lostContainer.innerHTML = `
            <div class="no-items">
                <i class="bi bi-search"></i>
                <h3>No Lost Items Found</h3>
                <p>There are currently no lost item reports.</p>
            </div>
        `;

        return;
    }
    lostContainer.innerHTML = "";
    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "item-card";
        card.innerHTML = `
            <div class="item-card-content">
                <span class="item-badge">
                    LOST
                </span>
                <h3>
                    ${item.title}
                </h3>
                <p class="item-category">
                    ${item.category}
                </p>
                <p class="item-description">
                    ${item.description || "No description provided."}
                </p>
                <div class="item-details">
                    <span>
                        <i class="bi bi-geo-alt"></i>
                        ${item.location}
                    </span>
                </div>
            </div>
        `;
        lostContainer.appendChild(card);
    });
}

loadLostItems();