class GridContainer extends HTMLElement {
    rows;
    cols;
    display;
    rowTemplate;
    colTemplate;
    static observedAttributes = ["rows", "cols", "rowTemplate", "colTemplate"];
    styleSheet;
    selfStyleRule;
    root = null;
    constructor(rows = 1, cols = 1, display = "grid", rowTemplate = `repeat(${rows}, 1fr)`, colTemplate = `repeat(${cols}, 1fr)`) {
        super();
        this.rows = rows;
        this.cols = cols;
        this.display = display;
        this.rowTemplate = rowTemplate;
        this.colTemplate = colTemplate;
        this.styleSheet = new CSSStyleSheet;
        this.selfStyleRule = this.styleSheet.cssRules[this.styleSheet.insertRule(":host {}")];
        const propertyValuePairs = [
            ["display", "grid"],
            ["container-type", "size"],
            // [ "width", "98cqw" ],
            ["height", "98cqh"],
            ["box-sizing", "border-box"],
            ["margin-top", "1cqh"],
            ["margin-right", "1cqw"],
            ["margin-bottom", "1cqh"],
            ["margin-left", "1cqw"],
            ["grid-template-rows", rowTemplate],
            ["grid-template-columns", colTemplate],
            ["grid-auto-rows", "0"],
            ["grid-auto-columns", "0"],
        ];
        for (const [property, value] of propertyValuePairs)
            this.updateStyle(property, value);
    }
    updateStyle(property, value) {
        try {
            if (typeof value === "string") {
                CSSStyleValue.parse(property, value);
            }
            this.selfStyleRule.style.setProperty(property, value);
        }
        catch {
            console.error(`Unable to parse ${value} as valid value for ${property}.`);
        }
    }
    adoptedCallback(...rest) {
        console.log("adoptedCallback", rest);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`${name} changed from ${oldValue} to ${newValue}`);
        switch (name) {
            case "rows":
                newValue = `repeat(${newValue ?? "1"}, 1fr)`;
            case "rowTemplate":
                this.updateStyle("grid-template-rows", newValue ?? "repeat(1, 1fr)");
                break;
            case "cols":
                newValue = `repeat(${newValue ?? "1"}, 1fr)`;
            case "colTemplate":
                this.updateStyle("grid-template-columns", newValue ?? "repeat(1, 1fr)");
                break;
            default:
                const _exhaustive = name;
                throw new Error(`GridContainer's attributeChangedCallback's switch is non-exhaustive. Missed ${_exhaustive}`);
        }
    }
    connectedCallback() {
        this.root = this.attachShadow({ mode: "open" });
        this.root.adoptedStyleSheets = [this.styleSheet];
        this.root.appendChild(document.createElement("slot"));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBVUEsTUFBTSxhQUFjLFNBQVEsV0FBVztJQU1yQjtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBVGQsTUFBTSxDQUFVLGtCQUFrQixHQUFHLENBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsYUFBYSxDQUFXLENBQUE7SUFDOUYsVUFBVSxDQUFlO0lBQ3pCLGFBQWEsQ0FBYztJQUMzQixJQUFJLEdBQXNCLElBQUksQ0FBQTtJQUM5QixZQUNjLE9BQWUsQ0FBQyxFQUNoQixPQUFlLENBQUMsRUFDaEIsVUFBa0MsTUFBTSxFQUN4QyxjQUFzQixVQUFXLElBQUssUUFBUSxFQUM5QyxjQUFzQixVQUFXLElBQUssUUFBUTtRQUV4RCxLQUFLLEVBQUUsQ0FBQTtRQU5HLFNBQUksR0FBSixJQUFJLENBQVk7UUFDaEIsU0FBSSxHQUFKLElBQUksQ0FBWTtRQUNoQixZQUFPLEdBQVAsT0FBTyxDQUFpQztRQUN4QyxnQkFBVyxHQUFYLFdBQVcsQ0FBbUM7UUFDOUMsZ0JBQVcsR0FBWCxXQUFXLENBQW1DO1FBSXhELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxhQUFhLENBQUE7UUFDbkMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBRSxVQUFVLENBQUUsQ0FBa0IsQ0FBQTtRQUN6RyxNQUFNLGtCQUFrQixHQUE4QjtZQUNsRCxDQUFFLFNBQVMsRUFBRSxNQUFNLENBQUU7WUFDckIsQ0FBRSxnQkFBZ0IsRUFBRSxNQUFNLENBQUU7WUFDNUIsd0JBQXdCO1lBQ3hCLENBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBRTtZQUNyQixDQUFFLFlBQVksRUFBRSxZQUFZLENBQUU7WUFDOUIsQ0FBRSxZQUFZLEVBQUUsTUFBTSxDQUFFO1lBQ3hCLENBQUUsY0FBYyxFQUFFLE1BQU0sQ0FBRTtZQUMxQixDQUFFLGVBQWUsRUFBRSxNQUFNLENBQUU7WUFDM0IsQ0FBRSxhQUFhLEVBQUUsTUFBTSxDQUFFO1lBQ3pCLENBQUUsb0JBQW9CLEVBQUUsV0FBVyxDQUFFO1lBQ3JDLENBQUUsdUJBQXVCLEVBQUUsV0FBVyxDQUFFO1lBQ3hDLENBQUUsZ0JBQWdCLEVBQUUsR0FBRyxDQUFFO1lBQ3pCLENBQUUsbUJBQW1CLEVBQUUsR0FBRyxDQUFFO1NBQy9CLENBQUM7UUFBQyxLQUFNLE1BQU0sQ0FBRSxRQUFRLEVBQUUsS0FBSyxDQUFFLElBQUksa0JBQWtCO1lBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBRSxRQUFRLEVBQUUsS0FBSyxDQUFFLENBQUE7SUFDbEcsQ0FBQztJQUNTLFdBQVcsQ0FBRSxRQUFnQixFQUFFLEtBQWE7UUFDbEQsSUFBSSxDQUFDO1lBQ0QsSUFBSyxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUcsQ0FBQztnQkFDOUIsYUFBYSxDQUFDLEtBQUssQ0FBRSxRQUFRLEVBQUUsS0FBSyxDQUFFLENBQUE7WUFDMUMsQ0FBQztZQUNELElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBRSxRQUFRLEVBQUUsS0FBSyxDQUFFLENBQUE7UUFDM0QsQ0FBQztRQUFDLE1BQU0sQ0FBQztZQUNMLE9BQU8sQ0FBQyxLQUFLLENBQUUsbUJBQW9CLEtBQU0sdUJBQXdCLFFBQVMsR0FBRyxDQUFFLENBQUE7UUFDbkYsQ0FBQztJQUNMLENBQUM7SUFDRCxlQUFlLENBQUUsR0FBRyxJQUFlO1FBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUUsaUJBQWlCLEVBQUUsSUFBSSxDQUFFLENBQUE7SUFDMUMsQ0FBQztJQUNELHdCQUF3QixDQUFFLElBQXVELEVBQUUsUUFBdUIsRUFBRSxRQUF1QjtRQUMvSCxPQUFPLENBQUMsR0FBRyxDQUFFLEdBQUksSUFBSyxpQkFBa0IsUUFBUyxPQUFRLFFBQVMsRUFBRSxDQUFFLENBQUE7UUFDdEUsUUFBUyxJQUFJLEVBQUcsQ0FBQztZQUNqQixLQUFLLE1BQU07Z0JBQ1AsUUFBUSxHQUFHLFVBQVcsUUFBUSxJQUFJLEdBQUksUUFBUSxDQUFBO1lBQ2xELEtBQUssYUFBYTtnQkFDZCxJQUFJLENBQUMsV0FBVyxDQUFFLG9CQUFvQixFQUFFLFFBQVEsSUFBSSxnQkFBZ0IsQ0FBRSxDQUFBO2dCQUN0RSxNQUFLO1lBQ1QsS0FBSyxNQUFNO2dCQUNQLFFBQVEsR0FBRyxVQUFXLFFBQVEsSUFBSSxHQUFJLFFBQVEsQ0FBQTtZQUNsRCxLQUFLLGFBQWE7Z0JBQ2QsSUFBSSxDQUFDLFdBQVcsQ0FBRSx1QkFBdUIsRUFBRSxRQUFRLElBQUksZ0JBQWdCLENBQUUsQ0FBQTtnQkFDekUsTUFBSztZQUNUO2dCQUNJLE1BQU0sV0FBVyxHQUFVLElBQUksQ0FBQTtnQkFDL0IsTUFBTSxJQUFJLEtBQUssQ0FBRSwrRUFBZ0YsV0FBWSxFQUFFLENBQUUsQ0FBQTtRQUNySCxDQUFDO0lBQ0wsQ0FBQztJQUNELGlCQUFpQjtRQUNiLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBRSxDQUFBO1FBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBRSxJQUFJLENBQUMsVUFBVSxDQUFFLENBQUE7UUFDbEQsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBRSxNQUFNLENBQUUsQ0FBRSxDQUFBO0lBQzdELENBQUM7SUFDRCxxQkFBcUIsQ0FBRSxHQUFHLElBQWU7UUFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBRSx1QkFBdUIsRUFBRSxJQUFJLENBQUUsQ0FBQTtJQUNoRCxDQUFDO0lBQ0Qsb0JBQW9CLENBQUUsR0FBRyxJQUFlO1FBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUUsc0JBQXNCLEVBQUUsSUFBSSxDQUFFLENBQUE7SUFDL0MsQ0FBQzs7QUFHTCxjQUFjLENBQUMsTUFBTSxDQUFFLGdCQUFnQixFQUFFLGFBQWEsQ0FBRSxDQUFBIn0=