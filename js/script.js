'use strict';

const siteController = {
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

};