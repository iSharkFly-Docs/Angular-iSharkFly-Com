# 部署多个语言环境

如果 `myapp` 是包含项目可分发文件的目录，通常会把不同语言环境（locale）的版本分别放在各自的语言环境目录中。
例如，法语版本位于 `myapp/fr` 目录，西班牙语版本位于 `myapp/es` 目录。

带有 `href` 属性的 HTML `base` 标签用于为相对链接指定基础 URI（即 URL）。
如果在 [`angular.json`][GuideWorkspaceConfig] 工作区构建配置文件中把 `"localize"` 选项设置为 `true` 或一个语言环境 ID 数组，CLI 会为应用的每个版本调整基础 `href`。
为了给应用的每个版本调整基础 `href`，CLI 会把配置的 `"subPath"` 用作该语言环境的 URL 片段。
如果没有设置 `"subPath"`，它默认为语言环境 ID。
请在 [`angular.json`][GuideWorkspaceConfig] 工作区构建配置文件中为每个语言环境指定 `"subPath"`。
下面的示例把 `"subPath"` 设置为空字符串。

```json [angular.json]
  "projects": {
    "angular.io-example": {
      "i18n": {
        "sourceLocale": "en-US",
        "locales": {
          "fr": {
            "translation": "src/locale/messages.fr.xlf",
            "subPath": ""
          }
        }
      },
      "architect": {
      }
    }
  }
}
```

## 配置服务器

多语言的典型部署方式是从不同的子目录提供每种语言。
用户会根据浏览器通过 `Accept-Language` HTTP 头定义的首选语言被重定向。
如果用户没有定义首选语言，或者首选语言不可用，服务器就会回退到默认语言。
要切换语言，就把当前位置切换到另一个子目录。
子目录的切换通常通过应用中实现的菜单来完成。

关于如何把应用部署到远程服务器的更多信息，请参阅[部署][GuideDeployment]。

::: warning 重要
如果你使用了[服务端渲染](/guide/ssr)，并把 `outputMode` 设置为 `server`，Angular 会根据 `Accept-Language` HTTP 头自动动态处理重定向。这样就无需手动调整服务器或配置，从而简化了部署。

:::

### Nginx 示例

下面的示例展示了一个 Nginx 配置。

```nginx [nginx.conf]
http {
    # 浏览器首选语言检测（不需要
    # AcceptLanguageModule）
    map $http_accept_language $accept_language {
        ~*^de de;
        ~*^fr fr;
        ~*^en "";
    }
    # ...
}

server {
    listen 80;
    server_name localhost;
    root /www/data;

    # 如果浏览器没有定义首选语言，则回退到默认语言
    if ($accept_language ~ "^$") {
        set $accept_language "fr";
    }

    # 把 "/" 重定向到浏览器首选语言版本的 Angular 应用
    rewrite ^/$ /$accept_language permanent;

    # Angular 应用下的所有内容始终重定向到
    # 对应语言版本的 Angular
    location ~ ^/(fr|de|$) {
        if ($accept_language = "") {
            try_files $uri /index.html?$args;
        }
        try_files $uri /$1/index.html?$args;
    }
    # ...
}
```

### Apache 示例

下面的示例展示了一个 Apache 配置。

```apache [apache2.conf]
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot /www/data

    <Directory "/www/data">
        # 启用重写引擎以操作 URL
        RewriteEngine on
        RewriteBase /

        # 访问根级路径时提供 'index.html'
        RewriteRule ^../index\.html$ - [L]

        # 如果请求的文件或目录不存在，则重定向到 'index.html'
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule (..) $1/index.html [L]

        # 基于 HTTP Accept-Language 头的语言重定向

        # 把德语用户重定向到 '/de/' 目录
        RewriteCond %{HTTP:Accept-Language} ^de [NC]
        RewriteRule ^$ /de/ [R]

        # 把英语用户重定向到 '/en/' 目录
        RewriteCond %{HTTP:Accept-Language} ^en [NC]
        RewriteRule ^$ /en/ [R]

        # 把使用不受支持语言（非 'en' 或 'de'）的用户重定向到 '/fr/' 目录
        RewriteCond %{HTTP:Accept-Language} !^en [NC]
        RewriteCond %{HTTP:Accept-Language} !^de [NC]
        RewriteRule ^$ /fr/ [R]
    </Directory>
</VirtualHost>
```

## 预渲染

如果把 `outputMode` 设置为 `static`，CLI 会在构建时为每个语言环境预渲染（prerender）服务器路由中配置了 `RenderMode.Prerender` 的路由（route），并且不会生成服务器。
更多信息请参阅[生成完全静态的应用](/guide/ssr#generate-a-fully-static-application)。
由于没有服务器来选择语言，重定向和未找到页面需要由你的托管配置来处理。

### 输出结构

CLI 会把每个语言环境写入 `browser/` 中各自的目录。
每个目录都包含该语言环境预渲染的 HTML、各个包（bundle）以及一份 `public/` 文件的副本。
预渲染页面的 `lang` 属性和 `<base href>` 与语言环境相匹配。

下面的结构假设源语言环境从根路径提供，如下一节所述。

```text
browser/
├── index.html
├── about/index.html
├── tr/
│   ├── index.html
│   └── about/index.html
└── es/
    ├── index.html
    └── about/index.html
```

根路径的页面使用 `lang="en"` 和 `<base href="/">`。`tr/` 页面使用 `lang="tr"` 和 `<base href="/tr/">`，`es/` 页面使用 `lang="es"` 和 `<base href="/es/">`。

### 从根路径提供源语言环境

要从 `/` 提供源语言环境，并把其他语言环境嵌套在它下面，请使用 `sourceLocale` 的对象形式，并把 `"subPath"` 设置为空字符串。

```json
{
  "i18n": {
    "sourceLocale": {
      "code": "en",
      "subPath": ""
    },
    "locales": {
      "tr": "src/locale/messages.tr.xlf",
      "es": "src/locale/messages.es.xlf"
    }
  }
}
```

如果没有空的 `"subPath"`，CLI 会把源语言环境放在以语言环境代码命名的单独目录中，例如 `/en/`。

### 把用户重定向到他们的语言

静态输出不会根据 `Accept-Language` HTTP 头进行重定向。
请配置你的托管服务，使其根据该请求头进行重定向。
[Nginx](#nginx-example) 和 [Apache](#apache-example) 示例假设每个语言环境（包括默认语言环境）都位于各自的子目录中。
如果从根路径提供源语言环境，请调整这些配置，只为其他语言环境重定向 `/`。

### 未找到页面

CLI 不会为 `**` 通配符路由预渲染页面。
要获得未找到页面，请声明一个具体的路由（例如 `404`），并确保你的服务器路由会预渲染它。
这样每个语言环境都会有自己的页面，例如 `/404/index.html` 和 `/tr/404/index.html`。
请配置你的托管服务，使其提供与缺失 URL 的语言环境路径相匹配的页面，例如在 Nginx 中使用 `error_page`，在 Apache 中使用 `ErrorDocument`。

[CliBuild]: cli/build 'ng build | CLI | Angular'
[GuideDeployment]: tools/cli/deployment 'Deployment | Angular'
[GuideWorkspaceConfig]: reference/configs/workspace-config 'Angular workspace configuration | Angular'
