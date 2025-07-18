# Angular 3D Model Viewer

A complete real-time 3D model viewer web application built with Angular 20 and Three.js, featuring advanced lighting, camera controls, and annotation systems.

## Features

### 🎯 Model Upload & Display
- **Format Support**: Upload and display OBJ and FBX 3D model files
- **Full Mesh Support**: Complete material and texture support
- **Optimized Rendering**: Smooth performance with automatic model centering
- **File Validation**: Automatic file type validation and error handling

### 📷 Advanced Camera Controls
- **Orbit Mode** (Default): Mouse-controlled rotation, panning, and zooming
- **First Person Mode**: Walk-through experience with WASD movement
- **Seamless Switching**: Easy toggle between camera modes
- **Pointer Lock**: Immersive first-person controls with mouse look

### 📝 Interactive Annotations
- **3D Placement**: Click anywhere in the scene to place annotations
- **Editable Content**: Add titles and descriptions to annotations
- **World Anchored**: Annotations stay fixed to 3D world coordinates
- **Show/Hide Toggle**: Control annotation visibility
- **Drag & Reposition**: Move annotations after placement

### 🌅 Time-Based Lighting System
- **24-Hour Cycle**: Dynamic lighting that changes with time of day
- **Realistic Sun**: Sun position and color changes based on time
- **Dynamic Ambient**: Ambient light adjusts for day/night cycles
- **Smooth Transitions**: Gradual lighting changes as time progresses

### 🌍 HDRI Environment
- **Realistic Lighting**: HDR environment maps for accurate lighting
- **360° Backgrounds**: Immersive skybox environments
- **PBR Materials**: Physically-based rendering support
- **Venice Sunset**: Included high-quality HDRI environment

### 🌙 Night Mode Features
- **Automatic Detection**: Night mode activates from 20:00 to 06:00
- **Artificial Lighting**: Point lights automatically activate at night
- **User Control**: Toggle night lights on/off
- **Atmospheric Effects**: Adjusted ambient lighting for night scenes

### 🎨 Modern UI Design
- **Tailwind CSS**: Beautiful, responsive design
- **Dark Theme**: Professional dark color scheme
- **Intuitive Controls**: Easy-to-use sidebar with all features
- **Real-time Feedback**: Visual indicators for current settings

## Technology Stack

- **Angular 20**: Modern web framework with signals and standalone components
- **Three.js**: 3D graphics library for WebGL rendering
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **UUID**: Unique identifier generation

## Dependencies

```json
{
  "three": "^0.178.0",
  "uuid": "^11.1.0",
  "tailwindcss": "^4.1.11",
  "@types/three": "^0.178.0",
  "@types/uuid": "^10.0.0"
}
```

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd angular-3d-model-viewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:4200
   ```

## Usage Guide

### 🚀 Getting Started

1. **Launch the application** - The viewer loads with a default scene
2. **Upload a model** - Use the file input in the sidebar to load OBJ or FBX files
3. **Choose camera mode** - Select between Orbit and First Person modes
4. **Adjust lighting** - Use the time slider to change lighting conditions

### 📷 Camera Controls

**Orbit Mode** (Default):
- **Rotate**: Left click + drag
- **Pan**: Right click + drag
- **Zoom**: Mouse wheel scroll

**First Person Mode**:
- **Click** to lock pointer
- **WASD** or arrow keys to move
- **Mouse** to look around
- **ESC** to unlock pointer

### 📝 Adding Annotations

1. Click "Place Annotation" button
2. Click anywhere in the 3D scene
3. Edit the annotation in the sidebar
4. Add title and description
5. Save or delete as needed

### 🌅 Lighting Controls

- **Time Slider**: Adjust from 00:00 to 23:00
- **Real-time Updates**: Lighting changes instantly
- **Night Lights**: Automatically enabled at night
- **Manual Override**: Toggle night lights on/off

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── model-viewer/          # Main 3D viewer component
│   │   │   ├── model-viewer.component.ts
│   │   │   ├── model-viewer.component.html
│   │   │   └── model-viewer.component.css
│   │   └── sidebar/               # Control panel component
│   │       ├── sidebar.component.ts
│   │       ├── sidebar.component.html
│   │       └── sidebar.component.css
│   ├── app.ts                     # Main app component
│   ├── app.html                   # App template
│   └── app.css                    # App styles
├── styles.css                     # Global styles
└── index.html                     # HTML entry point
```

## Key Features Implementation

### 🔧 Three.js Integration
- **Scene Management**: Proper scene, camera, and renderer setup
- **WebGL Optimization**: Efficient rendering with proper disposal
- **Responsive Design**: Automatic resize handling
- **Error Handling**: WebGL context loss recovery

### 🎮 Controls Implementation
- **OrbitControls**: Smooth camera manipulation
- **PointerLockControls**: Immersive first-person experience
- **Keyboard Input**: WASD movement with proper event handling
- **Mobile Support**: Touch-friendly controls

### 💡 Lighting System
- **Dynamic Sun**: Calculated sun position based on time
- **Color Temperature**: Realistic color changes throughout day
- **Shadow Mapping**: Soft shadows for realistic lighting
- **Multiple Light Sources**: Combination of ambient, directional, and point lights

### 🏷️ Annotation System
- **3D Positioning**: World-space coordinate anchoring
- **Raycasting**: Precise 3D point selection
- **UI Integration**: Seamless Angular component integration
- **State Management**: Reactive state using Angular signals

## Development Notes

### 🏗️ Architecture
- **Standalone Components**: Modern Angular architecture
- **Signal-based State**: Reactive state management
- **Type Safety**: Full TypeScript integration
- **Modular Design**: Separable, reusable components

### 🎨 Styling
- **Tailwind CSS**: Utility-first approach
- **Custom CSS**: Component-specific styling
- **Responsive Design**: Mobile-first approach
- **Dark Theme**: Professional appearance

### 🔍 Performance
- **Efficient Rendering**: Optimized Three.js setup
- **Memory Management**: Proper resource disposal
- **Async Loading**: Non-blocking model loading
- **Resize Optimization**: Efficient viewport handling

## Browser Support

- **Chrome**: 90+ ✅
- **Firefox**: 88+ ✅
- **Safari**: 14+ ✅
- **Edge**: 90+ ✅

**Requirements**:
- WebGL 2.0 support
- ES2020 support
- Modern browser features
- 

## Prompt To Cursor
Build a complete real-time 3D model viewer web app using Angular and Threejs with the following features

MODEL UPLOAD

1. Allow users to upload 3D model files in OBJ and FBX formats.

2. Display the uploaded models in the scene using Threejs with full mesh/material support.

3. Optimize model size and rendering for smooth performance.

CAMERA & USER CONTROLS

4. Add two camera modes

a) Orbit mode default, with OrbitControls (rotate, pan, zoom).

b) First-person mode simulate walking through the model like a person inside a building or space

5. In first-person mode

Use PointerLockControls or First PersonControls from Three.js

Movement: WASD or arrow keys.

Mouse look around (360°).

Limit vertical look to avoid unnatural head flips.

Add option in the Ul to toggle between "Orbit" and "First Person"

ANNOTATIONS:

6. Let users click inside the 3D scene to place floating annotations (text boxes).

-Editable title description.

- Anchor them to 3D world coordinates

Show/hide annotations in UI.

Support drag or repositioning.

TIME-BASED LIGHTING:

7. Add a "Time of Day" system:

Slider or clock picker (0-24 hours).

Change sun direction and color based on time.

Adjust ambient light and skybox colors to match.

HDRI & ENVIRONMENT:

8. Use an HDRI environment for realistic ambient light and sky:

- Load a free HDRI (like 'venice_sunset_1k.hdr" from Polyhaven).

Apply HDRI as both scene lighting and background.

NIGHT MODE:

9 if selected time is night (eg. 20:00-06:00)

Reduce sunlight to 0.

Automatically activate artificial point lights or spotlights in the scene.
Allow user to toggle night lights on/off.

UI DESIGN

10. Use Tailwind CSS for layout and design.

Sidebar or control panel with

Upload model

-Time of day slider

Toggle Orbit/First-person view

Toggle night lighting

List and edit annotations

Reset camera

CODE & DEV:

11. Use Angular v20 (or Next.js if preferred).

12. Include code comments to explain all logic.

13. Project should run locally via 'npm install' and 'npm run dev.

DEPENDENCIES TO USE:

ANGULAR

- Three.js

- Tailwind CSS

OBJLoader, FBXLoader

- RGBELoader (for HDRI)

- PointerLockControls or First PersonControls

- Sky shader or Sky class for dynamic sky

## Troubleshooting

### Common Issues

1. **WebGL not supported**
   - Check browser compatibility
   - Update graphics drivers
   - Try different browser

2. **Model not loading**
   - Verify file format (OBJ/FBX only)
   - Check file size limitations
   - Ensure proper file structure

3. **Performance issues**
   - Reduce model complexity
   - Disable HDRI if needed
   - Close other applications

### Development Issues

1. **TypeScript errors**
   - Run `npm install` to ensure all dependencies
   - Check Angular version compatibility

2. **Build errors**
   - Clear node_modules and reinstall
   - Check Tailwind CSS configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Credits

- **Three.js**: 3D graphics library
- **Angular**: Web framework
- **Tailwind CSS**: Styling framework
- **HDRI Haven**: Environment maps
- **Poly Haven**: 3D assets

---

**Built with ❤️ using Angular 20 and Three.js**

For support or questions, please open an issue in the repository. 
