class GridContainer extends HTMLElement {
    rows;
    cols;
    display;
    rowTemplate;
    colTemplate;
    static observedAttributes = ["rows", "columns", "rowTemplate", "colTemplate"];
    styleSheet;
    selfStyleRule;
    parent = null;
    constructor(rows = 1, cols = 1, display = "grid", rowTemplate = `repeat(${rows}, 1fr)`, colTemplate = `repeat(${cols}, 1fr)`) {
        super();
        this.rows = rows;
        this.cols = cols;
        this.display = display;
        this.rowTemplate = rowTemplate;
        this.colTemplate = colTemplate;
        try {
            CSSStyleValue.parse("grid-template-rows", rowTemplate);
            CSSStyleValue.parse("grid-template-columns", rowTemplate);
        }
        catch {
            console.error("Unable to parse supplied grid-template-rows/grid-template-columns");
            rowTemplate = `repeat(${rows}, 1fr)`;
            colTemplate = `repeat(${cols}, 1fr)`;
        }
        this.styleSheet = new CSSStyleSheet;
        this.selfStyleRule = this.styleSheet.cssRules.item(this.styleSheet.insertRule("grid-container {}"));
        const propertyValuePairs = [
            ["display", new CSSKeywordValue("grid")],
            ["width", CSS.percent(100)],
            ["height", CSS.percent(100)],
            ["grid-template-rows", new CSSUnparsedValue([rowTemplate])],
            ["grid-template-columns", new CSSUnparsedValue([colTemplate])],
        ];
        for (const [property, value] of propertyValuePairs)
            this.selfStyleRule.styleMap.set(property, value);
    }
    adoptedCallback(...rest) {
        console.log("adoptedCallback", rest);
    }
    attributeChangedCallback(...rest) {
        console.log("attributeChangedCallback", rest);
    }
    connectedCallback(...rest) {
        this.parent = this.parentElement;
        this.parent?.shadowRoot ?? this.parentElement?.attachShadow({ mode: "open" });
        this.parent?.shadowRoot?.adoptedStyleSheets.push(this.styleSheet);
        this.parent?.shadowRoot?.appendChild(this);
    }
    connectedMoveCallback(...rest) {
        console.log("connectedMoveCallback", rest);
    }
    disconnectedCallback(...rest) {
        console.log("disconnectedCallback", rest);
    }
}
customElements.define("grid-container", GridContainer);
export {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBVUEsTUFBTSxhQUFjLFNBQVEsV0FBVztJQU1yQjtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBVGQsTUFBTSxDQUFDLGtCQUFrQixHQUFHLENBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsYUFBYSxDQUFFLENBQUE7SUFDL0UsVUFBVSxDQUFlO0lBQ3pCLGFBQWEsQ0FBYztJQUMzQixNQUFNLEdBQXVCLElBQUksQ0FBQTtJQUNqQyxZQUNjLE9BQWUsQ0FBQyxFQUNoQixPQUFlLENBQUMsRUFDaEIsVUFBa0MsTUFBTSxFQUN4QyxjQUFzQixVQUFXLElBQUssUUFBUSxFQUM5QyxjQUFzQixVQUFXLElBQUssUUFBUTtRQUV4RCxLQUFLLEVBQUUsQ0FBQTtRQU5HLFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsU0FBSSxHQUFKLElBQUksQ0FBWTtRQUNoQixZQUFPLEdBQVAsT0FBTyxDQUFpQztRQUN4QyxnQkFBVyxHQUFYLFdBQVcsQ0FBbUM7UUFDOUMsZ0JBQVcsR0FBWCxXQUFXLENBQW1DO1FBR3hELElBQUksQ0FBQztZQUNELGFBQWEsQ0FBQyxLQUFLLENBQUUsb0JBQW9CLEVBQUUsV0FBVyxDQUFFLENBQUE7WUFDeEQsYUFBYSxDQUFDLEtBQUssQ0FBRSx1QkFBdUIsRUFBRSxXQUFXLENBQUUsQ0FBQTtRQUMvRCxDQUFDO1FBQUMsTUFBTSxDQUFDO1lBQ0wsT0FBTyxDQUFDLEtBQUssQ0FBRSxtRUFBbUUsQ0FBRSxDQUFBO1lBQ3BGLFdBQVcsR0FBRyxVQUFXLElBQUssUUFBUSxDQUFBO1lBQ3RDLFdBQVcsR0FBRyxVQUFXLElBQUssUUFBUSxDQUFBO1FBQzFDLENBQUM7UUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksYUFBYSxDQUFBO1FBQ25DLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFFLG1CQUFtQixDQUFFLENBQWtCLENBQUE7UUFDdkgsTUFBTSxrQkFBa0IsR0FBcUM7WUFDekQsQ0FBRSxTQUFTLEVBQUUsSUFBSSxlQUFlLENBQUUsTUFBTSxDQUFFLENBQUU7WUFDNUMsQ0FBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBRSxHQUFHLENBQUUsQ0FBRTtZQUMvQixDQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFFLEdBQUcsQ0FBRSxDQUFFO1lBQ2hDLENBQUUsb0JBQW9CLEVBQUUsSUFBSSxnQkFBZ0IsQ0FBRSxDQUFFLFdBQVcsQ0FBRSxDQUFFLENBQUU7WUFDakUsQ0FBRSx1QkFBdUIsRUFBRSxJQUFJLGdCQUFnQixDQUFFLENBQUUsV0FBVyxDQUFFLENBQUUsQ0FBRTtTQUN2RSxDQUFBO1FBQ0QsS0FBTSxNQUFNLENBQUUsUUFBUSxFQUFFLEtBQUssQ0FBRSxJQUFJLGtCQUFrQjtZQUNqRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUUsUUFBUSxFQUFFLEtBQUssQ0FBRSxDQUFBO0lBQzFELENBQUM7SUFDRCxlQUFlLENBQUUsR0FBRyxJQUFlO1FBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUUsaUJBQWlCLEVBQUUsSUFBSSxDQUFFLENBQUE7SUFDMUMsQ0FBQztJQUNELHdCQUF3QixDQUFFLEdBQUcsSUFBZTtRQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFFLDBCQUEwQixFQUFFLElBQUksQ0FBRSxDQUFBO0lBQ25ELENBQUM7SUFDRCxpQkFBaUIsQ0FBRSxHQUFHLElBQWU7UUFDakMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFBO1FBQ2hDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFFLENBQUE7UUFDL0UsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsa0JBQWtCLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQTtRQUNuRSxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxXQUFXLENBQUUsSUFBSSxDQUFFLENBQUE7SUFDaEQsQ0FBQztJQUNELHFCQUFxQixDQUFFLEdBQUcsSUFBZTtRQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFFLHVCQUF1QixFQUFFLElBQUksQ0FBRSxDQUFBO0lBQ2hELENBQUM7SUFDRCxvQkFBb0IsQ0FBRSxHQUFHLElBQWU7UUFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBRSxzQkFBc0IsRUFBRSxJQUFJLENBQUUsQ0FBQTtJQUMvQyxDQUFDOztBQUdMLGNBQWMsQ0FBQyxNQUFNLENBQUUsZ0JBQWdCLEVBQUUsYUFBYSxDQUFFLENBQUEifQ==