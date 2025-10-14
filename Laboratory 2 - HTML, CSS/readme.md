# Laboratory 2 - Piano keyboard

## Overview

This project contains a visual representation of a piano keyboard created using HTML and CSS. The keyboard features white and black keys arranged in the traditional piano layout, demonstrating fundamental CSS concepts like flexbox layout, positioning, and z-index stacking.

## What's Included

### HTML Structure
- A `#keyboard` container that serves as the outer frame
- A `#keypad` flexbox container that holds all the keys
- Individual `.whiteKey` and `.blackKey` elements representing piano keys

### CSS Styling
- **Keyboard Container**: Dark gray background (#333) with padding to create a frame effect
- **Keypad Layout**: Uses flexbox display with a red background (for debugging purposes)
- **White Keys**: 240px tall, 40px wide, white background with black borders
- **Black Keys**: 140px tall, 24px wide, black background with negative margins (-13px) to overlap adjacent white keys - it considers the size of the entire box model, not only the width of the black keys
- **Z-index**: Black keys have `z-index: 2` to appear on top of white keys

## Current Features

The keyboard displays 61 keys (36 white keys and 25 black keys), which represents 5 octaves of a standard piano keyboard. The black keys are positioned to overlap the white keys using negative margins, creating a realistic piano appearance.

---

## Exercises

Complete the following exercises to improve your HTML and CSS skills. Each exercise builds upon the existing code.

- Center the entire keyboard on the viewport. You can use `vw` and `vh` units of measure for setting the viewport size and `flex` to position the entire keyboard.

- Add a border radius for keyboard, keypad and keys as appropriate, to create a more realistic look of the corners.

- The current keyboard has a fixed-width keypad that doesn't fill the container on larger screens. Modify the CSS so that the keypad always fills 100% of the available width in the keyboard container, regardless of screen resolution.

- Add visual feedback when hovering over keys. White keys should turn light gray (#f0f0f0) and black keys should turn dark gray (#333) when hovered.

- Add smooth CSS transitions to all hover and active states created in exercise 2. The transitions should take 0.1 seconds.

- Add note labels (C, D, E, F, G, A, B) to the white keys, then repeat. Position them at the bottom of each white key. Style them with a small font size (10px) and centered alignment. Do the same exercise for black keys, by adding the appropriate labels (C#, Eb, F#, G#, Bb). In the end, for one octave (first 12 keys), the order of the labels should be:
`C C# D Eb E F F# G G# A Bb B`. Then, repeat for the rest of the keys.

- Add realistic shadows to create depth:
    - White keys should have an inset shadow
    - Black keys should have a subtle drop shadow
    - When hovered, the shadows should change to create a pressed-in effect

