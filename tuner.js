// Important, the client needs to implement tuner.onNoteDetected(note)

const Tuner = function (a4) {
    this.middleA = a4 || 440
    this.semitone = 69
    this.bufferSize = 4096
    this.noteStrings = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
}

Tuner.prototype.startRecord = function () {
    const self = this
    navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(function (stream) {
            self.audioContext.createMediaStreamSource(stream).connect(self.analyser)
            self.analyser.connect(self.scriptProcessor)
            self.scriptProcessor.connect(self.audioContext.destination)
            self.scriptProcessor.addEventListener('audioprocess', function (event) {
                const frequency = self.pitchDetector.do(
                    event.inputBuffer.getChannelData(0)
                )
                if (frequency && self.onNoteDetected) {
                    const note = self.getNote(frequency)
                    self.onNoteDetected({
                        name: self.noteStrings[note % 12],
                        value: note,
                        cents: self.getCents(frequency, note),
                        octave: parseInt(note / 12) - 1,
                        frequency: frequency
                    })
                }
            })
        })
        .catch(function (error) {
            alert(error.name + ': ' + error.message)
        })
}

Tuner.prototype.init = function () {
    this.audioContext = new window.AudioContext()
    this.analyser = this.audioContext.createAnalyser()
    this.scriptProcessor = this.audioContext.createScriptProcessor(
        this.bufferSize,
        1,
        1
    )

    const self = this

    Aubio().then(function (aubio) {
        self.pitchDetector = new aubio.Pitch(
            'default',
            self.bufferSize,
            1,
            self.audioContext.sampleRate
        )
        self.startRecord()
    })
}

/**
 * get musical note from frequency
 *
 * @param {number} frequency
 * @returns {number}
 */
Tuner.prototype.getNote = function (frequency) {
    const note = 12 * (Math.log(frequency / this.middleA) / Math.log(2))
    return Math.round(note) + this.semitone
}

/**
 * get the musical note's standard frequency
 *
 * @param note
 * @returns {number}
 */
Tuner.prototype.getStandardFrequency = function (note) {
    return this.middleA * Math.pow(2, (note - this.semitone) / 12)
}

/**
 * get cents difference between given frequency and musical note's standard frequency
 *
 * @param {number} frequency
 * @param {number} note
 * @returns {number}
 */
Tuner.prototype.getCents = function (frequency, note) {
    return Math.floor(
        (1200 * Math.log(frequency / this.getStandardFrequency(note))) / Math.log(2)
    )
}

/**
 * play the musical note
 *
 * @param {number} frequency
 */
Tuner.prototype.play = function (frequency) {
    if (!this.oscillator) {
        this.oscillator = this.audioContext.createOscillator()
        this.oscillator.connect(this.audioContext.destination)
        this.oscillator.start()
    }
    this.oscillator.frequency.value = frequency
}

Tuner.prototype.stop = function () {
    this.oscillator.stop()
    this.oscillator = null
}
