console.log("test");

// Form login
const loginForm = document.querySelector("#contact");
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);

  const loginData = {
    email: email.toLowerCase(), // Convertit le mail en minuscules pour l'API
    password: password,
  };

  console.log(`Login Data: ${JSON.stringify(loginData)}`);

  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = "./index.html";
        console.log("Login successful");
        alert("Vous êtes maintenant connecté");
      } else {
        throw new Error("Login failed");
      }
    })
    .catch((error) => {
      console.error(error);
      // Affiche une erreur s'il y en a une
      alert("Email ou mot de passe incorrect");
    });
});
