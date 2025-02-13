async function loadIntoTable(url, table) {
    const tableHead = table.querySelector('thead');
    const tableBody = table.querySelector('tbody');
    const response = await fetch(url);
    const data = response.json();
    console.log(data)
}

loadIntoTable('https://jsonplaceholder.typicode.com/users"',document.querySelector('searchResultsTable'))