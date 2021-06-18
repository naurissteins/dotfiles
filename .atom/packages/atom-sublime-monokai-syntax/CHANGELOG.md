## 0.4.3 - Sadly fix package.json error from 0.4.2

## 0.4.2 - Corrected package.json error

## 0.4.1 - Package info updated
* Added author.
* Update on .gitignore.
* Update on .npmignore.

## 0.4.0 - Atom Hermeneutics Update
* Added the `syntax--` preffix on syntax selectors. Here's the RegExp: `\.(scope|terminator|expression|method-call|js|php|underline|sql|marker|comment|keyword|other|operator|control|special-method|unit|storage|constant|character|escape|numeric|color|symbol|variable|interpolation|parameter|language|function|illegal|invalid|string|regexp|source|ruby|embedded|link|punctuation|definition|array|heading|identity|bold|italic|section|support|class|any-method|entity|name|type|inherited-class|tag|attribute-name|id|meta|require|selector|separator|none|markup|changed|deleted|inserted|list|quote|raw|inline|gfm)` => `.syntax--$1`.

## 0.3.9 - Secure
* Pacth to secure that last version is live.

## 0.3.9 - Sublimer coloring
* Function call color switched from white (VisualStudio Monokai) to light-blue (Sublime Monokai).
* CSS optimized.

## 0.3.8 - Absolute path for screenshot
* README.md update.

## 0.3.6 - Absolute path for screenshot
* This is just an workaround, I want to follow the best practices in Git repo soon.

## 0.3.4 - Arguments/parameters + SQL
* Corrected: argumets in PHP function declarations where not being orange colored.
* SQL syntax was white inside a PHP string, cause `.source` is white, added exception for source coloring in SQL embedded.
* Updated README.md

## 0.3.1 - Keywords
* Corrected CSS inheritance fault that made keywords looks like strings.
* CSS more optmized, far from ideal, but better than before.
* Improved indentation.

## 0.3.0 - Stable
* Various function declaration/call color highlight corrected
* Inside and outside string syntax colors corrected
* Based on Sublime, but corrected most of Sublime highlight unexpected behaviors

## 0.1.0 - First Release
* Every feature added
* Every bug fixed
