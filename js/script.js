'use strict';

const siteController = {
    htmlBuffer: '',
    validFerryIDs: null,
    validTerminalIDs: null,
    htmlWriteTarget: document.querySelector('main#main'),
    onSiteCheck: null,
    singleFerryObject: null,
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
    createSingleTerminalPage: function(pageID) {
        this.htmlWriteTarget.innerHTML= '';
        this.htmlBuffer = `
            <table>
                <tr>
                    <th>Name</th>
                    <td>(terminalJSON.name)</td>
                </tr>
                <tr>
                    <th>Picture</th>
                    <td> <img src="(terminalJSON.picture)" alt=""></td>
                </tr>
                <tr>
                    <th>Address</th>
                    <td>(terminalJSON.class)</td>
                </tr>
                <tr>
                    <th>Opened</th>
                    <td>(terminalJSON.status)</td>
                </tr>
                <tr>
                    <th>Routes</th>
                    <td>(terminalJSON.status)</td>
                </tr>
            </table>
            <p>(terminalJSON.history)</p>`;
    }
};

window.onload = function() {
    siteController.router();
};

window.onhashchange = function() {
    siteController.router();
};