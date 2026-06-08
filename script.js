/* ── DIRECT AR INITIALIZATION WITHOUT PRE-STREAM LOCKS ── */
async function startAR() {
  if (arStarted) return;

  loadingOverlay.classList.add('show');
  loadingStatus.textContent = 'Initialising AR Camera';

  try {
    // Reveal a-scene first so the WebGL rendering context is fully ready
    arScene.style.visibility  = 'visible';
    arScene.style.opacity     = '1';
    arScene.style.pointerEvents = 'auto';

    let readyFired = false;

    const onReady = () => {
      if (readyFired) return;
      readyFired = true;

      loadingOverlay.classList.remove('show');
      scanHint.style.opacity = '1';
      arStarted = true;

      swipeZone.classList.add('active');

      alwaysVisible.forEach(el => {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      });
      markerEls.forEach(el => {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      });

      selectDish(0);
      showSwipeHintOnce();
    };

    // Listen directly for MindAR to finish setting up the video pipeline
    arScene.addEventListener('loaded',   onReady, { once: true });
    arScene.addEventListener('arReady',  onReady, { once: true });

    // Fallback if events take slightly longer on slower devices
    setTimeout(onReady, 5000);

  } catch (err) {
    console.error('Camera error:', err);
    loadingOverlay.classList.remove('show');
    errorOverlay.classList.add('show');
  }
}
