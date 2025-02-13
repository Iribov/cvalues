const cvaluesTable = document.getElementById("searchResultsTable")

document.addEventListener("DOMContentLoaded", () => {
    // Retrieve the data from sessionStorage
    loadInputValues()
});

async function Search() {

    //put the input to storage
    setInputValues()

    // Now navigate to the results page
    window.location.href = "/src/pages/results.html";
}

function setInputValues() {
    //put the values in storage for persistence
    sessionStorage.setItem('family', document.getElementById('FamilyNameInput').value)
    sessionStorage.setItem('crop', document.getElementById('CropNameInput').value)
    sessionStorage.setItem('cultivar', document.getElementById('CultivarNameInput').value)
    sessionStorage.setItem('plant', document.getElementById('PlantNameInput').value)
}

function loadInputValues() { 
    //get values from storage and populate the inputs
    document.getElementById('FamilyNameInput').value = sessionStorage.getItem('family')
    document.getElementById('CropNameInput').value = sessionStorage.getItem('crop')
    document.getElementById('CultivarNameInput').value = sessionStorage.getItem('cultivar')
    document.getElementById('PlantNameInput').value = sessionStorage.getItem('plant')
}