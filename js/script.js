'use strict';

const siteController = {
    htmlBuffer: '',
    validFerryIDs: null,
    validTerminalIDs: null,
    htmlWriteTarget: document.querySelector('main#main'),
    htmlCardsWriteTarget: null,
    htmlLoadingTarget: document.querySelector('div#loading-container'),
    cardCountCurrent: null,
    cardCountLimit: null,
    navFunctionalityRunning: false,
    menuExpanded: false,
    ferrySortExpanded: false,
    terminalSortExpanded: false,
    ferriesArray: null,
    terminalsArray: null,
    singleFerryObject: null,
    singleTerminalObject: null,
    // Grabs an array from SQL DB to see what page IDs are stored
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
    // Function for determining which page to display based on URL
    router: async function() {
        scroll(0,0);
        // Starts Nav event listeners if they are not running already
        if (this.navFunctionalityRunning === false) {
            this.navFunctionality();
        // Collapses Nav menu when loading a new page
        } else {
            this.menuExpanded = true;
            this.navToggle();
        };
        let capturedURL = window.location.href;
        if (capturedURL.includes('#')) {
            let urlHashPosition = capturedURL.indexOf('#')+2;
            let capturedPageID = capturedURL.substring(urlHashPosition);
            // Checks if URL contains "ferries", then loads ferries page - If it also contains a specific ferry page ID, then loads that specific page
            if (capturedPageID.substring(0,7) === 'ferries') {
                if (capturedPageID.substring(8).includes('f')) {
                    await this.captureValidFerryIDs();
                    let capturedSingleFerryPageID = capturedPageID.substring(8);
                    // Checks if the page ID in the URL is located in the valid IDs array that was grabbed earlier, if so then render the page
                    if (this.validFerryIDs.includes(capturedSingleFerryPageID)) {
                        this.createSingleFerryPage(capturedSingleFerryPageID);
                    } else {
                        this.create404();
                    };
                } else {
                    this.createFerriesPage();
                };
            // Checks if URL contains "terminals", if so loads terminals page - If it also contains a specific ferry page ID, then loads that specific page
            } else if (capturedPageID.substring(0,9) === 'terminals') {
                if (capturedPageID.substring(10).includes('t')) {
                    await this.captureValidTerminalIDs();
                    let capturedSingleTerminalPageID = capturedPageID.substring(10);
                    // Checks if the page ID in the URL is located in the valid IDs array that was grabbed earlier, if so then render the page
                    if (this.validTerminalIDs.includes(capturedSingleTerminalPageID)) {
                        this.createSingleTerminalPage(capturedSingleTerminalPageID);
                    } else {
                        this.create404();
                    };
                } else {
                    this.createTerminalsPage();
                }
            // If URL contains "search", begin the search function
            } else if (capturedPageID.substring(0,6) === 'search') {
                if (capturedPageID.substring(7,8) === 'f') {
                    let ferrySearchQuery = capturedPageID.substring(9);
                    // Replaces %20 with a space since the function grabs the search term from the URL
                    ferrySearchQuery = ferrySearchQuery.replace('%20', ' ');
                    this.createFerriesSearchPage(ferrySearchQuery);
                } else if (capturedPageID.substring(7,8) === 't') {
                    let terminalSearchQuery = capturedPageID.substring(9);
                    terminalSearchQuery = terminalSearchQuery.replace('%20', ' ');
                    this.createTerminalsSearchPage(terminalSearchQuery);
                };
            } else if (capturedPageID.substring(0,7) === 'credits') {
                this.createCredits();
            } else {
                this.create404();
            }
        } else {
            this.createMainPage();
        };
    },
    create404: function() {
        this.htmlWriteTarget.innerHTML = '';
        this.htmlLoadingTarget.style.display = 'flex';
        this.htmlBuffer = `
            <h2>Error 404</h2>
            <p>Sorry, page was not found.</p>`;
        this.htmlWriteTarget.innerHTML = this.htmlBuffer;
        this.htmlLoadingTarget.style.display = 'none';
    },
    createCredits: function() {
        this.htmlWriteTarget.innerHTML = '';
        this.htmlLoadingTarget.style.display = 'flex';
        this.htmlBuffer = `
            <h2>Credits</h2>
            <h3>Information</h3>
            <p>Information was gathered from the following sites:</p>
            <ul>
                <li>
                    <a href="https://en.wikipedia.org/wiki/Main_Page">Wikipedia</a>
                </li>
                <li>
                    <a href="https://cptdb.ca/wiki/index.php/Main_Page">Canadian Public Transit Discussion Board Wiki</a>
                </li>
                <li>
                    <a href="https://www.bcferries.com/">BC Ferries Official Website</a>
                </li>
            </ul>
            <p>These sites will most likely prove to be better and more reliable sources of information.</p>
            <h3>Images</h3>
            <ul>
                <li>
                    <p>Image Source for background image (Image may appear cropped):<br> [<a href="https://commons.wikimedia.org/wiki/File:TsawwassenFerryTerminal.JPG">Link</a>]</p>
                </li>
                <li>
                    <p>Image Source for "Ferries" Category Thumbnail (Image was cropped):<br> [<a href="https://flickr.com/photos/8441189@N04/2591295036">Link</a>]</p>
                </li>
                <li>
                    <p>Image Source for "Terminals" Category Thumbnail (Image was cropped):<br> [<a href="https://www.flickr.com/photos/dph1110/2671969217/">Link</a>]</p>
                </li>
            </ul>`;
        this.htmlWriteTarget.innerHTML = this.htmlBuffer;
        this.htmlLoadingTarget.style.display = 'none';
    },
    // Event listeners for expanding/collapsing nav bar, as well as search functionality. Also checks for browser width changes and collpases menus to avoid visual glitches with them being too small/large
    navFunctionality: function() {
        this.navFunctionalityRunning = true;
        let searchField = document.getElementById('search-field');
        let searchFieldInput = '';
        let ferrySearchButton = document.getElementById('ferry-search-button');
        let terminalSearchButton = document.getElementById('terminal-search-button');
        let menuExpandButton = document.getElementById('nav-menu-button');
        menuExpandButton.addEventListener('click', function() {
            siteController.navToggle();
        });
        ferrySearchButton.addEventListener('click', function() {
            searchFieldInput = searchField.value;
            window.location.href = `http://localhost/bcfarchive/#/search/f/${searchFieldInput}`;
        });
        terminalSearchButton.addEventListener('click', function() {
            searchFieldInput = searchField.value;
            window.location.href = `http://localhost/bcfarchive/#/search/t/${searchFieldInput}`;
        });
        window.matchMedia('(min-width: 700px)').addEventListener('change', function() {
            if (siteController.menuExpanded === true) {
                siteController.navToggle();
            };
            if (siteController.ferrySortExpanded === true) {
                siteController.ferrySortToggle();
            };
            if (siteController.terminalSortExpanded === true) {
                siteController.terminalSortToggle();
            };
        });
        window.matchMedia('(min-width: 900px)').addEventListener('change', function() {
            if (siteController.menuExpanded === true) {
                siteController.navToggle();
            };
        });
        window.matchMedia('(min-width: 1300px)').addEventListener('change', function() {
            if (siteController.ferrySortExpanded === true) {
                siteController.ferrySortToggle();
            };
            if (siteController.terminalSortExpanded === true) {
                siteController.terminalSortToggle();
            };
        });
    },
    navToggle: function() {
        if (this.menuExpanded === false) {
            if (window.matchMedia('(min-width: 900px)').matches) {
                document.getElementById('nav').style.height = '3.46rem';
            } else if (window.matchMedia('(min-width: 700px)').matches) {
                document.getElementById('nav').style.height = '5.7rem';
            } else {           
                document.getElementById('nav').style.height = '11.6rem';
            };
            this.menuExpanded = true;
        } else {
            document.getElementById('nav').style.height = '0rem';
            this.menuExpanded = false;
        };
    },
    createMainPage: function() {
        this.htmlWriteTarget.innerHTML = '';
        this.htmlLoadingTarget.style.display = 'flex';
        this.htmlBuffer = `
            <section id="home-welcome-section">
                <h2>Welcome</h2>
                <p>Welcome to the BCFArchive! This is an unofficial database for ferries and terminals which are operated by BC Ferries. This site will allow you to browse and search through both, and also allow you to sort them based on various statistics. Each ferry/terminal has it's own page which will display all the information available about it.<p>
                <p>A "Routes" category with it's own entries will be added at a later date.</p>
            </section>
            <section id="home-category-section">
                <h2>Categories</h2>
                <div class="category-cards-container">
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
                </div>
            </section>
            <section id="home-info-section">
                <p id="home-info-header">ATTENTION</p>
                <p>This site has no affiliation with BC Ferries/British Columbia Ferry Services Inc.. This site is also not actively maintained, so many of the information here may be out of date. More reliable sources can be found on the "Credits" page.</p>
            </section>`;
        this.htmlWriteTarget.innerHTML = this.htmlBuffer;
        this.htmlLoadingTarget.style.display = 'none';
    },
    // Grabs array from SQL DB of all ferries stored.  Puts them in specific order if sort parameters are specified
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
    // Event listeners for ferry sort parameter options
    ferrySortFunctionality: function() {
        let ferrySortData = [null, 0];
        let ferrySortButtons = document.ferrySortRadio.ferrySort;
        let ferryOrderButtons = document.ferrySortOrderRadio.ferrySortOrder;
        for (let i = 0; i < ferrySortButtons.length; i++) {
            ferrySortButtons[i].addEventListener('change', async function(event) {
                ferrySortData[0] = event.target.value;
                await siteController.captureFerriesArray(ferrySortData);
                siteController.renderFerriesSort();
            });
        };
        for (let i = 0; i < ferryOrderButtons.length; i++) {
            ferryOrderButtons[i].addEventListener('change', async function(event) {
                ferrySortData[1] = event.target.value;
                await siteController.captureFerriesArray(ferrySortData);
                siteController.renderFerriesSort();
            });
        };
        let sortExpandButton = document.getElementById('ferry-sort-button-expand');
        sortExpandButton.addEventListener('click', function() {
            siteController.ferrySortToggle();
        });
    },
    ferrySortToggle: function() {
        if (this.ferrySortExpanded === false) {
            if (window.matchMedia('(min-width: 1300px)').matches) {
                document.getElementById('ferry-sort-section').style.height = '15.8rem';
            } else if (window.matchMedia('(min-width: 700px)').matches) {
                document.getElementById('ferry-sort-section').style.height = '19.8rem';
            } else {           
                document.getElementById('ferry-sort-section').style.height = '29.8rem';
            };
            this.ferrySortExpanded = true;
        } else if (this.ferrySortExpanded === true) {
            document.getElementById('ferry-sort-section').style.height = "2.9rem";
            this.ferrySortExpanded = false;
        };
    },
    ferryLoadCardsFunctionality: function() {
        let loadFerriesButton = document.getElementById('load-ferries-button');
        loadFerriesButton.addEventListener('click', function() {
            siteController.htmlLoadingTarget.style.display = 'flex';
            siteController.htmlBuffer = '';
            siteController.cardCountLimit = siteController.cardCountLimit + 9;
            if (siteController.cardCountLimit > siteController.ferriesArray.length) {
                siteController.cardCountLimit = siteController.ferriesArray.length;
                loadFerriesButton.style.display = "none";
            };
            for (let i = siteController.cardCountCurrent; i < siteController.cardCountLimit; i++) {
                siteController.htmlBuffer += `
                    <a href="#/ferries/${siteController.ferriesArray[i].page_id}">
                        <article class="single-ferry-card">
                            <p class="single-ferry-card-name">${siteController.ferriesArray[i].name}</p>
                            <p class="single-ferry-card-class">${siteController.ferriesArray[i].class}</p>
                            <p class="single-ferry-card-years-active">${siteController.ferriesArray[i].years_active_start} - `;
                            if (siteController.ferriesArray[i].years_active_end === "9999") {
                                siteController.htmlBuffer += `Present`;
                            } else {
                                siteController.htmlBuffer += `${siteController.ferriesArray[i].years_active_end}`;
                            };            
                            siteController.htmlBuffer += `
                            </p>
                            <div class="single-ferry-card-image">`;
                            if (siteController.ferriesArray[i].picture) {
                                siteController.htmlBuffer += `<img src="./media/ferries/thumbnails/${siteController.ferriesArray[i].picture}" alt="${siteController.ferriesArray[i].picture_alt}">`;
                            } else {
                                siteController.htmlBuffer += `<img src="./media/na.jpg">`;
                            };
                            siteController.htmlBuffer += `                        
                            </div>
                            <p class="single-ferry-card-passenger-capacity">${siteController.ferriesArray[i].passenger_capacity} People</p>
                            <p class="single-ferry-card-vehicle-capacity">${siteController.ferriesArray[i].vehicle_capacity} Vehicles</p>
                            <p class="single-ferry-card-length">${siteController.ferriesArray[i].length} Meters</p>
                            <p class="single-ferry-card-displacement">${siteController.ferriesArray[i].displacement} Tonnes</p>
                            <p class="single-ferry-card-max-speed">${siteController.ferriesArray[i].max_speed} Knots</p>
                            <p class="single-ferry-card-horsepower">${siteController.ferriesArray[i].horsepower} HP</p>
                        </article>
                    </a>
                `;
            };
            siteController.cardCountCurrent = siteController.cardCountCurrent + 9;
            siteController.htmlCardsWriteTarget.innerHTML += siteController.htmlBuffer;
            siteController.htmlLoadingTarget.style.display = 'none';
        });
    },
    terminalLoadCardsFunctionality: function() {
        let loadTerminalsButton = document.getElementById('load-terminals-button');
        loadTerminalsButton.addEventListener('click', function() {
            siteController.htmlLoadingTarget.style.display = 'flex';
            siteController.htmlBuffer = '';
            siteController.cardCountLimit = siteController.cardCountLimit + 9;
            if (siteController.cardCountLimit > siteController.terminalsArray.length) {
                siteController.cardCountLimit = siteController.terminalsArray.length;
                loadTerminalsButton.style.display = "none";
            };
            for (let i = siteController.cardCountCurrent; i < siteController.cardCountLimit; i++) {
                siteController.htmlBuffer += `
                    <a href="#/terminals/${siteController.terminalsArray[i].page_id}">
                        <article class="single-terminal-card">
                            <p class="single-terminal-card-name">${siteController.terminalsArray[i].name}</p>
                            <div class="single-terminal-card-image">`;
                            if (siteController.terminalsArray[i].picture) {
                                siteController.htmlBuffer += `<img src="./media/terminals/thumbnails/${siteController.terminalsArray[i].picture}" alt="${siteController.terminalsArray[i].picture_alt}">`;
                            } else {
                                siteController.htmlBuffer += `<img src="./media/na.jpg">`;
                            };
                            siteController.htmlBuffer += `
                            </div>
                            <p class="single-terminal-card-location">${siteController.terminalsArray[i].location}</p>
                            <p class="single-terminal-card-address">${siteController.terminalsArray[i].address}</p>
                        </article>
                    </a>
                `;
            };
            siteController.cardCountCurrent = siteController.cardCountCurrent + 9;
            siteController.htmlCardsWriteTarget.innerHTML += siteController.htmlBuffer;
            siteController.htmlLoadingTarget.style.display = 'none';
        });
    },
    // Grabs array from SQL DB of all terminals stored.  Puts them in specific order if sort parameters are specified
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
    // Event listeners for terminal sort parameter options
    terminalSortFunctionality: function() {
        let terminalSortData = [null, 0];
        let terminalSortButtons = document.terminalSortRadio.terminalSort;
        let terminalOrderButtons = document.terminalSortOrderRadio.terminalSortOrder;
        for (let i =0; i < terminalSortButtons.length; i++) {
            terminalSortButtons[i].addEventListener('change', async function(event) {
                terminalSortData[0] = event.target.value;
                await siteController.captureTerminalsArray(terminalSortData);
                siteController.renderTerminalsSort();
            });
        };
        for (let i =0; i < terminalOrderButtons.length; i++) {
            terminalOrderButtons[i].addEventListener('change', async function(event) {
                terminalSortData[1] = event.target.value;
                await siteController.captureTerminalsArray(terminalSortData);
                siteController.renderTerminalsSort();
            });
        };
        let sortExpandButton = document.getElementById('terminal-sort-button-expand');
        sortExpandButton.addEventListener('click', function() {
            siteController.terminalSortToggle();
        });
    },
    terminalSortToggle: function() {
        if (this.terminalSortExpanded === false) {
            if (window.matchMedia('(min-width: 1300px)').matches) {
                document.getElementById('terminal-sort-section').style.height = "7.5rem"
            } else if (window.matchMedia('(min-width: 700px)').matches) {
                document.getElementById('terminal-sort-section').style.height = "11.7rem";
            } else {
                document.getElementById('terminal-sort-section').style.height = "13.5rem";
            };
            this.terminalSortExpanded = true;
        } else if (this.terminalSortExpanded === true) {
            document.getElementById('terminal-sort-section').style.height = "2.9rem";
            this.terminalSortExpanded = false;
        };
    },
    // Renders ferries page using array grabbed from SQL DB
    createFerriesPage: async function() {
        this.htmlWriteTarget.innerHTML = '';
        this.htmlLoadingTarget.style.display = 'flex';
        this.htmlBuffer = `
            <h2>Ferries</h2>
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
                            <input type="radio" id="ascending" name="ferrySortOrder" value="1">
                            <label for="ascending">Ascending</label>
                        </div>
                        <div class="radio-option-wrapper">
                            <input type="radio" id="descending" name="ferrySortOrder" value="0" checked>
                            <label for="descending">Descending</label>
                        </div>
                    </div>
                </form>
            </section>
            <section id="ferry-cards">
        `;
        await this.captureFerriesArray();
        this.cardCountLimit = 12;
        for (let i = 0; i < this.cardCountLimit; i++) {
            this.htmlBuffer += `
                <a href="#/ferries/${this.ferriesArray[i].page_id}">
                    <article class="single-ferry-card">
                        <p class="single-ferry-card-name">${this.ferriesArray[i].name}</p>
                        <p class="single-ferry-card-class">${this.ferriesArray[i].class}</p>
                        <p class="single-ferry-card-years-active">${this.ferriesArray[i].years_active_start} - `;
                        if (this.ferriesArray[i].years_active_end === "9999") {
                            this.htmlBuffer += `Present`;
                        } else {
                            this.htmlBuffer += `${this.ferriesArray[i].years_active_end}`;
                        };            
                        this.htmlBuffer += `
                        </p>
                        <div class="single-ferry-card-image">`;
                        if (this.ferriesArray[i].picture) {
                            this.htmlBuffer += `<img src="./media/ferries/thumbnails/${this.ferriesArray[i].picture}" alt="${this.ferriesArray[i].picture_alt}">`;
                        } else {
                            this.htmlBuffer += `<img src="./media/na.jpg">`;
                        };
                        this.htmlBuffer += `                        
                        </div>
                        <p class="single-ferry-card-passenger-capacity">${this.ferriesArray[i].passenger_capacity} People</p>
                        <p class="single-ferry-card-vehicle-capacity">${this.ferriesArray[i].vehicle_capacity} Vehicles</p>
                        <p class="single-ferry-card-length">${this.ferriesArray[i].length} Meters</p>
                        <p class="single-ferry-card-displacement">${this.ferriesArray[i].displacement} Tonnes</p>
                        <p class="single-ferry-card-max-speed">${this.ferriesArray[i].max_speed} Knots</p>
                        <p class="single-ferry-card-horsepower">${this.ferriesArray[i].horsepower} HP</p>
                    </article>
                </a>
            `;
        };
        this.cardCountCurrent = 12;
        this.htmlBuffer += `
            </section>
            <section id="button-section">
                <button type="button" id="load-ferries-button">Load More</button>
            </section>`;
        this.htmlWriteTarget.innerHTML = this.htmlBuffer;
        this.htmlLoadingTarget.style.display = 'none';
        // Creates a target for specific section to allow for re-rendering of only the ferry cards.  When sort parameters are applied and the cards need to be re-rendered, this makes it so the sort section doesnt have to be re-rendered.
        this.htmlCardsWriteTarget = document.querySelector('section#ferry-cards');
        this.ferrySortFunctionality();
        this.ferryLoadCardsFunctionality();
    },
    // Renders terminals page with array grabbed from SQL DB
    createTerminalsPage: async function() {
        this.htmlWriteTarget.innerHTML = '';
        this.htmlLoadingTarget.style.display = 'flex';
        this.htmlBuffer = `
        <h2>Terminals</h2>
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
                        <input type="radio" id="location" name="terminalSort" value="1" checked>
                        <label for="location">Location</label>
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
        this.cardCountLimit = 12;
        for (let i = 0; i < this.cardCountLimit; i++) {
            this.htmlBuffer += `
                <a href="#/terminals/${this.terminalsArray[i].page_id}">
                    <article class="single-terminal-card">
                        <p class="single-terminal-card-name">${this.terminalsArray[i].name}</p>
                        <div class="single-terminal-card-image">`;
                        if (this.terminalsArray[i].picture) {
                            this.htmlBuffer += `<img src="./media/terminals/thumbnails/${this.terminalsArray[i].picture}" alt="${this.terminalsArray[i].picture_alt}">`;
                        } else {
                            this.htmlBuffer += `<img src="./media/na.jpg">`;
                        };
                        this.htmlBuffer += `
                        </div>
                        <p class="single-terminal-card-location">${this.terminalsArray[i].location}</p>
                        <p class="single-terminal-card-address">${this.terminalsArray[i].address}</p>
                    </article>
                </a>
            `;
        };
        this.cardCountCurrent = 12;
        this.htmlBuffer += `
            </section>
            <section id="button-section">
                <button type="button" id="load-terminals-button">Load More</button>
            </section>`;
        this.htmlWriteTarget.innerHTML = this.htmlBuffer;
        this.htmlLoadingTarget.style.display = 'none';
        // Creates a target for specific section to allow for re-rendering of only the terminal cards.  When sort parameters are applied and the cards need to be re-rendered, this makes it so the sort section doesnt have to be re-rendered.
        this.htmlCardsWriteTarget = document.querySelector('section#terminal-cards');
        this.terminalSortFunctionality();
        this.terminalLoadCardsFunctionality();
    },
    // Re-renders ferry-cards section with new array that has search parameters applied to it
    renderFerriesSort: function() {
        this.htmlLoadingTarget.style.display = 'flex';
        this.htmlBuffer = '';
        this.cardCountLimit = 12;
        for (let i = 0; i < this.cardCountLimit; i++) {
            this.htmlBuffer += `
                <a href="#/ferries/${this.ferriesArray[i].page_id}">
                    <article class="single-ferry-card">
                        <p class="single-ferry-card-name">${this.ferriesArray[i].name}</p>
                        <p class="single-ferry-card-class">${this.ferriesArray[i].class}</p>
                        <p class="single-ferry-card-years-active">${this.ferriesArray[i].years_active_start} - `;
                        if (this.ferriesArray[i].years_active_end === "9999") {
                            this.htmlBuffer += `Present`;
                        } else {
                            this.htmlBuffer += `${this.ferriesArray[i].years_active_end}`;
                        };            
                        this.htmlBuffer += `
                        </p>
                        <div class="single-ferry-card-image">`;
                        if (this.ferriesArray[i].picture) {
                            this.htmlBuffer += `<img src="./media/ferries/thumbnails/${this.ferriesArray[i].picture}" alt="${this.ferriesArray[i].picture_alt}">`;
                        } else {
                            this.htmlBuffer += `<img src="./media/na.jpg">`;
                        };
                        this.htmlBuffer += `                        
                        </div>
                        <p class="single-ferry-card-passenger-capacity">${this.ferriesArray[i].passenger_capacity} People</p>
                        <p class="single-ferry-card-vehicle-capacity">${this.ferriesArray[i].vehicle_capacity} Vehicles</p>
                        <p class="single-ferry-card-length">${this.ferriesArray[i].length} Meters</p>
                        <p class="single-ferry-card-displacement">${this.ferriesArray[i].displacement} Tonnes</p>
                        <p class="single-ferry-card-max-speed">${this.ferriesArray[i].max_speed} Knots</p>
                        <p class="single-ferry-card-horsepower">${this.ferriesArray[i].horsepower} HP</p>
                    </article>
                </a>
            `;
        };
        this.cardCountCurrent = 12;
        this.htmlCardsWriteTarget.innerHTML = this.htmlBuffer;
        this.htmlLoadingTarget.style.display = 'none';
    },
    // Re-renders terminal-cards section with new array that has search parameters applied to it
    renderTerminalsSort: function() {
        this.htmlLoadingTarget.style.display = 'flex';
        this.htmlBuffer = '';
        this.cardCountLimit = 12;
        for (let i = 0; i < this.cardCountLimit; i++) {
            this.htmlBuffer += `
                <a href="#/terminals/${this.terminalsArray[i].page_id}">
                    <article class="single-terminal-card">
                        <p class="single-terminal-card-name">${this.terminalsArray[i].name}</p>
                        <div class="single-terminal-card-image">`;
                        if (this.terminalsArray[i].picture) {
                            this.htmlBuffer += `<img src="./media/terminals/thumbnails/${this.terminalsArray[i].picture}" alt="${this.terminalsArray[i].picture_alt}">`;
                        } else {
                            this.htmlBuffer += `<img src="./media/na.jpg">`;
                        };
                        this.htmlBuffer += `
                        </div>
                        <p class="single-terminal-card-location">${this.terminalsArray[i].location}</p>
                        <p class="single-terminal-card-address">${this.terminalsArray[i].address}</p>
                    </article>
                </a>
            `;
        };
        this.cardCountCurrent = 12;
        this.htmlCardsWriteTarget.innerHTML = this.htmlBuffer;
        this.htmlLoadingTarget.style.display = 'none';
    },
    // Takes "searchQuery" which was grabbed from URL and makes SQL Query with said search term, returns array with results
    captureFerriesSearchArray: async function(searchQuery) {
        await fetch('./search-ferries.php', {
            method: "POST",
            body: JSON.stringify(searchQuery)
        })
        .then((response) => response.json())
        .then((responseJSON) => {
            this.ferriesArray = responseJSON;
        });
    },
    captureTerminalsSearchArray: async function(searchQuery) {
        await fetch('./search-terminals.php', {
            method: "POST",
            body: JSON.stringify(searchQuery)
        })
        .then((response) => response.json())
        .then((responseJSON) => {
            this.terminalsArray = responseJSON;
        });
    },
    // Creates page that shows results of SQL Query with specified search term
    createFerriesSearchPage: async function(searchQuery) {
        this.htmlWriteTarget.innerHTML = '';
        this.htmlLoadingTarget.style.display = 'flex';
        this.htmlBuffer = `
            <h2>Ferry Search Results for '${searchQuery}':</h2>
            <section id="ferry-cards">
        `;
        await this.captureFerriesSearchArray(searchQuery);
        this.cardCountLimit = 12;
        if (siteController.cardCountLimit > siteController.ferriesArray.length) {
            siteController.cardCountLimit = siteController.ferriesArray.length;
        };
        for (let i = 0; i < this.cardCountLimit; i++) {
            this.htmlBuffer += `
                <a href="#/ferries/${this.ferriesArray[i].page_id}">
                    <article class="single-ferry-card">
                        <p class="single-ferry-card-name">${this.ferriesArray[i].name}</p>
                        <p class="single-ferry-card-class">${this.ferriesArray[i].class}</p>
                        <p class="single-ferry-card-years-active">${this.ferriesArray[i].years_active_start} - `;
                        if (this.ferriesArray[i].years_active_end === "9999") {
                            this.htmlBuffer += `Present`;
                        } else {
                            this.htmlBuffer += `${this.ferriesArray[i].years_active_end}`;
                        };            
                        this.htmlBuffer += `
                        </p>
                        <div class="single-ferry-card-image">`;
                        if (this.ferriesArray[i].picture) {
                            this.htmlBuffer += `<img src="./media/ferries/thumbnails/${this.ferriesArray[i].picture}" alt="${this.ferriesArray[i].picture_alt}">`;
                        } else {
                            this.htmlBuffer += `<img src="./media/na.jpg">`;
                        };
                        this.htmlBuffer += `                        
                        </div>
                        <p class="single-ferry-card-passenger-capacity">${this.ferriesArray[i].passenger_capacity} People</p>
                        <p class="single-ferry-card-vehicle-capacity">${this.ferriesArray[i].vehicle_capacity} Vehicles</p>
                        <p class="single-ferry-card-length">${this.ferriesArray[i].length} Meters</p>
                        <p class="single-ferry-card-displacement">${this.ferriesArray[i].displacement} Tonnes</p>
                        <p class="single-ferry-card-max-speed">${this.ferriesArray[i].max_speed} Knots</p>
                        <p class="single-ferry-card-horsepower">${this.ferriesArray[i].horsepower} HP</p>
                    </article>
                </a>
            `;
        };
        this.cardCountCurrent = 12;
        this.htmlBuffer += `
            </section>`;
        if (this.cardCountCurrent < this.ferriesArray.length) {
            this.htmlBuffer += `
            <section id="button-section">
                <button type="button" id="load-ferries-button">Load More</button>
            </section>
            `;
            this.htmlWriteTarget.innerHTML = this.htmlBuffer;
            this.htmlCardsWriteTarget = document.querySelector('section#ferry-cards');
            this.ferryLoadCardsFunctionality();
        } else {
            this.htmlWriteTarget.innerHTML = this.htmlBuffer;
        };
        this.htmlLoadingTarget.style.display = 'none';
    },
    createTerminalsSearchPage: async function(searchQuery) {
        this.htmlWriteTarget.innerHTML = '';
        this.htmlLoadingTarget.style.display = 'flex';
        this.htmlBuffer = `
            <h2>Terminal Search Results for '${searchQuery}':</h2>
            <section id="terminal-cards">
            `;
        await this.captureTerminalsSearchArray(searchQuery);
        this.cardCountLimit = 12;
        if (siteController.cardCountLimit > siteController.terminalsArray.length) {
            siteController.cardCountLimit = siteController.terminalsArray.length;
        };
        for (let i = 0; i < this.cardCountLimit; i++) {
            this.htmlBuffer += `
                <a href="#/terminals/${this.terminalsArray[i].page_id}">
                    <article class="single-terminal-card">
                        <p class="single-terminal-card-name">${this.terminalsArray[i].name}</p>
                        <div class="single-terminal-card-image">`;
                        if (this.terminalsArray[i].picture) {
                            this.htmlBuffer += `<img src="./media/terminals/thumbnails/${this.terminalsArray[i].picture}" alt="${this.terminalsArray[i].picture_alt}">`;
                        } else {
                            this.htmlBuffer += `<img src="./media/na.jpg">`;
                        };
                        this.htmlBuffer += `
                        </div>
                        <p class="single-terminal-card-location">${this.terminalsArray[i].location}</p>
                        <p class="single-terminal-card-address">${this.terminalsArray[i].address}</p>
                    </article>
                </a>
            `;
        };
        this.cardCountCurrent = 12;
        this.htmlBuffer += `
            </section>`;
        if (this.cardCountCurrent < this.terminalsArray.length) {
            this.htmlBuffer += `
            <section id="button-section">
                <button type="button" id="load-terminals-button">Load More</button>
            </section>
            `;
            this.htmlWriteTarget.innerHTML = this.htmlBuffer;
            this.htmlCardsWriteTarget = document.querySelector('section#terminal-cards');
            this.terminalLoadCardsFunctionality();
        } else {
            this.htmlWriteTarget.innerHTML = this.htmlBuffer;
        };
        this.htmlLoadingTarget.style.display = 'none';
    },
    // Grabs specific entry from SQL DB based on page ID provided
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
    // Renders "single page" for a specific entry from SQL DB with page ID provided
    createSingleFerryPage: async function(pageID) {
        await this.captureSingleFerryObject(pageID);
        this.htmlWriteTarget.innerHTML = '';
        this.htmlLoadingTarget.style.display = 'flex';
        this.htmlBuffer = `
            <h2>${this.singleFerryObject.name}</h2>
            <section class="single-ferry-main-content">
                <table>
                    <tr>
                        <td colspan="2">`;
                        if (this.singleFerryObject.picture) {
                            this.htmlBuffer += `
                            <img src="./media/ferries/${this.singleFerryObject.picture}" alt="${this.singleFerryObject.picture_alt}">
                            <p>[<a href="${this.singleFerryObject.picture_source}">Image Source</a>]</p>`;
                        } else {
                            this.htmlBuffer += `<img src="./media/na.jpg">`;
                        };
                        this.htmlBuffer += `
                        </td>
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
                        <td>${this.singleFerryObject.years_active_start} - `                         
                        if (this.singleFerryObject.years_active_end === "9999") {
                            this.htmlBuffer += `Present`;
                        } else {
                            this.htmlBuffer += `${this.singleFerryObject.years_active_end}`;
                        };            
                        this.htmlBuffer += `
                        </td>
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
                </table>
                <p>${this.singleFerryObject.history}</p>
            </section>
            <section class="single-ferry-technical-information">
                <h3>Technical Information</h3>
                <table>
                    <tr>
                        <th>Passenger Capacity</th>
                        <td>${this.singleFerryObject.passenger_capacity} People</td>
                    </tr>
                    <tr>
                        <th>Vehicle Capacity</th>
                        <td>${this.singleFerryObject.vehicle_capacity} Vehicles</td>
                    </tr>
                    <tr>
                        <th>Length</th>
                        <td>${this.singleFerryObject.length} Meters</td>
                    </tr>
                    <tr>
                        <th>Displacement</th>
                        <td>${this.singleFerryObject.displacement} Tonnes</td>
                    </tr>
                    <tr>
                        <th>Max Speed</th>
                        <td>${this.singleFerryObject.max_speed} Knots</td>
                    </tr>
                    <tr>
                        <th>Horsepower</th>
                        <td>${this.singleFerryObject.horsepower} HP</td>
                    </tr>
                </table>
            </section>`;
        this.htmlWriteTarget.innerHTML = this.htmlBuffer;
        this.htmlLoadingTarget.style.display = 'none';
    },
    createSingleTerminalPage: async function(pageID) {
        await this.captureSingleTerminalObject(pageID);
        this.htmlWriteTarget.innerHTML= '';
        this.htmlLoadingTarget.style.display = 'flex';
        this.htmlBuffer = `
            <h2>${this.singleTerminalObject.name}</h2>
            <section class="single-terminal-main-content">
                <table>
                    <tr>
                        <td colspan="2">`;
                        if (this.singleTerminalObject.picture) {
                            this.htmlBuffer += `
                            <img src="./media/terminals/${this.singleTerminalObject.picture}" alt="${this.singleTerminalObject.picture_alt}">
                            <p>[<a href="${this.singleTerminalObject.picture_source}">Image Source</a>]</p>`;
                        } else {
                            this.htmlBuffer += `<img src="./media/na.jpg">`;
                        };
                        this.htmlBuffer += `
                        </td>
                    </tr>
                    <tr>
                    </tr>
                        <th>Location</th>
                        <td>${this.singleTerminalObject.location}</td>
                    <tr>
                        <th>Opened</th>`;
                        if (!this.singleTerminalObject.opened === '0000') {
                            this.htmlBuffer += `<td>${this.singleTerminalObject.opened}</td>`;
                        } else {
                            this.htmlBuffer += `<td>N/A</td>`;
                        };
                        this.htmlBuffer += `
                    </tr>
                    <tr>
                        <th>Address</th>
                        <td>${this.singleTerminalObject.address}</td>
                    </tr>
                </table>
                <p>${this.singleTerminalObject.history}</p>
            </section>
            <section class="single-terminal-routes">
                <h3>Routes</h3>
                <ul>
                    ${this.singleTerminalObject.routes}
                </ul>
            </section>`;
        this.htmlWriteTarget.innerHTML = this.htmlBuffer;
        this.htmlLoadingTarget.style.display = 'none';
    }
};

// Runs router functions everytime the site loads or the URL changes
window.onload = function() {
    siteController.router();
};

window.onhashchange = function() {
    siteController.router();
};