const foundContainer = document.getElementById("foundItems");
async function loadFoundItems() {
    const { data, error } = await supabaseClient
        .from("lost and found")
        .select("*")
        .eq("type", "found")
        .order("id", {
            ascending: false
        });
    if (error) {
        console.error("Found Error:", error);
        return;
    }
    console.log("Found Items:", data);
    foundContainer.innerHTML = "";
    if (!data || data.length === 0) {
        foundContainer.innerHTML = `
            <div class="no-items">
                <h3>No Found Items</h3>
                <p>There are currently no found item reports.</p>
            </div>
        `;
        return;
    }
    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "item-card";
        card.innerHTML = `
            <div class="item-card-content">
                <span class="item-badge">
                    FOUND
                </span>
                <h3>${item.title}</h3>
                <p>${item.category || "Other"}</p>
                <p>
                    ${item.description || "No description provided."}
                </p>
                <span>
                    <i class="bi bi-geo-alt"></i>
                    ${item.location || "Unknown"}
                </span>
            </div>
        `;
        foundContainer.appendChild(card);
    });
}
loadFoundItems();