async function signup() {

    const signupName = document.getElementById("signup-name").value.trim();
    const signupEmail = document.getElementById("signup-email").value.trim();
    const signupPassword = document.getElementById("signup-password").value;

    if (signupName === "" || signupEmail === "" || signupPassword === "") {
        Swal.fire({
            icon: "warning",
            title: "Missing Fields",
            text: "Please enter your name, email and password"
        });
        return;
    }

    try {

        const { data, error } = await supabaseClient.auth.signUp({
            email: signupEmail,
            password: signupPassword,
            options: {
                data: {
                    full_name: signupName
                }
            }
        });

        console.log("Signup Data:", data);
        console.log("Signup Error:", error);

        if (error) {
            Swal.fire({
                icon: "error",
                title: "Signup Failed",
                text: error.message
            });
            return;
        }

        Swal.fire({
            icon: "success",
            title: "Signup Successful",
            text: "Your account has been created!"
        }).then(() => {
            if (data.session) {
                window.location.href = "portal.html";
            } else {
                    Swal.fire({
                    icon: "info",
                    title: "Confirm your email",
                    text: "Please check your email to confirm your account, then login."
                }).then(() => {
                    window.location.href = "login.html";
                });
            }
        });

    } catch (error) {

        console.error("Signup Error:", error);

        Swal.fire({
            icon: "error",
            title: "Something went wrong",
            text: error.message
        });
    }
}


async function login() {

    const loginEmail = document.getElementById("login-email").value.trim();
    const loginPass = document.getElementById("login-password").value;

    if (loginEmail === "" || loginPass === "") {
        Swal.fire({
            icon: "warning",
            title: "Empty Fields",
            text: "Please enter email and password"
        });
        return;
    }

    try {

        const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: loginEmail,
    password: loginPass
});

        console.log("Login Data:", data);
        console.log("Login Error:", error);

        if (error) {
            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: error.message
            });
            return;
        }

        Swal.fire({
            icon: "success",
            title: "Login Successful",
            text: "Welcome back!"
        }).then(() => {
            window.location.href = "portal.html";
        });

    } catch (error) {

        console.error("Login Error:", error);

        Swal.fire({
            icon: "error",
            title: "Something went wrong",
            text: error.message
        });
    }
}


function tosignup() {
    window.location.href = "signup.html";
}


function tologin() {
    window.location.href = "login.html";
}