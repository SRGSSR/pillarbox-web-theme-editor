# Known Issues

This document outlines known issues within our software, detailing both temporary fixes and planned
permanent solutions. It reflects our commitment to transparency and our ongoing efforts to improve
user experience.

## Color picker doesn't work in the shadow dom

There is a known issue with the Monaco Editor's color picker disappearing when used in a shadow DOM
context. This problem is documented in the Monaco Editor GitHub issues:
[[Bug] Color picker not usable in monaco editor in shadow dom #3845][monaco-issue].

### Solution

As a temporary workaround, the rendering of the Monaco Editor has been moved from the shadow DOM to
the light DOM. This adjustment ensures that the color picker remains accessible and functional for
users. The necessary changes involve modifying the component's rendering context and adjusting
the `.monaco-container` CSS to cover the full parent area.

### Next Steps

This workaround will remain in place until the issue with the Monaco Editor is resolved. Once the
fix is released, the next steps involve reverting the rendering back to the shadow DOM to take
advantage of its encapsulation features. This will entail removing the temporary adjustments made to
the component's rendering method and the associated CSS.

[monaco-issue]:https://github.com/microsoft/monaco-editor/issues/3845
