 const menuBtn = document.getElementById("menuBtn");
        const mobileMenu = document.getElementById("mobileMenu");

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