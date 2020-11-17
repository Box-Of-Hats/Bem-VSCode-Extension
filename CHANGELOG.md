# Change Log

## 1.4.0

-   Add support for key-value modifiers in class names
    -   [Key-value modifiers explained](https://en.bem.info/methodology/quick-start/#key-value)

```html
<!-- No longer raises any diagnostic issues -->
<div class="block__element--color--green"></div>
```

## 1.3.0 - Improved Razor support + SHOUTING_SNAKE

-   Add support for SHOUTING_SNAKE_CASE
-   Improved razor support

## 1.2.1 - Multiple class name cases

-   Bug fix for multiple class name cases

## 1.2.0 - Multiple class name cases

-   Added support for multiple class name cases
    -   These can be enabled in your `settings.json` using the setting "bemHelper.classNameCase" to use a comma separated list of cases

```jsonc
//settings.json
{
	"bemHelper.classNameCase": "kebab,camel"
}
```

## 1.1.6 - Docs improvements

-   Improvements to the readme

## 1.1.5 - Bundle time

-   Reduced distributed extension size from 14.8MB (3680 files) to just 1.78MB (14 files)
    -   _who would have thought shipping all of your dev node_modules would be such a bad idea_

## 1.1.4

-   Reduce minimum VSCode version to 1.32

## 1.1.3

-   Fix issue with extension activation introduced in 1.1.2

## 1.1.2

-   Improve language support for PHP
-   Bug fixes around language-specific ignore strings
-   Bug fixes for boolean settings

## 1.1.0

-   Add new setting `bemHelper.blockSelectionMode` which allows the changing of the parent block selection mode.

Possible options:

-   `prefer-explicit`
    -   Use the first explicit parent if found. Fall back to an implicit parent if an explicit was not found.
    -   _This is the default value_
-   `first-parent`
    -   Use the first parent, regardless whether it was explicit or implicit.
-   `explicit-only`
    -   Use only explicit parent blocks.
    -   _Use this setting if you like the old behaviour of the extension_

### Usage examples

#### prefer-explicit

```html
<div class="explicit-parent">
	<div class="implicit-parent__child"></div>

	<!-- Insert Element: explicit-parent is used because it is an explicit block -->
	<div class="explicit-parent__"></div>
</div>
```

```html
<div class="implicit-parent__child"></div>

<!-- Insert Element: implicit-parent is used because no explicit parent was found -->
<div class="implicit-parent__"></div>
```

#### first-parent

```html
<div class="explicit-parent">
	<div class="implicit-parent__child"></div>

	<!-- Insert Element: implicit-parent is used because it is the first parent-->
	<div class="implicit-parent__"></div>
</div>
```

#### explicit-only

```html
<div class="explicit-parent">
	<div class="implicit-parent__child"></div>

	<!-- Insert Element: explicit-parent is used -->
	<div class="explicit-parent__"></div>
</div>
```

## 1.0.0

-   Add new setting `bemHelper.ignoreClassNames` that allows certain classnames to be ignored when inserting new elements.

```json
// settings.json
{
	"bemHelper.ignoreClassNames": ["material-icons"]
}
```

This was added for situations where you have class names that you don't want to be used as block elements. E.g:

```html
<div class="actual-parent">
	<i class="material-icons">arrow_right</i>

	<!-- Trying to insert an element here should have a parent of `actual-parent` and not `material-icons` -->
	<!-- GOOD: <div class="actual-parent__"></div> -->
	<!-- BAD:  <div class="material-icons__"></div> -->
</div>
```

## 0.8.0

-   Add optional alphabetisation of generated CSS class names
    -   Use setting `bemHelper.sortGeneratedStylesheets` to toggle this on or off. By default set to `true`
-   Improve snippet inserting experience.
    -   Tags no longer use a preset tag list so you're able to type anything you like
    -   Removed `bemHelper.tagList` setting
    -   Insert newline after any inserted elements
-   Fix bug where using custom separators caused class case diagnostics to be incorrect
-   Fix bug where including PHP code in classnames would cause false diagnostics issues
-   Under the hood refactoring
-   Add setting for max number of diagnostic issues to show `bemHelper.maxWarningsCount`. This defaults to 100

### 0.8.1

Security patches

-   Switch deps from `vscode` to `vscode-test` + `@types/vscode` following [recent advice](https://code.visualstudio.com/updates/v1_36#_splitting-vscode-package-into-typesvscode-and-vscodetest)
-   Update many packages

## 0.7.0

-   Add support for custom separators
    -   Dont like the standard BEM separators of '\_\_' and '--'? You can now set your own custom separators to be pretty much anything you like!
    -   You can change them in your settings file using `bemHelper.modifierSeparator` and `bemHelper.elementSeparator`

### 0.7.1

-   Fix vue classes interfering with found class names
    -   e.g: `<div class="nav-bar" :class="{'is-hidden':isHidden}">` was giving unexpected classnames when inserting elements

### 0.7.2

-   New command: `Bem Helper: Generate Stylesheet From Selection`
    -   Generate a stylesheet only for specific elements that are currently selcted

## 0.6.0

-   Add class name case refactor quick Fix

### 0.6.2

-   Add extension.bemHelper.convertSelectionToCase command to convert any text selection to a given case
-   Fix bug with empty classnames potentially causing extension crashing
-   Fix bug where only the first class of a set of classes could be quick fixed
-   Huge refactor of code base

### 0.6.3

-   Fix bugs with using single quotes and backticks surrounding class names

### 0.6.4

-   Add more activation events so that commands should always be found, regardless of the current file language

### 0.6.5

-   Improve modified element insert behaviour

### 0.6.6

-   Restructure ReadMe

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
