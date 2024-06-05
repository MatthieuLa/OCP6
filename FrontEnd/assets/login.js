// Form login
const loginForm = document.querySelector("#contact");
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  // Affiche les données dans la console pour vérification
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
        return response.json();
      } else {
        throw new Error("Email ou mot de passe incorrect");
      }
    })
    .then((data) => {
      // Je récupère le token et le stocke dans le local storage
      const token = data.token;
      localStorage.setItem("token", token);
      window.location.href = `index.html`;
    })
    .catch((error) => {
      console.error(error);
      // Affiche une erreur s'il y en a une
      alert(error.message);
    });
});
