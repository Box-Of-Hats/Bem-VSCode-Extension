export enum ClassNameCases {
    Any = "any",
    Kebab = "kebab",
    Snake = "snake",
    CamelCase = "camel",
    Pascal = "pascal"
}

export interface BemClass {
    block: string;
    element?: string;
    modifier?: string;
}

export class BemHelper {
    public generateStyleSheet(classNames: string[], flat: boolean): string {
        let styleSheet = ``;
        let styles = {};
        const _blockModifierName = "__BLOCK__MODIFIER__";

        classNames.sort().forEach(className => {
            if (flat) {
                styleSheet = `${styleSheet}.${className}{}`;
            } else {
                let block = className.split("__")[0].split("--")[0];
                let element = className.split("__")[1]
                    ? className.split("__")[1].split("--")[0]
                    : null;
                let modifier = className.split("--")[1];

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
                        styleSheet = `${styleSheet}&__${element}{`;
                        styles[block][element].forEach(modifier => {
                            styleSheet = `${styleSheet}&--${modifier}{}`;
                        });
                        styleSheet = `${styleSheet}}`;
                    });

                styles[block][_blockModifierName].forEach(blockModifier => {
                    styleSheet = `${styleSheet}&--${blockModifier}{}`;
                });

                styleSheet = `${styleSheet}}`;
            });
        }
        return styleSheet;
    }

    //Get all classes from a block of html
    public getClasses(html: string): string[] {
        let classNames: string[] = [];
        const regex = /class(Name)?=["']{1}([a-zA-Z0-9-_ ]+)["']{1}/g;
        const classNameRegex = /["']{1}(.*)["']{1}/;
        if (classNameRegex === null) {
            return classNames;
        }
        let match;
        while ((match = regex.exec(html))) {
            let classes = classNameRegex.exec(match[0]);
            if (classes === null || classes.length < 2) {
                return classNames;
            }
            classes[1].split(" ").forEach(className => {
                if (classNames.indexOf(className) === -1) {
                    classNames.push(className);
                }
            });
        }
        return classNames;
    }
    /*Get the last class name from a block of html
     *html: The html string to extract from
     *matchElements: Should the parent name include elements or just blocks?
     */
    public getPrecedingClassName(html: string, matchElements: boolean): string {
        const classNameRegex = /class(Name)?="([a-zA-Z0-9-_]+ ?)+"/g;

        let matches = html.match(classNameRegex);

        if (matches === null) {
            return "";
        }

        //If only including blocks, remove element classes
        matches = matchElements
            ? matches
            : matches.filter(match => {
                  return !match.includes("__");
              });

        let lastMatch = matches[matches.length - 1];

        let classNameMatches = lastMatch.match(/"(.*)"/);

        if (classNameMatches === null) {
            return null;
        }
        return classNameMatches[classNameMatches.length - 1]
            .split("--")[0]
            .split(" ")[0];
    }

    public getClassCaseType(className: string): ClassNameCases {
        className = className.replace(/__/g, "").replace(/--/g, "");

        if (className.match(/^[a-z0-9-]+$/)) {
            return ClassNameCases.Kebab;
        } else if (className.match(/^[a-z0-9_]+$/)) {
            return ClassNameCases.Snake;
        } else if (className.match(/^[A-Z]{1}[a-zA-Z0-9]+$/)) {
            return ClassNameCases.Pascal;
        } else if (className.match(/^[a-z]{1}[a-zA-Z0-9]+$/)) {
            return ClassNameCases.CamelCase;
        }
        return ClassNameCases.Any;
    }
    /*
    Create a classstring from a BemClass object
*/
    public createClass(bemClass: BemClass): string {
        let classString = "";

        if (bemClass.element && bemClass.modifier) {
            //block__element--modifier
            classString = `${bemClass.block}__${bemClass.element}--${
                bemClass.modifier
            }`;
        } else if (!bemClass.element && bemClass.modifier) {
            //block--modifier
            classString = `${bemClass.block}--${bemClass.modifier}`;
        } else if (bemClass.element && !bemClass.modifier) {
            //block__element
            classString = `${bemClass.block}__${bemClass.element}`;
        } else {
            //block
            classString = bemClass.block;
        }
        return classString;
    }
    /*Convert a string to a case
     */
    public convertStringToCase(word: string, toClassType: ClassNameCases) {
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
            case ClassNameCases.CamelCase:
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
        Convert a class string to specified case
    */
    public convertClass(
        sourceClass: string,
        toClassType: ClassNameCases
    ): string {
        let modifier = sourceClass.includes("--")
            ? sourceClass.split("--")[sourceClass.split("--").length - 1]
            : "";
        let element = sourceClass.includes("__")
            ? sourceClass
                  .split("__")
                  [sourceClass.split("__").length - 1].split("--")[0]
            : "";
        let block = sourceClass.split("__")[0];

        let classElements: BemClass = {
            block: convertStringToCase(block, toClassType),
            element: convertStringToCase(element, toClassType),
            modifier: convertStringToCase(modifier, toClassType)
        };

        return createClass(classElements);
    }
    /*Is a class name following BEM conventions?
     */
    public isBemClass(className: string): boolean {
        return !(
            className.split("__").length > 2 || className.split("--").length > 2
        );
    }
    //Check if a className is in a given case
    public isCaseMatch(className: string, caseType: ClassNameCases): boolean {
        className = className.replace(/__/g, "").replace(/--/g, "");
        let allowedClassNamePattern;
        switch (caseType) {
            case ClassNameCases.Any:
                return true;
            case ClassNameCases.Kebab:
                allowedClassNamePattern = /^[a-z0-9-]+$/;
                break;
            case ClassNameCases.Snake:
                allowedClassNamePattern = /^[a-z0-9_]+$/;
                break;
            case ClassNameCases.Pascal:
                allowedClassNamePattern = /^[A-Z]{1}[a-zA-Z0-9]+$/;
                break;
            case ClassNameCases.CamelCase:
                allowedClassNamePattern = /^[a-z]{1}[a-zA-Z0-9]+$/;
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
    public getClassNameDepthProblems() {}
    public getClassNameCaseProblems() {}
    public getClassPropertyTitle() {}
    public updateDiagnostics() {}
    public convertClassToCaseCommand() {}
}
