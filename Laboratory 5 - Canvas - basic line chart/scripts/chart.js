window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('chartCanvas');
  const ctx = canvas.getContext('2d');

  const width = canvas.width;
  const height = canvas.height;

  const elToggleRun = document.getElementById('toggleRun');
  const elReset = document.getElementById('resetChart');
  const elExport = document.getElementById('exportPng');
  const elInterval = document.getElementById('interval');
  const elIntervalLabel = document.getElementById('intervalLabel');
  const elShowGrid = document.getElementById('showGrid');
  const elChartType = document.getElementById('chartType');
  const elTheme = document.getElementById('theme');
  const elEnableSmoothing = document.getElementById('enableSmoothing');
  const elSmoothingControls = document.getElementById('smoothingControls');
  const elSmoothingMethod = document.getElementById('smoothingMethod');
  const elSmoothingWindow = document.getElementById('smoothingWindow');
  const elMinValue = document.getElementById('minValue');
  const elMaxValue = document.getElementById('maxValue');
  const elTooltip = document.getElementById('tooltip');
  const elStats = document.getElementById('stats');
  const elSeriesControls = document.getElementById('seriesControls');

  const GRID_X = 150;
  const GRID_Y = 100;
  const STEP_X = 20; 
  const PADDING = { left: 45, right: 15, top: 15, bottom: 35 };

  const THEMES = {
    light: {
      canvasBg: '#ffffff',
      grid: '#d3d6df',
      axisText: '#2b2f36',
      series: ['#1a7f37', '#0b5fff', '#cc4b37'],
      pointStroke: '#ffffff',
      areaAlpha: 0.14,
    },
    dark: {
      canvasBg: '#0c0f14',
      grid: '#2b313d',
      axisText: '#cfd6e6',
      series: ['#4ade80', '#69a6ff', '#fb7185'],
      pointStroke: '#0c0f14',
      areaAlpha: 0.16,
    },
    contrast: {
      canvasBg: '#000000',
      grid: '#666666',
      axisText: '#ffffff',
      series: ['#ffd400', '#00e5ff', '#ff5cf3'],
      pointStroke: '#000000',
      areaAlpha: 0.18,
    },
  };

  const state = {
    running: true,
    intervalMs: 1000,
    showGrid: true,
    chartType: 'line',
    smoothing: false,
    smoothingMethod: 'movingAverage',
    smoothingWindow: 5,
    minValue: 0,
    maxValue: height,
    theme: 'light',
    timerId: null,
    tick: 0,
    series: [],
    renderPoints: new Map(), 
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rand = (min, max) => min + Math.random() * (max - min);
  const round = (v, digits = 0) => {
    const p = 10 ** digits;
    return Math.round(v * p) / p;
  };

  function safeParseNumber(input, fallback) {
    const n = Number(input);
    return Number.isFinite(n) ? n : fallback;
  }

  function valueToY(v) {
    const minV = state.minValue;
    const maxV = state.maxValue;
    const plotH = height - PADDING.top - PADDING.bottom;
    if (maxV === minV) return PADDING.top + plotH / 2;
    const t = (v - minV) / (maxV - minV);
    const y = PADDING.top + (1 - t) * plotH;
    return y;
  }

  function indexToX(i) {
    const plotW = width - PADDING.left - PADDING.right;
    const maxPoints = getPointCount();
    const maxX = PADDING.left + plotW;
    const x = PADDING.left + (i / (maxPoints - 1)) * plotW;
    return Math.min(maxX, x);
  }

  function getPointCount() {
    const plotW = width - PADDING.left - PADDING.right;
    return Math.max(2, Math.floor(plotW / STEP_X) + 1);
  }

  function movingAverage(values, windowSize) {
    const w = clamp(Math.floor(windowSize), 2, 200);
    const out = new Array(values.length);
    let sum = 0;
    const q = [];
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      q.push(v);
      sum += v;
      if (q.length > w) sum -= q.shift();
      out[i] = sum / q.length;
    }
    return out;
  }

  function drawCatmullRomSpline(points, strokeStyle, lineWidth) {
    if (points.length < 2) return;

    ctx.save();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }

    ctx.stroke();
    ctx.restore();
  }

  function computeStats(values) {
    if (!values.length) {
      return { current: 0, min: 0, max: 0, avg: 0, trend: '—' };
    }
    const current = values[values.length - 1];
    let min = values[0];
    let max = values[0];
    let sum = 0;
    for (const v of values) {
      sum += v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const avg = sum / values.length;
    const prev = values.length >= 2 ? values[values.length - 2] : current;
    const trend = current > prev ? '↗' : current < prev ? '↘' : '→';
    return { current, min, max, avg, trend };
  }

  function buildSeries() {
    const theme = THEMES[state.theme];
    const pointCount = getPointCount();

    const seriesA = {
      name: 'Series A (Random)',
      visible: true,
      color: theme.series[0],
      last: null,
      phase: 0,
      nextValue() {
        return rand(state.minValue, state.maxValue);
      },
      data: new Array(pointCount).fill(0),
    };

    const seriesB = {
      name: 'Series B (Random walk)',
      visible: true,
      color: theme.series[1],
      last: null,
      phase: 0,
      nextValue() {
        const range = Math.max(1, state.maxValue - state.minValue);
        if (this.last === null) this.last = rand(state.minValue, state.maxValue);
        const step = rand(-range * 0.08, range * 0.08);
        this.last = clamp(this.last + step, state.minValue, state.maxValue);
        return this.last;
      },
      data: new Array(pointCount).fill(0),
    };

    const seriesC = {
      name: 'Series C (Sine + noise)',
      visible: true,
      color: theme.series[2],
      last: null,
      phase: 0,
      nextValue() {
        const mid = (state.minValue + state.maxValue) / 2;
        const amp = Math.max(1, (state.maxValue - state.minValue) * 0.35);
        const noise = rand(-amp * 0.12, amp * 0.12);
        this.phase += 0.35;
        const v = mid + amp * Math.sin(this.phase) + noise;
        return clamp(v, state.minValue, state.maxValue);
      },
      data: new Array(pointCount).fill(0),
    };

    state.series = [seriesA, seriesB, seriesC];
    resetData();
    renderSeriesControls();
  }

  function resetData() {
    const pointCount = getPointCount();
    state.tick = 0;
    for (const s of state.series) {
      s.data = new Array(pointCount);
      s.last = null;
      s.phase = 0;
      for (let i = 0; i < pointCount; i++) {
        s.data[i] = s.nextValue();
      }
    }
    draw();
  }

  function pushTick() {
    state.tick += 1;
    for (const s of state.series) {
      const next = s.nextValue();
      s.data.push(next);
      s.data.shift();
    }
  }

  function drawBackground() {
    const theme = THEMES[state.theme];
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = theme.canvasBg;
    ctx.fillRect(0, 0, width, height);
  }

  function drawGridAndLabels() {
    const theme = THEMES[state.theme];
    const plotLeft = PADDING.left;
    const plotRight = width - PADDING.right;
    const plotTop = PADDING.top;
    const plotBottom = height - PADDING.bottom;

    ctx.save();
    ctx.strokeStyle = theme.axisText;
    ctx.fillStyle = theme.axisText;
    ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.lineWidth = 1;

    if (state.showGrid) {
      ctx.strokeStyle = theme.grid;
      for (let x = plotLeft; x <= plotRight + 0.5; x += GRID_X) {
        ctx.beginPath();
        ctx.moveTo(x, plotTop);
        ctx.lineTo(x, plotBottom);
        ctx.stroke();
      }
      for (let y = plotTop; y <= plotBottom + 0.5; y += GRID_Y) {
        ctx.beginPath();
        ctx.moveTo(plotLeft, y);
        ctx.lineTo(plotRight, y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = theme.axisText;
    const ySteps = Math.max(2, Math.floor((plotBottom - plotTop) / GRID_Y) + 1);
    for (let i = 0; i < ySteps; i++) {
      const y = plotTop + i * GRID_Y;
      const t = (y - plotTop) / (plotBottom - plotTop);
      const v = state.maxValue - t * (state.maxValue - state.minValue);
      ctx.fillText(String(round(v, 0)), 10, y + 4);
    }

    const xSteps = Math.max(2, Math.floor((plotRight - plotLeft) / GRID_X) + 1);
    for (let i = 0; i < xSteps; i++) {
      const x = plotLeft + i * GRID_X;
      const label = `${Math.round(((x - plotLeft) / (plotRight - plotLeft)) * 100)}%`;
      ctx.fillText(label, x + 4, height - 12);
    }

    ctx.strokeStyle = theme.grid;
    ctx.strokeRect(plotLeft, plotTop, plotRight - plotLeft, plotBottom - plotTop);

    ctx.restore();
  }

  function buildPoints(values) {
    const points = new Array(values.length);
    for (let i = 0; i < values.length; i++) {
      points[i] = { x: indexToX(i), y: valueToY(values[i]), value: values[i], index: i };
    }
    return points;
  }

  function drawLine(points, color, useBezier) {
    if (!points.length) return;
    if (useBezier) {
      drawCatmullRomSpline(points, color, 3);
      return;
    }
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawPoints(points, color) {
    const theme = THEMES[state.theme];
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = theme.pointStroke;
    ctx.lineWidth = 2;
    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawArea(points, color) {
    if (points.length < 2) return;
    const theme = THEMES[state.theme];
    const baselineY = valueToY(state.minValue);
    ctx.save();
    ctx.globalAlpha = theme.areaAlpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0].x, baselineY);
    ctx.lineTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, baselineY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawBars(seriesVisible) {
    const baselineY = valueToY(state.minValue);
    const plotW = width - PADDING.left - PADDING.right;
    const nPoints = getPointCount();
    const groupW = plotW / (nPoints - 1);
    const barCount = Math.max(1, seriesVisible.length);
    const barW = Math.max(2, (groupW * 0.72) / barCount);

    for (let i = 0; i < nPoints; i++) {
      const xCenter = indexToX(i);
      const xStart = xCenter - (barCount * barW) / 2;

      for (let j = 0; j < barCount; j++) {
        const s = seriesVisible[j];
        const v = s.values[i];
        const y = valueToY(v);
        const x = xStart + j * barW;
        const h = baselineY - y;
        ctx.save();
        ctx.fillStyle = s.color;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(x, y, barW - 1, h);
        ctx.restore();
      }
    }
  }

  function drawScatter(points, color) {
    drawPoints(points, color);
  }

  function draw() {
    drawBackground();
    drawGridAndLabels();

    const theme = THEMES[state.theme];
    state.renderPoints.clear();

    const visible = state.series
      .filter((s) => s.visible)
      .map((s) => {
        let values = s.data.slice();
        if (state.smoothing && state.smoothingMethod === 'movingAverage') {
          values = movingAverage(values, state.smoothingWindow);
        }
        return { name: s.name, color: s.color, values };
      });

    for (const s of visible) {
      const points = buildPoints(s.values);
      state.renderPoints.set(s.name, points);

      if (state.chartType === 'area') {
        drawArea(points, s.color);
        drawLine(points, s.color, state.smoothing && state.smoothingMethod === 'bezier');
        drawPoints(points, s.color);
      } else if (state.chartType === 'line') {
        drawLine(points, s.color, state.smoothing && state.smoothingMethod === 'bezier');
        drawPoints(points, s.color);
      } else if (state.chartType === 'scatter') {
        drawScatter(points, s.color);
      }
    }

    if (state.chartType === 'bar') {
      drawBars(visible);
      for (let i = 0; i < getPointCount(); i++) {
        const x = indexToX(i);
        for (const s of visible) {
          const y = valueToY(s.values[i]);
          const arr = state.renderPoints.get(s.name) || [];
          arr[i] = { x, y, value: s.values[i], index: i };
          state.renderPoints.set(s.name, arr);
        }
      }
    }

    renderStats(theme);
  }

  function renderStats() {
    const cards = [];
    for (const s of state.series) {
      if (!s.visible) continue;
      const st = computeStats(s.data);
      cards.push(
        `<div class="statCard">
          <h3>${escapeHtml(s.name)}</h3>
          <div class="statRow"><span>Current</span><span><strong>${round(st.current, 1)}</strong> ${st.trend}</span></div>
          <div class="statRow"><span>Min</span><span>${round(st.min, 1)}</span></div>
          <div class="statRow"><span>Max</span><span>${round(st.max, 1)}</span></div>
          <div class="statRow"><span>Average</span><span>${round(st.avg, 1)}</span></div>
        </div>`
      );
    }
    elStats.innerHTML = cards.length ? cards.join('') : `<div class="hint">No series selected.</div>`;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function hideTooltip() {
    elTooltip.hidden = true;
  }

  function showTooltip({ x, y, html }) {
    elTooltip.hidden = false;
    elTooltip.innerHTML = html;
    elTooltip.style.left = `${x}px`;
    elTooltip.style.top = `${y}px`;
  }

  function onMouseMove(evt) {
    const rect = canvas.getBoundingClientRect();
    const mx = evt.clientX - rect.left;
    const my = evt.clientY - rect.top;

    let best = null;
    const threshold = 14;
    const threshold2 = threshold * threshold;

    for (const [seriesName, points] of state.renderPoints.entries()) {
      for (const p of points) {
        if (!p) continue;
        const dx = p.x * (rect.width / width) - mx;
        const dy = p.y * (rect.height / height) - my;
        const d2 = dx * dx + dy * dy;
        if (d2 <= threshold2 && (!best || d2 < best.d2)) {
          best = { seriesName, p, d2, dx, dy };
        }
      }
    }

    if (!best) {
      hideTooltip();
      return;
    }

    const html = `
      <div><strong>${escapeHtml(best.seriesName)}</strong></div>
      <div>Index: ${best.p.index}</div>
      <div>Value: <strong>${round(best.p.value, 2)}</strong></div>
    `;

    showTooltip({ x: mx, y: my, html });
  }

  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseleave', hideTooltip);

  function setRunning(running) {
    state.running = running;
    elToggleRun.textContent = running ? 'Pause' : 'Start';
    elToggleRun.classList.toggle('primary', !running);
    if (running) startTimer();
    else stopTimer();
  }

  function stopTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function startTimer() {
    stopTimer();
    state.timerId = setInterval(() => {
      pushTick();
      draw();
    }, state.intervalMs);
  }

  function applyTheme(themeName) {
    state.theme = themeName;
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-contrast');
    document.body.classList.add(`theme-${themeName}`);

    const palette = THEMES[themeName].series;
    for (let i = 0; i < state.series.length; i++) {
      state.series[i].color = palette[i % palette.length];
    }
    renderSeriesControls();
    draw();
  }

  function renderSeriesControls() {
    elSeriesControls.innerHTML = '';
    for (let i = 0; i < state.series.length; i++) {
      const s = state.series[i];
      const item = document.createElement('div');
      item.className = 'seriesItem';
      item.innerHTML = `
        <div class="seriesLeft">
          <div class="swatch" style="background:${s.color}"></div>
          <label class="check" style="margin:0;">
            <input type="checkbox" ${s.visible ? 'checked' : ''} data-series-index="${i}" />
            <span>${escapeHtml(s.name)}</span>
          </label>
        </div>
      `;
      elSeriesControls.appendChild(item);
    }

    elSeriesControls.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener('change', (e) => {
        const idx = Number(e.target.getAttribute('data-series-index'));
        state.series[idx].visible = e.target.checked;
        draw();
      });
    });
  }

  elToggleRun.addEventListener('click', () => setRunning(!state.running));
  elReset.addEventListener('click', resetData);
  elExport.addEventListener('click', () => {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `canvas-chart-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  elInterval.addEventListener('input', () => {
    state.intervalMs = safeParseNumber(elInterval.value, 1000);
    elIntervalLabel.textContent = `${state.intervalMs}ms`;
    if (state.running) startTimer();
  });

  elShowGrid.addEventListener('change', () => {
    state.showGrid = elShowGrid.checked;
    draw();
  });

  elChartType.addEventListener('change', () => {
    state.chartType = elChartType.value;
    draw();
  });

  elTheme.addEventListener('change', () => applyTheme(elTheme.value));

  elEnableSmoothing.addEventListener('change', () => {
    state.smoothing = elEnableSmoothing.checked;
    elSmoothingControls.hidden = !state.smoothing;
    draw();
  });

  elSmoothingMethod.addEventListener('change', () => {
    state.smoothingMethod = elSmoothingMethod.value;
    draw();
  });

  elSmoothingWindow.addEventListener('input', () => {
    state.smoothingWindow = safeParseNumber(elSmoothingWindow.value, 5);
    draw();
  });

  function applyRangeFromInputs({ reset = false } = {}) {
    const minV = safeParseNumber(elMinValue.value, 0);
    const maxV = safeParseNumber(elMaxValue.value, height);
    if (maxV <= minV) {
      state.minValue = minV;
      state.maxValue = minV + 1;
      elMaxValue.value = String(state.maxValue);
    } else {
      state.minValue = minV;
      state.maxValue = maxV;
    }
    if (reset) resetData();
    else draw();
  }

  elMinValue.addEventListener('change', () => applyRangeFromInputs({ reset: true }));
  elMaxValue.addEventListener('change', () => applyRangeFromInputs({ reset: true }));

  function init() {
    state.intervalMs = safeParseNumber(elInterval.value, 1000);
    elIntervalLabel.textContent = `${state.intervalMs}ms`;
    state.showGrid = elShowGrid.checked;
    state.chartType = elChartType.value;
    state.smoothing = elEnableSmoothing.checked;
    state.smoothingMethod = elSmoothingMethod.value;
    state.smoothingWindow = safeParseNumber(elSmoothingWindow.value, 5);
    state.minValue = safeParseNumber(elMinValue.value, 0);
    state.maxValue = safeParseNumber(elMaxValue.value, height);

    applyTheme(elTheme.value);
    buildSeries();
    draw();
    setRunning(true);
  }

  init();
});
