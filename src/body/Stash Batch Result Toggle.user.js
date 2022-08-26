(function() {
    'use strict';

    console.log('Stash Batch Result Toggle');

    const DELAY = 200;

    const {
        stash,
        Stash,
        waitForElementId,
        waitForElementClass,
        waitForElementByXpath,
        getElementByXpath,
        getClosestAncestor,
        updateTextInput,
        sortElementChildren,
    } = window.stash;

    let running = false;
    const buttons = [];

    function run() {
        if (!running) return;
        const button = buttons.pop();
        if (button) {
            const scene = getClosestAncestor(button, '.search-item');
            const sceneName = scene.querySelector('a.scene-link > div.TruncatedText');

            const optionalButtons = scene.querySelectorAll('div.optional-field > button.include-exclude-button');
            for (const optionalButton of optionalButtons) {
                optionalButton.click();
            }
            const stashIdButton = scene.querySelector('div.col-lg-6 > div.flex-column > div.scene-details > div.optional-field > button.include-exclude-button');
            stashIdButton.click();

            setTimeout(run, DELAY);
        }
        else {
            stop();
        }
    }

    const btnId = 'batch-result-toggle';
    const startLabel = 'Result Toggle All';
    const stopLabel = 'Stop Result Toggle';
    const btn = document.createElement("button");
    btn.setAttribute("id", btnId);
    btn.classList.add('btn', 'btn-primary', 'ml-3');
    btn.innerHTML = startLabel;
    btn.onclick = () => {
        if (running) {
            stop();
        }
        else {
            start();
        }
    };

    function start() {
        btn.innerHTML = stopLabel;
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-danger');
        running = true;
        console.log('Result Toggle Started');
        buttons.length = 0;
        for (const button of document.querySelectorAll('.btn.btn-primary')) {
            if (button.innerText === 'Search') {
                buttons.push(button);
            }
        }
        run();
    }

    function stop() {
        btn.innerHTML = startLabel;
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-primary');
        running = false;
        console.log('Result Toggle Stopped');
    }

    stash.addEventListener('page:scenes', function () {
        waitForElementByXpath("//button[text()='Scrape All']", function (xpath, el) {
            if (!document.getElementById(btnId)) {
                const container = el.parentElement;
                container.appendChild(btn);
                sortElementChildren(container);
                el.classList.add('ml-3');
            }
        });
    });

})();