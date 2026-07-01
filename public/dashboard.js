document.addEventListener("DOMContentLoaded", () => {

    async function loadClients() {
        try {
            const res = await fetch("/api/clients");
            const data = await res.json();

            const table = document.getElementById("table");
            table.innerHTML = "";

            data.forEach(client => {
                table.innerHTML += `
                    <tr>
                        <td>${client.nom}</td>
                        <td>${client.prenom}</td>
                        <td>${client.email}</td>
                        <td>${client.telephone}</td>
                        <td>
                            <button class="delete-btn" onclick="deleteClient(${client.id})">
                                Supprimer
                            </button>
                        </td>
                    </tr>
                `;
            });
            document.getElementById("total").textContent = data.length;

        } catch (err) {
            console.error("Erreur load:", err);
        }
    }

    window.deleteClient = async function(id) {
        if (!confirm("Supprimer ce client ?")) return;

        try {
            await fetch("/api/clients/" + id, {
                method: "DELETE"
            });

            loadClients();

        } catch (err) {
            console.error("Erreur delete:", err);
        }
    }

    loadClients();

});
function rechercher() {

    const filtre = document
        .getElementById("recherche")
        .value
        .toLowerCase();

    const lignes = document.querySelectorAll("#table tr");

    lignes.forEach(ligne => {

        if (ligne.innerText.toLowerCase().includes(filtre)) {
            ligne.style.display = "";
        } else {
            ligne.style.display = "none";
        }

    });

}