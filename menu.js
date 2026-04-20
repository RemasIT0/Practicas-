const nav = document.querySelector("#nav");
const abrir = document.querySelector("#abrir");
const cerrar = document.querySelector("#cerrar");

abrir.addEventListener("click", () => {
   nav.classList.add("visible");
});

cerrar.addEventListener("click", () => {
   nav.classList.remove("visible");
});

// Tarjetas
const botones = document.querySelectorAll(".btn-toggle");

botones.forEach(btn => {
  btn.addEventListener("click", () => {
    btn.parentElement.classList.toggle("active");
  });
});