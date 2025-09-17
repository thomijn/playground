# Playground Router System

This project uses a scalable router system that makes it easy to add new experiments and playgrounds.

## How to Add a New Playground

### 1. Create Your Playground Component

Create a new folder in `src/playgrounds/` with your playground name:

```
src/playgrounds/my-new-playground/
  ├── index.jsx          # Main component (required)
  ├── components/        # Additional components (optional)
  └── assets/           # Assets specific to this playground (optional)
```

### 2. Register Your Playground

Open `src/router/playgroundRoutes.js` and:

1. **Import your component** (lazy loading recommended):

```javascript
const MyNewPlayground = lazy(() => import("../playgrounds/my-new-playground/index.jsx"));
```

2. **Add to the playgrounds array**:

```javascript
{
  id: 'my-new-playground',           // Unique identifier
  name: 'My New Playground',         // Display name
  description: 'Description here',   // Brief description
  path: '/my-new-playground',        // URL path
  component: MyNewPlayground,        // Component reference
  category: 'Experiments'            // Category for grouping
}
```

### 3. That's It! 🎉

Your playground will automatically:

- ✅ Appear on the home page
- ✅ Be grouped by category
- ✅ Have its own route
- ✅ Be lazy-loaded for performance
- ✅ Include navigation back to home

## Available Categories

Current categories include:

- `3D` - Three.js and 3D experiences
- `AR` - Augmented reality experiments
- `Shaders` - Shader and visual effects
- `Visualization` - Data visualization and graphics
- `WebGPU` - WebGPU experiments
- `Effects` - Visual effects and animations
- `Experiments` - General experiments

Feel free to create new categories as needed!

## Project Structure

```
src/
├── components/
│   ├── HomePage.jsx      # Main landing page
│   └── Layout.jsx        # Layout wrapper with navigation
├── router/
│   └── playgroundRoutes.js  # Route configuration
├── playgrounds/
│   ├── playground-1/
│   ├── playground-2/
│   └── ...
└── main.jsx             # App entry point with router setup
```

## Features

- **Lazy Loading**: All playgrounds are lazy-loaded for optimal performance
- **Automatic Navigation**: Navigation bar appears automatically on playground pages
- **Category Grouping**: Playgrounds are automatically grouped by category on the home page
- **Responsive Design**: Beautiful, responsive design that works on all devices
- **Quick Access**: Featured playgrounds in the quick access section
- **Statistics**: Automatic counting of playgrounds and categories

## Tips

1. **Keep it Simple**: Each playground should be self-contained in its own folder
2. **Use Descriptive Names**: Choose clear, descriptive names for your playgrounds
3. **Add Good Descriptions**: Write helpful descriptions that explain what the playground does
4. **Choose Appropriate Categories**: Use existing categories when possible, create new ones when needed
5. **Test Your Routes**: Make sure your playground loads correctly at its designated path

## Example Playground Component

```jsx
import React from "react";

const MyNewPlayground = () => {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">My New Playground</h1>
      <p>Your amazing experiment goes here!</p>
    </div>
  );
};

export default MyNewPlayground;
```

Happy experimenting! 🚀
