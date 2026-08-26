console.log("EasyTools website loaded successfully!");

const searchInput = document.querySelector(".search-box input");

searchInput.addEventListener("input", function () {
    console.log("Searching:", searchInput.value);
});