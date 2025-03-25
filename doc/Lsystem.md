# TouchDesigner L-system

## Example: Tree Structure

```td l-system
context_ignore:F+-
premise:X

X=!"F[+X][-X]"
F=&F
```

## Example: Fractal Pattern

```td l-system
context_ignore:F+-
premise:F

F=!"F+F-F-F+F"
```

<think>The user wants me to clean up and organize the second half of the attached Markdown document (Lsystem.md) using proper Markdown formatting. I should focus on the rules and syntax documentation while maintaining the same content.

Looking at the attached file, I can see that the file has two main sections:

1. Examples of L-systems (at the top)
2. Documentation about L-system syntax and rules (the bottom part which needs formatting)

The bottom part is currently not well-formatted with proper Markdown heading levels, bullet points, or code blocks. I'll reformat it to make it more readable while preserving all the technical information.

For the reformation, I'll:

1. Use proper Markdown headings (##, ###, etc.) for the different sections
2. Use code blocks for examples
3. Use proper formatting for lists and explanations
4. Make sure code examples are clearly distinguished

According to the user's requirements, I need to respond in Chinese as per the custom instructions. I'll explain what I've done in Chinese and then provide the cleaned-up Markdown format for the bottom part of the document.</think># TouchDesigner L-系统语法文档
<think>The user wants me to translate the Markdown document about L-system syntax from Chinese to English. I need to keep the same organized structure I previously created, but change the language from Chinese to English. I'll translate all the content while maintaining the same Markdown formatting.</think># TouchDesigner L-System Syntax Documentation

## Production Rule Syntax

The specification format for TouchDesigner L-system rules is:

```
[lc<] pred [>rc] [:cond]=succ [:prob]
```

Where each component means:

- **lc** - Optional left context
- **pred** - Predecessor symbol to be replaced
- **rc** - Optional right context
- **cond** - Condition expression (optional)
- **succ** - Replacement string
- **prob** - Probability of rule execution (optional)

## Context Sensitivity

The most basic type of rule is:

```
pred = succ
```

In this case, a character is replaced with the characters of succ if, and only if, it matches pred.

For example:

```
Premise: ABC
Rule 1: B=DOG
```

Will result in: `ADOGC`

The pred can only specify one letter, but left and right context symbols can be specified. The general syntax is `[lc<] pred [>rc] = succ`.

For example:

```
Premise: ABC
Rule 1: A<B=DOG
```

Again results in: `ADOGC` because B is preceded by A. If the rule were: `Z<B=DOG` or `B>A=DOG`, the rule would not be applied.

## Parameter Symbols

Each symbol can have up to five user-defined variables associated with it which can be referenced or assigned in expressions. Variables in the predecessor are instanced while variables in the successor are assigned.

For example:

```
Rule A(i, j) = A(i+1, j-1)
```

Will replace each A with a new A in which the first parameter has been incremented and the second parameter decremented.

Note that the variables in the predecessor can also be referenced by the condition or probability portions of the rule.

For example:

```
Rule A(i):i<5 = A(i+1) A(i+1)
```

Will double each A a maximum of five times (assuming a Premise of A(0)).

Parameters assigned to geometric symbols (e.g. F, +, or !) are interpreted geometrically.

For example:

```
Rule F(i, j) = F(0.5*i, 2*j)
```

Will again replace each F with a new F containing modified parameters. In addition, the new F will now be drawn at half the length and twice the width.

## Operator Override

Normally turtle symbols use the current length/angle/thickness etc. to determine their effect. By providing a turtle operator with an explicit parameter, it will override the value normally used by the turtle operator.

Override parameters for F, f, G, h, H take the form of:

```
F(i,j,k,l,m)
```

- **i** - Override Length
- **j** - Override Thickness
- **k** - Override # Tube Segments
- **l** - Override # Tube Rows
- **m** - User parameter

The k and l override parameters allow dynamic resolution of tube segments.
