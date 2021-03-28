// Find the next element in an in-order traversal of a tree of nodes.
export function getNextElement(element) {
    if (!element) {
        return null;
    }

    // The next element is either this one's first child...
    var nextelement = null;
    if (element.firstChild) {
        nextElement = element.firstChild;
    }

    // ...or the next sibling...
    else if (element.nextSibling) {
        nextElement = element.nextSibling;
    }

    // ...or the next sibling for the first ancestor that has one.
    else {
        var current = element;
        while (true) {
            if (current.parentElement) {
                var parentElement = current.parentElement;
                if (parentElement.nextSibling) {
                    nextElement = parentElement.nextSibling;
                    break;
                }
                else {
                    current = parentElement;
                }
            }
            else {
                break;
            }
        }
    }

    return nextElement;
}

// Find the previous element in an in-order traversal of a tree of nodes.
export function getPreviousElement(element) {

    if (!element) {
        return null;
    }

    // The previous element is either this one's previous sibling
    var previouselement = null;
    if (element.previousSibling) {
        previousElement = element.previousSibling;
    }

    // ...or its parent
    else {
        previousElement = element.parentElement;;
    }

    return previousElement;
}