document.addEventListener("DOMContentLoaded", async () => {
  let formToken = null;

  // Fetch token when page loads
  try {
    const response = await fetch("/.netlify/functions/generate-token");
    if (response.ok) {
      const data = await response.json();
      formToken = data.token;
    } else {
      console.error("Failed to fetch token");
    }
  } catch (error) {
    console.error("Error fetching token:", error);
  }

  // Function to fetch and display users
  const fetchUsers = async () => {
    if (!formToken) {
      console.error("No token available for fetching users");
      return;
    }

    try {
      const response = await fetch("/.netlify/functions/get-users", {
        headers: {
          "x-form-token": formToken,
        },
      });
      const data = await response.json();

      if (response.ok) {
        const usersBody = document.getElementById("usersBody");
        usersBody.innerHTML = "";
        data.users.forEach((user) => {
          const row = document.createElement("tr");
          row.innerHTML = `<td>${user.name}</td><td>${user.email}</td>`;
          usersBody.appendChild(row);
        });
      } else {
        console.error("Error fetching users:", data.error);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch users on page load
  fetchUsers();

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
            "x-form-token": formToken,
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          responseDiv.textContent = result.message;
          form.reset();
          fetchUsers(); // Refresh users table after submission
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
