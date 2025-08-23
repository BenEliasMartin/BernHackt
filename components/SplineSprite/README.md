# SplineSprite Component

A reusable React component for displaying Spline 3D scenes with loading states, error handling, and customizable sizes.

## 🚀 Features

- **Multiple Size Presets**: Predefined sizes (sm, md, lg, xl) for quick use
- **Custom Sizing**: Support for custom width/height dimensions
- **Loading States**: Beautiful loading animations with customizable behavior
- **Error Handling**: Graceful error states with user feedback
- **Event Callbacks**: onLoad and onError handlers for integration
- **Framer Motion**: Smooth animations and transitions
- **TypeScript**: Full type safety and IntelliSense support

## 📦 Installation

The component requires these dependencies:
- `@splinetool/react-spline`
- `framer-motion`
- `react`

## 🎯 Basic Usage

### Simple Implementation
```tsx
import { DefaultSplineSprite } from "@/components/SplineSprite"

function MyComponent() {
  return <DefaultSplineSprite size="lg" />
}
```

### Custom Scene
```tsx
import SplineSprite from "@/components/SplineSprite"

function MyComponent() {
  return (
    <SplineSprite
      sceneUrl="https://your-spline-scene-url.com"
      size="md"
    />
  )
}
```

## ⚙️ Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sceneUrl` | `string` | - | **Required.** URL to the Spline scene |
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "custom"` | `"lg"` | Predefined size preset |
| `customSize` | `{ width: number, height: number }` | - | Custom dimensions when size is "custom" |
| `className` | `string` | `""` | Additional CSS classes |
| `onLoad` | `() => void` | - | Callback when scene loads successfully |
| `onError` | `(error: Error) => void` | - | Callback when scene fails to load |
| `showLoadingState` | `boolean` | `true` | Whether to show loading state |
| `loadingAnimation` | `boolean` | `true` | Whether to animate loading state |

## 📏 Size Presets

| Size | Dimensions | Use Case |
|------|------------|----------|
| `sm` | 96×96px | Small icons, thumbnails |
| `md` | 144×144px | Medium displays, cards |
| `lg` | 192×192px | **Default** - Standard size |
| `xl` | 240×240px | Large displays, hero sections |
| `custom` | Variable | Custom dimensions with `customSize` prop |

## 🎨 Examples

### Different Sizes
```tsx
<div className="flex gap-4">
  <DefaultSplineSprite size="sm" />
  <DefaultSplineSprite size="md" />
  <DefaultSplineSprite size="lg" />
  <DefaultSplineSprite size="xl" />
</div>
```

### Custom Dimensions
```tsx
<SplineSprite
  sceneUrl="https://your-scene.com"
  size="custom"
  customSize={{ width: 300, height: 200 }}
/>
```

### With Event Handlers
```tsx
<SplineSprite
  sceneUrl="https://your-scene.com"
  size="lg"
  onLoad={() => {
    console.log('Scene loaded successfully!')
    // Update UI state, show content, etc.
  }}
  onError={(error) => {
    console.error('Failed to load scene:', error)
    // Show fallback content, retry logic, etc.
  }}
/>
```

### Custom Loading Behavior
```tsx
<SplineSprite
  sceneUrl="https://your-scene.com"
  size="md"
  showLoadingState={true}
  loadingAnimation={false} // Static loading state
/>
```

### Styling
```tsx
<SplineSprite
  sceneUrl="https://your-scene.com"
  size="lg"
  className="rounded-full shadow-2xl"
/>
```

## 🔧 Advanced Usage

### Conditional Rendering
```tsx
function ConditionalSpline({ show, sceneUrl }) {
  if (!show) return null
  
  return (
    <SplineSprite
      sceneUrl={sceneUrl}
      size="lg"
      onLoad={() => setSceneReady(true)}
    />
  )
}
```

### Dynamic Sizing
```tsx
function ResponsiveSpline() {
  const [size, setSize] = useState('lg')
  
  useEffect(() => {
    const handleResize = () => {
      setSize(window.innerWidth < 768 ? 'md' : 'lg')
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return <DefaultSplineSprite size={size} />
}
```

### Error Boundaries
```tsx
function SplineWithFallback({ sceneUrl, fallback }) {
  const [hasError, setHasError] = useState(false)
  
  if (hasError) {
    return fallback
  }
  
  return (
    <SplineSprite
      sceneUrl={sceneUrl}
      size="lg"
      onError={() => setHasError(true)}
    />
  )
}
```

## 🎭 Animation Details

The component uses Framer Motion for smooth animations:

- **Initial State**: Scaled down (0.8), rotated (-180°), and transparent
- **Loading State**: Scales to 0.9 with loading animation
- **Loaded State**: Scales to 1.0 with spring animation
- **Error State**: Fades in with scale animation

### Customizing Animations
```tsx
// Override default animations with CSS
<SplineSprite
  sceneUrl="https://your-scene.com"
  size="lg"
  className="animate-bounce" // Add custom animations
/>
```

## 🚨 Error Handling

The component automatically handles common error scenarios:

1. **Network Errors**: Failed scene loading
2. **Invalid URLs**: Malformed scene URLs
3. **Spline API Errors**: Service unavailable
4. **Browser Compatibility**: Unsupported features

### Error State UI
- Red border and background
- Error icon with exclamation mark
- "Failed to load" message
- Maintains component dimensions

## 🔍 Debugging

### Console Logging
```tsx
<SplineSprite
  sceneUrl="https://your-scene.com"
  size="lg"
  onLoad={() => console.log('✅ Scene loaded')}
  onError={(error) => console.error('❌ Scene error:', error)}
/>
```

### Common Issues
- **Scene not loading**: Check URL validity and network
- **Loading stuck**: Verify Spline service status
- **Size issues**: Ensure customSize is provided when size="custom"
- **Animation glitches**: Check Framer Motion version compatibility

## 📱 Responsive Design

The component is designed to work across all screen sizes:

- **Mobile**: Use `sm` or `md` sizes
- **Tablet**: Use `md` or `lg` sizes  
- **Desktop**: Use `lg` or `xl` sizes
- **Custom**: Use `custom` with responsive dimensions

## 🎨 Customization

### CSS Variables
```css
/* Override default colors */
.spline-sprite {
  --loading-bg: linear-gradient(to bottom right, #f1f5f9, #e2e8f0);
  --error-bg: #fef2f2;
  --error-border: #fecaca;
}
```

### Theme Integration
```tsx
<SplineSprite
  sceneUrl="https://your-scene.com"
  size="lg"
  className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}
/>
```

## 🔗 Related Components

- **DefaultSplineSprite**: Pre-configured with default scene URL
- **SplineSprite**: Base component for custom scenes
- **Demo Page**: `/spline-demo` for testing and examples

## 📚 Resources

- [Spline Documentation](https://docs.spline.design/)
- [Framer Motion Guide](https://www.framer.com/motion/)
- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

To improve the component:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This component is part of the BernHackt project and follows the same licensing terms.

