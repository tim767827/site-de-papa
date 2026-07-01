function login() {
    const code = document.getElementById("code").value;

    if (code === "0903123") {

        // Autoriser l'accès au dashboard
        sessionStorage.setItem("admin", "true");

        // Redirection
        window.location.href = "dashboard.html";

    } else {
        alert("TU T'ES TROMPÉ CHEF !");
    }
}