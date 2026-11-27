// Thin wrapper around the HTML overlay elements defined in index.html.
export class Hud {
  constructor() {
    this.prompt = document.getElementById('prompt');
    this.stats = document.getElementById('stats');
    this.inspect = document.getElementById('inspect');
    this.inspectTitle = document.getElementById('inspect-title');
    this.inspectBody = document.getElementById('inspect-body');
    this.overlay = document.getElementById('overlay');
    this.startButton = document.getElementById('start');
    this.status = document.getElementById('status');

    this.frames = 0;
    this.statsTimer = 0;
    this.startButton.disabled = true;
  }

  setStatus(text) {
    this.status.textContent = text;
  }

  onStart(callback) {
    this.startButton.addEventListener('click', callback);
  }

  setReady() {
    this.startButton.disabled = false;
  }

  setOverlayVisible(visible) {
    this.overlay.classList.toggle('hidden', !visible);
    this.startButton.textContent = 'Click to resume';
  }

  showPrompt(text) {
    this.prompt.textContent = text;
    this.prompt.classList.remove('hidden');
  }

  hidePrompt() {
    this.prompt.classList.add('hidden');
  }

  get isInspecting() {
    return !this.inspect.classList.contains('hidden');
  }

  openInspect(title, body) {
    this.inspectTitle.textContent = title;
    this.inspectBody.textContent = body;
    this.inspect.classList.remove('hidden');
  }

  closeInspect() {
    this.inspect.classList.add('hidden');
  }

  updateStats(dt, backend) {
    this.frames++;
    this.statsTimer += dt;
    if (this.statsTimer >= 0.5) {
      const fps = Math.round(this.frames / this.statsTimer);
      this.stats.textContent = `${backend}\n${fps} fps`;
      this.frames = 0;
      this.statsTimer = 0;
    }
  }
}
