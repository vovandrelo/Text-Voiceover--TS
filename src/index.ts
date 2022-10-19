
import "./styles/common.sass";
import Voice from "./modules/voice-module";

class Main {
    private voice;

    constructor() {
        this.voice = new Voice();
        this.render();
    }

    render = () => {
        const voiceElem = this.voice.getElem();
		const voiceContainer = document.querySelector("[data-voice-holder]") as HTMLElement;
        voiceContainer.append(voiceElem)
    }
}

new Main();