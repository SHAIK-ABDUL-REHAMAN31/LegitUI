# Contributing to LegitUI

Welcome to LegitUI! This guide covers everything you need to know about adding new components to the library.

## Adding a New Component to LegitUI

Adding a new component involves creating its folder, writing the React code and CSS, and registering it so the documentation site can dynamically render the preview, generate the CLI installation instructions, and provide live customization. 

We've automated the boilerplate creation into a single CLI command.

### Quick Start

Run the scaffold script from the root of the project:

```bash
npm run new:component -- --name "Component Name" --category backgrounds --slug component-name
```

*(Note: the extra `--` is required so npm passes the flags to our script).*

### File Structure

The scaffold script automatically creates the following files in `src/ui-components/ComponentName/`:

1. **`ComponentName.tsx`**: The main React component file. This is where you write your logic and render the UI. It includes a boilerplate `interface` for props.
2. **`ComponentName.module.css`**: The CSS module file for styling. By using CSS modules, we ensure styles are scoped and won't leak into user applications.
3. **`index.ts`**: Re-exports the component for easier imports internally.

It also automatically updates:
- **`src/lib/component-registry.ts`**: Adds the metadata entry so the library knows your component exists.
- **`src/lib/preview-map.ts`**: Maps the component slug to a dynamic import so the `/preview/[slug]` route can natively render it.

### Component Requirements

For a component to be compatible with LegitUI's automated registry and distribution system, it must adhere to these rules:

- **Must export a default React component.** The build pipeline assumes `export default`.
- **Must have a TypeScript props interface with JSDoc.** Every prop in the interface should have a `/** Description */` block. The build script (`react-docgen-typescript`) uses this to auto-generate the prop documentation table.
- **Must use CSS Modules.** Do not use inline `<style>` tags or generic CSS imports. Use `import styles from './ComponentName.module.css'`.
- **Should be self-contained.** Avoid importing other LegitUI components into yours unless absolutely necessary. Users should be able to copy/paste your component folder into their project without tracking down 5 other dependencies.
- **Should work with the prop customizer.** Define reasonable, configurable props (like colors, speeds, booleans) that users would want to tweak.

### Adding Props to the Registry

While the build script extracts prop *descriptions* automatically from your JSDoc comments, you must manually define the interactive controls for the Prop Customizer Panel in `src/lib/component-registry.ts`.

Find your component's entry in `component-registry.ts` and populate the `props` array. 

Here are the supported control types:

- **Text String**: Default input.
  ```json
  { "name": "text", "type": "string", "default": "'Hello World'", "description": "Text to display" }
  ```
- **Number**: Renders a range slider.
  ```json
  { "name": "speed", "type": "number", "default": "1", "min": 0.1, "max": 5, "step": 0.1, "description": "Animation speed" }
  ```
- **Color**: Renders a visual color picker.
  ```json
  { "name": "color", "type": "color", "default": "'#a855f7'", "description": "Primary color" }
  ```
- **Color Array**: Renders a multi-color gradient picker.
  ```json
  { "name": "colors", "type": "color[]", "default": "['#ff0000', '#00ff00']", "description": "Gradient colors" }
  ```
- **Boolean**: Renders a toggle switch.
  ```json
  { "name": "glow", "type": "boolean", "default": "true", "description": "Enable glow effect" }
  ```
- **Select**: Renders a dropdown menu.
  ```json
  { "name": "variant", "type": "select", "options": [
      { "label": "Solid", "value": "'solid'" },
      { "label": "Outline", "value": "'outline'" }
    ], "default": "'solid'", "description": "Visual variant" }
  ```

*Note: String defaults and enum values must be wrapped in internal quotes (e.g., `"'solid'"` or `'"solid"'`) because they are parsed by the runtime customizer.*

### Testing Your Component

Follow these steps to verify your component works flawlessly in the LegitUI ecosystem:

1. **Check the Preview Route**: Run `npm run dev` and visit `http://localhost:3000/preview/your-slug`. This route renders *only* your component without the surrounding documentation chrome. Make sure it looks correct and spans the viewport correctly.
2. **Test the Customizer**: Visit `http://localhost:3000/components/your-slug`. You should see your component rendered inside the interactive preview card. Tweak the controls on the right panel and verify your component reacts to prop changes in real-time.
3. **Verify Documentation**: Check the Props table at the bottom of the page. Ensure your JSDoc comments were extracted and required fields are marked.
4. **Compile Check**: Run `npm run build`. Verify there are no TypeScript errors.
5. **Registry Build Check**: Run `npm run registry:build`. Verify that your component's JSON file is successfully generated in `public/registry/your-slug.json` and that it contains your `.tsx` and `.css` files.

### WebGL / Canvas Components

Special notes for components that use `Three.js`, `OGL`, or raw WebGL `<canvas>` APIs:

- **Native Rendering**: Thanks to the Phase 1+2 refactors, WebGL components now render natively inside React via the preview route. We no longer use fragile iframe source-code injection.
- **Cleanup**: If you use Three.js, ensure you cleanly dispose of your renderer, scenes, materials, and geometries inside a `useEffect` cleanup return function. Failing to do so will cause severe memory leaks and hot-reload crashes during local development.
- **Window Resizing**: Ensure your camera aspect ratio and renderer size automatically update when the viewport resizes. The LegitUI documentation layout dynamically resizes the iframe wrapper.
