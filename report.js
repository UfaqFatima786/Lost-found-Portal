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
    const title =
        document.getElementById("title").value.trim();
    const category =
        document.getElementById("category").value;
    const dateLostFound =
        document.getElementById("date_lost_found").value;
    const location =
        document.getElementById("location").value.trim();
    const description =
        document.getElementById("description").value.trim();
    const imageFile =
        document.getElementById("itemImage").files[0];
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
    let imageUrl = null;
    if (imageFile) {
        const fileName =
            `${Date.now()}-${imageFile.name}`;
        const { data: uploadData, error: uploadError } =
            await supabaseClient.storage
                .from("lost-found-images")
                .upload(fileName, imageFile);
        if (uploadError) {
            console.error(
                "Image Upload Error:",
                uploadError
            );
            alert(
                "Image upload nahi ho saki.\n\n" +
                uploadError.message
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
        console.log(
            "Image uploaded successfully:",
            uploadData
        );
        const { data: publicUrlData } =
            supabaseClient.storage
                .from("lost-found-images")
                .getPublicUrl(fileName);
        imageUrl =
            publicUrlData.publicUrl;
        console.log(
            "Image URL:",
            imageUrl
        );
    }
    const { data, error } =
        await supabaseClient
            .from("lost and found")
            .insert([
                {
                    type: type,
                    title: title,
                    category: category,
                    "date-lost-found": dateLostFound,
                    location: location,
                    description: description,
                    status: "active",
                    "img-url": imageUrl
                }
            ])
            .select();
    if (error) {
        console.error(
            "Supabase Error:",
            error
        );
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
    console.log(
        "Report successfully added:",
        data
    );
    await Swal.fire({
        icon: "success",
        title: "Congrats!",
        text: "🎉 Report successfully submitted!",
        confirmButtonText: "OK"
    });
    reportForm.reset();
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = `
            <i class="bi bi-send"></i>
            Submit Report
        `;
    }
});
const itemImage = document.getElementById("itemImage");
const imagePreview = document.getElementById("imagePreview");
itemImage.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) {
        imagePreview.innerHTML = "";
        return;
    }
    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image.");
        this.value = "";
        imagePreview.innerHTML = "";
        return;
    }
    const imageURL = URL.createObjectURL(file);
    imagePreview.innerHTML = `
        <div class="preview-container">
            <img
                src="${imageURL}"
                alt="Selected Image"
                class="preview-image">
            <button
                type="button"
                id="removeImage"
                class="remove-image">
                <i class="bi bi-x"></i>
                Remove
            </button>
        </div>
    `;
    document
        .getElementById("removeImage")
        .addEventListener("click", function () {
            itemImage.value = "";
            imagePreview.innerHTML = "";
        });
});