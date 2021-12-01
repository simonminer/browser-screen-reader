/**
 * @class
 * Class to encapsulate accessibility data for an HTML node/tag.
 */

 'use strict';

 export class AccessibleNode {

     /**
      * @member
      * Name of the tag associated with this node.
      */
     tagName = undefined;

     /**
      * @member
      * Actual DOM element associated with this accessible node.
      */
      actualNode = undefined;

     /**
      * @member
      * Virtual node from the shadow DOM generated by axe-core
      * associated with this accessible node.
      */
      virtualNode = undefined;

     /**
      * @member
      * Accessible role of this node
      */
      role = undefined;

     /**
      * @member
      * Accessible name of this node
      */
      name = undefined;

     /**
      * @member
      * Current value of this node
      */
      value = undefined;

     /**
      * @member
      * Metadata about this node, typically depending on its role;
      * for instance, heading level, position in list, count of listitems.
      * This attribute is formatted as text for use in the toString() method.
      */
      metadata = undefined;

     /**
      * @member
      * Character string to separate accessible data values
      * returned by the toString() method.
      */
     separator = ': ';

    /**
     * @constructor
     *
     * @param {Node} actualNode - Element in the DOM tree corresponding to this accessible node.
     * @param {VirtualNode} virtualNode - Virtual node from the shadow DOM for this accessible node.
     * @returns {AccessibleNode} - A new instance of the AccessibleNode class.
     */
    constructor(actualNode, virtualNode = undefined) {
        this.actualNode = actualNode;
        this.tagName = actualNode.tagName.toLowerCase();
        this.name = actualNode.hasAttribute('name') ? actualNode.getAttribute('name') : undefined;
        this.virtualNode = virtualNode;
    }

     /**
      * @method
      *
      * Renders the data in this object as a string
      * @returns {String}
      */
     toString () {
         var roleText = this.role;
         if (this.metadata) {
             roleText += ' ' + this.metadata;
         }

         var values = [];
         [roleText, this.name, this.value].forEach((data) => {
            if (data !== undefined && data !== null && data !== '') {
                values.push(data);
            }
        });
        const text = values.join(this.separator);
        return text;
     }
 }
