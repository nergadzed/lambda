fetch("./app.css").then(value => {
    let decoder = new TextDecoderStream("utf-8")
    let data = value.body?.pipeThrough(decoder)
    data?.getReader().read().then(value => {
        let stylesheet = new CSSStyleSheet
        stylesheet.insertRule(value.value!)
        document.adoptedStyleSheets.push(stylesheet)
    })
}, reason => console.log(reason))

let [width, height] = [document.documentElement.clientWidth, document.documentElement.clientHeight]
console.log(width, height)