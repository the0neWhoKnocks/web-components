# Web Components

A collection of Web Components that I've built

[Click here to view the examples page](https://the0newhoknocks.github.io/web-components/).

---

## Usage

There are a couple types of Web Components in this repo.
| Type | Description |
| ---- | ----------- |
| `hybrid` | Can be used in raw HTML and in JS. These components may only need to be wired up during initial page load, or updated due to User interactions. |
| `js-only` | Should only be used within JS. Think of these as on-demand components that shouldn't be added to a page until a User requests them. |

Usage examples are spread across a couple files:
- [index.html](./index.html) demonstrates how to load a Web Component (via a `script` include). Also shows the `hybrid` approach with HTML components and it's attributes.
- [examples.js](./example/examples.js) demonstrates how to create `js-only` components, assign their attributes, and add them to the DOM.

---

## Development

For Local development I use the [Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb) extension.
Just point it to the folder for this repo, and start it up.

---

## Notes

General notes, and gotchas.

- They go by many names. `web components`, `custom components`, `custom elements`, but MDN is a good place to start https://developer.mozilla.org/en-US/docs/Web/Web_Components for info.
- Attribute names are hard. Imagine you want to implement something like a click handler. You can go with the below formats.
  | Format |   |
  | ------ | - |
  | `onClick` | The camelcase format is JS specific. If you try to use that format in HTML and access it in your component, the DOM parser will transform `<custom-component onClick="fn">` to `<custom-component onclick="fn">`. |
  | `onclick` | The lowercase no separator format is what the XML spec expects and will work for HTML and JS. |
  | `on-click` | The lowercase with separator format will work in HTML and JS, unless you want to add a `set` for that property, in which case `set on-click` is not valid. |
  
  So, what do you do if you want to maintain functionality and readability for HTML and JS? I go with mainly a JS approach with a normalization layer. This way Users don't have to do any mental gymnastics determining what format of an attribute to use.
  ```html
  <custom-component onClick="fnName"></custom-component>
  ```
  ```js
  set onClick(fn) { this._onClick = fn; }
  
  static get observedAttributes() {
    // notice I'm referencing the attribute in lowercase
    return ['onclick'];
  }
  
  attributeChangedCallback(attr, oldVal, newVal) {
    if (oldVal !== newVal) {
      let _attr = attr;
      let _newVal = newVal;
      
      switch (_attr) {
        case 'onclick': {
          // normalize the attribute name to the camelcase version
          _attr = 'onClick';
          if (typeof newVal === 'string') _newVal = eval(newVal);
          break;
        }
      }
      
      this[_attr] = _newVal;
    }
  }
  ```
