const botones = document.querySelectorAll(".btn-toggle");

botones.forEach(btn => {
  btn.addEventListener("click", () => {
    btn.parentElement.classList.toggle("active");
  });
});