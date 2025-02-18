document.addEventListener("DOMContentLoaded", () => {
    loadHeadersIntoTable("/static/data/cvalues.csv", document.getElementById('searchResultsTable'));
});

async function loadHeadersIntoTable(url, table) {
    let csvString = await fetchData(url);
    let data = parseCSV(csvString);
    const headers = data[0];
    const values = data.slice(1);

    sessionStorage.headers = JSON.stringify(headers);
    sessionStorage.data = JSON.stringify(values);
    sessionStorage.filters = JSON.stringify({});

    Insert_Table_Header(table, headers);
}

function initializeSearchBoxEvent(table) {
    const elements = document.getElementsByClassName("searchTextBox");
    const myFunction = async function () {
        let filters = JSON.parse(sessionStorage.filters);
        let value = this.value.trim();

        if (value === "") {
            delete filters[this.id];
        } else {
            filters[this.id] = value;
        }

        sessionStorage.filters = JSON.stringify(filters);
        let filteredData = await searchTable(filters, JSON.parse(sessionStorage.data));
        Insert_Table_Rows(table, filteredData);
    };

    for (let element of elements) {
        element.addEventListener('keyup', debounce(myFunction, 500), false);
    }

    // Show all button
    const showAllButton = document.getElementById('ShowAllButton');
    showAllButton.addEventListener('click', () => {
        Insert_Table_Rows(table, JSON.parse(sessionStorage.data));
    });
}

async function fetchData(url) {
    try {
        let fetchData = await fetch(url);
        return await fetchData.text();
    } catch (error) {
        console.error(`ERROR: ${error}`);
        return "";
    }
}

function parseCSV(csvString) {
    const rows = csvString.trim().split('\n');
    return rows.map(row => row.split(';'));
}

function Insert_Table_Header(table, headers) {
    const tableHeader = table.querySelector("thead");
    tableHeader.innerHTML = "";

    const searchHeaderRow = document.createElement("tr");
    const headerTextRow = document.createElement("tr");

    headers.forEach((headerText, index) => {
        const searchHeaderElement = document.createElement("th");
        const searchElement = document.createElement("input");
        searchElement.id = index;
        searchElement.type = "text";
        searchElement.className = "searchTextBox";
        searchHeaderElement.appendChild(searchElement);
        searchHeaderRow.appendChild(searchHeaderElement);

        const headerElement = document.createElement("th");
        headerElement.textContent = headerText;
        headerElement.className = "headers";
        headerTextRow.appendChild(headerElement);
    });

    tableHeader.appendChild(searchHeaderRow);
    tableHeader.appendChild(headerTextRow);
    initializeSearchBoxEvent(table);
}

function Insert_Table_Rows(table, data) {
    const tableBody = table.querySelector("tbody");
    tableBody.innerHTML = "";

    const fragment = document.createDocumentFragment();

    data.forEach(row => {
        const rowElement = document.createElement("tr");
        row.forEach(cellText => {
            const cellElement = document.createElement("td");
            cellElement.textContent = cellText;
            rowElement.appendChild(cellElement);
        });
        fragment.appendChild(rowElement);
    });

    tableBody.appendChild(fragment);
}

async function searchTable(filters, data) {
    if (Object.keys(filters).length === 0) {
        return data;
    }

    return data.filter(row => {
        return Object.entries(filters).every(([key, value]) => {
            let cellValue = row[Number(key)].toLowerCase();
            return cellValue.includes(value.toLowerCase());
        });
    });
}

function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}
