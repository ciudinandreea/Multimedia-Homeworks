# Laboratory - Voice-Controlled Number Guessing Game

## Overview

This project demonstrates the integration of browser speech recognition and speech synthesis APIs to create a fully voice-interactive guessing game. The application generates a random number between 0 and 99, listens to the user's spoken guesses, provides audio feedback about whether the guess is too high or too low, and announces when the correct number is guessed. This showcases how to build accessible, hands-free web applications using the Web Speech API.

## What's Included

### HTML Structure
- Basic HTML5 document with viewport meta tag
- A single button with id `guess` to trigger speech recognition
- External JavaScript file for speech recognition and synthesis logic

### Speech Recognition Implementation
- **SpeechRecognition API**: Creates an instance using `new SpeechRecognition()`
- **Language setting**: Configured for US English (`en-US`)
- **Button-triggered listening**: Click event starts the recognition process
- **Result handling**: Processes the transcribed speech through the `onresult` event
- **Transcript extraction**: Accesses the recognized text via `event.results[0][0].transcript`

### Speech Synthesis Implementation
- **SpeechSynthesis API**: Uses `window.speechSynthesis` for text-to-speech output
- **Voice loading**: Detects when voices are loaded with `onvoiceschanged` event
- **SpeechSynthesisUtterance**: Creates utterance objects for each spoken response
- **Ready notification**: Announces "Voices loaded, I am ready!" when initialization completes

### Game Logic
- **Random number generation**: Generates target number between 0-99 using `Math.random()`
- **Text-to-number mapping**: Dictionary for converting word numbers ("one", "two", "five") to integers
- **Input validation**: Checks if transcribed text is a valid number or mapped word
- **Comparison feedback**: Provides "too high", "too low", or "you won" responses
- **Audio feedback**: All game responses are delivered through speech synthesis

### Input Processing
- **Numeric parsing**: Attempts to parse transcribed text as an integer
- **Fallback dictionary**: Maps specific number words to their numeric equivalents
- **Error handling**: Provides "invalid input" feedback for unrecognized words
- **Case normalization**: Converts transcript to lowercase for consistent matching

## Current Features

The application generates a random number and allows users to make guesses by speaking into their microphone. After each guess, the game provides audio feedback indicating whether the guess was correct, too high, or too low. The game supports both spoken numbers (e.g., "42") and a set of word digits ("zero", "one", "two" etc.). Invalid inputs trigger an error message spoken back to the user.

---

## Exercises

Complete the following exercises to enhance the voice-controlled game with additional features, better usability, and more sophisticated interactions. Focus on improving speech recognition accuracy, adding game features, and creating a more engaging user experience.

- **Add visual feedback**: Display the current game state on screen:
  - Show the transcribed guess
  - Display a history of all previous guesses
  - Show the number of attempts made
  - Display hint messages visually alongside audio feedback
  - *Hint: Update DOM elements in the `onresult` callback to show transcription and game state*

- **Visualize the narrowing range on a canvas**: Add a visual number line that shows the possible remaining range:
  - Draw a horizontal bar representing 0-100 (or current max range)
  - After each guess, shade or cross out the eliminated numbers
  - Highlight the remaining valid range in a different color
  - Show previous guesses as markers on the number line
    - Example: If they guessed 42 and the number is higher, visually eliminate 0-42 by graying it out
  - *Hint: Create a `<canvas>` element, use `context.fillRect()` to draw different colored sections based on minRange and maxRange variables, and use `context.fillText()` to label key numbers. Update and redraw after each guess in the onresult callback*

- **Implement continuous listening mode**: Add a toggle to switch between click-to-speak and continuous listening modes where the recognition automatically restarts after each guess.
  - *Hint: Use `recognition.continuous = true` and handle `onend` event with `recognition.start()` to restart automatically*

- **Add voice selection**: Allow users to choose from available voices (male, female, different accents) for the speech synthesis responses.
  - *Hint: Use `synth.getVoices()` to populate a dropdown, then set `utterance.voice = selectedVoice` before speaking*

- **Implement difficulty levels**: Create easy, medium, and hard modes:
  - Easy: 1-50 range with more helpful hints
  - Medium: 1-100 range (current)
  - Hard: 1-1000 range with fewer hints

- **Add smart hints**: Provide more sophisticated feedback based on how close the guess is:
  - "Very cold" (far away)
  - "Cold" (moderately far)
  - "Warm" (getting closer)
  - "Hot" (very close)
  - *Hint: Calculate the difference between guess and target, then provide hints based on percentage or absolute difference*

- **Implement a scoring system**: Track and display:
  - Number of attempts to win
  - Time taken to guess correctly
  - Best score (fewest attempts)
  - Win/loss ratio across multiple games

- **Add "give up" voice command**: Allow users to say "give up" or "surrender" to reveal the answer and start a new game.
  - *Hint: Check the `rawTranscription` for specific phrases like "give up" before attempting numeric parsing*

- **Implement voice commands for game control**: Add recognition for commands like:
  - "New game" or "restart" to start over
  - "Repeat" to hear the last hint again
  - "Help" to get instructions

- **Add speech rate and pitch controls**: Create sliders that allow users to adjust the speech synthesis:
  - Speech rate (slower/faster)
  - Pitch (higher/lower)
  - Volume control
  - *Hint: Set `utterance.rate`, `utterance.pitch`, and `utterance.volume` properties based on slider values*

- **Create a multiplayer mode**: Allow two players to take turns guessing, tracking who wins in fewer attempts.
  - *Hint: Maintain a `currentPlayer` variable and switch between players after each guess, storing separate attempt counts*

- **Add sound effects**: Play audio cues for different events:
  - Success sound when winning
  - Error sound for invalid input
  - Click sound when recognition starts
  - *Hint: Use `Audio` objects with `.play()` method or HTML5 `<audio>` elements*

- **Implement timeout handling**: If the user doesn't speak within a certain time, provide a reminder prompt.
  - *Hint: Use `recognition.onspeechend` and `recognition.onaudioend` events, or set a timeout that triggers a reminder utterance*

- **Add language selection**: Allow users to play the game in different languages (Spanish, French, German, etc.).
  - *Hint: Change `recognition.lang` and `utterance.lang` based on user selection, and translate all spoken messages*

- **Implement error handling**: Add proper error handling for:
  - Microphone permission denied
  - Browser doesn't support speech APIs
  - No speech detected
  - Network errors (if applicable)
  - *Hint: Use `recognition.onerror` event and check `error.error` property for specific error types*

- **Add statistics visualization**: Create charts or graphs showing:
  - Distribution of guess attempts over multiple games
  - Average time per game
  - Most common guess ranges
  - *Hint: Store game data in an array and use Canvas or a charting library to visualize statistics*

- **Create an achievement system**: Award badges or achievements for:
  - Winning in one guess (lucky!)
  - Winning in 5 guesses or fewer (skilled)
  - Playing 10 games (dedicated)
  - Perfect pronunciation (high confidence scores)
  - *Hint: Store achievements in localStorage and check conditions after each game completion*