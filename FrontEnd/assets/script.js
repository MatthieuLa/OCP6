// --------------------- Variables --------------------- //

let works = [];
let uploadWorkInitialized = false; // Variable pour savoir si la fonction uploadWork a déjà été initialisée.

// ---------------------  DOM Listener --------------------- //

// Evènement pour executer le code une fois que le DOM est chargé.
window.addEventListener("DOMContentLoaded", () => {
  // Récupère le jeton d'authentification dans le stockage local.
  const token = localStorage.getItem("token");
  getWorks();
  if (token) {
    const openModal = document.querySelectorAll(".open-modal");
    openModal.forEach((modal) => {
      modal.style.display = "flex";
      modal.addEventListener("click", displayModal);
    });
  } else {
    getCategories();
  }
});

// ---------------------  Modal --------------------- //

function displayModal() {
  const modal = document.querySelector(".modal");
  modal.style.display = "flex";
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", true);
}

// ---------------------  Fetch Modal --------------------- //

fetch("http://localhost:5678/api/works")
  .then((response) => response.json())
  .then((works) => {
    // Fonction renderWorksInModal
    const modalGallery = document.querySelector(".modal-gallery");
    works.forEach((work) => {
      const figureGallery = document.createElement("figure");
      figureGallery.innerHTML = `
      <div class="modal-trash">
      <i class="fa-solid fa-trash-can"></i></div>
          <img src="${work.imageUrl}" alt="${work.title}" class
          ="modal-image" />
          
        `;
      modalGallery.appendChild(figureGallery);

      // -------------- Supprimer un travail depuis la modal -------------- //

      // J'intégre le bouton de suppression dans la modal à partir du fetch de l'api pour que cela fonctionne

      const trashModal = figureGallery.querySelector(".modal-trash");
      trashModal.addEventListener("click", () => {
        // J'appelle la fonction deleteWork avec l'id du work fetch dans l'api
        if (confirm("Voulez-vous vraiment supprimer cette photo ?")) {
          deleteWork(work.id)
            .then(() => {
              figureGallery.remove();
            })
            .catch((error) => {
              console.error(error.message);
            });
        }
      });
    });
  });

// --------------------- QuerySelectors --------------------- //

const uploadForm = document.querySelector(".upload-form");
const btnUpload = document.querySelector(".btn-upload");
const fileInput = document.querySelector("#file-input");
const uploadIcon = document.querySelector(".upload-icon");
const modalUploaded = document.querySelector(".modal-uploaded");
const uploadRestriction = document.querySelector(".upload-restriction");
const btnValidate = document.querySelector(".btn-modal__validate");
const modalGallery = document.querySelector("#modal-gallery");
const modalUpload = document.querySelector("#modal-upload");
const closeButtons = document.querySelectorAll(".btn-close");
const titleInput = document.querySelector("#title");
const categorySelect = document.querySelector("#category");

// --------------------- Event Listeners --------------------- //

addEventListener("click", backToGallery);
addEventListener("click", btnModal);

btnUpload.addEventListener("click", () => {
  fileInput.click();
});

closeButtons.forEach((button) => {
  button.addEventListener("click", closeModal);
});

// Le formulaire doit inclure les différent inputs, et l'évènement pour l'envoi des données doit se faire lors de la soumission du formulaire.#category
uploadForm.addEventListener("submit", (event) => {
  event.preventDefault();
  uploadIcon.style.display = "none";
  btnUpload.style.display = "none";
  uploadRestriction.style.display = "none";

  // Créer un FormData en utilisant le formulaire. Les valeurs seront pré-remplies en fonction du name (key) et de la valeur des inputs (value).
  const formData = new FormData(uploadForm);

  if (
    !formData.get("title").trim() ||
    !formData.get("category") ||
    !formData.get("image")
  ) {
    alert("Une information est manquante au sein du formulaire.");
  } else {
    uploadWork(formData);
  }
});

// Evènement pour afficher l'image uploadée dans la modal et alerter si le fichier est trop gros.

fileInput.addEventListener("change", function () {
  const maxFileSize = 4 * 1024 * 1024; // 4MB

  if (this.files[0].size > maxFileSize) {
    alert(
      "Le fichier est trop gros, veuillez choisir un fichier de moins de 4MB."
    );
    this.value = "";
  } else {
    const fileURL = URL.createObjectURL(this.files[0]);
    modalUploaded.src = fileURL;
    modalUploaded.style.display = "block";
    uploadIcon.style.display = "none";
    btnUpload.style.display = "none";
    uploadRestriction.style.display = "none";
    // Création des éléments img et figcaption
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figCaption = document.createElement("figcaption");
    // J'ajoute l'img et le figcaption dans la gallery
    figure.appendChild(img);
    figure.appendChild(figCaption);
  }
  uploadWorkInitialized = true; // J'indique que la fonction a été initialisée. Cela évite de répéter l'ajout des évènements et d'uploader plusieurs fois le même travail.
});

//  --------------------- Fonctions --------------------- //

function uploadWork(form) {
  const token = localStorage.getItem("token");
  fetch("http://localhost:5678/api/works", {
    // a remplire avec le bon fetch.
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  })
    .then((response) => response.json())
    .then((data) => {
      addUploadedWorkToGallery(data);
      validateUpload();
    })
    .catch((error) => {
      console.error("Erreur lors du téléchargement de l'image :", error);
    });

  // Si uploadWorkInitialized est faux, on initialise les évènements.
  if (!uploadWorkInitialized) {
    btnUpload.addEventListener("click", () => {
      console.log("UploadWork");
      fileInput.click();
    });

    const btnAddPhoto = document.querySelector(".btn-modal");
    btnAddPhoto.addEventListener("click", () => {
      const modalUpload = document.querySelector("#modal-upload");
      modalUpload.style.display = "flex";
    });
  }
}

function addUploadedWorkToGallery(work) {
  const gallery = document.querySelector(".gallery");
  const figureGallery = document.createElement("figure");
  figureGallery.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}" />
        <figcaption>${work.title}</figcaption>
        `;
  gallery.appendChild(figureGallery);
}

// --------------------- Fonctions --------------------- //

// Fonction qui ajoute les catégories de travaux dynamiquement en fonction de l'api.

function modalCategory() {
  const modalCategory = document.querySelector("#category");
  // Si la modal contient déjà des enfants, on ne fait rien (permet d'éviter de dupliquer les catégories à chaque ouverture de la modal)
  if (modalCategory.children.length > 0) return;
  modalCategory.innerHTML = "";

  fetch("http://localhost:5678/api/categories")
    .then((response) => response.json())
    .then((data) => {
      modalCategory.innerHTML = "";
      data.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        modalCategory.appendChild(option);
      });
    });
}

const inputs = [fileInput, titleInput, categorySelect];
for (let input of inputs) {
  input.addEventListener("input", validateInputs);
}

function validateInputs() {
  console.log(!!titleInput.value.trim());
  console.log(!!Number(categorySelect.value));
  console.log(!!fileInput.files[0]);
  if (
    titleInput.value.trim() &&
    Number(categorySelect.value) &&
    fileInput.files[0]
  ) {
    btnValidate.style.backgroundColor = "#1E6154";
    btnValidate.disabled = false;
    btnValidate.removeAttribute("disabled");
  } else {
    btnValidate.style.backgroundColor = "#A7A7A7";
    btnValidate.disabled = true;
  }
}

// Bouton valider pour la modal 2, il est important de le nesté ici pour bien afficher la modal

function validateUpload(event) {
  // Empêchez l'action par défaut du bouton validate pour éviter la boucle alert
  if (event) {
    event.preventDefault();
  }
  modalUploaded.style.display = "none";
  fileInput.value = "";
  uploadIcon.style.display = "block";
  btnUpload.style.display = "flex";
  uploadRestriction.style.display = "block";
}

// Boutons de fermeture des modales

function closeModal() {
  modalGallery.style.display = "none";
  modalGallery.setAttribute("aria-hidden", true);
  modalGallery.removeAttribute("aria-modal");
  modalUpload.style.display = "none";
  modalUpload.setAttribute("aria-hidden", true);
  modalUpload.removeAttribute("aria-modal");
}

// Fonction pour afficher la modal 2 et cacher la modal 1

function btnModal() {
  // Je cache la modal 1

  const btnModal = document.querySelector(".btn-modal");
  btnModal.addEventListener("click", () => {
    modalGallery.style.display = "none";
    modalGallery.setAttribute("aria-hidden", true);
    modalGallery.removeAttribute("aria-modal");

    // J'affiche la modal 2

    modalUpload.style.display = "flex";
    modalUpload.setAttribute("aria-modal", true);
    modalUpload.removeAttribute("aria-hidden");
    modalCategory();
  });
}

// Fonction pour revenir à la galerie depuis la modal 2

function backToGallery() {
  const backButton = document.querySelector(".btn-back");
  backButton.onclick = () => {
    modalGallery.style.display = null;
    modalGallery.setAttribute("aria-modal", true);
    modalGallery.removeAttribute("aria-hidden");
    modalUpload.style.display = "none";
    modalUpload.setAttribute("aria-hidden", true);
    modalUpload.removeAttribute("aria-modal");
  };
}

// Fonction pour récupérer les travaux.

function getWorks() {
  fetch("http://localhost:5678/api/works")
    .then((response) => response.json())
    .then((data) => {
      works = data;
      renderWorks(works);
      // renderWorksInModal(works);
    });
}

// Fonction pour afficher les travaux.

function renderWorks(works) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";
  works.forEach(addWorkToGallery);
}

// Fonction pour ajouter un travail à la galerie.

function addWorkToGallery(work) {
  const gallery = document.querySelector(".gallery");
  const figureGallery = document.createElement("figure");
  figureGallery.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}" />
        <figcaption>${work.title}</figcaption>
        `;
  gallery.appendChild(figureGallery);
}

// Fetch categories

function getCategories() {
  fetch("http://localhost:5678/api/categories")
    .then((response) => response.json())
    .then((data) => {
      const filters = document.querySelector(".filters");
      filters.innerHTML = `<button class="filter all">Tous</button>`;
      // Ajout de l'évènement pour afficher tous les travaux.
      const filterAll = document.querySelector(".all");
      filterAll.addEventListener("click", getWorks);
      // Ajout des filtres de catégories.
      data.forEach((category) => {
        const option = document.createElement("button");
        option.value = category.id;
        option.textContent = category.name;
        option.classList.add("filter");
        option.addEventListener("click", () => filterGallery(category.id));
        filters.appendChild(option);
      });
    });
}

// Filter gallery

function filterGallery(categoryId) {
  // On filtre les travaux en fonction de la catégorie.
  const filteredWorks = works.filter((work) => work.categoryId === categoryId);
  // On affiche les travaux filtrés.
  renderWorks(filteredWorks);
}

async function deleteWork(id) {
  // Exemple de requête DELETE avec le jeton d'authentification passé en en-tête.
  const response = await fetch(`http://localhost:5678/api/works/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (response.ok) {
    works = works.filter((work) => work.id !== id);
    renderWorks(works);
  } else {
    throw Error("Une erreur est survenue lors de la suppression d'une photo.");
  }
}
