window.addEventListener("load", () => {
  const originalCanvas = document.getElementById("originalCanvas");
  const originalCtx = originalCanvas.getContext("2d", { willReadFrequently: true });

  const targetCanvas = document.getElementById("targetCanvas");
  const targetCtx = targetCanvas.getContext("2d", { willReadFrequently: true });

  const uploadInput = document.getElementById("upload");
  const presetSelect = document.getElementById("preset");
  const grayscaleCb = document.getElementById("grayscale");

  const applyBtn = document.getElementById("apply");
  const resetBtn = document.getElementById("reset");
  const exportBtn = document.getElementById("export");

  const kernelView = document.getElementById("kernelView");
  const PRESETS = {
    "Identity (no change)": {
      kernel: [
        0, 0, 0,
        0, 1, 0,
        0, 0, 0
      ],
      normalize: false,
      factor: 1,
      bias: 0
    },
    "Box Blur": {
      kernel: [
        1, 1, 1,
        1, 1, 1,
        1, 1, 1
      ],
      normalize: true,
      factor: 1,
      bias: 0
    },
    "Gaussian Blur": {
      kernel: [
        1, 2, 1,
        2, 4, 2,
        1, 2, 1
      ],
      normalize: true,
      factor: 1,
      bias: 0
    },
    "Sharpen": {
      kernel: [
         0, -1,  0,
        -1,  5, -1,
         0, -1,  0
      ],
      normalize: false,
      factor: 1,
      bias: 0
    },
    "Edge Detect (Laplacian)": {
      kernel: [
        -1, -1, -1,
        -1,  8, -1,
        -1, -1, -1
      ],
      normalize: false,
      factor: 1,
      bias: 0
    },
    "Emboss": {
      kernel: [
        -2, -1, 0,
        -1,  1, 1,
         0,  1, 2
      ],
      normalize: false,
      factor: 1,
      bias: 128 
    }
  };

  Object.keys(PRESETS).forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    presetSelect.appendChild(opt);
  });

  let originalImageData = null; 

  const defaultImg = new Image();
  defaultImg.src = "../assets/download.png";
  defaultImg.onload = () => drawNewImage(defaultImg);

  uploadInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => drawNewImage(img);
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

  presetSelect.addEventListener("change", updateKernelView);
  updateKernelView();

  function updateKernelView() {
    const preset = PRESETS[presetSelect.value];
    const k = preset.kernel;
    kernelView.textContent =
      `${presetSelect.value}\n` +
      `normalize: ${preset.normalize}, factor: ${preset.factor}, bias: ${preset.bias}\n\n` +
      `${k[0].toString().padStart(4)} ${k[1].toString().padStart(4)} ${k[2].toString().padStart(4)}\n` +
      `${k[3].toString().padStart(4)} ${k[4].toString().padStart(4)} ${k[5].toString().padStart(4)}\n` +
      `${k[6].toString().padStart(4)} ${k[7].toString().padStart(4)} ${k[8].toString().padStart(4)}\n`;
  }

  function drawNewImage(img) {
    originalCanvas.width = img.width;
    originalCanvas.height = img.height;
    targetCanvas.width = img.width;
    targetCanvas.height = img.height;

    originalCtx.drawImage(img, 0, 0);
    targetCtx.drawImage(img, 0, 0);

    originalImageData = originalCtx.getImageData(0, 0, img.width, img.height);
  }

  applyBtn.addEventListener("click", () => {
    if (!originalImageData) return;

    const preset = PRESETS[presetSelect.value];
    const src = targetCtx.getImageData(0, 0, targetCanvas.width, targetCanvas.height);

    if (grayscaleCb.checked) {
      toGrayscale(src.data);
    }

    const out = convolve3x3(
      src.data,
      targetCanvas.width,
      targetCanvas.height,
      preset.kernel,
      {
        normalize: preset.normalize,
        factor: preset.factor,
        bias: preset.bias
      }
    );

    const imgData = new ImageData(out, targetCanvas.width, targetCanvas.height);
    targetCtx.putImageData(imgData, 0, 0);
  });

  resetBtn.addEventListener("click", () => {
    if (!originalImageData) return;
    originalCtx.putImageData(originalImageData, 0, 0);
    targetCtx.putImageData(originalImageData, 0, 0);
  });

  exportBtn.addEventListener("click", () => {
    const a = document.createElement("a");
    a.download = "lab6-filtered.png";
    a.href = targetCanvas.toDataURL("image/png");
    a.click();
  });

  function clampByte(v) {
    return v < 0 ? 0 : v > 255 ? 255 : v;
  }

  function toGrayscale(data) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const y = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
      data[i] = y;
      data[i + 1] = y;
      data[i + 2] = y;
    }
  }

  function convolve3x3(src, w, h, kernel, opts) {
    const out = new Uint8ClampedArray(src.length);

    const normalize = !!opts.normalize;
    const factor = typeof opts.factor === "number" ? opts.factor : 1;
    const bias = typeof opts.bias === "number" ? opts.bias : 0;

    let denom = 1;
    if (normalize) {
      const sum = kernel.reduce((a, b) => a + b, 0);
      denom = (sum !== 0) ? sum : 1;
    }

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;

        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) {
          out[idx] = src[idx];
          out[idx + 1] = src[idx + 1];
          out[idx + 2] = src[idx + 2];
          out[idx + 3] = src[idx + 3];
          continue;
        }

        let r = 0, g = 0, b = 0;
        let k = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const nIdx = ((y + ky) * w + (x + kx)) * 4;
            const wgt = kernel[k++];
            r += src[nIdx] * wgt;
            g += src[nIdx + 1] * wgt;
            b += src[nIdx + 2] * wgt;
          }
        }

        r = (r / denom) * factor + bias;
        g = (g / denom) * factor + bias;
        b = (b / denom) * factor + bias;

        out[idx] = clampByte(Math.round(r));
        out[idx + 1] = clampByte(Math.round(g));
        out[idx + 2] = clampByte(Math.round(b));
        out[idx + 3] = src[idx + 3];
      }
    }
    return out;
  }
});
