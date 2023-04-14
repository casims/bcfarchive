'use strict';

const siteController = {
    htmlBuffer: '',
    validFerryIDs: null,
    validTerminalIDs: null,
    htmlWriteTarget: document.querySelector('main#main'),
    onSiteCheck: null,
    ferriesArray: null,
    terminalsArray: null,
    terminalsArray: null,
    singleFerryObject: null,
    singleTerminalObject: null,
    testString: 'f000',
    captureValidFerryIDs: function () {
        fetch('./valid-ferry-ids.php')
            .then((response) => response.json())
            .then((responseJSON) => {
                this.validFerryIDs = responseJSON;
            });
    },
    captureValidTerminalIDs: function() {
        fetch('./valid-terminal-ids.php')
            .then((response) => response.json())
            .then((responseJSON) => {
                this.validTerminalIDs = responseJSON;
            });
    },
    router: function() {
        let capturedURL = window.location.href;
        if (capturedURL.includes('#')) {
            let urlHashPosition = capturedURL.indexOf('#')+1;
            let capturedPageID = capturedURL.substring(urlHashPosition);
            if (this.onSiteCheck === true) {
                return;
            } else if (capturedPageID.substring(0,7) === 'ferries') {
                if (capturedPageID.substring(8).includes('f')) {
                    let capturedSingleFerryPageID = capturedPageID.substring(8);
                    this.createSingleFerryPage(capturedSingleFerryPageID);
                    this.onSiteCheck = false;
                }
                this.createFerriesPage();
                this.onSiteCheck = false;
            } else if (capturedPageID.substring(0,9) === 'terminals') {
                if (capturedPageID.substring(9).includes('t')) {
                    let capturedSingleTerminalPageID = capturedPageID.substring(9);
                    this.createSingleTerminalPage(capturedSingleTerminalPageID);
                    this.onsiteCheck = false;
                }
                this.createTerminalsPage();
                this.onSiteCheck = false;
            } else if (this.onSiteCheck === false || this.onSiteCheck === null) {
                this.createMainPage();
                this.onSiteCheck = true;
            };
        } else {
            scroll(0,0);
            this.createMainPage();
            this.onSiteCheck = true;
        }
    },
    createMainPage: function() {
        this.htmlWriteTarget.innerHTML = '';
        this.htmlBuffer = `
            <div id="search-container">
                <form action="" method="get" id="search-form">
                    <input type="text" placeholder="search">
                    <button type="submit">
                        
                    </button>
                </form>
            </div>
            <section id="home-category-section">
                <a href="/ferries/">
                    Ferries
                    <img src="media/ferries-thumbnail.jpg" alt="">
                </a>
                <a href="/terminals/">
                    Terminals
                    <img src="media/terminalss-thumbnail.jpg" alt="">
                </a>
            </section>`;
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
    createFerriesPage: async function(sortType) {
        this.htmlWriteTarget.innerHTML = '';
        this.htmlBuffer = `
            <div class="radio-sort">
                <p>Sort By:</p>
                <input type="radio" id="name" name="ferry-sort" value="name">
                <label for="name">Name</label>
                <input type="radio" id="class" name="ferry-sort" value="class">
                <label for="class">Class</label>
                <input type="radio" id="years-active-start" name="ferry-sort" value="years-active-start" checked>
                <label for="years-active-start">Year Deployed</label>
                <input type="radio" id="years-active-end" name="ferry-sort" value="years-active-end">
                <label for="years-active-end">Year Retired</label>
                <input type="radio" id="horsepower" name="ferry-sort" value="horsepower">
                <label for="horsepower">Horsepower</label>
                <input type="radio" id="max-speed" name="ferry-sort" value="max-speed">
                <label for="max-speed">Max Speed</label>
                <input type="radio" id="length" name="ferry-sort" value="length">
                <label for="length">Length</label>
                <input type="radio" id="displacement" name="ferry-sort" value="displacement">
                <label for="displacement">Displacement</label>
                <input type="radio" id="vehicle-capacity" name="ferry-sort" value="vehicle-capacity">
                <label for="vehicle-capacity">Vehicle Capacity</label>
                <input type="radio" id="passenger-capacity" name="ferry-sort" value="passenger-capacity">
                <label for="passenger-capacity">Passenger Capacity</label>

                <p>Sort Order:</p>
                <input type="radio" id="ascending" name="ferry-sort-type" value="ascending">
                <label for="ascending">Ascending</label>
                <input type="radio" id="descending" name="ferry-sort-type" value="descending" checked>
                <label for="descending">Descending</label>
            </div>
        `;
        await this.captureFerriesArray(sortType);
        this.ferriesArray.forEach((ferry) => {
            this.htmlBuffer += `
                <div class="single-ferry-card">
                    <a href="#/ferries/${ferry.page_id}">
                        <p class="single-ferry-card-name">${ferry.name}</p>
                        <p class="single-ferry-card-class">${ferry.class}</p>
                        <p class="single-ferry-card-status">${ferry.status}</p>
                        <p class="single-ferry-card-years-active-start">${ferry.years_active_start}</p>
                        <p class="single-ferry-card-years-active-end">${ferry.years_active_end}</p>
                        <p class="single-ferry-card-current-route">${ferry.current_route}</p>
                        <p class="single-ferry-card-horsepower">${ferry.horsepower}</p>
                        <p class="single-ferry-card-max-speed">${ferry.max_speed}</p>
                        <p class="single-ferry-card-length">${ferry.length}</p>
                        <p class="single-ferry-card-displacement">${ferry.displacement}</p>
                        <p class="single-ferry-card-vehicle-capacity">${ferry.vehicle_capacity}</p>
                        <p class="single-ferry-card-passenger-capacity">${ferry.passenger_capacity}</p>
                        <img class="single-ferry-card-image" src="${ferry.thumbnail}" alt="${ferry.thumbnail_alt}">
                    </a>
                </div>
            `;
        });
        this.htmlWriteTarget.innerHTML = this.htmlBuffer;
    },
    createTerminalsPage: async function(sortType) {
        this.htmlWriteTarget.innerHTML = '';
        this.htmlBuffer = `
            <div class="radio-sort">
                <p>Sort By:</p>
                <input type="radio" id="name" name="terminal-sort" value="name">
                <label for="name">Name</label>
                <input type="radio" id="opened" name="terminal-sort" value="opened" checked>
                <label for="opened">Opened</label>

                <p>Sort Order:</p>
                <input type="radio" id="ascending" name="terminal-sort-type" value="ascending">
                <label for="ascending">Ascending</label>
                <input type="radio" id="descending" name="terminal-sort-type" value="descending" checked>
                <label for="descending">Descending</label>
            </div>
        `;
        await this.captureTerminalsArray(sortType);
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
                    <td> <img src="${this.singleFerryObject.thumbnail}" alt="${this.singleFerryObject.thumbnail_alt}"></td>
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
                    <td> <img src="${this.singleTerminalObject.picture}" alt=""></td>
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
    }
};

window.onload = function() {
    siteController.router();
};

window.onhashchange = function() {
    siteController.router();
};