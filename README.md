# BEM Helper

A VSCode extension to help when using the BEM (Block-Element-Modifier) class naming convention in HTML.

## Commands

### Insert BEM Child

Insert a BEM child with a class name matching the name that came before it.

![Inserting a BEM child element](images/add_child_element.gif)

```html
<div class="block">
    <div class="block__child">
        <div class="block__child__element_one">
            Content
        </div>
        <div class="block__child__element_two">
            More Content
        </div>
    </div>
</div>
```

## Known issues

- Classes wont be discovered if they contain _ characters.