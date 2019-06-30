# Change Log

## 0.5.0

-   Add Pascal and Camel case options for classnames
    -   bemHelper.classNameCase = "any" | "kebab" | "snake" | "pascal" | "camel"
-   Element insertion now uses snippets so inserting elements should now feel a little smoother.
-   Add support for React (jsx) files!

### 0.5.1

-   Add autocompleting tag names! Tab through an inserted element snippet to get the list of options.
    -   Configurable with bemHelper.tagList = ["div", "h1" ... "table", "MyCustomComponent"]

### 0.5.3

-   Add support for single quotes surrounding classnames, e.g class='block\_\_element'

### 0.5.4

-   Fix bug where snake_case classes weren't being detected

## 0.4.0

-   Add configurable kebab / snake case warnings for classnames.
    -   bemHelper.classNameCase = "any" | "kebab" | "snake"
-   Add toggle for showing depth warnings.
    -   bemHelper.showDepthWarnings = true | false
-   More reliable extension activation

### 0.4.1

-   Add configuration for enabling / disabling linting on document change
    -   bemHelper.responsiveLinting = true | false

## 0.3.0

-   Add GenerateStyleSheet command

### 0.3.1

-   Fix consecutive modified elements not using the correct classnames

### 0.3.2

-   Fix LESS / SCSS stylesheet generation not working when modified blocks were present

## 0.2.0

-   Add diagnostic warnings when classes are nested more than block**element. E.g block**block\_\_element
-   More reliable extension activation

## 0.1.0

-   Add InsertBemModifier command
-   Rename InsertBemChild command to InsertBemElement
-   Change InsertBemElement to only use the current top level element
-   Upgrade to Typescript
-   Add error messages

## 0.0.1

-   Initial release
-   Add InsertBemChild command
