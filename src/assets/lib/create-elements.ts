const createElement = (html: string): HTMLElement => {
    const div: HTMLDivElement = document.createElement('div');
    div.innerHTML = html;
    return div.firstElementChild as HTMLElement;
};


export default createElement;