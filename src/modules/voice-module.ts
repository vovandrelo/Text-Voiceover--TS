import "../styles/modules/voice.sass";
import createElement from "../assets/lib/create-elements";

// <================================================== ОПИСАНИЕ ТИПОВ =================================================> \\

// Структура плеера:
interface IVoice {
    render: () => void,                                             // Рендер
    getElem: () => HTMLElement,                                     // Получение основного элемента
    createPopUpMenu: (voices: SpeechSynthesisVoice[]) => void,      // Создание меню с выбором голоса
    buttonsHandler: (event: Event) => void,                         // Обработка действий кнопок
    convertTextToSpeech: () => void,                                // Произношение текста
    changeSettings: (event: InputEvent) => void;                    // Изменение насроек произношения
}

// <================================================= РЕАЛИЗАЦИЯ МОДУЛЯ ===============================================> \\
export default class Voice implements IVoice {
    // <============================================ ОБЪЯВЛЕНИЕ ПЕРЕМЕННЫХ ============================================> \\
    private elem: null | HTMLElement = null;                        // Основной элемент
    private langList: null | HTMLSelectElement = null;              // Элемент со списком голосов
    private buttons: null | HTMLDivElement = null;                  // Элемент с кнопками плеера
    private text: null | HTMLTextAreaElement = null;                // Элемент с текстовым полем
    private SpeechSynthesisObj = new SpeechSynthesisUtterance();    // Объект для воспроизведения текста
    private voices = speechSynthesis.getVoices();                   // Массив с голосами
    private volume: null | HTMLInputElement = null;                 // Элемент с настройкой громкости
    private rate: null | HTMLInputElement = null;                   // Элемент с настройкой скорости
    private pitch: null | HTMLInputElement = null;                  // Элемент с настройкой высоты голоса

    // <=========================================== РЕАЛИЗАЦИЯ КОНСТРУКТОРА ===========================================> \\
    constructor() {
        this.render();
    }

    // <=============================================== РЕНДЕР ПЛЕЕРА =================================================> \\
    render = () => {
        // Создание вёрстки плеера
        this.elem = createElement(`
            <div class="voice">
                <h1 class="title">Player</h1>
                <label>
                    Text:
                    <textarea class="text">Привет! Как дела?</textarea>
                </label>
                <label>
                    Voice:
                    <select class="languages"></select>
                </label>
                <label>
                    Volume:
                    <input data-range-type="volume" class="volume" type="range" min="0" max="1" step="0.1" value="1" />
                </label>
                <label>
                    Rate:
                    <input data-range-type="rate" class="rate" type="range" min="0" max="3" step="0.2" value="0.8" />
                </label>
                <label>Pitch:
                    <input data-range-type="pitch" class="pitch" type="range" min="0" max="2" step="0.5" value="1" />
                </label>
                <div class="buttons">
                    <button class="speak" data-btn-type="speak">Speak</button>
                    <button class="cancel" data-btn-type="cancel">Cancel</button>
                    <button class="pause" data-btn-type="pause">Pause</button>
                    <button class="resume" data-btn-type="resume">Resume</button>
                </div>
            </div>
        `);

        // Получение необходимых элементов:
        this.langList = this.elem.querySelector(".languages") as HTMLSelectElement; // Список с голосами
        this.buttons = this.elem.querySelector(".buttons") as HTMLDivElement;       // Панель с кнопками
        this.text = this.elem.querySelector(".text") as HTMLTextAreaElement;        // Блок с текстом
        this.volume = this.elem.querySelector(".volume") as HTMLInputElement;       // Настройка громкости
        this.rate = this.elem.querySelector(".rate") as HTMLInputElement;           // Настройка скорости
        this.pitch = this.elem.querySelector(".pitch") as HTMLInputElement;         // Настройка высоты

        // Создание выпадающего меню с выбором голоса:
        speechSynthesis.addEventListener("voiceschanged", () => {
            // Получение всех возможных голосов:
            this.voices = speechSynthesis.getVoices();
            // На основании полученных голосов формирование меню:
            this.createPopUpMenu(this.voices);
        });

        // Обработка событий:
        this.elem.addEventListener("change", this.changeSettings);      // Изменение настроек воспроизведения
        this.SpeechSynthesisObj.onstart = () => console.log('Started')  // Начало произношения
        this.SpeechSynthesisObj.onend = () => console.log('Finished')   // Завершение произношения
        this.SpeechSynthesisObj.onerror = (err) => console.error(err)   // Ошибка при произношении
        this.buttons.addEventListener('click', this.buttonsHandler)     // Клик по кнопкам
    }

    // <============================================== ПОЛУЧЕНИЕ ПЛЕЕРА ===============================================> \\
    getElem = (): HTMLElement => {
        return this.elem as HTMLElement;
    }

    // <========================================= СОЗДАНИЕ МЕНЮ С ГОЛОСАМИ ============================================> \\
    createPopUpMenu = (voices: SpeechSynthesisVoice[]) => {
        // Если список с голосами был успешно создан и является Select-элементом, то:
        if (this.langList && this.langList instanceof HTMLSelectElement) {
            // Формирование списка с голосами:
            voices.forEach((voice, index) => {
                if (this.langList && this.langList instanceof HTMLSelectElement) {
                    const newOption = new Option(voice.name, String(index));
                    this.langList.append(newOption);
                }
            })

            // Формирвоание значения по-умочанию:
            const defaultLangIdx = voices.findIndex(voice => voice.name === 'Google русский');
            const defaulLangOption = this.langList[defaultLangIdx] as HTMLOptionElement;
            defaulLangOption.selected = true;
        }
    }

    // <========================================= ОБРАБОТКА НАЖАТИЙ КНОПОК ============================================> \\
    buttonsHandler = (event: Event) => {
        const eventTarget = event.target as HTMLButtonElement;  // Получени кнопки, по которой был клик
        const btnType = eventTarget.dataset.btnType;            // Получение типа кнопки, по которой был клик

        // В зависимости от типа кнопки реализуем необходимое действие:
        switch (btnType) {
            // Если тип кнопки "Воспроизведение", то:
            case 'speak':
                // Если текста в очереди на озвучивание нет, то:
                if (!speechSynthesis.speaking) {
                    // Воспроизводим текст:
                    this.convertTextToSpeech();
                }
                break;
            // Если тип кнопки "Отмена", то:
            case 'cancel':
                // Останавливаем воспроизведение:
                speechSynthesis.cancel();
                break;
            // Если тип кнопки "Пауза", то:
            case 'pause':
                // Ставим воспроизведение на паузу:
                speechSynthesis.pause();
                break;
            // Если тип кнопки "Продолжить", то:
            case 'resume':
                // Продолжаем воспроизведение: 
                speechSynthesis.resume();
                break;
            default:
                break;
        }
    }

    // <========================================== ВОСПРОИЗВЕДЕНИЕ ТЕКСТА =============================================> \\
    convertTextToSpeech = () => {        
        if (this.text && this.langList && this.volume && this.rate && this.pitch) {
            // Удаление из текста крайних пробелов:
            const textValue = this.text.value.trim();

            // Если после удаления пробелом текст остался, то:
            if (!textValue) return

            // Указываем, какой текст произнести:
            this.SpeechSynthesisObj.text = textValue;

            // Указываем, каким голосом и на каком языке текст необходимо произнести:
            const voice = this.voices[+this.langList.value];
            this.SpeechSynthesisObj.voice = voice;
            this.SpeechSynthesisObj.lang = voice.lang;

            // Указываем настройки воспроизведения: громкость/скорость/высота
            this.SpeechSynthesisObj.volume = +this.volume.value;
            this.SpeechSynthesisObj.rate = +this.rate.value;
            this.SpeechSynthesisObj.pitch = +this.pitch.value;

            // Запуск произношения:
            speechSynthesis.speak(this.SpeechSynthesisObj)
        }
    }

    // <========================================= ИЗМЕНЕНИЕ НАСТРОЕК ПЛЕЕРА ===========================================> \\
    changeSettings = (event: Event) => {
        const eventTarget = event.target as HTMLInputElement;   // Получение "ползунка", который был изменён
        const value = eventTarget.value;                        // Получение нового значения

        // Если все "ползунки-настройки" были успешно отрендерены, то:
        if (this.volume && this.rate && this.pitch) {
            // В зависимости от ползунка, который был изменён, изменяем значение настройки:
            switch(eventTarget.dataset.rangeType) {
                case "volume":
                    this.volume.value = value;
                    break;
                case "rate":
                    this.rate.value = value;
                    break;
                case "pitch":
                    this.pitch.value = value;
                    break;
                default:
                    break
            }
        } 
    }
}