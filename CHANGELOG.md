# Change Log

## 0.4.0

-   Add configurable kebab / snake case warnings for classnames.
    -   bemHelper.classNameCase = "any" | "kebab" | "snake"
-   Add toggle for showing depth warnings.
    -   bemHelper.showDepthWarnings = true | false
-   More reliable extension activation

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
