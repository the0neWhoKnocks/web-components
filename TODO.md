# TODO

---

- [ ] progress indicators
- [ ] carousel https://codepen.io/theOneWhoKnocks/pen/gjvdev
- [ ] reviews https://codepen.io/theOneWhoKnocks/pen/ZXqzEd
  - ratings: default svg stars, allow slot for ratings-symbol
- [ ] file uploader https://codepen.io/theOneWhoKnocks/pen/KXZZLy
- [ ] navs https://codepen.io/theOneWhoKnocks/pen/NGyjKR
  - https://codepen.io/theOneWhoKnocks/pen/ZYKebb
- [ ] image editor
- [ ] cube # https://codepen.io/theOneWhoKnocks/pen/vzqwG
- [ ] countdown clock https://codepen.io/theOneWhoKnocks/pen/fedCk
- [ ] split flap clock https://codepen.io/theOneWhoKnocks/pen/Ivneu
- [ ] dir listing: https://github.com/the0neWhoKnocks/star-monkey-scripts/blob/master/scripts/github/Github_UI_Updates.user.js#L332-L497
- [ ] toaster/notification


## CustomAutoCompleteInput

- On selection of an option:
  - [x] Add that text to the input's value along with a clear button.
- While arrowing/hovering over options in the list:
  - [x] Update input overlay to display possible value. Has to be in an overlay
  otherwise the list the user is viewing would change.

---

## CustomDialog

- [ ] Look into populating the `content` via what's in the DOM. So if a user has
  ```html
  <custom-dialog id="d1">
    <div>hello world</div>
  </custom-dialog>
  ```
  they should only have to worry about calling `document.getElementById('d1').show()`
- [x] Add in a `styles` node similar to `CustomAutoCompleteInput`.
- [x] Focus the dialog on open
- [x] `ESC` closes dialog

---

## CustomFlyout

- [x] Add in an `openFrom` prop to open from `TOP`, `BOTTOM`, `LEFT`, `RIGHT`.
Currently it just opens from the left.
- [x] Focus the flyout on open
- [x] `ESC` closes flyout
