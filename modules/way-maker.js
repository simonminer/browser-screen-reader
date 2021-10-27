/**
 * @class
 * Class to parse the DOM for navigable elements
 * and mark them as such
 *
 * "Even when I can't see it your working..."
 */
"use strict";

import { ElementList } from "./element-list.js";

export class WayMaker extends ElementList {

    /**
     * @member
     * CSS class assigned to elements that are navigable by the screen reader.
     */
    className = "srn";

    /**
     * HTML tag lists are taken from https://developer.mozilla.org/en-US/docs/Web/HTML/Element.
     * 
     * @member
     * List of interactive HTML tags. These are
     * already in the tab order, but the also need
     * to be navigable via screen reader controls.
     */
    interactiveTags = ["button", "datalist", "input", "option", "select", "textarea"];

    /**
     * @member
     * List of non-interactive HTML tags that should be
     * navigable by the screen reader.
     */
    nonInteractiveTags = [
        "address", "area", "audio", "blockquote",
        "caption", "dd", "dl", "dt", "figcaption", "figure",
        "h1", "h2", "h3", "h4", "h5", "h6", "img",
        "label", "legend", "li", "map", "math", "ol",
        "p", "pre", "progress", "svg", "table", "td",
        "th", "tr", "track", "ul", "video"
    ];

    /**
     * @member
     * List of HTML tags that could potentially 
     * be navigable by the screen reader,
     * depending on their contents.
     */
    potentiallyNavigableTags = ["div","span"];

    /**
     * @member
     * Number of nodes that have been assigned
     * tabindex attributes by this object.
     */
    tabIndexNodeCount = 0;

    /**
     * @member
     * List of nodes that can be navigated
     * by the screen reader
     */
    nodes = [];

    /**
     * @member
     * Index of current node in list of navigable odes.
     */
     currentNodeIndex = -1;

     /**
     * @member
     * Event handler to bind to "keydown" events to handle arrow key presses.
     */
     static eventHandlerFunction = function (event) {
        // Don't do anything if the user is on a form field.
        var activeElement = document.activeElement;
        var tagName = activeElement.tagName.toLowerCase();
        if (tagName == "select"
            || tagName == "textarea"
            || (tagName == "input" && activeElement.getAttribute("type") == "text")) {
            return;
        }

        // Move to the next or previous accessible node when the right or left
        // arrow is pressed, respectively.
        var wayMaker = document.screenReader.wayMaker;
        var node = undefined;
        if (event.key === "ArrowRight") {
            node = wayMaker.nextNode();
        }
        else if (event.key === "ArrowLeft") {
            node = wayMaker.previousNode();
        }
        else if (event.key === "Tab" || (event.shiftKey && event.key === "Tab")) {
            node = wayMaker.currentNode(document.activeElement);
        }
        if (node !== undefined) {
            node.focus();
        }
    };
    /**
     * @member
     * Type of wrap-around when the screen reader reaches the
     * first or last navigable node:
     * values include "start" or "end".
     */
    wrappedTo = undefined;
    static _properties = ["className", "tabIndexNodeCount", "nodes", "wrappedTo"];

    /**
     * @constructor
     * @param {Object} properties - Set of key/value pairs to override the default properties of this class.
     */
    constructor(properties) {
        super();
        if (properties !== undefined) {
            WayMaker._properties.forEach(property => {
                if (properties.hasOwnProperty(property)) {
                    this[property] = properties[property];
                }
            });
        }


        // Set up the event listeners for arrow keys.
        document.addEventListener( 'keydown', WayMaker.eventHandlerFunction);
    }

    /**
     * @method
    * @param {Node} node - The HTML element being for considered for a tabindex attribute.
    * @returns {boolean}
    * Tests whether or not the given HTML node needs a tabindex="-1"
    * attribute so that it can receive keyboard focus 
    */
    isTabIndexNeeded(node) {
        var tagName = node.tagName.toLowerCase();
        var isNeeded = false;

        // Is the node non-interactive?
        if (this.nonInteractiveTags.includes(tagName)) {
            isNeeded = true;
        }
        // Does the node have at least one child that contains text?
        else if (this.potentiallyNavigableTags.includes(tagName)) {
            var children = node.childNodes;
            for (let i = 0; i < children.length; i++) {
                if (children[i].nodeType === 3 && children[i].nodeValue.trim() !== "") {
                    isNeeded = true;
                    break;
                }
            }
        }

        return isNeeded;
    }
    
    /**
     * @method
     * @param {Node} node - The HTML element to be processed.
     * Examines the specified HTML node, flagging it appropriately
     * if it can be navigated by a screen reader.
     */
    processNode(node) {
        // If the screen reader should be able to navigate
        // this node, make sure it has a tabindex attribute.
        var isTabIndexNeeded = this.isTabIndexNeeded(node);
        if (isTabIndexNeeded) {
            node.setAttribute("tabindex", "-1");
            this.tabIndexNodeCount += 1;
        }

        // Assign a special class to the node if can be navigated
        // by the screen reader.
        var tagName = node.tagName.toLowerCase();
        if (isTabIndexNeeded || this.interactiveTags.includes(tagName)) {
            node.classList.add(this.className);
            this.nodes.push(node);
        }
    }

    /**
     * @method
     * @param {Node} rootNode - Top-level node from which to find and process elements
     * Parses the DOM starting from the specified root node,
     * finding and flagging nodes that are navigable by the screen reader.
     */
    markNavigableNodes(rootNode) {
        rootNode.querySelectorAll('*').forEach(node => {
            this.processNode(node);
        });
    }

    /**
     * @method
     * @returns {Node} - The current matching node or undefined if there are none
     * Returns the current node navigable by the screen reader.
     * or the list of nodes has not been traversed yet.
     */
    currentNode() {
        if (!this.nodes.length || this.currentNodeIndex < 0) {
            return;
        }
        return this.nodes[this.currentNodeIndex];
    }    
}
