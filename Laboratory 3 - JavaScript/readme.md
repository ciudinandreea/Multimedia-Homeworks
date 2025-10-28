# Laboratory 3 - Wordle Game

## Overview
This project contains a browser-based implementation of the popular word-guessing game Wordle. Players have 6 attempts to guess a 5-letter word, with color-coded feedback after each guess. The game is built using HTML, CSS, and vanilla JavaScript, demonstrating DOM manipulation, event handling, and game logic implementation.

## What's Included

### HTML Structure

A `#board` container that dynamically generates the game grid
An `#guessInput` text field for player input
A `#guessButton` button to submit guesses

### CSS Styling

- Cell Design: 50px × 50px squares with rounded corners (5px), gray borders, and light gray background
- Color Feedback System:
    - `.green`: Letter is correct and in the right position
    - `.yellow`: Letter exists in the word but wrong position
    - `.red`: Letter doesn't exist in the word

## JavaScript Functionality

### Board Generation
- Creates a 6×5 grid of cells dynamically on page load

### Game Logic:

- Hardcoded target word: "media"
- Validates guesses and provides color-coded feedback
- Tracks number of tries (maximum 6 attempts)
- Win/lose condition alerts
- Game over state management

## Current Features
The game displays a 6-row, 5-column grid representing 6 attempts to guess a 5-letter word. Each guess receives immediate visual feedback: green for correct letters in correct positions, yellow for correct letters in wrong positions, and red for letters not in the word. The game ends when the player guesses correctly or exhausts all 6 attempts.

## Exercises
Complete the following exercises to improve your HTML, CSS, and JavaScript skills. Each exercise builds upon the existing code.

- Randomize the target word: Instead of hardcoding "media", create an array of possible 5-letter words and randomly select one at the start of each game. Consider using words like: "table", "chair", "piano", "mouse", "house", "plant", "brain", "cloud", "beach", "fruit".
- Add input validation: Prevent the player from submitting guesses that aren't exactly 5 letters long. Display an appropriate error message (using alerts or better yet, a styled message on the page) when invalid input is submitted.
- Improve the UI layout: Center the entire game board on the viewport using flexbox. Add spacing between the board and input elements. Style the input field and button to match the game's aesthetic with appropriate padding, borders, and colors.
- Add a "New Game" button: Create a button that resets the game state, clears all cells, and selects a new random word. This button should only appear after a game ends (win or lose).
- Implement keyboard support: Allow players to press Enter to submit their guess instead of clicking the button. Add an event listener for the Enter key on the input field.
- Display the correct word on loss: When the player loses, show the correct word in the alert message (e.g., "You lost! The word was: MEDIA").
- Add animation effects: Implement CSS transitions or animations when cells change color. Consider adding a flip animation (similar to the real Wordle game) or a fade-in effect when feedback colors appear.
- Enhanced color feedback logic: Fix potential issues with duplicate letters. The current logic doesn't properly handle cases where a letter appears multiple times in either the guess or the target word. For example, if the word is "LLAMA" and you guess "LLAMA", the feedback should be accurate for repeated letters.
- Add visual polish:
    - Add a title/header for the game
    - Improve the color scheme 
    - Add box shadows to cells for depth
    - Style the input and button with hover and focus states
    - Add a game statistics display (games played, win percentage, current streak)