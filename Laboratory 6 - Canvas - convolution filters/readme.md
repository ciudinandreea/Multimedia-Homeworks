# Laboratory - Image Processing with Canvas API

## Overview

This project demonstrates client-side image processing using the HTML5 Canvas API and vanilla JavaScript. The application loads an image and applies a convolution kernel (edge detection filter) to process the image pixel by pixel. The original image is displayed on one canvas while the processed result appears on another, showcasing real-time image manipulation techniques entirely in the browser.

## What's Included

### HTML Structure
- Basic HTML5 document setup with viewport meta tag
- Two `<canvas>` elements:
  - `originalCanvas` - displays the source image
  - `targetCanvas` - displays the processed result
- External JavaScript file for image processing logic

### Image Processing Implementation
- **Dynamic canvas sizing**: Canvas dimensions automatically match the loaded image dimensions
- **Image loading**: Uses the `Image` object to load `download.png` asynchronously
- **Pixel manipulation**: Accesses raw pixel data using `getImageData()` and `putImageData()`
- **Convolution kernel**: A 3×3 edge detection kernel (Laplacian filter):
  ```
  [-1, -1, -1]
  [-1,  8, -1]
  [-1, -1, -1]
  ```

### Processing Algorithm
- **Kernel convolution**: Iterates through each pixel (excluding borders) and applies the kernel
- **Neighborhood sampling**: For each pixel, samples the 3×3 neighborhood around it
- **Weighted sum calculation**: Multiplies each neighboring pixel value by the corresponding kernel weight
- **Value clamping**: Ensures output values stay within valid range (0-255)
- **Grayscale output**: Applies the same processed value to R, G, and B channels
- **Border handling**: Skips the outermost pixel row/column to avoid out-of-bounds access

### Data Structure
- **ImageData object**: Contains pixel data as a `Uint8ClampedArray` with 4 values per pixel (RGBA)
- **Output buffer**: Uses `Uint8ClampedArray` for automatic value clamping (0-255 range)
- **Pixel indexing**: Calculates array indices using the formula `(y * width + x) * 4`

## Current Features

The application loads an image file (`download.png`), displays it on the first canvas, applies an edge detection filter through convolution, and renders the processed result on the second canvas. The edge detection highlights areas of rapid intensity change, creating an outline effect that emphasizes boundaries and details in the image.

---

## Exercises

Complete the following exercises to expand the image processing capabilities and create a more versatile image manipulation tool. Focus on adding different filters, user controls, and advanced processing techniques.

- **Add multiple filter options**: Implement additional convolution kernels and allow users to switch between them:
  - Gaussian blur (smoothing)
    ```
    [0.0625, 0.1250, 0.0625]​
    [0.1250, 0.2500, 0.1250]​
    [0.0625, 0.1250, 0.0625]
    ```
  - Sharpen filter
    ```
    [ 0, -1,  0]​
    [-1,  5, -1]​
    [ 0, -1,  0]
    ```
    or for a stronger sharpen
    ```
    [-1, -1, -1]​
    [-1,  9, -1]​
    [-1, -1, -1]
    ```
  - Emboss effect
    ```
    [-2, -1,  0]​
    [-1,  1,  1]​
    [ 0,  1,  2]
    ```
  - Diagonal emboss
    ```
    [-1, -1,  0]​
    [-1,  0,  1]​
    [ 0,  1,  1]
    ```
  - Box blur
    ```
    [0.111, 0.111,  0.111]​
    [0.111, 0.111,  0.111]​
    [0.111, 0.111,  0.111]​
    ```
  - Create UI buttons or a dropdown to select which filter to apply

- **Implement color channel processing**: Modify the code to process color images while preserving color information. Apply the kernel to each RGB channel separately instead of converting to grayscale.

- **Add real-time preview with sliders**: Create a slider control that lets users adjust the intensity/strength of the applied filter (e.g., blend between original and processed image using an opacity value from 0-100%).

- **Create a filter comparison view**: Implement a split-view feature where users can drag a slider to reveal the original image on one side and the processed image on the other, making before/after comparison easy.

- **Implement custom kernel editor**: Create an interactive 3×3 or 5×5 grid where users can input their own kernel values and see the results in real-time. Include preset buttons for common kernels.

- **Add histogram visualization**: Generate and display histograms showing the distribution of pixel values for both the original and processed images. This helps visualize the effect of processing.

- **Create a filter pipeline**: Allow users to apply multiple filters in sequence. Display a list of applied filters that can be reordered, removed, or adjusted.

- **Add image upload functionality**: Replace the hardcoded image path with a file input that allows users to upload and process their own images from their device.

- **Implement advanced filters**: Add filters that don't use convolution:
  - Threshold/binarization (convert to pure black and white)
  - Negative/invert colors
  - Sepia tone effect
  - Posterization (reduce color levels)

- **Add export functionality**: Create a download button that allows users to save the processed image as PNG or JPEG using `toDataURL()` or `toBlob()`.