(async function () {

    const { data, error } = await supabaseClient.auth.getUser();
    const user = data ? data.user : null;

    if (!user) return;

    const displayName = (user.user_metadata && user.user_metadata.full_name)
        ? user.user_metadata.full_name
        : user.email;

    const navBtn = document.getElementById("navLoginBtn");
    const mobileBtn = document.getElementById("mobileLoginBtn");

    [navBtn, mobileBtn].forEach((btn) => {
        if (!btn) return;

        btn.innerHTML = "";

        const icon = document.createElement("i");
        icon.className = "bi bi-person-check-fill";
        btn.appendChild(icon);
        btn.appendChild(document.createTextNode(" " + displayName));

        btn.href = "#";
        btn.title = "Click to logout";
        btn.addEventListener("click", handleLogout);
    });

    async function handleLogout(e) {
        e.preventDefault();

        const result = await Swal.fire({
            icon: "question",
            title: "Logout?",
            text: "Are you sure to logout?",
            showCancelButton: true,
            confirmButtonText: "Yes, logout",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            await supabaseClient.auth.signOut();
            window.location.href = "index.html";
        }
    }

})();
