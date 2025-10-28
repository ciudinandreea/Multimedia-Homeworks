# Laboratory 4 - Music Library with Bootstrap

## Overview

This project contains a responsive music library interface built using Bootstrap 5. The library displays album cards in a grid layout that adapts to different screen sizes, and includes a modal component for viewing detailed information. The project demonstrates Bootstrap's grid system, card components, modal functionality, and responsive design capabilities.

## What's Included

### HTML Structure
- Bootstrap 5.3.8 CSS and JS loaded from CDN
- A `.container` wrapper for responsive layout
- A `.row` containing multiple column layouts
- Nine `.col` elements with responsive column classes (`col-xl-2`, `col-md-3`, `col-sm-6`, `col-12`)
- Bootstrap `.card` components containing:
  - Card images (`.card-img-top`)
  - Card body with title, text, and button
- A Bootstrap `.modal` component with header, body, and footer sections

### Bootstrap Grid System
- **Extra Large screens (≥1200px)**: 6 cards per row (2 columns each)
- **Medium screens (≥768px)**: 4 cards per row (3 columns each)
- **Small screens (≥576px)**: 2 cards per row (6 columns each)
- **Extra Small screens (<576px)**: 1 card per row (12 columns)

### Modal Component
- Modal dialog with header (title and close button)
- Body section for dynamic content
- Footer with action buttons (Close and Save changes)
- Triggered by the last card's button using `data-bs-toggle` and `data-bs-target` attributes

## Current Features

The library displays 9 static album cards, all showing the album thumbnail, the artist and the album name. Each card includes a button that opens a modal window. The layout is fully responsive and adapts to different screen sizes using Bootstrap's grid system.

---

## Exercises

Complete the following exercises to create a dynamic, functional music library. A JSON file (`library.json`) containing 9 albums with artist names, album titles, thumbnails, and tracklists has been provided for these exercises.

- **Load and display albums dynamically**: Remove all hardcoded cards from the HTML. Use JavaScript to fetch the `library.json` file and dynamically generate cards for each album. Each card should display:
  - The album's thumbnail image (from `assets/img/{thumbnail}`)
  - The artist name as the card title
  - The album name as the card text
  - A "View Tracklist" button
  - Use a card footer instead of the `<hr>` tag
  - Find a way to ensure the same height for all cards, no matter how tall the content of one is.

- **Make all cards open the modal**: Modify the JavaScript so that clicking the "View Tracklist" button on any card opens the modal window. Use event delegation or dynamically add event listeners to each button.

- **Display album-specific content in the modal**: When a card's button is clicked, populate the modal with that album's information:
  - Modal title should show: "{Artist} - {Album}"
  - Modal body should display the complete tracklist with track numbers, titles, and lengths
  - Format the tracklist as a numbered list or table for better readability

- **Add Spotify links to tracks**: Each track in the JSON has a `url` property linking to Spotify. Make each track title in the modal clickable, opening the Spotify link in a new tab. Style these links appropriately using Bootstrap classes.

- **Improve the modal footer**: Remove the "Save changes" button (it's not needed). Change the "Close" button to say "Close Tracklist" and consider adding a "Play on Spotify" button that opens the first track of the album.

- **Add a search/filter feature**: Create an input field above the album grid that allows users to filter albums by artist name or album title in real-time as they type. Show only matching albums and hide non-matching ones.

- **Enhance card styling with your own custom CSS**: 
  - Add hover effects to cards (scale transform, shadow increase)
  - Ensure all album images have consistent aspect ratios
  - Add smooth transitions for hover effects
  - Consider adding a subtle overlay on card images with the album name

- **Sort albums alphabetically**: Add dropdown buttons or tabs that allow users to sort the displayed albums by:
  - Artist name (A-Z)
  - Album name (A-Z)
  - Number of tracks (ascending/descending)

- **Track statistics in modal**: In the modal body, before the tracklist, display summary statistics:
  - Total number of tracks
  - Total album duration (sum of all track lengths)
  - Average track length
  - Longest and shortest tracks

- **Make it mobile-friendly**: Test the layout on mobile devices and ensure:
  - Cards stack properly on small screens
  - Modal is readable and scrollable on mobile
  - Touch targets (buttons) are appropriately sized
  - Consider adding a "Back to Top" button for long album lists