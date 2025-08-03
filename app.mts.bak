
type TypleOfElements<T extends readonly (keyof HTMLElementTagNameMap)[]> = {
  [I in keyof T]: T[I] extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T[I]] : never
}

function createElements<T extends readonly (keyof HTMLElementTagNameMap)[]>(...tags: T): TypleOfElements<T> {
  return tags.map(tag => document.createElement(tag)) as TypleOfElements<T>
}

const tags = ["div", "div", "div", "div", "div", "button", "button", "label", "label", "input", "input", "span", "span"] as const
const [
  container,
  content,
  control,
  bttnsGroup,
  propsGroup,
  addButton,
  remButton,
  inputGridTemplateRowsLabel,
  inputGridTemplateClmsLabel,
  inputGridTemplateRows,
  inputGridTemplateClms,
  addButtonText,
  remButtonText
]: TypleOfElements<typeof tags> = createElements<typeof tags>(...tags)

interface Structure {
  element: HTMLElementTagNameMap[typeof tags[number]]
  children?: Structure[],
}

function buildStructure(structure: Structure) {
  if (structure?.children)
    for (const child of structure.children) {
      structure.element.appendChild(child.element)
      buildStructure(child)
      // debugger
    }
}

const structure: Structure = {
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
                    { element: addButtonText }]
                },
                {
                  element: remButton, children: [
                    { element: remButtonText }]
                },
              ],
            },
            {
              element: propsGroup, children: [
                {
                  element: inputGridTemplateClmsLabel, children: [
                    { element: inputGridTemplateClms }]
                },
                {
                  element: inputGridTemplateRowsLabel, children: [
                    { element: inputGridTemplateRows }]
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

addButtonText.appendChild(new Text("Add box"))
remButtonText.appendChild(new Text("Remove box"))

inputGridTemplateRowsLabel.appendChild(new Text("grid-template-rows:"))
inputGridTemplateRows.name = "grid-template-rows"
inputGridTemplateRows.type = "text"
inputGridTemplateClmsLabel.appendChild(new Text("grid-template-columns:"))
inputGridTemplateClms.name = "grid-template-columns"
inputGridTemplateClms.type = "text"

buildStructure(structure)

const stylesheet = new CSSStyleSheet
document.adoptedStyleSheets.push(stylesheet)

container.id = "container"
stylesheet.insertRule(
  "div#container {"
  + "display: flex;"
  + "flex-flow: column nowrap;"
  + "width: calc(100% - 2px - var(--spacing) * 4);"
  + "height: calc(100% - 2px - var(--spacing) * 4);"
  + "}"
)

content.id = "content"
stylesheet.insertRule(
  "div#content {"
  + "flex: 1 1 stretch;"
  + "display: grid;"
  + "}"
)

control.id = "control"
stylesheet.insertRule(
  "div#control {"
  + "flex: 0 0 30%;"
  + "overflow: scroll;"
  + "display: flex;"
  + "flex-flow: row nowrap;"
  + "}"
)
bttnsGroup.id = "buttonsGroup"
stylesheet.insertRule(
  "div#buttonsGroup {"
  + "display: flex;"
  + "justify-content: space-evenly;"
  + "align-items: center;"
  + "flex: 1 1 50%;"
  + "flex-flow: row nowrap;"
  + "}"
)

propsGroup.id = "propertiesGroup"
stylesheet.insertRule(
  "div#propertiesGroup {"
  + "display: flex;"
  + "justify-content: space-evenly;"
  + "align-items: center;"
  + "flex: 1 1 50%;"
  + "flex-flow: row nowrap;"
  + "}"
)

function isCSSStyleRule(input: unknown): input is CSSStyleRule {
  return input instanceof CSSStyleRule
}
const gridChildren: HTMLDivElement[] = []

addButton.addEventListener("click", () => {
  gridChildren.push(document.createElement("div"))
  document.querySelector("div#content")?.appendChild(gridChildren.at(-1)!)
})

remButton.addEventListener("click", () => {
  if (gridChildren.length) document.querySelector("div#content")?.removeChild(gridChildren.pop()!)
})

const ruleIndex = stylesheet.insertRule("div#content { }")
console.log(stylesheet.cssRules.item(ruleIndex))

inputGridTemplateClms.addEventListener("input", function (inputEvent) {
  const rule = stylesheet.cssRules.item(ruleIndex)
  try {
    CSSStyleValue.parse("grid-template-columns", this.value)
  } catch (parseError) {
    console.log("Invalid value for grid-template-columns")
    return
  }
  if (isCSSStyleRule(rule)) {
    rule.style.gridTemplateColumns = this.value
  }
})
inputGridTemplateRows.addEventListener("input", function (inputEvent) {
  const rule = stylesheet.cssRules.item(ruleIndex)
  try {
    CSSStyleValue.parse("grid-template-rows", this.value)
  } catch (parseError) {
    console.log("Invalid value for grid-template-rows")
    return
  }
  if (isCSSStyleRule(rule)) {
    rule.style.gridTemplateRows = this.value
  }
})