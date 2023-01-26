'use strict';

const siteController = {
    htmlBuffer: '',
    validFerryIDs: [],
    validTerminalIDs: [],
    htmlWriteTarget: document.querySelector('main#main'),
    router: function() {
        const capturedURL = window.location.href;
        if (capturedURL === 'https://bcfarchive.ca/') {
            createMainPage();
            return;
        };
        if (capturedURL.includes('https://bcfarchive.ca/ferries/' || 'https://bcfarchive.ca/ferries')) {
            let capturedFerryID = capturedURL.substring(30);
            if (capturedFerryID.includes('/')) {
                capturedFerryID = capturedFerryID.slice(0, -1);
            };
            if (capturedFerryID === '') {
                createFerriesPage();
                return;
            };
            if (this.validFerryIDs.includes(capturedFerryID)) {
                createSingleFerryPage(capturedFerryID);
                return;
            } else {
                create404Page();
                return;
            };
        };
        if (capturedURL.includes('https://bcfarchive.ca/terminals/' || 'https://bcfarchive.ca/terminals')) {
            let capturedTerminalID = capturedURL.substring(31);
            if (capturedTerminalID.includes('/')) {
                capturedTerminalID = capturedTerminalID.slice(0, -1);
            };
            if (capturedTerminalID === '') {
                createTerminalsPage();
                return;
            };
            if (this.validTerminalIDs.includes(capturedTerminalID)) {
                createSingleTerminalPage(capturedTerminalID);
                return;
            } else {
                create404Page();
                return;
            };
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