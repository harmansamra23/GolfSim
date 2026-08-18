type Tone = {
  frequency: number
  duration: number
  volume: number
  type?: OscillatorType
}

function playTone({
  frequency,
  duration,
  volume,
  type = 'sine',
}: Tone) {
  if (typeof window === 'undefined') return

  const AudioContextClass =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext

  if (!AudioContextClass) return

  const context = new AudioContextClass()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const now = context.currentTime

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, now)
  gain.gain.setValueAtTime(volume, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(now)
  oscillator.stop(now + duration)

  oscillator.addEventListener('ended', () => {
    void context.close()
  })
}

export function playShotCue() {
  playTone({
    frequency: 150,
    duration: 0.07,
    volume: 0.06,
    type: 'triangle',
  })
}

export function playHazardCue() {
  playTone({
    frequency: 110,
    duration: 0.2,
    volume: 0.04,
    type: 'sawtooth',
  })
}

export function playHoleCompleteCue() {
  playTone({ frequency: 520, duration: 0.13, volume: 0.035 })
  window.setTimeout(() => {
    playTone({ frequency: 660, duration: 0.18, volume: 0.03 })
  }, 95)
}

export function playUiCue() {
  playTone({ frequency: 330, duration: 0.045, volume: 0.018 })
}
