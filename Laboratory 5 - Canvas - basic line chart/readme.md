# Laboratory - Dynamic Chart Visualization with Canvas API

## Overview

This project contains a real-time data visualization tool built using the HTML5 Canvas API and vanilla JavaScript. The application displays a continuously updating line chart with a grid overlay, demonstrating dynamic data generation, canvas drawing techniques, and animation using `setInterval`. The chart generates random data points and shifts them across the canvas to create a live-streaming effect.

## What's Included

### HTML Structure
- Basic HTML5 document setup with viewport meta tag for responsiveness
- A `<canvas>` element with id `chartCanvas` (900x600 pixels)
- External CSS and JavaScript files linked for styling and functionality

### Canvas Configuration
- **Canvas dimensions**: 900px width × 600px height
- **Grid spacing**: 
  - Vertical lines every 150px
  - Horizontal lines every 100px
- **Data point spacing**: New value every 20px horizontally
- **Color scheme**: Gray grid lines with a green data line (5px width)

### JavaScript Functionality
- **Grid rendering**: Draws vertical and horizontal gray lines to create a coordinate system
- **Axis labels**: Displays numeric labels on both axes for value reference
- **Dynamic data generation**: Creates random values between 0 and canvas height
- **Real-time updates**: Generates a new data point every second (1000ms)
- **Data shifting**: Uses a FIFO (First-In-First-Out) queue to shift old data out as new data comes in
- **Continuous redrawing**: Clears and redraws the entire canvas every second to show updated data

### CSS Styling
- Flexbox centering to display the canvas in the middle of the viewport
- Black border around the canvas for visual definition
- Full viewport height layout with no margin

## Current Features

The application initializes with randomly generated data points and continuously updates the chart in real-time. The line chart moves from left to right, with old data points disappearing as new ones are added, creating a streaming visualization effect. Grid lines and numeric labels provide context for data values.

---

## Exercises

Complete the following exercises to enhance the chart visualization and add more functionality. Focus on improving the user experience, adding interactivity, and expanding the visualization capabilities.

- **Add multiple data series**: Modify the code to display multiple lines on the same chart (e.g., 2-3 different colored lines). Each should have its own data array and update independently with different random values or patterns.

- **Implement data smoothing**: Add an option to smooth the line chart using moving averages or bezier curves instead of sharp point-to-point connections. This will create a more polished, professional-looking visualization.

- **Create interactive controls**: Add HTML controls (buttons, sliders, checkboxes) to allow users to:
  - Start/pause the animation
  - Adjust the update interval (speed)
  - Change the data generation range (min/max values)
  - Toggle grid lines on/off
  - Reset the chart with new data

- **Add tooltips on hover**: Implement mouse tracking that displays the exact value and position when hovering over data points. Show a small popup or overlay with this information.

- **Implement different chart types**: Add buttons to switch between visualization types:
  - Line chart (current)
  - Bar chart
  - Area chart (filled under the line)
  - Scatter plot

- **Add data statistics panel**: Create an HTML panel that displays real-time statistics:
  - Current value
  - Maximum and minimum values in the visible data
  - Average of all visible data points
  - Trend indicator (rising/falling)

- **Export chart as image**: Add a button that allows users to download the current chart view as a PNG image using the canvas function `toDataURL()`.

- **Customizable themes**: Create multiple visual themes (dark mode, light mode, high contrast) that users can switch between. Change colors, background, and line styles accordingly.