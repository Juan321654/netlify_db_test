document.addEventListener("DOMContentLoaded", async () => {
  let formToken = null;

  // Fetch token when page loads
  try {
    const response = await fetch("/.netlify/functions/generate-token");
    if (response.ok) {
      const data = await response.json();
      formToken = data.token; // Store token for form submission
    } else {
      console.error("Failed to fetch token");
    }
  } catch (error) {
    console.error("Error fetching token:", error);
  }

  // Form submission
  document
    .getElementById("myForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      const form = event.target;
      const responseDiv = document.getElementById("response");
      responseDiv.textContent = "";
      responseDiv.classList.remove("error");

      if (!formToken) {
        responseDiv.textContent = "Error: No token available";
        responseDiv.classList.add("error");
        return;
      }

      const formData = new FormData(form);
      const data = {
        name: formData.get("name"),
        email: formData.get("email"),
      };

      try {
        const response = await fetch(form.action, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-form-token": formToken, // Send token in header
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          responseDiv.textContent = result.message;
          form.reset();
        } else {
          responseDiv.textContent = result.error;
          responseDiv.classList.add("error");
        }
      } catch (error) {
        responseDiv.textContent = "Error submitting form";
        responseDiv.classList.add("error");
        console.error("Error:", error);
      }
    });
});
