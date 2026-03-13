export function initBehaviorTracking() {
    const state = {
        typingStart: null,
        mouseCount: 0,
        formStart: Date.now()
    };

    const mouseHandler = () => { state.mouseCount++; };

    window.addEventListener('mousemove', mouseHandler);

    return {
        state,
        onType: () => {
            if (!state.typingStart) state.typingStart = Date.now();
        },
        reset: () => {
            state.typingStart = null;
            state.mouseCount = 0;
            state.formStart = Date.now();
        },
        cleanup: () => {
            window.removeEventListener('mousemove', mouseHandler);
        }
    };
}

export function getTypingSpeed(msElapsed) {
    if (!msElapsed) return 0;
    return Math.round(60000 / msElapsed);
}
