const reportForm = document.getElementById("reportForm");
reportForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const selectedType = document.querySelector(
        'input[name="type"]:checked'
    );

    if (!selectedType) {
        alert("Please select Lost or Found.");
        return;
    }
    const type = selectedType.value;
    const title = document.getElementById("title").value.trim();
    const category =
        document.getElementById("category").value;
    const dateLostFound =
        document.getElementById("date_lost_found").value;
    const location =
        document.getElementById("location").value.trim();
    const description =
        document.getElementById("description").value.trim();
    if (!title || !category || !location || !description) {
        alert("Please fill all required fields.");
        return;
    }
    const submitButton =
        document.getElementById("submitReport");
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <i class="bi bi-arrow-repeat"></i>
            Submitting...
        `;
    }
    const { data, error } = await supabaseClient
        .from("lost and found")
        .insert([
            {
                type: type,
                title: title,
                category: category,
                location: location,
                description: description,
                status: "active"
            }
        ])
        .select();
    if (error) {
        console.error("Supabase Error:", error);
        alert(
            "Report submit nahi ho saki.\n\n" +
            error.message
        );
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = `
                <i class="bi bi-send"></i>
                Submit Report
            `;
        }

        return;
    }
    console.log("Report successfully added:", data);
    // alert("🎉 Report successfully submitted!");
      Swal.fire({
            icon: "success",
            title: "Congrats!",
            text: "🎉 Report successfully submitted!"
        })
    reportForm.reset();
    if (submitButton) {

        submitButton.disabled = false;

        submitButton.innerHTML = `
            <i class="bi bi-send"></i>
            Submit Report
        `;
    }

});