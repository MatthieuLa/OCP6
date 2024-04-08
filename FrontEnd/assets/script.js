// Fetchs

let works = [];
fetch("http://localhost:5678/api/works")
  .then((response) => response.json())
  .then((data) => {
    works = data;
    const gallery = document.querySelector(".gallery");
    works.forEach((work) => {
      const figureGallery = document.createElement("figure");
      figureGallery.classList.add(`category-${work.categoryId}`);
      figureGallery.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}" />
        <figcaption>${work.title}</figcaption>
        `;
      gallery.appendChild(figureGallery);
    });
  });

// Fetch categories

fetch("http://localhost:5678/api/categories")
  .then((response) => response.json())
  .then((data) => {
    const filters = document.querySelector(".filters");
    data.forEach((category) => {
      const option = document.createElement("button");
      option.value = category.id;
      option.textContent = category.name;
      option.classList.add("filter");
      option.addEventListener("click", () => filterGallery(category.id));
      filters.appendChild(option);
    });
  });

// Filter gallery

function filterGallery(categoryId) {
  const figures = document.querySelectorAll(".gallery figure");
  figures.forEach((figure) => {
    if (!figure.classList.contains(`category-${categoryId}`)) {
      figure.style.display = "none";
    } else {
      figure.style.display = "block";
    }
  });
}

// Filter all

const filterAll = document.querySelector(".all");

filterAll.addEventListener("click", () => {
  console.log("all");
  const figures = document.querySelectorAll(".gallery figure");
  figures.forEach((figure) => {
    figure.style.display = "block";
  });
});
