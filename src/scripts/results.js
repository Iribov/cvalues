document.addEventListener("DOMContentLoaded", () => {
    loadIntoTable("https://jsonplaceholder.typicode.com/users", document.getElementById('searchResultsTable'));
});


async function loadIntoTable(url, table) {
    let data = await fetchData(url);
    console.log("Data received:", data);
    Insert_Table_Rows(table, data)
}

async function fetchData(url) {
    //get the data from a server
    try {
        let fetchData = await fetch(url);
        console.log("awaited fetchdata", fetchData)
        let data = await fetchData.json()
        data.forEach(element => {
            Object.defineProperty(element, "family", Object.getOwnPropertyDescriptor(element, "name"));
            Object.defineProperty(element, "crop", Object.getOwnPropertyDescriptor(element, "username"));
            Object.defineProperty(element, "cvalue", Object.getOwnPropertyDescriptor(element, "id"));
        })
        return data
    } catch (error) {
        console.error(`ERROR: ${error}`);
        return {"error": ["something went wrong..."],};
    }
}

function Insert_Table_Rows(table, data) {
    //clear the table body
    const tableBody = table.querySelector("tbody")
    tableBody.innerHTML="<tr></tr>";

    data.forEach(element => {
        let row = table.insertRow(-1);
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);
        let cell5 = row.insertCell(4);
        let cell6 = row.insertCell(5);
        let cell7 = row.insertCell(6);
        let cell8 = row.insertCell(7);
        cell1.innerHTML = element.family === undefined ? "":element.family;
        cell2.innerHTML = element.crop === undefined ? "":element.crop;
        cell3.innerHTML = element.cultivar === undefined ? "":element.cultivar;
        cell4.innerHTML = element.plant === undefined ? "":element.plant;
        cell5.innerHTML = element.cvalue === undefined ? "":element.cvalue;
        cell6.innerHTML = "";
        cell7.innerHTML = "";
        cell8.innerHTML = "";
    })
}
