# Template syntax

In Angular, a template is a chunk of HTML.
Use special syntax within a template to leverage many of Angular's features.


::: tip TIP
Check out Angular's [Essentials](/en/essentials/templates) before diving into this comprehensive guide.

:::

Every Angular component has a **template** that defines the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) that the component renders onto the page. By using templates, Angular is able to automatically keep your page up-to-date as data changes.

Templates are usually found within either the `template` property of a `*.ts` file or the `*.html` file. To learn more, check out the [in-depth components guide](/en/guide/components).

## How do templates work?

Templates are based on [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) syntax, with additional features such as built-in template functions, data binding, event listening, variables, and more.

Angular compiles templates into JavaScript in order to build up an internal understanding of your application. One of the benefits of this are built-in rendering optimizations that Angular applies to your application automatically.

### Differences from standard HTML

Some differences between templates and standard HTML syntax include:

- Comments in the template source code are not included in the rendered output
- Component and directive elements can be self-closed (e.g., `<UserProfile />`)
- Attributes with certain characters (i.e., `[]`, `()`, etc.) have special meaning to Angular. See [binding docs](/en/guide/templates/binding) and [adding event listeners docs](/en/guide/templates/event-listeners) for more information.
- The `@` character has a special meaning to Angular for adding dynamic behavior, such as [control flow](/en/guide/templates/control-flow), to templates. You can include a literal `@` character by escaping it as an HTML entity code (`&commat;` or `&#64;`).
- Angular ignores and collapses unnecessary whitespace characters. See [whitespace in templates](/en/guide/templates/whitespace) for more details.
- Angular may add comment nodes to a page as placeholders for dynamic content, but developers can ignore these.

In addition, while most HTML syntax is valid template syntax, Angular does not support `<script>` element in templates. For more information, see the [Security](/en/best-practices/security) page.

## What's next?

You might also be interested in the following:

| Topics                                                                      | Details                                                                                 |
| :-------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| [Binding dynamic text, properties, and attributes](/en/guide/templates/binding) | Bind dynamic data to text, properties and attributes.                                   |
| [Adding event listeners](/en/guide/templates/event-listeners)                   | Respond to events in your templates.                                                    |
| [Two-way binding](/en/guide/templates/two-way-binding)                          | Simultaneously binds a value and propagate changes.                                     |
| [Control flow](/en/guide/templates/control-flow)                                | Conditionally show, hide and repeat elements.                                           |
| [Pipes](/en/guide/templates/pipes)                                              | Transform data declaratively.                                                           |
| [Slotting child content with ng-content](/en/guide/templates/ng-content)        | Control how components render content.                                                  |
| [Create template fragments with ng-template](/en/guide/templates/ng-template)   | Declare a template fragment.                                                            |
| [Grouping elements with ng-container](/en/guide/templates/ng-container)         | Group multiple elements together or mark a location for rendering.                      |
| [Variables in templates](/en/guide/templates/variables)                         | Learn about variable declarations.                                                      |
| [Deferred loading with @defer](/en/guide/templates/defer)                       | Create deferrable views with `@defer`.                                                  |
| [Expression syntax](/en/guide/templates/expression-syntax)                      | Learn similarities and differences between Angular expressions and standard JavaScript. |
| [Whitespace in templates](/en/guide/templates/whitespace)                       | Learn how Angular handles whitespace.                                                   |
