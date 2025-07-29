function createElements(...tags) {
    return tags.map(tag => document.createElement(tag));
}
const tags = ["div", "div", "div", "div", "div", "button", "button", "label", "label", "input", "input", "span", "span"];
const [container, content, control, bttnsGroup, propsGroup, addButton, remButton, inputGridTemplateRowsLabel, inputGridTemplateClmsLabel, inputGridTemplateRows, inputGridTemplateClms, addButtonText, remButtonText] = createElements(...tags);
function buildStructure(structure) {
    if (structure?.children)
        for (const child of structure.children) {
            structure.element.appendChild(child.element);
            buildStructure(child);
            // debugger
        }
}
const structure = {
    element: document.body, children: [
        {
            element: container, children: [
                { element: content },
                {
                    element: control, children: [
                        {
                            element: bttnsGroup, children: [
                                {
                                    element: addButton, children: [
                                        { element: addButtonText }
                                    ]
                                },
                                {
                                    element: remButton, children: [
                                        { element: remButtonText }
                                    ]
                                },
                            ],
                        },
                        {
                            element: propsGroup, children: [
                                {
                                    element: inputGridTemplateClmsLabel, children: [
                                        { element: inputGridTemplateClms }
                                    ]
                                },
                                {
                                    element: inputGridTemplateRowsLabel, children: [
                                        { element: inputGridTemplateRows }
                                    ]
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
addButtonText.appendChild(new Text("Add box"));
remButtonText.appendChild(new Text("Remove box"));
inputGridTemplateRowsLabel.appendChild(new Text("grid-template-rows:"));
inputGridTemplateRows.name = "grid-template-rows";
inputGridTemplateRows.type = "text";
inputGridTemplateClmsLabel.appendChild(new Text("grid-template-columns:"));
inputGridTemplateClms.name = "grid-template-columns";
inputGridTemplateClms.type = "text";
buildStructure(structure);
const stylesheet = new CSSStyleSheet;
document.adoptedStyleSheets.push(stylesheet);
container.id = "container";
stylesheet.insertRule("div#container {"
    + "display: flex;"
    + "flex-flow: column nowrap;"
    + "width: calc(100% - 2px - var(--spacing) * 4);"
    + "height: calc(100% - 2px - var(--spacing) * 4);"
    + "}");
content.id = "content";
stylesheet.insertRule("div#content {"
    + "flex: 1 1 stretch;"
    + "display: grid;"
    + "}");
control.id = "control";
stylesheet.insertRule("div#control {"
    + "flex: 0 0 30%;"
    + "overflow: scroll;"
    + "display: flex;"
    + "flex-flow: row nowrap;"
    + "}");
bttnsGroup.id = "buttonsGroup";
stylesheet.insertRule("div#buttonsGroup {"
    + "display: flex;"
    + "justify-content: space-evenly;"
    + "align-items: center;"
    + "flex: 1 1 50%;"
    + "flex-flow: row nowrap;"
    + "}");
propsGroup.id = "propertiesGroup";
stylesheet.insertRule("div#propertiesGroup {"
    + "display: flex;"
    + "justify-content: space-evenly;"
    + "align-items: center;"
    + "flex: 1 1 50%;"
    + "flex-flow: row nowrap;"
    + "}");
function isCSSStyleRule(input) {
    return input instanceof CSSStyleRule;
}
const gridChildren = [];
addButton.addEventListener("click", () => {
    gridChildren.push(document.createElement("div"));
    document.querySelector("div#content")?.appendChild(gridChildren.at(-1));
});
remButton.addEventListener("click", () => {
    if (gridChildren.length)
        document.querySelector("div#content")?.removeChild(gridChildren.pop());
});
const ruleIndex = stylesheet.insertRule("div#content { }");
console.log(stylesheet.cssRules.item(ruleIndex));
inputGridTemplateClms.addEventListener("input", function (inputEvent) {
    const rule = stylesheet.cssRules.item(ruleIndex);
    try {
        CSSStyleValue.parse("grid-template-columns", this.value);
    }
    catch (parseError) {
        console.log("Invalid value for grid-template-columns");
        return;
    }
    if (isCSSStyleRule(rule)) {
        rule.style.gridTemplateColumns = this.value;
    }
});
inputGridTemplateRows.addEventListener("input", function (inputEvent) {
    const rule = stylesheet.cssRules.item(ruleIndex);
    try {
        CSSStyleValue.parse("grid-template-rows", this.value);
    }
    catch (parseError) {
        console.log("Invalid value for grid-template-rows");
        return;
    }
    if (isCSSStyleRule(rule)) {
        rule.style.gridTemplateRows = this.value;
    }
});
export {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBS0EsU0FBUyxjQUFjLENBQXFELEdBQUcsSUFBTztJQUNwRixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUF1QixDQUFBO0FBQzNFLENBQUM7QUFFRCxNQUFNLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBVSxDQUFBO0FBQ2pJLE1BQU0sQ0FDSixTQUFTLEVBQ1QsT0FBTyxFQUNQLE9BQU8sRUFDUCxVQUFVLEVBQ1YsVUFBVSxFQUNWLFNBQVMsRUFDVCxTQUFTLEVBQ1QsMEJBQTBCLEVBQzFCLDBCQUEwQixFQUMxQixxQkFBcUIsRUFDckIscUJBQXFCLEVBQ3JCLGFBQWEsRUFDYixhQUFhLENBQ2QsR0FBaUMsY0FBYyxDQUFjLEdBQUcsSUFBSSxDQUFDLENBQUE7QUFPdEUsU0FBUyxjQUFjLENBQUMsU0FBb0I7SUFDMUMsSUFBSSxTQUFTLEVBQUUsUUFBUTtRQUNyQixLQUFLLE1BQU0sS0FBSyxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN2QyxTQUFTLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDNUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ3JCLFdBQVc7UUFDYixDQUFDO0FBQ0wsQ0FBQztBQUVELE1BQU0sU0FBUyxHQUFjO0lBQzNCLE9BQU8sRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtRQUNoQztZQUNFLE9BQU8sRUFBRSxTQUFTLEVB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