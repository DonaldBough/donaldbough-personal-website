// All of the personal text shown in the lab lives here, so it is easy to edit
// (and, later on, easy to hand to an in-browser LLM as a knowledge base).

export const content = {
  terminal: {
    title: 'Lab Terminal',
    body: 'DONALD BOUGH — software engineer. This lab is my playground for 3D graphics, GPU programming and on-device AI. More terminals coming online soon.',
    screen: [
      'LAB 07 // RESEARCH TERMINAL',
      '',
      '> whoami',
      'donald bough',
      '> ls ./interests',
      'graphics  gpu  ai  guitar',
      '> status',
      'WebGPU ........ ONLINE',
      'WebLLM ........ PENDING',
    ],
  },
  terminalGpu: {
    title: 'GPU Diagnostics',
    body: 'Reserved for upcoming experiments: compute-shader dust particles and volumetric flashlight beams written in WGSL / TSL.',
    screen: [
      'GPU DIAGNOSTICS',
      '',
      '> compute.dust ...... TODO',
      '> volumetrics ....... TODO',
      '> shadows ........... OK',
      '> renderer .......... {backend}',
    ],
  },
  terminalAi: {
    title: 'AI Core',
    body: 'Soon this terminal will run a language model directly in your browser with WebLLM. Ask it about me, or ask it what Oscar is up to.',
    screen: [
      'AI CORE v0.0.1',
      '',
      '> load model',
      'ERR: model not installed',
      '> eta',
      'soon(tm)',
    ],
  },
  guitar: {
    title: 'Guitar',
    body: 'My guitar. It strums an E major chord every time you interact with it.',
  },
  oscar: {
    title: 'Oscar',
    body: 'Oscar, my miniature dachshund and Head of Lab Security. Very good boy. Will accept treats as payment.',
  },
  labBench: {
    title: 'Lab Bench',
    body: 'Assorted glassware. Most experiments here are shader experiments, so nothing should explode. Probably.',
  },
  door: {
    title: 'Sealed Door',
    body: 'ACCESS DENIED. More rooms are under construction.',
  },
  photos: [
    { title: 'Hong Kong', body: 'Victoria Harbour, Hong Kong.', src: 'assets/photos/hong-kong.jpg' },
    { title: 'Oscar, Off Duty', body: 'Oscar on his blanket, surrounded by his toys.', src: 'assets/photos/oscar.jpg' },
    { title: 'Splash Mountain', body: 'Splash Mountain at Disneyland with friends.', src: 'assets/photos/splash-mountain.jpg' },
  ],
};
