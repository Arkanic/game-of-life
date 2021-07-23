export default class FPS {
    constructor(id) {
        this.fps = document.getElementById(id);
        this.frames = [];
        this.then = performance.now();
    }

    render() {
        let now = performance.now();
        let delta = now - this.then;
        let fps = 1 / delta * 1000;

        this.frames.push(fps);
        if(this.frames.length > 100) {
            this.frames.shift();
        }

        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        for(let i in this.frames) {
            sum += this.frames[i];
            min = Math.min(this.frames[i], min);
            max = Math.max(this.frames[i], max);
        }
        let mean = sum / this.frames.length;

        this.fps.textContent = `
FPS:
         latest = ${Math.round(fps)}
avg of last 100 = ${Math.round(mean)}
min of last 100 = ${Math.round(min)}
max of last 100 = ${Math.round(max)}`.trim();
    }
}