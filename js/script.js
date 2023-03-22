'use strict';

const siteController = {
    htmlBuffer: '',
    validFerryIDs: [],
    validTerminalIDs: [],
    htmlWriteTarget: document.querySelector('main#main'),
    onSiteCheck: null,
    captureValidFerryIDs: async function () {
        let validFerryIDsQuery = await fetch('valid-ferry-ids.php');
        let validFerryIDsQueryResponse = validFerryIDsQuery.text();
        this.validFerryIDs = validFerryIDsQueryResponse;
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
    createSingleFerryPage: function() {
        this.htmlWriteTarget.innerHTML = '';
        this.htmlBuffer = `
            <table>
                <tr>
                    <th>Name</th>
                    <td>(ferryJSON.name)</td>
                </tr>
                <tr>
                    <th>Picture</th>
                    <td> <img src="(ferryJSON.picture)" alt=""></td>
                </tr>
                <tr>
                    <th>Class</th>
                    <td>(ferryJSON.class)</td>
                </tr>
                <tr>
                    <th>Status</th>
                    <td>(ferryJSON.status)</td>
                </tr>
                <tr>
                    <th>Years Active</th>
                    <td>(ferryJSON.years_active_start) - (ferryJSON.years_active_end</td>
                </tr>
                <tr>
                    <th>Home Terminal</th>
                    <td>(ferryJSON.home_terminal)</td>
                </tr>
                <tr>
                    <th>Current Route</th>
                    <td>(ferryJSON.current_route)</td>
                </tr>
                <tr>
                    <th>Place of Origin</th>
                    <td>(ferryJSON.origin)</td>
                </tr>
                <tr>
                    <th>Engines</th>
                    <td>(ferryJSON.engines)</td>
                </tr>
                <tr>
                    <th>Horsepower</th>
                    <td>(ferryJSON.horsepower)</td>
                </tr>
                <tr>
                    <th>Max Speed</th>
                    <td>(ferryJSON.max_speed)</td>
                </tr>
                <tr>
                    <th>Length</th>
                    <td>(ferryJSON.length)</td>
                </tr>
                <tr>
                    <th>Displacement</th>
                    <td>(ferryJSON.displacement)</td>
                </tr>
                <tr>
                    <th>Vehicle Capacity</th>
                    <td>(ferryJSON.vehicle_capacity)</td>
                </tr>
                <tr>
                    <th>Passenger Capacity</th>
                    <td>(ferryJSON.passenger_capacity)</td>
                </tr>
            </table>
            <p>(ferryJSON.history)</p>`;
    },
    createSingleTerminalPage: function() {
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