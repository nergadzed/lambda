class GridContainer extends HTMLElement {
    rows;
    cols;
    display;
    rowTemplate;
    colTemplate;
    styleSheet;
    selfStyleRule;
    root = null;
    rowVector;
    colVector;
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
        (this.colVector = Array(cols).fill([1, 0]).flat()).pop();
        (this.rowVector = Array(rows).fill([1, 0]).flat()).pop();
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
    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case 'rowTemplate':
                this.updateStyle('grid-template-rows', newVal ?? 'repeat(1, 1fr)');
                break;
            case 'colTemplate':
                this.updateStyle('grid-template-columns', newVal ?? 'repeat(1, 1fr)');
                break;
            case 'rows':
                this.rowVector.forEach(callbackfn);
                this.updateStyle('grid-template-rows', `repeat(${newVal ?? '1'},     1fr)`);
                break;
            case 'cols':
                this.updateStyle('grid-template-columns', `repeat(${newVal ?? '1'},     1fr)`);
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
    orientation;
    constructor(orientation) {
        super();
        this.orientation = orientation;
    }
    connectedCallback() {
        switch (this.orientation) {
            case 'horizontal':
                this.attributeStyleMap.set('height', 'var(--spacing)');
                break;
            case 'vertical':
                this.attributeStyleMap.set('width', 'var(--spacing)');
                break;
            default:
                const _exhaustive = this.orientation;
        }
    }
}
customElements.define('grid-container', GridContainer);
export {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBVUEsTUFBTSxhQUFjLFNBQVEsV0FBVztJQVVyQjtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBYmQsVUFBVSxDQUFtQjtJQUM3QixhQUFhLENBQWU7SUFDNUIsSUFBSSxHQUFnQyxJQUFJLENBQUE7SUFDeEMsU0FBUyxDQUFvQjtJQUM3QixTQUFTLENBQW9CO0lBQzdCLE1BQU0sQ0FBVSxrQkFBa0IsR0FDNUIsQ0FBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxhQUFhLENBQVcsQ0FBQTtJQUUvRCxZQUNjLE9BQXVDLENBQUMsRUFDeEMsT0FBdUMsQ0FBQyxFQUN4QyxVQUF1QyxNQUFNLEVBQzdDLGNBQXVDLFVBQVcsSUFBSyxRQUFRLEVBQy9ELGNBQXVDLFVBQVcsSUFBSyxRQUFRO1FBRXpFLEtBQUssRUFBRSxDQUFBO1FBTkcsU0FBSSxHQUFKLElBQUksQ0FBb0M7UUFDeEMsU0FBSSxHQUFKLElBQUksQ0FBb0M7UUFDeEMsWUFBTyxHQUFQLE9BQU8sQ0FBc0M7UUFDN0MsZ0JBQVcsR0FBWCxXQUFXLENBQW9EO1FBQy9ELGdCQUFXLEdBQVgsV0FBVyxDQUFvRDtRQUl6RSxJQUFJLENBQUMsVUFBVSxHQUFNLElBQUksYUFBYSxDQUFBO1FBQ3RDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUUsVUFBVSxDQUFFLENBQWtCLENBQUE7UUFDekcsQ0FBRSxJQUFJLENBQUMsU0FBUyxHQUFLLEtBQUssQ0FBRSxJQUFJLENBQUUsQ0FBQyxJQUFJLENBQUUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ25FLENBQUUsSUFBSSxDQUFDLFNBQVMsR0FBSyxLQUFLLENBQUUsSUFBSSxDQUFFLENBQUMsSUFBSSxDQUFFLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFFLENBQUMsSUFBSSxFQUFFLENBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUVuRSxNQUFNLGtCQUFrQixHQUE4QjtZQUNsRCxDQUFFLFFBQVEsRUFBa0IsbUJBQW1CLENBQUU7WUFDakQsQ0FBRSxZQUFZLEVBQWMsWUFBWSxDQUFTO1lBQ2pELENBQUUsU0FBUyxFQUFpQixNQUFNLENBQWU7WUFDakQsQ0FBRSxVQUFVLEVBQWdCLE1BQU0sQ0FBZTtZQUNqRCxDQUFFLEtBQUssRUFBcUIsZ0JBQWdCLENBQUs7WUFDakQsQ0FBRSxtQkFBbUIsRUFBTyxHQUFHLENBQWtCO1lBQ2pELENBQUUsZ0JBQWdCLEVBQVUsR0FBRyxDQUFrQjtZQUNqRCxDQUFFLHVCQUF1QixFQUFHLFdBQVcsQ0FBVTtZQUNqRCxDQUFFLG9CQUFvQixFQUFNLFdBQVcsQ0FBVTtTQUNwRCxDQUFBO1FBQ0QsS0FBTSxNQUFNLENBQUUsUUFBUSxFQUFFLEtBQUssQ0FBRSxJQUFJLGtCQUFrQjtZQUNqRCxJQUFJLENBQUMsV0FBVyxDQUFFLFFBQVEsRUFBRSxLQUFLLENBQUUsQ0FBQTtJQUMzQyxDQUFDO0lBRVMsV0FBVyxDQUFFLFFBQWdCLEVBQUUsS0FBYTtRQUNsRCxJQUFJLENBQUM7WUFDRCxhQUFhLENBQUMsS0FBSyxDQUFtQixRQUFRLEVBQUUsS0FBSyxDQUFFLENBQUE7WUFDdkQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFFLFFBQVEsRUFBRSxLQUFLLENBQUUsQ0FBQTtRQUMzRCxDQUFDO1FBQUMsTUFBTSxDQUFDO1lBQ0wsT0FBTyxDQUFDLEtBQUssQ0FBeUIsbUJBQW9CLEtBQU0sdUJBQXdCLFFBQVMsR0FBRyxDQUFFLENBQUE7UUFDMUcsQ0FBQztJQUNMLENBQUM7SUFFRCx3QkFBd0IsQ0FDcEIsSUFBMEQsRUFDMUQsTUFBc0IsRUFDdEIsTUFBc0I7UUFFdEIsUUFBUyxJQUFJLEVBQUcsQ0FBQztZQUNqQixLQUFLLGFBQWE7Z0JBQ2QsSUFBSSxDQUFDLFdBQVcsQ0FBRSxvQkFBb0IsRUFBSyxNQUFNLElBQUksZ0JBQWdCLENBQWEsQ0FBQTtnQkFDbEYsTUFBSztZQUNULEtBQUssYUFBYTtnQkFDZCxJQUFJLENBQUMsV0FBVyxDQUFFLHVCQUF1QixFQUFFLE1BQU0sSUFBSSxnQkFBZ0IsQ0FBYSxDQUFBO2dCQUNsRixNQUFLO1lBQ1QsS0FBSyxNQUFNO2dCQUNQLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFBO2dCQUNsQyxJQUFJLENBQUMsV0FBVyxDQUFFLG9CQUFvQixFQUFLLFVBQVcsTUFBTSxJQUFJLEdBQUksWUFBWSxDQUFFLENBQUE7Z0JBQ2xGLE1BQUs7WUFDVCxLQUFLLE1BQU07Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBRSx1QkFBdUIsRUFBRSxVQUFXLE1BQU0sSUFBSSxHQUFJLFlBQVksQ0FBRSxDQUFBO2dCQUNsRixNQUFLO1lBQ1Q7Z0JBQ0ksTUFBTSxXQUFXLEdBQVUsSUFBSSxDQUFBO2dCQUMvQixNQUFNLElBQUksS0FBSyxDQUFFLCtFQUFnRixXQUFZLEVBQUUsQ0FBRSxDQUFBO1FBQ3JILENBQUM7SUFDTCxDQUFDO0lBRUQsaUJBQWlCO1FBQ2IsSUFBSSxDQUFDLElBQUksR0FBc0IsSUFBSSxDQUFDLFlBQVksQ0FBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBRSxDQUFBO1FBQ3BFLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBRSxJQUFJLENBQUMsVUFBVSxDQUFFLENBQUE7UUFFbEQsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBRSxNQUFNLENBQUUsQ0FBRSxDQUFBO0lBQzdELENBQUM7O0FBR0wsTUFBTSxVQUFXLFNBQVEsV0FBVztJQUNWO0lBQXRCLFlBQXNCLFdBQXNDO1FBQ3hELEtBQUssRUFBRSxDQUFBO1FBRFcsZ0JBQVcsR0FBWCxXQUFXLENBQTJCO0lBRTVELENBQUM7SUFDRCxpQkFBaUI7UUFDYixRQUFTLElBQUksQ0FBQyxXQUFXLEVBQUcsQ0FBQztZQUM3QixLQUFLLFlBQVk7Z0JBQ2IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBRSxRQUFRLEVBQUUsZ0JBQWdCLENBQUUsQ0FBQTtnQkFDeEQsTUFBSztZQUNULEtBQUssVUFBVTtnQkFDWCxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFFLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBRSxDQUFBO2dCQUN2RCxNQUFLO1lBQ1Q7Z0JBQ0ksTUFBTSxXQUFXLEdBQVUsSUFBSSxDQUFDLFdBQVcsQ0FBQTtRQUMvQyxDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBRUQsY0FBYyxDQUFDLE1BQU0sQ0FBRSxnQkFBZ0IsRUFBRSxhQUFhLENBQUUsQ0FBQSJ9