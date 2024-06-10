// ==UserScript==
// @name         Replace SIP with TEL on Click
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Change SIP to TEL on button click for data-softphoneurl attributes and navigate on second click
// @author       Your Name
// @match        https://s2.vanillasoft.net/web/default.asp
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("Tampermonkey script started");

    function addClickListener(button) {
        // console.log('Attempting to add click listener to button:', button);
        if (!button.__sipReplaced) {  // Prevent adding multiple listeners to the same button
            button.addEventListener('click', function(event) {
                const sipUrl = button.getAttribute('data-softphoneurl');
                if (sipUrl && sipUrl.startsWith('sip:')) {
                    const telUrl = sipUrl.replace('sip:', 'tel:');
                    // console.log("Replacing data-softphoneurl:", sipUrl, "with", telUrl);
                    button.setAttribute('data-softphoneurl', telUrl);
                    button.__sipReplaced = true;  // Mark this button as processed
                    // console.log('Attribute replaced. Please click again to dial:', telUrl);
                    showNotification('Phone number ready to dial. Click again to proceed.');
                } else if (button.__sipReplaced) {
                    window.location.href = button.getAttribute('data-softphoneurl');
                }
            });
        }
    }

    function setupButtonListeners(doc) {
        const buttons = doc.querySelectorAll('.dialphone[data-softphoneurl]');
        // console.log('Buttons Found:', buttons);
        buttons.forEach(button => {
            addClickListener(button);
        });
    }

    function checkIframe() {
        const iframe = document.querySelector('#bodyIframe');
        if (iframe) {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc) {
                // console.log("Checking buttons inside iframe");
                setupButtonListeners(iframeDoc);
            }
        } else {
            // console.log("No iframe found on the page");
        }
    }

    function initialize() {
        console.log("Initializing script");

        // Set interval to continuously check for new buttons in the main document
        setInterval(() => {
            //console.log("Checking for new buttons in main document");
            setupButtonListeners(document);
        }, 1000);  // Adjust the interval as needed

        // Set interval to continuously check for new buttons in the iframe
        setInterval(() => {
            // console.log("Checking for new buttons in iframe");
            checkIframe();
        }, 1000);  // Adjust the interval as needed
    }

    function showNotification(message) {
        let notification = document.querySelector('#customNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'customNotification';
            notification.style.position = 'fixed';
            notification.style.bottom = '10px';
            notification.style.right = '10px';
            notification.style.padding = '10px';
            notification.style.backgroundColor = '#444';
            notification.style.color = '#fff';
            notification.style.borderRadius = '5px';
            notification.style.zIndex = '10000';
            document.body.appendChild(notification);
        }
        notification.innerText = message;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 100);
    }

    // Initial check in case buttons are already present
    // console.log("Initial check for buttons in main document and iframe");
    setupButtonListeners(document);
    checkIframe();

    // Start the continuous checking immediately
    initialize();
})();
