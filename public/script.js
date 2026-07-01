document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("form");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const inputs = document.querySelectorAll("input");

        const data = {
            nom: inputs[0].value,
            prenom: inputs[1].value,
            email: inputs[2].value,
            telephone: inputs[3].value
        };

        try {
            const res = await fetch("/api/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            console.log("AJOUT OK:", result);

            alert("Client enregistré !");
            form.reset();

        } catch (err) {
            console.error("Erreur ajout:", err);
        }
    });

});