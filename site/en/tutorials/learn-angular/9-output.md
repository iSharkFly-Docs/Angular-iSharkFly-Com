# Component output properties

When working with components it may be required to notify other components that something has happened. Perhaps a button has been clicked, an item has been added/removed from a list or some other important update has occurred. In this scenario components need to communicate with parent components.

Angular uses the `output()` function to enable this type of behavior.

::: info NOTE
Learn more about [custom events in the outputs guide](/en/guide/components/outputs).

:::

In this activity, you'll learn how to use the `output()` function to communicate with components.

<hr />

To create the communication path from child to parent components, use the `output` function to initialize a class property.

```ts [child.ts]
@Component({...})
class Child {
  incrementCountEvent = output<number>();
}
```

Now the component can generate events that can be listened to by the parent component. Trigger events by calling the `emit` method:

```ts [child.ts]
class Child {
  ...

  onClick() {
    this.count++;
    this.incrementCountEvent.emit(this.count);
  }
}
```

The emit function will generate an event with the same type as defined by the `output`.

Alright, your turn to give this a try. Complete the code by following these tasks:



### 1. Add an `output()` property

Update `child.ts` by adding an output property called `addItemEvent`, be sure to set the output type to be `string`.


### 2. Complete `addItem` method

In `child.ts` update the `addItem` method; use the following code as the logic:

```ts [child.ts]
addItem() {
  this.addItemEvent.emit('🐢');
}
```


### 3. Update the `App` template

In `app.ts` update the template to listen to the emitted event by adding the following code:

```html
<app-child (addItemEvent)="addItem($event)" />
```

Now, the "Add Item" button adds a new item to the list every time the button is clicked.




Wow, at this point you've completed the component fundamentals - impressive 👏

Keep learning to unlock more of Angular's great features.
