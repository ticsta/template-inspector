## Ticsta template inspector

A module for loading and validating a ticsta template.

### Usage

```
var inspector = require('ticsta-template-inspector');

inspector.validate('/path/to/a/template')
  .then(function(templateInfo){
    // valid template
  })
  .catch(function(error){
    // invalid template
  });

inspector.load('/path/to/a/template')
  .then(function(template){
    // got template
  });
```