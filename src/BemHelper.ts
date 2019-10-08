export enum ClassNameCases {
    Any = "any",
    Kebab = "kebab",
    Snake = "snake",
    Camel = "camel",
    Pascal = "pascal"
}

export interface BemClass {
    block: string;
    element?: string;
    modifier?: string;
}

export class BemHelper {
    //BEM separators
    public elementSeparator = "__";
    public modifierSeparator = "--";
    //Regex to extract a class property value from a block of html text
    readonly classPropertyValueRegex = /[\s]+class(Name)?=["'`]{1}([^"'`])+["'`]{1}/g;
    //Regex to extract actual class names as groups from a class property string
    readonly classNameRegex = /["'`]{1}(.*)["'`]{1}/;
    // Case regex
    private readonly kebabCaseRegex = /^[a-z0-9-]+$/;
    private readonly snakeCaseRegex = /^[a-z0-9_]+$/;
    private readonly pascalCaseRegex = /^[A-Z]{1}[a-zA-Z0-9]+$/;
    private readonly camelCaseRegex = /^[a-z]{1}[a-zA-Z0-9]+$/;

    /*
     * Generate a stylesheet from a list of BEM class names
     */
    public generateStyleSheet(classNames: string[], flat: boolean): string {
        this.resetRegex();
        let styleSheet = ``;
        let styles = {};
        const _blockModifierName = "__BLOCK__MODIFIER__";

        classNames.forEach(className => {
            if (flat) {
                styleSheet = `${styleSheet}.${className}{}`;
            } else {
                let block = className
                    .split(this.elementSeparator)[0]
                    .split(this.modifierSeparator)[0];
                let element = className.split(this.elementSeparator)[1]
                    ? className
                          .split(this.elementSeparator)[1]
                          .split(this.modifierSeparator)[0]
                    : null;
                let modifier = className.split(this.modifierSeparator)[1];

                if (block) {
                    //Blocks
                    if (!styles.hasOwnProperty(block)) {
                        styles[block] = {};
                        styles[block][_blockModifierName] = [];
                    }

                    //Elements
                    if (element && !styles[block].hasOwnProperty(element)) {
                        styles[block][element] = [];
                    }

                    //Modifiers
                    if (modifier) {
                        if (!element) {
                            //If there is no element, the modifier applies to the block
                            styles[block][_blockModifierName].push(modifier);
                        } else {
                            if (!styles[block][element].includes(modifier)) {
                                styles[block][element].push(modifier);
                            }
                        }
                    }
                }
            }
        });

        if (!flat) {
            Object.keys(styles).forEach(block => {
                styleSheet = `${styleSheet}.${block}{`;
                Object.keys(styles[block])
                    .filter(element => {
                        return element !== _blockModifierName;
                    })
                    .forEach(element => {
                        styleSheet = `${styleSheet}&${this.elementSeparator}${element}{`;
                        styles[block][element].forEach(modifier => {
                            styleSheet = `${styleSheet}&${this.modifierSeparator}${modifier}{}`;
                        });
                        styleSheet = `${styleSheet}}`;
                    });

                styles[block][_blockModifierName].forEach(blockModifier => {
                    styleSheet = `${styleSheet}&${this.modifierSeparator}${blockModifier}{}`;
                });

                styleSheet = `${styleSheet}}`;
            });
        }
        return styleSheet;
    }

    //Get all classes from a block of html
    public getClasses(html: string): string[] {
        let classNames: string[] = [];
        this.resetRegex();

        if (this.classPropertyValueRegex === null) {
            return classNames;
        }
        let match;
        while ((match = this.classPropertyValueRegex.exec(html))) {
            let classes = this.classNameRegex.exec(match[0]);
            if (classes === null || classes.length < 2) {
                return classNames;
            }
            classes[1].split(" ").forEach(className => {
                if (className === "") {
                    return;
                }
                if (classNames.indexOf(className) === -1) {
                    classNames.push(className);
                }
            });
        }
        return classNames;
    }
    /*
     * Get the last class name from a block of html
     * html: The html string to extract from
     * matchElements: Should the parent name include elements or just blocks?
     */
    public getPrecedingClassName(
        html: string,
        includeElements: boolean
    ): string {
        this.resetRegex();
        let matches = html.match(this.classPropertyValueRegex);

        if (matches === null) {
            return "";
        }

        //If only including blocks, remove element classes
        matches = includeElements
            ? matches
            : matches.filter(match => {
                  return !match.includes(this.elementSeparator);
              });

        let lastMatch = matches[matches.length - 1];

        let classNameMatches = lastMatch.match(this.classNameRegex);

        if (classNameMatches === null) {
            return "";
        }
        return classNameMatches[classNameMatches.length - 1]
            .split(this.modifierSeparator)[0]
            .split(" ")[0];
    }

    /*
     * Get the case type of a classname
     */
    public getClassCaseType(className: string): ClassNameCases {
        this.resetRegex();
        className = className
            .replace(this.elementSeparator, "")
            .replace(this.modifierSeparator, "");

        if (className.match(this.kebabCaseRegex)) {
            return ClassNameCases.Kebab;
        } else if (className.match(this.snakeCaseRegex)) {
            return ClassNameCases.Snake;
        } else if (className.match(this.pascalCaseRegex)) {
            return ClassNameCases.Pascal;
        } else if (className.match(this.camelCaseRegex)) {
            return ClassNameCases.Camel;
        }
        return ClassNameCases.Any;
    }
    /*
     *   Create a classstring from a BemClass object
     */
    public createClass(bemClass: BemClass): string {
        let classString = "";

        if (bemClass.element && bemClass.modifier) {
            //block__element--modifier
            classString = `${bemClass.block}${this.elementSeparator}${bemClass.element}${this.modifierSeparator}${bemClass.modifier}`;
        } else if (!bemClass.element && bemClass.modifier) {
            //block--modifier
            classString = `${bemClass.block}${this.modifierSeparator}${bemClass.modifier}`;
        } else if (bemClass.element && !bemClass.modifier) {
            //block__element
            classString = `${bemClass.block}${this.elementSeparator}${bemClass.element}`;
        } else {
            //block
            classString = bemClass.block;
        }
        return classString;
    }
    /*
     * Convert a string to a case
     */
    public convertStringToCase(word: string, toClassType: ClassNameCases) {
        this.resetRegex();
        let outputClass = word;

        let classNameWords = word
            .replace("-", " ")
            .replace("_", " ")
            .split("")
            .map(char => {
                if (char.match(/^[A-Z]$/)) {
                    return ` ${char}`;
                } else {
                    return char;
                }
            })
            .join("")
            .toLowerCase()
            .trim()
            .split(" ")
            .filter(word => {
                return word;
            });

        switch (toClassType) {
            case ClassNameCases.Kebab:
                outputClass = classNameWords.join("-");
                break;
            case ClassNameCases.Snake:
                outputClass = classNameWords.join("_");
                break;
            case ClassNameCases.Camel:
                outputClass = classNameWords
                    .map((word, index) => {
                        if (index === 0) {
                            return word;
                        }
                        return `${word[0].toUpperCase()}${word.slice(1)}`;
                    })
                    .join("");
                break;
            case ClassNameCases.Pascal:
                outputClass = classNameWords
                    .map(word => {
                        return `${word[0].toUpperCase()}${word.slice(1)}`;
                    })
                    .join("");
                break;
            default:
                break;
        }
        return outputClass;
    }
    /*
     *   Convert a class string to specified case
     */
    public convertClass(
        sourceClass: string,
        toClassType: ClassNameCases
    ): string {
        this.resetRegex();
        let modifier = sourceClass.includes(this.modifierSeparator)
            ? sourceClass.split(this.modifierSeparator)[
                  sourceClass.split(this.modifierSeparator).length - 1
              ]
            : "";
        let element = sourceClass.includes(this.elementSeparator)
            ? sourceClass
                  .split(this.elementSeparator)
                  [sourceClass.split(this.elementSeparator).length - 1].split(
                      this.modifierSeparator
                  )[0]
            : "";
        let block = sourceClass.split(this.elementSeparator)[0];

        let classElements: BemClass = {
            block: this.convertStringToCase(block, toClassType),
            element: this.convertStringToCase(element, toClassType),
            modifier: this.convertStringToCase(modifier, toClassType)
        };

        return this.createClass(classElements);
    }
    /*
     * Is a class name following BEM conventions?
     */
    public isBemClass(className: string): boolean {
        return !(
            className.split(this.elementSeparator).length > 2 ||
            className.split(this.modifierSeparator).length > 2
        );
    }
    /*
     * Check if a className is in a given case
     */
    public isCaseMatch(className: string, caseType: ClassNameCases): boolean {
        this.resetRegex();
        className = className.replace(/__/g, "").replace(/--/g, "");
        let allowedClassNamePattern;
        switch (caseType) {
            case ClassNameCases.Any:
                return true;
            case ClassNameCases.Kebab:
                allowedClassNamePattern = this.kebabCaseRegex;
                break;
            case ClassNameCases.Snake:
                allowedClassNamePattern = this.snakeCaseRegex;
                break;
            case ClassNameCases.Pascal:
                allowedClassNamePattern = this.pascalCaseRegex;
                break;
            case ClassNameCases.Camel:
                allowedClassNamePattern = this.camelCaseRegex;
                break;
            default:
                return false;
        }
        let matches = className.match(allowedClassNamePattern);
        if (!matches) {
            return false;
        }
        return true;
    }

    /*
     * Get the appropriate class property word for a given language
     */
    public getClassPropertyWord(language: string): string {
        if (["javascriptreact", "typescriptreact"].indexOf(language) !== -1) {
            return "className";
        }

        return "class";
    }

    private resetRegex(): void {
        this.classPropertyValueRegex.lastIndex = 0;
        this.classNameRegex.lastIndex = 0;
        this.kebabCaseRegex.lastIndex = 0;
        this.snakeCaseRegex.lastIndex = 0;
        this.pascalCaseRegex.lastIndex = 0;
        this.camelCaseRegex.lastIndex = 0;
    }
}
