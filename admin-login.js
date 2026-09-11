const loginForm = document.getElementById("adminLoginForm");

const emailInput = document.getElementById("adminEmail");
const passwordInput = document.getElementById("adminPassword");

const loginBtn = document.getElementById("loginBtn");
const togglePassword = document.getElementById("togglePassword");


togglePassword.addEventListener("click", () => {

    const icon = togglePassword.querySelector("i");

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");

    } else {

        passwordInput.type = "password";

        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");

    }

});

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    loginBtn.disabled = true;

    loginBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Logging in...
    `;

    try {

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            throw error;
        }


        const user = data.user;
        const { data: profile, error: profileError } =
            await supabaseClient
                .from("profiles")
                .select("id, full_name, email, role")
                .eq("id", user.id)
                .single();


        if (profileError) {
            throw profileError;
        }

        if (profile.is_blocked === true) {

            await supabaseClient.auth.signOut();

            throw new Error(
                "Your account has been blocked."
            );
        }

        if (profile.role !== "admin") {

            await supabaseClient.auth.signOut();

            throw new Error(
                "Access denied. Admin account required."
            );
        }

        sessionStorage.setItem(
            "adminLoggedIn",
            "true"
        );

        sessionStorage.setItem(
            "adminName",
            profile.full_name || "Admin"
        );

        await Swal.fire({
            icon: "success",
            title: "Login Successful",
            text: "Welcome to Admin Panel!",
            timer: 1500,
            showConfirmButton: false
        });


        window.location.href = "admin.dashboard.html";


    } catch (error) {

        console.error(error);


        Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: error.message || "Please check your email and password."
        });


        loginBtn.disabled = false;

        loginBtn.innerHTML = `
            <i class="fa-solid fa-right-to-bracket"></i>
            Login as Admin
        `;

    }

});