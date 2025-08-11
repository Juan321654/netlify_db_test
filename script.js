// script.js
document.getElementById("myForm").addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent default form submission

  const form = event.target;
  const responseDiv = document.getElementById("response");
  responseDiv.textContent = ""; // Clear previous messages
  responseDiv.classList.remove("error");

  const formData = new FormData(form);
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
  };

  try {
    const response = await fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      responseDiv.textContent = result.message;
      form.reset(); // Clear the form
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
