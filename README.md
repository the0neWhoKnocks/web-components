# Web Components

A collection of Web Components that I've built

[Click here to view the examples page][examplePage].

---

## Usage

Usage examples are in [index.html](./index.html). It demonstrates:
- How to load a Web Component (via a `script` include).
- Ways to style and override existing styles.
- How to set up listeners.
- What attributes are available for each Component.

If you want to load a file directly from GitHub (like in a CodePen), you can get the URLs from [the example page][examplePage]. An example is `https://the0newhoknocks.github.io/web-components/js/components/CustomToggle.js`, so `https://the0newhoknocks.github.io/web-components/<PATH_TO_FILE>`. You can't link directly to a `raw.githubusercontent.com` file since GitHub serves up the files with a `text` header, but `github.io` pages serve files from a CDN with the correct headers.

---

## Development

For Local development I use the [Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb) extension.
Just point it to the folder for this repo, and start it up.

---

## Notes

General notes, and gotchas.

- They go by many names. `web components`, `custom components`, `custom elements`, but MDN is a good place to start https://developer.mozilla.org/en-US/docs/Web/Web_Components for info.
- Custom components can't self close, you always need to add a closing node.
  ```html
  <!-- invalid -->
  <custom-component/>
  <!-- valid -->
  <custom-component></custom-component>
  ```
- `slot` content only effects the Light DOM. This seems like a given, but imagine a case where you insert this via a `slot`.
  ```html
  <div slot="name">
    <style>
      .custom-component-class-name {
        color: pink;
      }
    </style>
  </div>
  ```
  You might think "the `style` node's been inserted into the Component, so it should be able to effect that content", and you'd be wrong.
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

[examplePage]: https://the0newhoknocks.github.io/web-components/