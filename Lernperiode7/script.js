
const button = document.getElementById("clickButton");
const message = document.getElementById("message");


button.addEventListener("click", () => {
  message.textContent = "Proof of Concept";
});