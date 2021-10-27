/**
 * @class
 * Class to represent and manage a browser-based screen reader simulator.
 */
"use strict";

import { Overlay } from "./overlay.js";
import { Caption } from "./caption.js";
import { Navigator } from './navigator.js';

export class ScreenReader {

    navigator = new Navigator();
    overlay = new Overlay();
    caption = new Caption();
    quickKeyManager;

     

    /**
     * @constructor
     * @param {QuickKeyManager} qkm - Object to manage quick key interactions
     */
    constructor(qkm) {
        this.markNavigableNodes();
        this.appendOverlay();
        document.screenReader = this;

        if (qkm) {
            this.quickKeyManager = qkm;
        }
    }

    /**
     * @method
     * Iterates through the elements in the DOM, adding
     * tabindex attributes as needed to make them focusable
     * for screen reader navigation.
     */
    markNavigableNodes() {
        this.navigator.markNavigableNodes(document.body);
    }

    /**
     * @method
     * Generate and add the overlay to the DOM.
     */
    appendOverlay() {
        document.body.appendChild(this.overlay.getCSS());
        document.body.appendChild(this.overlay.getHTML());

        // Put the caption inside the overlay.
        var overlayElement = document.getElementById(this.overlay.id);
        overlayElement.appendChild(this.caption.getCSS());
        overlayElement.appendChild(this.caption.getHTML());
    }
}
