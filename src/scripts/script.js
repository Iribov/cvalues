function updateTableWrapperHeight() {
    const tableWrapper = document.querySelector(".table-wrapper");
    if (tableWrapper) {
        const offsetTop = tableWrapper.getBoundingClientRect().top + window.scrollY;
        document.documentElement.style.setProperty('--table-wrapper-top-offset', `${offsetTop}px`);
    }
}

// Run on page load and resize
document.addEventListener("DOMContentLoaded", updateTableWrapperHeight);
window.addEventListener("resize", updateTableWrapperHeight);



document.addEventListener("DOMContentLoaded", () => {
    loadHeadersIntoTable("/static/data/cvalues.zip", document.getElementById('searchResultsTable'));
});

async function loadHeadersIntoTable(url, table) {
    let csvString = await fetchAndUnzipCSV(url);
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
        rowElement.className="row"
        row.forEach(cellText => {
            const cellElement = document.createElement("td");
            cellElement.className="cell"
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

async function fetchAndUnzipCSV(url) {
    try {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      return await unzipCSVFromString(buffer);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  

async function unzipCSVFromString(zipData) {
    try {
      // Convert the ArrayBuffer to a Uint8Array
      const zipArray = new Uint8Array(zipData);
      
      // Load the zip file
      const zip = await JSZip.loadAsync(zipArray);
  
      // Find the first CSV file in the archive
      const csvFileName = Object.keys(zip.files).find(name => name.endsWith('.csv'));
      if (!csvFileName) {
        throw new Error('No CSV file found in the ZIP archive.');
      }
  
      // Extract the CSV file content as a string
      const csvContent = await zip.files[csvFileName].async('text');
      return csvContent;
  
    } catch (error) {
      console.error('Error unzipping CSV:', error);
      throw error;
    }
  }
  