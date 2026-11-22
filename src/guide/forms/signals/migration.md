# Migrating existing forms to Signal Forms

This guide provides strategies for migrating existing codebases to Signal Forms, focusing on interoperability with
existing Reactive Forms.

## Top-down migration using `compatForm`

Sometimes you may want to use existing reactive `FormControl` instances within a Signal Form. This is useful for
controls that involve:

- Complex asynchronous logic.
- Intricate RxJS operators that are not yet ported.
- Integration with existing third-party libraries.

### Integrating a `FormControl` into a signal form

Consider an existing `passwordControl` that uses a specialized `enterprisePasswordValidator`. Instead of rewriting the
validator, you can bridge the control into your signal state.

We can do it using `compatForm`:

```ts
import {signal} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {compatForm} from '@angular/forms/signals/compat';

// 1. Existing control with a specialized validator
const passwordControl = new FormControl('', {
  validators: [Validators.required, enterprisePasswordValidator()],
  nonNullable: true,
});

// 2. Wrap it inside your form state signal
const user = signal({
  email: '',
  password: passwordControl, // Nest the existing control directly
});

// 3. Create the form
const f = compatForm(user);

// Access values via the signal tree
console.log(f.email().value()); // Current email value
console.log(f.password().value()); // Current value of passwordControl

// Reactive state is proxied automatically
const isPasswordValid = f.password().valid();
const passwordErrors = f.password().errors(); // Returns CompatValidationError if the existing validator fails
```

In the template, use standard reactive syntax by binding the underlying control:

```html
<form novalidate>
  <div>
    <label>
      Email:
      <input [formField]="f.email" />
    </label>
  </div>

  <div>
    <label>
      Password:
      <input [formField]="f.password" type="password" />
    </label>

    @if (f.password().touched() && f.password().invalid()) {
      <div class="error-list">
        @for (error of f.password().errors(); track error) {
          <p>{{ errorMessage(error) }}</p>
        }
      </div>
    }
  </div>
</form>
```

Errors from the existing validators are `CompatValidationError`s. They don't set `message`; the error object returned by the validator is available as `context` instead:

```ts
import {ValidationError} from '@angular/forms/signals';
import {CompatValidationError} from '@angular/forms/signals/compat';

errorMessage(error: ValidationError) {
  if (error instanceof CompatValidationError) {
    return (error.context as {message?: string} | null)?.message ?? error.kind;
  }
  return error.message ?? error.kind;
}
```

::: code-group

```ts [app.ts]
import {JsonPipe} from '@angular/common';
import {Component, computed, signal} from '@angular/core';
import {AbstractControl, FormControl, Validators} from '@angular/forms';
import {FormField, ValidationError} from '@angular/forms/signals';
import {compatForm, CompatValidationError} from '@angular/forms/signals/compat';

// Dummy enterprisePasswordValidator for the example
function enterprisePasswordValidator() {
  return (control: AbstractControl) => {
    if (control.value && control.value.length < 8) {
      return {enterprisePassword: {message: 'Password must be at least 8 characters.'}};
    }
    return null;
  };
}

@Component({
  selector: 'app',
  imports: [FormField, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // 1. Existing legacy control with a specialized validator
  readonly passwordControl = new FormControl('', {
    validators: [Validators.required, enterprisePasswordValidator()],
    nonNullable: true,
  });

  // 2. Wrap it inside your form state signal
  readonly user = signal({
    email: '',
    password: this.passwordControl, // Nest the legacy control directly
  });

  // 3. Create the form
  readonly f = compatForm(this.user);

  // We have to manually extract values, because JSON pipe can't serialize FormControl
  readonly formValue = computed(() => ({
    email: this.f.email().value(),
    password: this.f.password().value(),
  }));

  errorMessage(error: ValidationError) {
    // Errors from reactive validators keep the validator's error object in `context`.
    if (error instanceof CompatValidationError) {
      return (error.context as {message?: string} | null)?.message ?? error.kind;
    }
    return error.message ?? error.kind;
  }

  constructor() {
    console.log(this.f.email().value()); // ""
    console.log(this.f.password().value()); // Current value of passwordControl
  }
}
```

```html [app.html]
<form>
  <div>
    <label>
      Email:
      <input [formField]="f.email" />
    </label>
  </div>

  <div>
    <label>
      Password:
      <input [formField]="f.password" type="password" />
    </label>

    @if (f.password().touched() && f.password().invalid()) {
      <div class="error-list">
        @for (error of f.password().errors(); track error) {
          <p>{{ errorMessage(error) }}</p>
        }
      </div>
    }
  </div>
  <h3>Value</h3>
  <pre>{{ formValue() | json }}</pre>
</form>
```

:::

### Integrating a `FormGroup` into a signal form

You can also wrap an entire `FormGroup`. This is common when a reusable sub-section of a form—such as an
**Address Block**—is still managed by existing Reactive Forms.

```ts
import {signal} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {compatForm} from '@angular/forms/signals/compat';
import {required} from '@angular/forms/signals';

// 1. An existing address group with its own validation logic
const addressGroup = new FormGroup({
  street: new FormControl('123 Angular Way', Validators.required),
  city: new FormControl('Mountain View', Validators.required),
  zip: new FormControl('94043', Validators.required),
});

// 2. Include it in the state like it's a value
const checkoutModel = signal({
  customerName: 'Pirojok the Cat',
  shippingAddress: addressGroup,
});

const f = compatForm(checkoutModel, (p) => {
  required(p.customerName);
});
```

The `shippingAddress` field acts as a branch in your Signal Form tree. You can bind these nested controls in your
template by accessing the underlying existing controls via `.control()`:

```html
<form novalidate>
  <h3>Shipping Details</h3>

  <div>
    <label>
      Customer Name:
      <input [formField]="f.customerName" />
    </label>

    @if (f.customerName().touched() && f.customerName().invalid()) {
      <div class="error-list">
        <p>Customer name is required.</p>
      </div>
    }
  </div>

  <fieldset>
    <legend>Address</legend>

    @let street = f.shippingAddress().control().controls.street;
    <div>
      <label>
        Street:
        <input [formControl]="street" />
      </label>
      @if (street.touched && street.invalid) {
        <div class="error-list">
          <p>Street is required</p>
        </div>
      }
    </div>

    @let city = f.shippingAddress().control().controls.city;
    <div>
      <label>
        City:
        <input [formControl]="city" />
      </label>
      @if (city.touched && city.invalid) {
        <div class="error-list">
          <p>City is required</p>
        </div>
      }
    </div>

    @let zip = f.shippingAddress().control().controls.zip;
    <div>
      <label>
        Zip Code:
        <input [formControl]="zip" />
      </label>
      @if (zip.touched && zip.invalid) {
        <div class="error-list">
          <p>Zip Code is required</p>
        </div>
      }
    </div>
  </fieldset>
</form>
```

::: code-group

```ts [app.ts]
import {JsonPipe} from '@angular/common';
import {Component, computed, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {FormField, required} from '@angular/forms/signals';
import {compatForm} from '@angular/forms/signals/compat';

@Component({
  selector: 'app',
  imports: [ReactiveFormsModule, FormField, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // 1. A legacy address group with its own validation logic
  readonly addressGroup = new FormGroup({
    street: new FormControl('123 Angular Way', Validators.required),
    city: new FormControl('Mountain View', Validators.required),
    zip: new FormControl('94043', Validators.required),
  });

  // 2. Include it in the state like it's a value
  readonly checkoutModel = signal({
    customerName: '',
    shippingAddress: this.addressGroup,
  });

  // 3. Create the form
  readonly f = compatForm(this.checkoutModel, (p) => {
    required(p.customerName);
  });

  // We have to manually extract values, because JSON pipe can't serialize FormControl
  readonly formValue = computed(() => ({
    customerName: this.f.customerName().value(),
    shippingAddress: this.f.shippingAddress().value(),
  }));

  constructor() {
    console.log('Customer Name:', this.f.customerName().value());
    console.log('Street:', this.f.shippingAddress().value().street);
  }
}
```

```html [app.html]
<form>
  <h3>Shipping Details</h3>

  <div>
    <label>
      Customer Name:
      <input [formField]="f.customerName" />
    </label>

    @if (f.customerName().touched() && f.customerName().invalid()) {
      <div class="error-list">
        <p>Customer name is required.</p>
      </div>
    }
  </div>

  <fieldset>
    <legend>Address</legend>

    @let street = f.shippingAddress().control().controls.street;
    <div>
      <label>
        Street:
        <input [formControl]="street" />
      </label>
      @if (street.touched && street.invalid) {
        <div class="error-list">
          <p>Street is required</p>
        </div>
      }
    </div>

    @let city = f.shippingAddress().control().controls.city;
    <div>
      <label>
        City:
        <input [formControl]="city" />
      </label>
      @if (city.touched && city.invalid) {
        <div class="error-list">
          <p>City is required</p>
        </div>
      }
    </div>

    @let zip = f.shippingAddress().control().controls.zip;
    <div>
      <label>
        Zip Code:
        <input [formControl]="zip" />
      </label>
      @if (zip.touched && zip.invalid) {
        <div class="error-list">
          <p>Zip Code is required</p>
        </div>
      }
    </div>
  </fieldset>
  <h3>Value</h3>
  <pre>{{ formValue() | json }}</pre>
</form>
```

:::

### Accessing values

While `compatForm` proxies value access on the `FormControl` level, the full form value preserves the control:

```ts
const passwordControl = new FormControl('password' /** ... */);

const user = signal({
  email: '',
  password: passwordControl, // Nest the existing control directly
});

const form = compatForm(user);
form.password().value(); // 'password'
form().value(); // { email: '', password: FormControl}
```

If you need the whole form value with the controls unwrapped, use `extractValue` from `@angular/forms/signals/compat`:

```ts
import {extractValue} from '@angular/forms/signals/compat';

const formValue = computed(() => extractValue(form)); // {email: '', password: 'password'}
```

## Bottom-up migration

### Integrating a Signal Form into a `FormGroup`

You can use `SignalFormControl` to expose a signal-based form as a standard `FormControl`. This is useful when you want
to migrate leaf nodes of a form to Signals while keeping the parent `FormGroup` structure.

```ts
import {Component, signal} from '@angular/core';
import {ReactiveFormsModule, FormGroup} from '@angular/forms';
import {SignalFormControl} from '@angular/forms/signals/compat';
import {required} from '@angular/forms/signals';

@Component({
  // ...
  imports: [ReactiveFormsModule],
})
export class UserProfile {
  // 1. Create a SignalFormControl, use signal form rules.
  emailControl = new SignalFormControl('', (p) => {
    required(p, {message: 'Email is required'});
  });

  // 2. Use it in an existing FormGroup
  form = new FormGroup({
    email: this.emailControl,
  });
}
```

The `SignalFormControl` synchronizes values bi-directionally between the **Signal Forms** system and the **Reactive Forms** system:

- **Signal -> Reactive**: Updating the value via Signal Forms updates the Reactive Form control immediately.

```ts
// Signal Forms update
this.emailControl.fieldTree().value.set('new@example.com');

// Reactive Forms reflects the change
console.log(this.form.value); // {email: 'new@example.com'}
```

- **Reactive -> Signal**: Updating the value via the parent `FormGroup` updates the Signal Forms state.

```ts
// Reactive Forms update
this.form.patchValue({email: 'other@example.com'});

// Signal Forms reflects the change
console.log(this.emailControl.fieldTree().value()); // 'other@example.com'
```

### Binding `SignalFormControl`

To use `SignalFormControl` in a `FormGroup`, pass it as a control and bind it in the template using `.fieldTree`:

```ts
readonly emailControl = new SignalFormControl('', (p) => { required(p); });

readonly form = new FormGroup({
  name: new FormControl('Alice'),
  email: this.emailControl,
});
```

```html
<form [formGroup]="form">
  <!-- Standard control -->
  <input formControlName="name" />

  <!-- Signal control -->
  <input [formField]="emailControl.fieldTree" />
</form>
```

```html
<!-- Avoid: Using formControlName or [formControl] for SignalFormControl -->
<input formControlName="email" />
<input [formControl]="emailControl" />
```

### Why `SignalFormControl` takes a value instead of a signal

In standard Signal Forms, you create a form by passing a signal: `form(mySignal)`.

However, `SignalFormControl` takes a **raw value** (like a string or object) as its first argument:

```ts
// Takes a raw value, not a signal
const userControl = new SignalFormControl({
  email: 'pirojok@example.com',
});
```

`SignalFormControl` creates the signal internally to intercept writes and trigger the **synchronous updates** expected by Reactive Forms.

You can still access the internal signal via `.sourceValue`:

```ts
const value = userControl.sourceValue();
```

### Disabling/Enabling control

Imperative APIs for changing the enabled/disabled state (like `enable()`, `disable()`) are intentionally not supported
in `SignalFormControl`. This is because the state of the control should be derived from the signal state and rules.

Attempting to call disable/enable would throw an error.

```ts
import {signal, effect} from '@angular/core';
import {SignalFormControl} from '@angular/forms/signals/compat';

export class UserProfile {
  readonly emailControl = new SignalFormControl('');

  readonly isLoading = signal(false);

  constructor() {
    // This will throw an error
    effect(() => {
      if (this.isLoading()) {
        this.emailControl.disable();
      } else {
        this.emailControl.enable();
      }
    });
  }
}
```

Instead, use disabled rule:

```ts
import {signal} from '@angular/core';
import {SignalFormControl} from '@angular/forms/signals/compat';
import {disabled} from '@angular/forms/signals';

export class UserProfile {
  readonly isLoading = signal(false);

  readonly emailControl = new SignalFormControl('', (p) => {
    // The control becomes disabled whenever isLoading is true
    disabled(p, {when: () => this.isLoading()});
  });

  async saveData() {
    this.isLoading.set(true);
    // ... perform save ...
    this.isLoading.set(false);
  }
}
```

### Dynamic manipulation

Imperative APIs for adding or removing validators (like `addValidators()`, `removeValidators()`, `setValidators()`) are
intentionally not supported in `SignalFormControl`.

Attempting to call these methods will throw an error.

```ts
export class UserProfile {
  readonly emailControl = new SignalFormControl('');
  readonly isRequired = signal(false);

  toggleRequired() {
    this.isRequired.update((v) => !v);
    // This will throw an error
    if (this.isRequired()) {
      this.emailControl.addValidators(Validators.required);
    } else {
      this.emailControl.removeValidators(Validators.required);
    }
  }
}
```

Instead, use `applyWhen` rule to conditionally apply validators:

```ts
import {signal} from '@angular/core';
import {SignalFormControl} from '@angular/forms/signals/compat';
import {applyWhen, required} from '@angular/forms/signals';

export class UserProfile {
  readonly isRequired = signal(false);

  readonly emailControl = new SignalFormControl('', (p) => {
    // The control becomes required whenever isRequired is true
    applyWhen(
      p,
      () => this.isRequired(),
      (p) => {
        required(p);
      },
    );
  });
}
```

### Manual Error Selection

The `setErrors()` and `markAsPending()` methods are not supported. In Signal Forms, errors are derived from validation
rules and async validation status. If you need to report an error, it should be done declaratively via a validation rule
in the schema.

## Automatic status classes

Reactive/Template Forms automatically adds [class attributes](/guide/forms/template-driven-forms#track-control-states) (
such as `.ng-valid` or `.ng-dirty`) to facilitate styling control states. Signal Forms does not do that.

If you want to preserve this behavior, you can provide the `NG_STATUS_CLASSES` preset:

```ts
import {provideSignalFormsConfig} from '@angular/forms/signals';
import {NG_STATUS_CLASSES} from '@angular/forms/signals/compat';
import {bootstrapApplication} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [
    provideSignalFormsConfig({
      classes: NG_STATUS_CLASSES,
    }),
  ],
});
```

You can also provide your own custom configuration to apply whatever classes you wish based on you custom logic:

```ts
import {provideSignalFormsConfig} from '@angular/forms/signals';
import {bootstrapApplication} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [
    provideSignalFormsConfig({
      classes: {
        'ng-valid': ({state}) => state().valid(),
        'ng-invalid': ({state}) => state().invalid(),
        'ng-touched': ({state}) => state().touched(),
        'ng-dirty': ({state}) => state().dirty(),
      },
    }),
  ],
});
```

## Custom Controls

Any [custom Signal Form Control](/guide/forms/signals/custom-controls) can be
used with Reactive (and Template-Driven) Forms as-is. This allows you to
migrate existing `ControlValueAccessor` implementations to
`FormValueControl`/`FormCheckboxControl` without breaking existing usages.

::: warning IMPORTANT
Do **not** implement both `ControlValueAccessor` and
`FormValueControl`/`FormCheckboxControl` on the same component. Implement one or
the other.

:::

Given the following custom control:

```ts
import {Component, model} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';

@Component({
  selector: 'app-basic-input',
  template: `
    <div class="basic-input">
      <input
        type="text"
        [value]="value()"
        (input)="value.set($event.target.value)"
        placeholder="Enter text..."
      />
    </div>
  `,
})
export class BasicInput implements FormValueControl<string> {
  /** The current input value */
  value = model('');
}
```

You can use this custom control with reactive forms as you would a native input
or a custom control based on `ControlValueAccessor`. For example, consider this
simple component with a Reactive Form.

```ts
import {Component} from '@angular/core';
import {FormGroup, FormControl, ReactiveFormsModule} from '@angular/forms';
import {BasicInput} from './basic-input';

@Component({
  selector: 'app-example',
  template: `
    <form [formGroup]="reactiveFormGroup">
      <app-basic-input formControlName="reactiveControlName" />
    </form>
    <p>Text: {{ reactiveFormGroup.value.reactiveControlName }}</p>
  `,
  imports: [ReactiveFormsModule, BasicInput],
})
export class ExampleComponent {
  readonly reactiveFormGroup = new FormGroup({
    reactiveControlName: new FormControl(''),
  });
}
```

Any change to the custom `app-basic-input` control will be reflected in the
reactive `FormControl`.
