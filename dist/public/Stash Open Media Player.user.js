// ==UserScript==
// @name        Stash Open Media Player
// @description Open scene filepath links in an external media player. Requires userscript_functions stash plugin
// @version     0.1.5
// @author      7dJx1qP
// @match       http://localhost:9999/*
// @grant       unsafeWindow
// @grant       GM.getValue
// @grant       GM.setValue
// @require     https://raw.githubusercontent.com/7dJx1qP/stash-userscripts/develop/src\StashUserscriptLibrary.js
// ==/UserScript==

(function () {
    'use strict';

    const {
        stash,
        Stash,
        waitForElementId,
        waitForElementClass,
        waitForElementByXpath,
        getElementByXpath,
    } = window.stash;

    const MIN_REQUIRED_PLUGIN_VERSION = '0.4.0';

    function openMediaPlayerTask(path) {
        stash.runPluginTask("userscript_functions", "Open in Media Player", {"key":"path", "value":{"str": path}});
    }

    // scene filepath open with Media Player
    stash.addEventListener('page:scene', function () {
        waitForElementClass('scene-file-info', function () {
            const a = getElementByXpath("//dt[text()='Path']/following-sibling::dd/a");
            if (a) {
                a.addEventListener('click', function () {
                    openMediaPlayerTask(a.href);
                });
            }
        });
    });
    
    const settingsId = 'userscript-settings-mediaplayer';

    stash.addEventListener('page:settings:system', function () {
        waitForElementId('userscript-settings', (elementId, el) => {
            const inputId = 'userscript-settings-mediaplayer-input';
            if (!document.getElementById(settingsId)) {
                const section = document.createElement("div");
                section.setAttribute('id', settingsId);
                section.classList.add('card');
                section.style.display = 'none';
                section.innerHTML = `<div class="setting">
<div>
<h3>Media Player Path</h3>
</div>
<div>
<div class="flex-grow-1 query-text-field-group">
<input id="${inputId}" class="bg-secondary text-white border-secondary form-control" placeholder="Media Player Path…">
</div>
</div>
</div>`;
                el.appendChild(section);
                const mediaplayerPathInput = document.getElementById(inputId);
                mediaplayerPathInput.addEventListener('change', () => {
                    const value = mediaplayerPathInput.value;
                    if (value) {
                        stash.updateConfigValueTask('MEDIAPLAYER', 'path', value);
                        alert(`Media player path set to ${value}`);
                    }
                    else {
                        stash.getConfigValueTask('MEDIAPLAYER', 'path').then(value => {
                            mediaplayerPathInput.value = value;
                        });
                    }
                });
                mediaplayerPathInput.disabled = true;
                stash.getConfigValueTask('MEDIAPLAYER', 'path').then(value => {
                    mediaplayerPathInput.value = value;
                    mediaplayerPathInput.disabled = false;
                });
            };
        });
    });
    stash.addEventListener('stash:pluginVersion', async function () {
        waitForElementId(settingsId, async (elementId, el) => {
            el.style.display = stash.pluginVersion != null ? 'flex' : 'none';
        });
        if (stash.comparePluginVersion(MIN_REQUIRED_PLUGIN_VERSION) < 0) {
            const alertedPluginVersion = await GM.getValue('alerted_plugin_version');
            if (alertedPluginVersion !== stash.pluginVersion) {
                await GM.setValue('alerted_plugin_version', stash.pluginVersion);
                alert(`User functions plugin version is ${stash.pluginVersion}. Stash Open Media Player userscript requires version ${MIN_REQUIRED_PLUGIN_VERSION} or higher.`);
            }
        }
    });
})();