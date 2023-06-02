'use strict';

const siteController = {
    htmlBuffer: '',
    validFerryIDs: null,
    validTerminalIDs: null,
    htmlWriteTarget: document.querySelector('main#main'),
    htmlCardsWriteTarget: null,
    navFunctionalityRunning: false,
    ferriesArray: null,
    terminalsArray: null,
    ferriesSearchArray: null,
    terminalsSearchArray: null,
    singleFerryObject: null,
    singleTerminalObject: null,
    captureValidFerryIDs: async function () {
        await fetch('./valid-ferry-ids.php')
            .then((response) => response.json())
            .then((responseJSON) => {
                this.validFerryIDs = responseJSON;
            });
    },
    captureValidTerminalIDs: async function() {
        await fetch('./valid-terminal-ids.php')
            .then((response) => response.json())
            .then((responseJSON) => {
                this.validTerminalIDs = responseJSON;
            });
    },
    router: async function() {
        if (this.navFunctionalityRunning === false) {
            this.navFunctionality();
        };
        let capturedURL = window.location.href;
        if (capturedURL.includes('#')) {
            let urlHashPosition = capturedURL.indexOf('#')+2;
            let capturedPageID = capturedURL.substring(urlHashPosition);
            if (capturedPageID.substring(0,7) === 'ferries') {
                if (capturedPageID.substring(8).includes('f')) {
                    await this.captureValidFerryIDs();
                    let capturedSingleFerryPageID = capturedPageID.substring(8);
                    if (this.validFerryIDs.includes(capturedSingleFerryPageID)) {
                        this.createSingleFerryPage(capturedSingleFerryPageID);
                    } else {
                        this.create404();
                    };
                } else {
                    this.createFerriesPage();
                };
            } else if (capturedPageID.substring(0,9) === 'terminals') {
                if (capturedPageID.substring(10).includes('t')) {
                    await this.captureValidTerminalIDs();
                    let capturedSingleTerminalPageID = capturedPageID.substring(10);
                    if (this.validTerminalIDs.includes(capturedSingleTerminalPageID)) {
                        this.createSingleTerminalPage(capturedSingleTerminalPageID);
                    } else {
                        this.create404();
                    };
                } else {
                    this.createTerminalsPage();
                }
            } else if (capturedPageID.substring(0,6) === 'search') {
                if (capturedPageID.substring(7,8) === 'f') {
                    let ferrySearchQuery = capturedPageID.substring(9);
                    ferrySearchQuery = ferrySearchQuery.replace('%20', ' ');
                    this.createFerriesSearchPage(ferrySearchQuery);
                } else if (capturedPageID.substring(7,8) === 't') {
                    let terminalSearchQuery = capturedPageID.substring(9);
                    ferrySearchQuery = ferrySearchQuery.replace('%20', ' ');
                    this.createTerminalsSearchPage(terminalSearchQuery);
                };
            };
        } else {
            scroll(0,0);
            this.createMainPage();
        };
    },
    create404: function() {
        this.htmlWriteTarget.innerHTML = '';
        this.htmlBuffer = `
            <h2>Error 404</h2>
            <p>Sorry, page was not found.</p>`;
        this.htmlWriteTarget.innerHTML = this.htmlBuffer;
    },
    navFunctionality: function() {
        this.navFunctionalityRunning = true;
        let searchField = document.getElementById('search-field');
        let searchFieldInput = '';
        let ferrySearchButton = document.getElementById('ferry-search-button');
        let terminalSearchButton = document.getElementById('terminal-search-button');
        let menuExpandButton = document.getElementById('nav-menu-button');
        let menuExpanded = false;
        menuExpandButton.addEventListener('click', function() {
            if (menuExpanded === false) {
                document.getElementById('nav').style.height = '11.6rem';
                menuExpanded = true;
            } else {
                document.getElementById('nav').style.height = '0rem';
                menuExpanded = false;
            };
        });
        ferrySearchButton.addEventListener('click', function() {
            searchFieldInput = searchField.value;
            window.location.href = `http://localhost/bcfarchive/#/search/f/${searchFieldInput}`;
        });
        terminalSearchButton.addEventListener('click', function() {
            searchFieldInput = searchField.value;
            window.location.href = `http://localhost/bcfarchive/#/search/t/${searchFieldInput}`;
        });
    },
    createMainPage: function() {
        this.htmlWriteTarget.innerHTML = '';
        this.htmlBuffer = `
            <section id="home-info-section">
                <p id="home-info-header">ATTENTION</p>
                <p>This site has absolutely no affiliation whatsoever with BC Ferries/British Columbia Ferry Services Inc..  This is merely a fan site.  Being as such, much of the information here may be out of date.  Better resources with more up to date/accurate information can be found on the credits page.</p>
            </section>
            <section id="home-category-section">
                <h2>Categories</h2>
                <div class="category-card" id="ferry-cat-card">
                    <a href="#/ferries/">
                        Ferries
                    </a>
                </div>
                <div class="category-card" id="terminal-cat-card">
                    <a href="#/terminals/">
                        Terminals
                    </a>
                </div>
            </section>`;
        this.htmlWriteTarget.innerHTML = this.htmlBuffer;
    },
    captureFerriesArray: async function(sortType) {
        if (sortType) {
            await fetch('./ferries-data.php', {
                method: "POST",
                body: JSON.stringify(sortType)
            })
            .then((response) => response.json())
            .then((responseJSON) => {
                    this.ferriesArray = responseJSON;
            });
        } else {
            await fetch('./ferries-data.php')
                .then((response) => response.json())
                .then((responseJSON) => {
                    this.ferriesArray = responseJSON;
            });
        };
    },
    ferrySortFunctionality: function() {
        let ferrySortData = [null, 0];
        let ferrySortButtons = document.ferrySortRadio.ferrySort;
        let prevSortRadioValue = null;
        let ferryOrderButtons = document.ferrySortOrderRadio.ferrySortOrder;
        let prevOrderRadioValue = 0;
        for (let i = 0; i < ferrySortButtons.length; i++) {
            ferrySortButtons[i].addEventListener('change', function(event) {
                if (event.target.value !== prevSortRadioValue) {
                    ferrySortData[0] = event.target.value;
                    prevSortRadioValue = event.target.value;
                    siteController.captureFerriesArray(ferrySortData);
                    siteController.renderFerriesSort();
                };
            });
        };
        for (let i = 0; i < ferryOrderButtons.length; i++) {
            ferryOrderButtons[i].addEventListener('change', function(event) {
                if (event.target.value !== prevOrderRadioValue) {
                    ferrySortData[1] = event.target.value;
                    prevOrderRadioValue = event.target.value;
                    siteController.captureFerriesArray(ferrySortData);
                    siteController.renderFerriesSort();
                };
            });
        };
        let sortExpandButton = document.getElementById('ferry-sort-button-expand');
        let sortExpanded = false;
        sortExpandButton.addEventListener('click', function() {
            if (sortExpanded === false) {
                sortExpanded = true;
                document.getElementById('ferry-sort-section').style.height = "29.8rem";
            } else if (sortExpanded === true) {
                sortExpanded = false;
                document.getElementById('ferry-sort-section').style.height = "2.9rem";
            };
        });
    },
    captureTerminalsArray: async function(sortType) {
        if (sortType) {
            await fetch('./terminals-data.php', {
                method: "POST",
                body: JSON.stringify(sortType)
            })
            .then((response) => response.json())
            .then((responseJSON) => {
                this.terminalsArray = responseJSON;
            });
        } else {
            await fetch('./terminals-data.php')
                .then((response) => response.json())
                .then((responseJSON) => {
                    this.terminalsArray = responseJSON;
            });
        };
    },
    terminalSortFunctionality: function() {
        let terminalSortData = [null, 0];
        let terminalSortButtons = document.terminalSortRadio.terminalSort;
        let prevSortRadioValue = null;
        let terminalOrderButtons = document.terminalSortOrderRadio.terminalSortOrder;
        let prevOrderRadioValue = 0;
        for (let i =0; i < terminalSortButtons.length; i++) {
            terminalSortButtons[i].addEventListener('change', function(event) {
                if (event.target.value !== prevSortRadioValue) {
                    terminalSortData[0] = event.target.value;
                    prevSortRadioValue = event.target.value;
                    siteController.captureTerminalsArray(terminalSortData);
                    siteController.renderTerminalsSort();
                }
            });
        };
        for (let i =0; i < terminalOrderButtons.length; i++) {
            terminalOrderButtons[i].addEventListener('change', function(event) {
                if (event.target.value !== prevOrderRadioValue) {
                    terminalSortData[0] = event.target.value;
                    prevOrderRadioValue = event.target.value;
                    siteController.captureTerminalsArray(terminalSortData);
                    siteController.renderTerminalsSort();
                }
            });
        };
        let sortExpandButton = document.getElementById('terminal-sort-button-expand');
        let sortExpanded = false;
        sortExpandButton.addEventListener('click', function() {
            if (sortExpanded === false) {
                sortExpanded = true;
                document.getElementById('terminal-sort-section').style.height = "13.5rem";
            } else if (sortExpanded === true) {
                sortExpanded = false;
                document.getElementById('terminal-sort-section').style.height = "2.9rem";
            };
        });
    },
    createFerriesPage: async function() {
        this.htmlWriteTarget.innerHTML = '';
        this.htmlBuffer = `
            <section class="radio-sort" id="ferry-sort-section">
                <div class="radio-sort-header">
                    <p>Sort</p>
                    <button class="sort-expand" id="ferry-sort-button-expand">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6 18h-2v5h-2v-5h-2v-3h6v3zm-2-17h-2v12h2v-12zm11 7h-6v3h2v12h2v-12h2v-3zm-2-7h-2v5h2v-5zm11 14h-6v3h2v5h2v-5h2v-3zm-2-14h-2v12h2v-12z"/></svg>
                    </button>
                </div>
                <form name="ferrySortRadio">
                    <p>Sort By:</p>
                    <div class="sort-by-radio-container">
                        <div class="radio-option-wrapper">
                            <input type="radio" id="name" name="ferrySort" value="0">
                            <label for="name">Name</label>
                        </div>
                        <div class="radio-option-wrapper">
                            <input type="radio" id="class" name="ferrySort" value="1">
                            <label for="class">Class</label>
                        </div>
                        <div class="radio-option-wrapper">
                            <input type="radio" id="years-active-start" name="ferrySort" value="2" checked>
                            <label for="years-active-start">Year Deployed</label>
                        </div>    
                        <div class="radio-option-wrapper">
                            <input type="radio" id="years-active-end" name="ferrySort" value="3">
                            <label for="years-active-end">Year Retired</label>
                        </div>
                        <div class="radio-option-wrapper">
                            <input type="radio" id="passenger-capacity" name="ferrySort" value="9">
                            <label for="passenger-capacity">Passenger Capacity</label>
                        </div>
                        <div class="radio-option-wrapper">
                            <input type="radio" id="vehicle-capacity" name="ferrySort" value="8">
                            <label for="vehicle-capacity">Vehicle Capacity</label>
                        </div>
                        <div class="radio-option-wrapper">
                            <input type="radio" id="length" name="ferrySort" value="6">
                            <label for="length">Length</label>
                        </div>
                        <div class="radio-option-wrapper">
                            <input type="radio" id="displacement" name="ferrySort" value="7">
                            <label for="displacement">Displacement</label>
                        </div>
                        <div class="radio-option-wrapper">
                            <input type="radio" id="max-speed" name="ferrySort" value="5">
                            <label for="max-speed">Max Speed</label>
                        </div>
                        <div class="radio-option-wrapper">
                            <input type="radio" id="horsepower" name="ferrySort" value="4">
                            <label for="horsepower">Horsepower</label>
                        </div>
                    </div>
                </form>

                <form name="ferrySortOrderRadio">
                    <p>Sort Order:</p>
                    <div class="sort-order-radio-container">
                        <div class="radio-option-wrapper">
                            <input type="radio" id="ascending" name="ferrySortOrder" value="0">
                            <label for="ascending">Ascending</label>
                        </div>
                        <div class="radio-option-wrapper">
                            <input type="radio" id="descending" name="ferrySortOrder" value="1" checked>
                            <label for="descending">Descending</label>
                        </div>
                    </div>
                </form>
            </section>
            <section id="ferry-cards">
        `;
        await this.captureFerriesArray();
        this.ferriesArray.forEach((ferry) => {
            this.htmlBuffer += `
                <a href="#/ferries/${ferry.page_id}">
                    <article class="single-ferry-card">
                        <p class="single-ferry-card-name">${ferry.name}</p>
                        <p class="single-ferry-card-class">${ferry.class}</p>
                        <p class="single-ferry-card-years-active">${ferry.years_active_start} - `;
                        if (ferry.years_active_end === "9999") {
                            this.htmlBuffer += `Present`;
                        } else {
                            this.htmlBuffer += `${ferry.years_active_end}`;
                        };            
                        this.htmlBuffer += `
                        </p>
                        <div class="single-ferry-card-image">
                            <img src="${ferry.picture}" alt="${ferry.picture_alt}">
                        </div>
                        <p class="single-ferry-card-passenger-capacity">${ferry.passenger_capacity}</p>
                        <p class="single-ferry-card-vehicle-capacity">${ferry.vehicle_capacity}</p>
                        <p class="single-ferry-card-length">${ferry.length}</p>
                        <p class="single-ferry-card-displacement">${ferry.displacement}</p>
                        <p class="single-ferry-card-max-speed">${ferry.max_speed}</p>
                        <p class="single-ferry-card-horsepower">${ferry.horsepower}</p>
                    </article>
                </a>
            `;
        });
            this.htmlBuffer += `
            </section>`;
        this.htmlWriteTarget.innerHTML = this.htmlBuffer;
        this.htmlCardsWriteTarget = document.querySelector('section#ferry-cards');
        this.ferrySortFunctionality();
    },
    createTerminalsPage: async function() {
        this.htmlWriteTarget.innerHTML = '';
        this.htmlBuffer = `
            <section class="radio-sort" id="terminal-sort-section">
                <div class="radio-sort-header">
                    <p>Sort</p>
                    <button class="sort-expand" id="terminal-sort-button-expand">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6 18h-2v5h-2v-5h-2v-3h6v3zm-2-17h-2v12h2v-12zm11 7h-6v3h2v12h2v-12h2v-3zm-2-7h-2v5h2v-5zm11 14h-6v3h2v5h2v-5h2v-3zm-2-14h-2v12h2v-12z"/></svg>
                    </button>
                </div>
                <form name="terminalSortRadio">
                    <p>Sort By:</p>
                    <div class="sort-by-radio-container">
                        <div class="radio-option-wrapper">
                            <input type="radio" id="name" name="terminalSort" value="0">
                            <label for="name">Name</label>
                        </div>
                        <div class="radio-option-wrapper">
                            <input type="radio" id="opened" name="terminalSort" value="1" checked>
                            <label for="opened">Opened</label>
                        </div>
                    </div>
                </form>

                <form name="terminalSortOrderRadio">
                    <p>Sort Order:</p>
                    <div class="sort-order-radio-container">
                        <div class="radio-option-wrapper">
                            <input type="radio" id="ascending" name="terminalSortOrder" value="1">
                            <label for="ascending">Ascending</label>
                        </div>
                        <div class="radio-option-wrapper">
                            <input type="radio" id="descending" name="terminalSortOrder" value="0" checked>
                            <label for="descending">Descending</label>
                        </div>
                    </div>
                </form>
            </section>
            <section id="terminal-cards">
        `;
        await this.captureTerminalsArray();
        this.terminalsArray.forEach((terminal) => {
            this.htmlBuffer += `
                <a href="#/terminals/${terminal.page_id}">
                    <div class="single-terminal-card">
                        <p class="single-terminal-card-name">${terminal.name}</p>
                        <div class="single-terminal-card-image">
                            <img src="${terminal.picture}" alt="${terminal.picture_alt}">
                        </div>
                        <p class="single-terminal-card-location">${terminal.location}</p>
                        <p class="single-terminal-card-opened">${terminal.opened}</p>
                    </div>
                </a>
            `;
        });
        this.htmlBuffer += `</section>`;
        this.htmlWriteTarget.innerHTML = this.htmlBuffer;
        this.terminalSortFunctionality();
    },
    renderFerriesSort: function() {
        this.htmlBuffer = '';
        this.ferriesArray.forEach((ferry) => {
            this.htmlBuffer += `
                <a href="#/ferries/${ferry.page_id}">
                    <article class="single-ferry-card">
                        <p class="single-ferry-card-name">${ferry.name}</p>
                        <p class="single-ferry-card-class">${ferry.class}</p>
                        <p class="single-ferry-card-years-active">${ferry.years_active_start} - `;
                        if (ferry.years_active_end === "9999") {
                            this.htmlBuffer += `Present`;
                        } else {
                            this.htmlBuffer += `${ferry.years_active_end}`;
                        };            
                        this.htmlBuffer += `
                        </p>
                        <div class="single-ferry-card-image">
                            <img src="${ferry.picture}" alt="${ferry.picture_alt}">
                        </div>
                        <p class="single-ferry-card-passenger-capacity">${ferry.passenger_capacity}</p>
                        <p class="single-ferry-card-vehicle-capacity">${ferry.vehicle_capacity}</p>
                        <p class="single-ferry-card-length">${ferry.length}</p>
                        <p class="single-ferry-card-displacement">${ferry.displacement}</p>
                        <p class="single-ferry-card-max-speed">${ferry.max_speed}</p>
                        <p class="single-ferry-card-horsepower">${ferry.horsepower}</p>
                    </article>
                </a>
            `;
        });
        this.htmlCardsWriteTarget.innerHTML = this.htmlBuffer;
    },
    renderTerminalsSort: function() {
        this.htmlBuffer = '';
        this.terminalsArray.forEach((terminal) => {
            this.htmlBuffer += `
                <div class="single-terminal-card">
                    <a href="#/terminals/${terminal.page_id}">
                        <p class="single-terminal-card-name">${terminal.name}</p>
                        <p class="single-terminal-card-opened">${terminal.opened}</p>
                        <p class="single-terminal-card-address">${terminal.address}</p>
                        <img class="single-terminal-card-image" src="${terminal.picture}" alt="${terminal.picture_alt}">
                    </a>
                </div>
            `;
        });
        this.htmlCardsWriteTarget.innerHTML = this.htmlBuffer;
    },
    captureFerriesSearchArray: async function(searchQuery) {
        await fetch('./search-ferries.php', {
            method: "POST",
            body: JSON.stringify(searchQuery)
        })
        .then((response) => response.json())
        .then((responseJSON) => {
            this.ferriesSearchArray = responseJSON;
        });
    },
    captureTerminalsSearchArray: async function(searchQuery) {
        await fetch('./search-terminals.php', {
            method: "POST",
            body: JSON.stringify(searchQuery)
        })
        .then((response) => response.json())
        .then((responseJSON) => {
            this.terminalsSearchArray = responseJSON;
        });
    },
    createFerriesSearchPage: async function(searchQuery) {
        this.htmlWriteTarget.innerHTML = '';
        this.htmlBuffer = `
            <h2>Ferry Search Results for '${searchQuery}':</h2>
            <section id="ferry-cards">
        `;
        await this.captureFerriesSearchArray(searchQuery);
        this.ferriesSearchArray.forEach((ferry) => {
            this.htmlBuffer += `
                <a href="#/ferries/${ferry.page_id}">
                    <article class="single-ferry-card">
                        <p class="single-ferry-card-name">${ferry.name}</p>
                        <p class="single-ferry-card-class">${ferry.class}</p>
                        <p class="single-ferry-card-years-active">${ferry.years_active_start} - `;
                        if (ferry.years_active_end === "9999") {
                            this.htmlBuffer += `Present`;
                        } else {
                            this.htmlBuffer += `${ferry.years_active_end}`;
                        };            
                        this.htmlBuffer += `
                        </p>
                        <div class="single-ferry-card-image">
                            <img src="${ferry.picture}" alt="${ferry.picture_alt}">
                        </div>
                        <p class="single-ferry-card-passenger-capacity">${ferry.passenger_capacity}</p>
                        <p class="single-ferry-card-vehicle-capacity">${ferry.vehicle_capacity}</p>
                        <p class="single-ferry-card-length">${ferry.length}</p>
                        <p class="single-ferry-card-displacement">${ferry.displacement}</p>
                        <p class="single-ferry-card-max-speed">${ferry.max_speed}</p>
                        <p class="single-ferry-card-horsepower">${ferry.horsepower}</p>
                    </article>
                </a>
            `;
        });
        this.htmlBuffer += `</section>`;
        this.htmlWriteTarget.innerHTML = this.htmlBuffer;
    },
    createTerminalsSearchPage: async function(searchQuery) {
        this.htmlWriteTarget.innerHTML = '';
        this.htmlBuffer = `<p>Terminal Search Results for '${searchQuery}':</p>`;
        await this.captureTerminalsSearchArray(searchQuery);
        this.terminalsSearchArray.forEach((terminal) => {
            this.htmlBuffer += `
                <div class="single-terminal-card">
                    <a href="#/terminals/${terminal.page_id}">
                        <p class="single-terminal-card-name">${terminal.name}</p>
                        <p class="single-terminal-card-opened">${terminal.opened}</p>
                        <p class="single-terminal-card-address">${terminal.address}</p>
                        <img class="single-terminal-card-image" src="${terminal.picture}" alt="${terminal.picture_alt}">
                    </a>
                </div>
            `;
        });
        this.htmlWriteTarget.innerHTML = this.htmlBuffer;
    },
    captureSingleFerryObject: async function(pageID) {
        await fetch('./single-ferry-data.php', {
            method: "POST",
            body: JSON.stringify(pageID),
        })
            .then((response) => response.json())
            .then((responseJSON) => {
                this.singleFerryObject = responseJSON;
        });
    },
    captureSingleTerminalObject: async function(pageID) {
        await fetch('./single-terminal-data.php', {
            method: "POST",
            body: JSON.stringify(pageID),
        })
            .then((response) => response.json())
            .then((responseJSON) => {
                this.singleTerminalObject = responseJSON;
        });
    },
    createSingleFerryPage: async function(pageID) {
        await this.captureSingleFerryObject(pageID);
        this.htmlWriteTarget.innerHTML = '';
        this.htmlBuffer = `
            <table>
                <tr>
                    <th>Name</th>
                    <td>${this.singleFerryObject.name}</td>
                </tr>
                <tr>
                    <th>Picture</th>
                    <td><img src="${this.singleFerryObject.picture}" alt="${this.singleFerryObject.picture_alt}"><a href="${this.singleFerryObject.picture_alt}">Image Source</a></td>
                    
                </tr>
                <tr>
                    <th>Class</th>
                    <td>${this.singleFerryObject.class}</td>
                </tr>
                <tr>
                    <th>Status</th>
                    <td>${this.singleFerryObject.status}</td>
                </tr>
                <tr>
                    <th>Years Active</th>
                    <td>${this.singleFerryObject.years_active_start} - ${this.singleFerryObject.years_active_end}</td>
                </tr>
                <tr>
                    <th>Home Terminal</th>
                    <td>${this.singleFerryObject.home_terminal}</td>
                </tr>
                <tr>
                    <th>Current Route</th>
                    <td>${this.singleFerryObject.current_route}</td>
                </tr>
                <tr>
                    <th>Place of Origin</th>
                    <td>${this.singleFerryObject.origin}</td>
                </tr>
                <tr>
                    <th>Engines</th>
                    <td>${this.singleFerryObject.engines}</td>
                </tr>
                <tr>
                    <th>Horsepower</th>
                    <td>${this.singleFerryObject.horsepower}</td>
                </tr>
                <tr>
                    <th>Max Speed</th>
                    <td>${this.singleFerryObject.max_speed}</td>
                </tr>
                <tr>
                    <th>Length</th>
                    <td>${this.singleFerryObject.length}</td>
                </tr>
                <tr>
                    <th>Displacement</th>
                    <td>${this.singleFerryObject.displacement}</td>
                </tr>
                <tr>
                    <th>Vehicle Capacity</th>
                    <td>${this.singleFerryObject.vehicle_capacity}</td>
                </tr>
                <tr>
                    <th>Passenger Capacity</th>
                    <td>${this.singleFerryObject.passenger_capacity}</td>
                </tr>
            </table>
            <p>${this.singleFerryObject.history}</p>`;
        this.htmlWriteTarget.innerHTML = this.htmlBuffer;
    },
    createSingleTerminalPage: async function(pageID) {
        await this.captureSingleTerminalObject(pageID);
        this.htmlWriteTarget.innerHTML= '';
        this.htmlBuffer = `
            <table>
                <tr>
                    <th>Name</th>
                    <td>${this.singleTerminalObject.name}</td>
                </tr>
                <tr>
                    <th>Picture</th>
                    <td> <img src="${this.singleTerminalObject.picture}" alt="${this.singleTerminalObject.picture_alt}"><a href="${this.singleTerminalObject.picture_alt}">Image Source</a></td>
                </tr>
                <tr>
                    <th>Address</th>
                    <td>${this.singleTerminalObject.address}</td>
                </tr>
                <tr>
                    <th>Opened</th>
                    <td>${this.singleTerminalObject.opened}</td>
                </tr>
                <tr>
                    <th>Routes</th>
                    <td>${this.singleTerminalObject.routes}</td>
                </tr>
            </table>
            <p>${this.singleTerminalObject.history}</p>`;
        this.htmlWriteTarget.innerHTML = this.htmlBuffer;
    }
};

window.onload = function() {
    siteController.router();
};

window.onhashchange = function() {
    siteController.router();
};