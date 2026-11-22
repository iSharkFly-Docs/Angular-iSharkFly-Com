---
untranslated: true
---

# Merge translations into the application

To merge the completed translations into your project, complete the following actions

1. Use the [Angular CLI][CliMain] to build a copy of the distributable files of your project
1. Use the `"localize"` option to replace all of the i18n messages with the valid translations and build a localized variant application.
   A variant application is a complete copy of the distributable files of your application translated for a single locale.

After you merge the translations, serve each distributable copy of the application using server-side language detection or different subdirectories.

::: tip HELPFUL
For more information about how to serve each distributable copy of the application, see [deploying multiple locales](/guide/i18n/deploy).

:::

For a compile-time translation of the application, the build process uses ahead-of-time (AOT) compilation to produce a small, fast, ready-to-run application.

::: tip HELPFUL
For a detailed explanation of the build process, see [Building and serving Angular apps][GuideBuild].
The build process works for translation files in the `.xlf` format or in another format that Angular understands, such as `.xtb`.
For more information about translation file formats used by Angular, see [Change the source language file format][GuideI18nCommonTranslationFilesChangeTheSourceLanguageFileFormat]

:::

To build a separate distributable copy of the application for each locale, [define the locales in the build configuration][GuideI18nCommonMergeDefineLocalesInTheBuildConfiguration] in the [`angular.json`][GuideWorkspaceConfig] workspace build configuration file of your project.

This method shortens the build process by removing the requirement to perform a full application build for each locale.

To [generate application variants for each locale][GuideI18nCommonMergeGenerateApplicationVariantsForEachLocale], use the `"localize"` option in the [`angular.json`][GuideWorkspaceConfig] workspace build configuration file.
Also, to [build from the command line][GuideI18nCommonMergeBuildFromTheCommandLine], use the [`build`][CliBuild] [Angular CLI][CliMain] command with the `--localize` option.

::: tip HELPFUL
Optionally, [apply specific build options for just one locale][GuideI18nCommonMergeApplySpecificBuildOptionsForJustOneLocale] for a custom locale configuration.

:::

## Define locales in the build configuration

Use the `i18n` project option in the [`angular.json`][GuideWorkspaceConfig] workspace build configuration file of your project to define locales for a project.

The following sub-options identify the source language and tell the compiler where to find supported translations for the project.

| Suboption      | Details                                                                                                                                                |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sourceLocale` | The locale you use within the application source code \(`en-US` by default\). Can also be an object with `code`, `baseHref`, and `subPath` properties. |
| `locales`      | A map of locale identifiers to translation files. Each entry can also be an object with `translation`, `baseHref`, and `subPath` properties.           |

For the full list of `i18n` properties and their types, see [i18n options][GuideWorkspaceConfigI18n].

### `angular.json` for `en-US` and `fr` example

For example, the following excerpt of an [`angular.json`][GuideWorkspaceConfig] workspace build configuration file sets the source locale to `en-US` and provides the path to the French \(`fr`\) locale translation file.

```json [angular.json]
  "projects": {
    "angular.io-example": {
      "i18n": {
        "sourceLocale": "en-US",
        "locales": {
          "fr": {
            "translation": "src/locale/messages.fr.xlf",
          }
        }
      },
      "architect": {
      }
    }
  }
}
```

## Generate application variants for each locale

To use your locale definition in the build configuration, use the `"localize"` option in the [`angular.json`][GuideWorkspaceConfig] workspace build configuration file to tell the CLI which locales to generate for the build configuration.

- Set `"localize"` to `true` for all the locales previously defined in the build configuration.
- Set `"localize"` to an array of a subset of the previously defined locale identifiers to build only those locale versions.
- Set `"localize"` to `false` to disable localization and not generate any locale-specific versions.

::: tip HELPFUL
Ahead-of-time (AOT) compilation is required to localize component templates.

:::

If you changed this setting, set `"aot"` to `true` in order to use AOT.

::: tip HELPFUL
Due to the deployment complexities of i18n and the need to minimize rebuild time, the development server only supports localizing a single locale at a time.
If you set the `"localize"` option to `true` or to an array of more than one locale, and use `ng serve`, the development server logs a warning and disables localization.
If you want to develop against a specific locale, set the `"localize"` option to a specific locale.
For example, for French \(`fr`\), specify `"localize": ["fr"]`.

:::

The CLI loads and registers the locale data, places each generated version in a locale-specific directory to keep it separate from other locale versions, and puts the directories within the configured `outputPath` for the project.
For each application variant the `lang` attribute of the `html` element is set to the locale.
The CLI also adjusts the HTML base HREF for each version of the application by adding the locale to the configured `baseHref`.

Set the `"localize"` property as a shared configuration to effectively inherit for all the configurations.
Also, set the property to override other configurations.

### `angular.json` include all locales from build example

The following example displays the `"localize"` option set to `true` in the [`angular.json`][GuideWorkspaceConfig] workspace build configuration file, so that all locales defined in the build configuration are built.

```json [angular.json]
"build": {
  "builder": "@angular-devkit/build-angular:browser",
  "options": {
    "localize": true,
  },
```

## Build from the command line

Also, use the `--localize` option with the [`ng build`][CliBuild] command and your existing `production` configuration.
The CLI builds all locales defined in the build configuration.
If you set the locales in build configuration, it is similar to when you set the `"localize"` option to `true`.

::: tip HELPFUL
For more information about how to set the locales, see [Generate application variants for each locale][GuideI18nCommonMergeGenerateApplicationVariantsForEachLocale].

:::

```shell [commands.sh]
ng build --localize
```

## Apply specific build options for just one locale

To apply specific build options to only one locale, specify a single locale to create a custom locale-specific configuration.

::: warning IMPORTANT
Use the [Angular CLI][CliMain] development server \(`ng serve`\) with only a single locale.

:::

### build for French example

The following example displays a custom locale-specific configuration using a single locale.

```json [angular.json]
  "build": {
    "configurations": {
      "fr": {
        "localize": ["fr"]
      }
    },
  },
  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "configurations": {
      "fr": {
        "buildTarget": "angular.io-example:build:development,fr"
      }
    },
  },
}
```

Pass this configuration to the `ng serve` or `ng build` commands.
The following code example displays how to serve the French language file.

```shell [commands.sh]
ng serve --configuration=fr
```

For production builds, use configuration composition to run both configurations.

```shell [commands.sh]
ng build --configuration=production,fr
```

```json [angular.json]
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser",
    "options": {
    },
    "configurations": {
      "fr": {
        "localize": ["fr"]
      }
    },
  },
  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "configurations": {
      "production": {
        "buildTarget": "angular.io-example:build:production"
      },
      "fr": {
        "buildTarget": "angular.io-example:build:development,fr"
      }
    },
  },
}
```

## Report missing translations

When a translation is missing, the build succeeds but generates a warning such as `Missing translation for message "{translation_text}"`.
To configure the level of warning that is generated by the Angular compiler, specify one of the following levels.

| Warning level | Details                                              | Output                                                 |
| :------------ | :--------------------------------------------------- | :----------------------------------------------------- |
| `error`       | Throw an error and the build fails                   | n/a                                                    |
| `ignore`      | Do nothing                                           | n/a                                                    |
| `warning`     | Displays the default warning in the console or shell | `Missing translation for message "{translation_text}"` |

Specify the warning level in the `options` section for the `build` target of your [`angular.json`][GuideWorkspaceConfig] workspace build configuration file.

### `angular.json` `error` warning example

The following example displays how to set the warning level to `error`.

```json [angular.json]
"build": {
  "builder": "@angular-devkit/build-angular:browser",
  "options": {
    "i18nMissingTranslation": "error"
  },
```

::: tip HELPFUL
When you compile your Angular project into an Angular application, the instances of the `i18n` attribute are replaced with instances of the [`$localize`][ApiLocalizeInitLocalize] tagged message string.
This means that your Angular application is translated after compilation.
This also means that you can create localized versions of your Angular application without re-compiling your entire Angular project for each locale.

:::

When you translate your Angular application, the _translation transformation_ replaces and reorders the parts \(static strings and expressions\) of the template literal string with strings from a collection of translations.
For more information, see [`$localize`][ApiLocalizeInitLocalize].

::: info TLDR
Compile once, then translate for each locale.

:::

## What's next

- [Deploy multiple locales](/guide/i18n/deploy)


[ApiLocalizeInitLocalize]: api/localize/init/$localize '$localize | init - localize - API | Angular'
[CliMain]: cli 'CLI Overview and Command Reference | Angular'
[CliBuild]: cli/build 'ng build | CLI | Angular'
[GuideBuild]: tools/cli/build 'Building and serving Angular apps | Angular'
[GuideI18nCommonMergeApplySpecificBuildOptionsForJustOneLocale]: guide/i18n/merge#apply-specific-build-options-for-just-one-locale 'Apply specific build options for just one locale - Merge translations into the application | Angular'
[GuideI18nCommonMergeBuildFromTheCommandLine]: guide/i18n/merge#build-from-the-command-line 'Build from the command line - Merge translations into the application | Angular'
[GuideI18nCommonMergeDefineLocalesInTheBuildConfiguration]: guide/i18n/merge#define-locales-in-the-build-configuration 'Define locales in the build configuration - Merge translations into the application | Angular'
[GuideI18nCommonMergeGenerateApplicationVariantsForEachLocale]: guide/i18n/merge#generate-application-variants-for-each-locale 'Generate application variants for each locale - Merge translations into the application | Angular'
[GuideI18nCommonTranslationFilesChangeTheSourceLanguageFileFormat]: guide/i18n/translation-files#change-the-source-language-file-format 'Change the source language file format - Work with translation files | Angular'
[GuideWorkspaceConfig]: reference/configs/workspace-config 'Angular workspace configuration | Angular'
[GuideWorkspaceConfigI18n]: reference/configs/workspace-config#i18n-options 'i18n options - Angular workspace configuration | Angular'
