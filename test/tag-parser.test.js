const TagParser = require("../modules/tag-parser.js").TagParser;

var tagParser = undefined;
beforeAll(() => {
    tagParser = new TagParser();
})

/**
 * Function inspired by https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
 * @param {String} HTML representing a single element
 * @return {Element}
 */
function htmlToElement(html, tag) {
    document.body.innerHTML = html;
    var node = document.querySelector(tag);
    return node;
}

describe("TagParser class tests", function () {
    test('constructor creates tagParser', () => {
        expect(tagParser instanceof TagParser).toBe(true);
        expect(Object.keys(tagParser.tagsWithoutRole).length).toBeGreaterThan(0);
        expect(tagParser.rootNode).toBe(document.body);
        expect(tagParser.virtualTree instanceof Array).toBe(true);
        expect(tagParser.virtualTree.length).toBe(1);
        expect(tagParser.virtualTree[0].actualNode.tagName).toBe("BODY");
    });

    test('generateTree creates a list of nodes', () => {
        document.body.innerHTML = '<h1>Heading</h1><p>Text<p><ul><li>One</li><li>Two</li></ul>';
        const tree = tagParser.generateTree(document.body);
        expect(tree instanceof Array).toBe(true);
        expect(tree.length).toBe(1);
        expect(tree[0].actualNode.tagName).toBe("BODY");
        expect(tree[0].actualNode.children.length).toBeGreaterThanOrEqual(3);
    });

    // Common HTML tags.
    test('tagParser parses heading tags', () => {
        for (var i = 1; i <= 6; i++) {
            var tagName = `h${i}`;
            var tag =  htmlToElement(`<${tagName}>Heading level ${i}</${tagName}>`, tagName);
            tagParser = new TagParser({
                rootNode: tag
            });
            expect(tagParser.parseHeadingLevel(tag)).toBe(i.toString());
            var data = tagParser.parse(tag);
            expect(data.role).toBe(`heading level ${i}`);
            expect(data.name).toBe(undefined);
            expect(data.value).toBe(`Heading level ${i}`);

            tag =  htmlToElement(`<div role="heading" aria-level="${i}">Heading level ${i}</div>`, 'div');
            tagParser = new TagParser({
                rootNode: tag
            });
            expect(tagParser.parseHeadingLevel(tag)).toBe(i.toString());
            data = tagParser.parse(tag);
            expect(data.role).toBe(`heading level ${i}`);
            expect(data.name).toBe(undefined);
            expect(data.value).toBe(`Heading level ${i}`);
        }
    });
    test('tagParser parses link tags', () => {
        var text = "This is a paragraph";
        var tag = htmlToElement(`<p>${text}</p>`, 'p');
        tagParser = new TagParser({
            rootNode: tag
        });
        var data = tagParser.parse(tag);
        expect(data.role).toBe(null);
        expect(data.name).toBe(undefined);
        expect(data.value).toBe(text);
    });
    test('tagParser parses link tags', () => {
        var linkText = "This is a link";
        var name = "link";
        var tag =  htmlToElement(`<a href="#" name="${name}">${linkText}</a>`, 'a');
        tagParser = new TagParser({
            rootNode: tag
        });
        var data = tagParser.parse(tag);
        expect(data.role).toBe('link');
        expect(data.name).toBe(name);
        expect(data.value).toBe(linkText);

        tag =  htmlToElement(`<div role="link" href="#">${linkText}</div>`, 'div');
        tagParser = new TagParser({
            rootNode: tag
        });
        var data = tagParser.parse(tag);
        expect(data.role).toBe('link');
        expect(data.name).toBe(undefined);
        expect(data.value).toBe(linkText);
    });
    test('tagParser parses list tags', () => {
        ['ol', 'ul'].forEach(function(tagName) {
            var listItemText = "Item 1";
            var tag =  htmlToElement(`<${tagName}><li>${listItemText}</li></${tagName}>`, tagName);
            tagParser = new TagParser({
                rootNode: tag
            });
            var data = tagParser.parse(tag);
            expect(data.role).toBe("list");
            expect(data.name).toBe(undefined);
            expect(data.value).toBe('');

            tag =  htmlToElement(`<${tagName}><li>${listItemText}</li></${tagName}>`, 'li');
            tagParser = new TagParser({
                rootNode: tag
            });
            data = tagParser.parse(tag);
            expect(data.role).toBe("list item");
            expect(data.name).toBe(undefined);
            expect(data.value).toBe(listItemText);
        });
    });
    test('tagParser parses definition list tags', () => {
        var html = "<dl><dt>Term</dt><dd>Definition</dd></dl>";
        var tag =  htmlToElement(html, 'dl');
        tagParser = new TagParser({
            rootNode: tag
        });
        var data = tagParser.parse(tag);
        expect(data.role).toBe("list");
        expect(data.name).toBe(undefined);
        expect(data.value).toBe('TermDefinition');

        tag =  htmlToElement(html, 'dt');
        tagParser = new TagParser({
            rootNode: tag
        });
        data = tagParser.parse(tag);
        expect(data.role).toBe("list item");
        expect(data.name).toBe(undefined);
        expect(data.value).toBe("Term");

        tag =  htmlToElement(html, 'dd');
        data = tagParser.parse(tag);
        expect(data.role).toBe("list item");
        expect(data.name).toBe(undefined);
        expect(data.value).toBe("Definition");
    });
    test('tagParser parses image tags', () => {
        var altText = "Sample image";
        var src = "image.png";
        var tag =  htmlToElement(`<img src="${src}" alt="${altText}" />`, 'img');
        tagParser = new TagParser({
            rootNode: tag
        });
        var data = tagParser.parse(tag);
        expect(data.role).toBe("img");
        expect(data.name).toBe(undefined);
        expect(data.value).toBe(altText);

        tag =  htmlToElement(`<div role="img" aria-label="${altText}">Test</div>`, 'div');
        tagParser = new TagParser({
            rootNode: tag
        });
        data = tagParser.parse(tag);
        expect(data.role).toBe("img");
        expect(data.name).toBe(undefined);
        expect(data.value).toBe(altText);

        // TODO Test SVG tag.
    });

    // Form fields.
    test('tagParser parses input tags', () => {
        ['checkbox', 'radio', 'reset', 'submit', 'text'].forEach(function(type) {
            var role = type === "reset" || type === "submit"
                ? "button" : type === "text"
                ? "textbox" : type;
            var name = `test-${type}`;
            var value = `Test ${type}`;
            var tag =  htmlToElement(`<input type="${type}" aria-label="${value}" name="${name}" />`, 'input');
            tagParser = new TagParser({
                rootNode: tag
            });
            var data = tagParser.parse(tag);
            expect(data.role).toBe(role);
            expect(data.name).toBe(name);
            expect(data.value).toBe(value);
        });
    });
    test('tagParser parses textarea tag', () => {
        var name = 'test-textarea';
        var value = 'Test Textarea';
        var tag =  htmlToElement(`<textarea name="${name}" aria-label="${value}">${value} Value</button>`, 'textarea');
        tagParser = new TagParser({
            rootNode: tag
        });
        var data = tagParser.parse(tag);
        expect(data.role).toBe('textbox');
        expect(data.name).toBe(name);
        expect(data.value).toBe(value);
    });
    test('tagParser parses select tags', () => {
        var selectName = "test-select";
        var selectValue = "Test Select";
        var optionName = "test-option";
        var optionValue = "Test Option";
        var html = `<select name="${selectName}" aria-label="${selectValue}"><option name="${optionName}">${optionValue}</option></select>`;
        var tag =  htmlToElement(html, 'select');
        tagParser = new TagParser({
            rootNode: tag
        });
        var data = tagParser.parse(tag);
        expect(data.role).toBe('combobox');
        expect(data.name).toBe(selectName);
        expect(data.value).toBe(selectValue);

        tag =  htmlToElement(html, 'option');
        tagParser = new TagParser({
            rootNode: tag
        });
        data = tagParser.parse(tag);
        expect(data.role).toBe('option');
        expect(data.name).toBe(optionName);
        expect(data.value).toBe(optionValue);
    });
    test('tagParser parses button tag', () => {
        var name = 'test-button';
        var value = 'Test Button';
        var tag =  htmlToElement(`<button name="${name}">${value}</button>`, 'button');
        tagParser = new TagParser({
            rootNode: tag
        });
        var data = tagParser.parse(tag);
        expect(data.role).toBe('button');
        expect(data.name).toBe(name);
        expect(data.value).toBe(value);
    });

    // Tables.
    test('tagParser parses table tags', () => {
        var captionValue = "Table Caption";
        var headingValue = "Table Heading";
        var cellValue = "Table Cell";
        var html = `<table><caption>${captionValue}</caption><tr><th>${headingValue}</th><td>${cellValue}</td></tr></table>`;
        var tag =  htmlToElement(html, 'table');
        tagParser = new TagParser({
            rootNode: tag
        });
        var data = tagParser.parse(tag);
        expect(data.role).toBe('table');
        expect(data.name).toBe(undefined);
        expect(data.value).toBe(captionValue);

        tag =  htmlToElement(html, 'caption');
        tagParser = new TagParser({
            rootNode: tag
        });
        data = tagParser.parse(tag);
        expect(data.role).toBe('table caption');
        expect(data.name).toBe(undefined);
        expect(data.value).toBe(captionValue);

        tag =  htmlToElement(html, 'tr');
        tagParser = new TagParser({
            rootNode: tag
        });
        data = tagParser.parse(tag);
        expect(data.role).toBe('table row');
        expect(data.name).toBe(undefined);
        expect(data.value).toBe(headingValue + cellValue);

        tag =  htmlToElement(html, 'th');
        tagParser = new TagParser({
            rootNode: tag
        });
        data = tagParser.parse(tag);
        expect(data.role).toBe('table heading');
        expect(data.name).toBe(undefined);
        expect(data.value).toBe(headingValue);

        tag =  htmlToElement(html, 'td');
        tagParser = new TagParser({
            rootNode: tag
        });
        data = tagParser.parse(tag);
        expect(data.role).toBe('table cell');
        expect(data.name).toBe(undefined);
        expect(data.value).toBe(cellValue);

    });

});
