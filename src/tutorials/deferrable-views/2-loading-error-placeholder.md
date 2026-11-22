# @loading, @error and @placeholder blocks

Deferrable views let you define content to be shown in different loading states.

| Block          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@placeholder` | By default, defer blocks do not render any content before they are triggered. The `@placeholder` is an optional block that declares content to show before the deferred content loads. Angular replaces the placeholder with the deferred content after loading completes. While this block is optional, the Angular team recommends always including a placeholder. [Learn more in the full deferrable views documentation](/guide/templates/defer) |
| `@loading`     | This optional block allows you to declare content to be shown during the loading of any deferred dependencies.                                                                                                                                                                                                                                                                                                                                      |
| `@error`       | This block allows you to declare content which is shown if deferred loading fails.                                                                                                                                                                                                                                                                                                                                                                  |

The contents of all the above sub-blocks are eagerly loaded. Additionally, some features require a `@placeholder` block.

In this activity, you'll learn how to use the `@loading`, `@error` and `@placeholder` blocks to manage the states of deferrable views.

<hr>



### 1. Add `@placeholder` block

In your `app.ts`, add a `@placeholder` block to the `@defer` block.

```html
@defer {
  <article-comments />
} @placeholder {
  <p>Placeholder for comments</p>
}
```


### 2. Configure the `@placeholder` block

The `@placeholder` block accepts an optional parameter to specify the `minimum` amount of time that this placeholder should be shown. This `minimum` parameter is specified in time increments of milliseconds (ms) or seconds (s). This parameter exists to prevent fast flickering of placeholder content in the case that the deferred dependencies are fetched quickly.

```html
@defer {
  <article-comments />
} @placeholder (minimum 1s) {
  <p>Placeholder for comments</p>
}
```


### 3. Add `@loading` block

Next add a `@loading` block to the component template.

The `@loading` block accepts two optional parameters:

- `minimum`: the amount of time that this block should be shown
- `after`: the amount of time to wait after loading begins before showing the loading template

Both parameters are specified in time increments of milliseconds (ms) or seconds (s).

Update `app.ts` to include a `@loading` block with a minimum parameter of `1s` as well as an after parameter with the value 500ms to the @loading block.

```html
@defer {
  <article-comments />
} @placeholder (minimum 1s) {
  <p>Placeholder for comments</p>
} @loading (minimum 1s; after 500ms) {
  <p>Loading comments...</p>
}
```

::: info NOTE
this example uses two parameters, separated by the ; character.

:::


### 4. Add `@error` block

Finally, add an `@error` block to the `@defer` block.

```html
@defer {
  <article-comments />
} @placeholder (minimum 1s) {
  <p>Placeholder for comments</p>
} @loading (minimum 1s; after 500ms) {
  <p>Loading comments...</p>
} @error {
  <p>Failed to load comments</p>
}
```



Congratulations! At this point, you have a good understanding about deferrable views. Keep up the great work and let's learn about triggers next.
