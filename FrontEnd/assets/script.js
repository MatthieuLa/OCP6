// --------------------- Variables --------------------- //

let works = [];
let modal = null;

// Evènement pour executer le code une fois que le DOM est chargé.
window.addEventListener("DOMContentLoaded", () => {
  // Récupère le jeton d'authentification dans le stockage local.
  const token = localStorage.getItem("token");
  getWorks();
  if (token) {
    // @TODO: Faire la mise en page pour un utilisateur connecté.
    // Il est préférable de cacher (dans le HTML) les éléments qui ne sont pas nécessaires pour l'utilisateur connecté, avant de les afficher si l'utilisateur est connecté.
    const openModal = document.querySelectorAll(".open-modal");
    openModal.forEach((modal) => {
      modal.style.display = "block";
      modal.addEventListener("click", displayModal);
    });
  } else {
    getCategories();
  }
});

// ---------------------  Modal --------------------- //

function displayModal() {
  const modal = document.querySelector(".modal");
  modal.style.display = null;
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

// --------------------- Event Listeners --------------------- //

addEventListener("click", backToGallery);
addEventListener("click", btnModal);
addEventListener("click", closeModal);

// --------------------- Fonctions --------------------- //

// Boutons de fermeture des modales

function closeModal() {
  const modal1 = document.querySelector("#modal-1");
  const modal2 = document.querySelector("#modal-2");
  const closeButtons = document.querySelectorAll(".btn-close");
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      modal1.style.display = "none";
      modal1.setAttribute("aria-hidden", true);
      modal1.removeAttribute("aria-modal");
      modal2.style.display = "none";
      modal2.setAttribute("aria-hidden", true);
      modal2.removeAttribute("aria-modal");
    });
  });
}

// Fonction pour afficher la modal 2 et cacher la modal 1

function btnModal() {
  // Je cache la modal 1

  const btnModal = document.querySelector(".btn-modal");
  btnModal.addEventListener("click", () => {
    const modal1 = document.querySelector("#modal-1");
    modal1.style.display = "none";
    modal1.setAttribute("aria-hidden", true);
    modal1.removeAttribute("aria-modal");

    // J'affiche la modal 2

    const modal2 = document.querySelector("#modal-2");
    modal2.style.display = null;
    modal2.setAttribute("aria-modal", true);
    modal2.removeAttribute("aria-hidden");
  });
}

// Fonction pour revenir à la galerie depuis la modal 2

function backToGallery() {
  const backButton = document.querySelector(".btn-back");
  const modal1 = document.querySelector("#modal-1");
  const modal2 = document.querySelector("#modal-2");
  backButton.onclick = () => {
    modal1.style.display = null;
    modal1.setAttribute("aria-modal", true);
    modal1.removeAttribute("aria-hidden");
    modal2.style.display = "none";
    modal2.setAttribute("aria-hidden", true);
    modal2.removeAttribute("aria-modal");
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
