export function postFigma(data) {
    window.parent.postMessage({ pluginMessage: data }, "*");
}