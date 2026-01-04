# Laboratory - Virtual Piano with Web MIDI and Web Audio APIs

## Overview

This project demonstrates the integration of multiple web audio technologies to create a fully functional virtual piano keyboard. The application supports three input methods: computer keyboard keys, physical MIDI keyboard devices, and mouse clicks on visual piano keys. It showcases both sample-based audio playback and real-time sound synthesis using oscillators, demonstrating the Web MIDI API, Web Audio API, and DOM manipulation for creating interactive musical instruments in the browser.

## What's Included

### HTML Structure
- Custom-styled piano keyboard interface with 61 keys spanning 5 octaves (C2-C7)
- White and black keys with proper visual layout using CSS positioning
- Each key has `data-midi-code` and `data-note` attributes for identification
- Note labels displayed on each key for easy reference
- External CSS for keyboard styling and JavaScript for audio functionality

### CSS Styling
- **Piano keyboard layout**: Flexbox-based keypad with overlapping black keys (z-index positioning)
- **Key dimensions**: White keys (38px × 230px), black keys (26px × 150px) with negative margins for overlap
- **Visual feedback**: Active key highlighting with pink background color via `.activeKey` class
- **Color scheme**: Dark gray keyboard body (#333) with realistic white and black keys
- **Centering**: Flexbox centering for full viewport display
- **Checkerboard pattern**: Alternating colored pads in grid layout (currently unused in active code)

### Web MIDI API Implementation
- **MIDI Access**: Uses `navigator.requestMIDIAccess()` to connect to physical MIDI devices
- **Input detection**: Automatically detects and opens all connected MIDI input devices
- **Message handling**: Processes MIDI messages through `onmidimessage` event listener
- **Note On/Off detection**: Checks MIDI command code 144 (Note On) with velocity > 0
- **MIDI code mapping**: Extracts note number from `m.data[1]` (0-127 range)

### Web Audio API Implementation
- **AudioContext**: Creates separate audio contexts for each note (36-96 MIDI range)
- **Oscillator synthesis**: Generates tones using `createOscillator()` with sawtooth waveform
- **Frequency calculation**: Converts MIDI note numbers to Hz using formula: `2^((midiCode - 69) / 12) * 440`
- **Playback control**: Uses `audioContext.resume()` and `audioContext.suspend()` for play/stop
- **Direct audio output**: Oscillators connected directly to `audioContext.destination`

### Sample-Based Audio
- **Audio files**: Loads MP3 samples for each note from `../notes/{noteName}.mp3`
- **Audio array**: Stores 256 Audio objects indexed by MIDI code
- **Playback methods**: `play()`, `pause()`, and `currentTime = 0` for sample control
- **Note naming**: Uses standard music notation (C2, C#2, D2, etc.)

### Keyboard Input Mapping
- **Key-to-MIDI mapping**: Dictionary mapping computer keys to MIDI note numbers:
  - `q` = 60 (C4, middle C)
  - `2` = 61 (C#4)
  - `w` = 62 (D4)
  - And so on for one octave
- **Visual feedback**: Adds/removes `.activeKey` class on key press/release
- **Event handling**: `keydown` and `keyup` events trigger sound playback and visual changes

## Current Features

The application displays a visual piano keyboard spanning 5 octaves. Users can play notes using their computer keyboard (one octave mapped to QWERTY keys), connect a physical MIDI keyboard for full-range control, or click on the visual keys. The current implementation uses oscillator-based synthesis for computer keyboard input and sample-based playback for MIDI input. Visual feedback highlights active keys in pink. Audio samples are preloaded for all 61 notes, and oscillators are pre-created with calculated frequencies for immediate playback.

---

## Exercises

Complete the following exercises to enhance the virtual piano with additional features, better audio quality, and more sophisticated musical capabilities. The exercises are divided into two sections: those that work with just the computer keyboard and mouse (most exercises), and those that specifically require a physical MIDI keyboard.

### Core Exercises (No MIDI Keyboard Required)

These exercises can be completed using only the computer keyboard, mouse, and the visual piano interface. Focus on these to build a fully-featured virtual instrument accessible to anyone.

- **Add mouse click support for all keys**: Make all 61 visual piano keys clickable so users can play the entire range by clicking with the mouse.
  - *Hint: Add `click` event listeners to each `.key` element, extract the `data-midi-code` attribute using `getAttribute()`, and call `playOscillator()` with that MIDI code*

- **Add volume control**: Create a slider that adjusts the master volume for all sounds.
  - *Hint: Create a `GainNode` using `audioContext.createGain()`, connect all oscillators to the gain node first, then connect the gain node to `destination`. Adjust `gainNode.gain.value` (0-1) based on slider input*

- **Add multiple waveform options**: Allow users to switch between different oscillator waveforms (sine, square, sawtooth, triangle) using buttons or a dropdown.
  - *Hint: Add HTML buttons/select element, set `oscillator.type` to 'sine', 'square', 'sawtooth', or 'triangle' based on user selection before starting the oscillator*

- **Expand computer keyboard mapping**: Map more computer keys to cover 2-3 octaves instead of just one, allowing users to play a wider range without a MIDI keyboard.
  - *Hint: Extend the `emulatedKeys` object with additional keys (a-l for lower octave, z-/ for another octave), mapping them to appropriate MIDI codes*

- **Add octave shift buttons**: Create up/down buttons that shift the computer keyboard mapping by octaves, allowing access to the full 5-octave range.
  - *Hint: Add/subtract 12 from all values in the `emulatedKeys` object when octave buttons are clicked, updating the mapping dynamically*

- **Create a recording feature**: Add record/stop/play buttons that capture a sequence of played notes with timing, then play them back.
  - *Hint: Store note events with timestamps in an array like `[{note: 60, time: 1.5, duration: 0.5}, ...]` when recording, then use `setTimeout()` to replay them with correct timing relative to start time*

- **Implement ADSR envelope**: Add Attack, Decay, Sustain, and Release sliders that shape how notes fade in and out.
  - *Hint: Create a `GainNode` for each note, use `gainNode.gain.setValueAtTime()`, `linearRampToValueAtTime()`, and `exponentialRampToValueAtTime()` to create envelope shapes with timing based on slider values*

- **Implement chord buttons**: Add preset buttons that play multiple notes simultaneously for common chords (C major, G major, A minor, F major, etc.).
  - *Hint: Define arrays of MIDI codes for each chord (e.g., C major = [60, 64, 67]), create a function that calls `playOscillator()` for each note in the array simultaneously*

- **Add effects processing**: Implement audio effects like reverb, delay, or distortion that can be toggled on/off with buttons.
  - *Hint: Use Web Audio API nodes like `ConvolverNode` for reverb, `DelayNode` with feedback for delay, or `WaveShaperNode` for distortion, inserting them in the audio chain between oscillators and destination*

- **Create a piano roll visualization**: Display recently played notes as horizontal bars on a canvas, similar to a MIDI editor view.
  - *Hint: Add a `<canvas>` element, track note start/stop times in an array, use Canvas API with `context.fillRect()` to draw bars where Y-position represents note pitch and X-position represents time*

- **Add a metronome**: Create a clickable metronome with adjustable BPM that plays a click sound on each beat.
  - *Hint: Use `setInterval(callback, 60000/bpm)` to trigger beats, play a short high-frequency oscillator burst (e.g., 1000Hz for 50ms) or use an audio sample for each click*

- **Implement key labels toggle**: Add a button to show/hide the note labels on the keys for a cleaner visual appearance.
  - *Hint: Add a button that toggles a CSS class on the `.keyboard` element, define `.keyboard.hide-labels span { display: none; }` in your CSS*

- **Create preset sounds/instruments**: Add buttons for different instrument presets (piano, organ, strings, brass, lead synth) that change the oscillator waveform, envelope settings, and gain.
  - *Hint: Store preset configurations as objects like `{waveform: 'sawtooth', attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.3}`, apply them when a preset button is clicked*

- **Add visual frequency spectrum**: Display a real-time frequency spectrum analyzer showing the audio output.
  - *Hint: Create an `AnalyserNode` with `audioContext.createAnalyser()`, connect it between your audio chain and destination, use `getByteFrequencyData()` in an animation loop, draw the spectrum on canvas using `fillRect()` for each frequency bin*

- **Add note name display**: Show the name and MIDI number of currently pressed notes in a prominent display area.
  - *Hint: Create a `<div id="noteDisplay">` element, update its `textContent` with the `data-note` attribute value and MIDI code when keys are pressed, clear when released*

- **Create a looping sequencer**: Build a 16-step sequencer with a grid where users can click to activate notes at specific time intervals, creating looping patterns.
  - *Hint: Create a grid of checkboxes/buttons (16 columns for steps, rows for notes), store active steps in a 2D array, use `setInterval()` to step through columns and play all active notes in that column*

- **Add keyboard shortcuts**: Add keyboard shortcuts for common functions (record, play, stop, change octave, change waveform).
  - *Hint: In the `keydown` event handler, check for special keys (Space, Enter, Ctrl combinations) using `event.key` and `event.ctrlKey` before checking musical key mappings*

- **Add export to WAV/MP3**: Allow users to export their recordings as audio files they can download.
  - *Hint: Use `MediaRecorder` API with `audioContext.createMediaStreamDestination()`, record audio during playback, create a Blob from recorded data, generate download link with `URL.createObjectURL()`*

### Advanced Exercises (Physical MIDI Keyboard Required)

These exercises specifically leverage features of physical MIDI keyboards and require hardware to implement and test effectively.

- **Implement velocity sensitivity for MIDI input**: Use the velocity value from MIDI messages to control note volume/intensity, making the piano respond to how hard keys are pressed.
  - *Hint: Extract velocity from `m.data[2]` (0-127), normalize to 0-1 by dividing by 127, use it to set `gainNode.gain.value` for each note*

- **Add visual keyboard highlighting for MIDI input**: When playing via MIDI keyboard, highlight the corresponding visual keys in real-time.
  - *Hint: In the MIDI `onmidimessage` handler, use `querySelector('[data-midi-code="${m.data[1]}"]')` to find the visual key, add `.activeKey` class on Note On (velocity > 0), remove it on Note Off (velocity = 0)*

- **Implement sustain pedal support**: Add MIDI sustain pedal functionality (MIDI CC 64) that keeps notes playing even after keys are released on the MIDI keyboard.
  - *Hint: Check for `m.data[0] == 176` (Control Change) and `m.data[1] == 64` in MIDI message handler, track sustain state based on `m.data[2] >= 64`, store notes to sustain in an array when pedal is down*

- **Implement pitch bend support**: Add MIDI pitch bend support that smoothly changes the pitch of playing notes when the pitch wheel is moved.
  - *Hint: Listen for MIDI message `m.data[0] == 224` (Pitch Bend), calculate bend amount from `m.data[1]` and `m.data[2]` bytes, adjust oscillator frequency using `frequency.setValueAtTime()` with new calculated frequency*