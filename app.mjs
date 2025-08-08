class GridContainer extends HTMLElement {
    rows;
    cols;
    display;
    rowTemplate;
    colTemplate;
    styleSheet;
    selfStyleRule;
    root = null;
    rowsVector;
    colsVector;
    static observedAttributes = ['rows', 'cols', 'rowTemplate', 'colTemplate'];
    constructor(rows = 1, cols = 1, display = 'grid', rowTemplate = `repeat(${rows}, 1fr)`, colTemplate = `repeat(${cols}, 1fr)`) {
        super();
        this.rows = rows;
        this.cols = cols;
        this.display = display;
        this.rowTemplate = rowTemplate;
        this.colTemplate = colTemplate;
        this.styleSheet = new CSSStyleSheet;
        this.selfStyleRule = this.styleSheet.cssRules[this.styleSheet.insertRule(':host {}')];
        this.rowsVector = [];
        this.colsVector = [];
        const propertyValuePairs = [
            ['border', '1px solid #A0A0A0'],
            ['box-sizing', 'border-box'],
            ['display', 'grid'],
            ['overflow', 'auto'],
            ['gap', 'var(--spacing)'],
            ['grid-auto-columns', '0'],
            ['grid-auto-rows', '0'],
            ['grid-template-columns', colTemplate],
            ['grid-template-rows', rowTemplate],
        ];
        for (const [property, value] of propertyValuePairs)
            this.updateStyle(property, value);
    }
    updateStyle(property, value) {
        try {
            CSSStyleValue.parse(property, value);
            this.selfStyleRule.style.setProperty(property, value);
        }
        catch {
            console.error(`Unable to parse ${value} as valid value for ${property}.`);
        }
    }
    sliderCallback(whatFor, oldVal, newVal) {
        const difference = newVal - oldVal;
        const have = Array.from(this.getElementsByTagName('grid-slider'))
            .filter(element => element.getAttribute('whatFor') === whatFor);
        switch (true) {
            case difference > 0:
                /* Grid cell corresponds to 1, slider - 0.
                   Vectors must start with 1 and drop the last 0.
                   Sliders are required BETWEEN grid cells, not at the start/end.
                   Maybe CSS's `resize` is a better tool for that purpose?!  */
                /* Slower? Three array construction (inital, `flat` and `toSpliced`) */
                // this.rowVector.push( ...Array( difference ).fill( [ 1, 0 ] ).flat().toSpliced( -1 ) )
                /* Faster? `splice` should be some kind of modify-in-place/slice mechanic, therefore less memory usage but computationally expensive?!  */
                this[`${whatFor}Vector`].push(...Array(difference).fill([1, 0]).flat().splice(difference << 1 - 1));
                Array.from({ length: difference - 1 }, _ => {
                    let slider = document.createElement("grid-slider");
                    slider.setAttribute("whatFor", whatFor);
                    this.appendChild(slider);
                });
                break;
            case difference < 0:
                if (-difference >= oldVal)
                    throw Error(`${this.constructor.name}'s ${whatFor} can't be negative!`);
                this[`${whatFor}Vector`].splice(difference << 1);
                Array.from({ length: -difference }, _ => {
                    debugger;
                });
                break;
            case difference == 0:
                break;
        }
        console.log(this[`${whatFor}Vector`]);
    }
    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case 'rowTemplate':
                this.updateStyle('grid-template-rows', newVal ?? 'repeat(1, 1fr)');
                break;
            case 'colTemplate':
                this.updateStyle('grid-template-columns', newVal ?? 'repeat(1, 1fr)');
                break;
            case 'cols':
            case 'rows':
                this.sliderCallback(name, Number(oldVal), Number(newVal));
                this.updateStyle('grid-template-rows', `repeat(${newVal ?? '1'},     1fr)`);
                break;
            default:
                const _exhaustive = name;
                throw new Error(`GridContainer's attributeChangedCallback's switch is non-exhaustive. Missed ${_exhaustive}`);
        }
    }
    connectedCallback() {
        this.root = this.attachShadow({ mode: 'open' });
        this.root.adoptedStyleSheets = [this.styleSheet];
        this.root.appendChild(document.createElement('slot'));
    }
}
class GridSlider extends HTMLElement {
    constructor() {
        super();
    }
}
customElements.define('grid-container', GridContainer);
export {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBVUEsTUFBTSxhQUFjLFNBQVEsV0FBVztJQVVyQjtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBYmQsVUFBVSxDQUFtQjtJQUM3QixhQUFhLENBQWU7SUFDNUIsSUFBSSxHQUFnQyxJQUFJLENBQUE7SUFDeEMsVUFBVSxDQUFtQjtJQUM3QixVQUFVLENBQW1CO0lBQzdCLE1BQU0sQ0FBVSxrQkFBa0IsR0FDNUIsQ0FBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxhQUFhLENBQVcsQ0FBQTtJQUUvRCxZQUNjLE9BQXVDLENBQUMsRUFDeEMsT0FBdUMsQ0FBQyxFQUN4QyxVQUF1QyxNQUFNLEVBQzdDLGNBQXVDLFVBQVcsSUFBSyxRQUFRLEVBQy9ELGNBQXVDLFVBQVcsSUFBSyxRQUFRO1FBRXpFLEtBQUssRUFBRSxDQUFBO1FBTkcsU0FBSSxHQUFKLElBQUksQ0FBb0M7UUFDeEMsU0FBSSxHQUFKLElBQUksQ0FBb0M7UUFDeEMsWUFBTyxHQUFQLE9BQU8sQ0FBc0M7UUFDN0MsZ0JBQVcsR0FBWCxXQUFXLENBQW9EO1FBQy9ELGdCQUFXLEdBQVgsV0FBVyxDQUFvRDtRQUl6RSxJQUFJLENBQUMsVUFBVSxHQUFNLElBQUksYUFBYSxDQUFBO1FBQ3RDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUUsVUFBVSxDQUFFLENBQWtCLENBQUE7UUFDekcsSUFBSSxDQUFDLFVBQVUsR0FBTSxFQUFFLENBQUE7UUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBTSxFQUFFLENBQUE7UUFFdkIsTUFBTSxrQkFBa0IsR0FBOEI7WUFDbEQsQ0FBRSxRQUFRLEVBQWtCLG1CQUFtQixDQUFFO1lBQ2pELENBQUUsWUFBWSxFQUFjLFlBQVksQ0FBUztZQUNqRCxDQUFF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