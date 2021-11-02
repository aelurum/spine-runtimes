# 3.5-mod

## Typescript/Javascript
* **Breaking changes**
* The completion event will fire for looped 0 duration animations every frame.

* **Additions**
* `AnimationState#apply` returns boolean indicating if any timeline was applied or not.
* Added `AssetManager.loadTextureAtlas`. Instead of loading the `.atlas` and corresponding image files manually, you can simply specify the location of the `.atlas` file and AssetManager will load the atlas and all its images automatically. `AssetManager.get("atlasname.atlas")` will then return an instance of `spine.TextureAtlas`.
* Added support for binary skeleton files. To see how to load and use binary skeleton file, see the examples in the folders of the backend you need.


### WebGL backend
* Fixed WebGL context loss
  * Added `Restorable` interface, implemented by any WebGL resource that needs restoration after a context loss. All WebGL resource classes (`Shader`, `Mesh`, `GLTexture`) implement this interface.
  * Added `ManagedWebGLRenderingContext`. Handles setup of a `WebGLRenderingContext` given a canvas element and restoration of WebGL resources (`Shader`, `Mesh`, `GLTexture`) on WebGL context loss. WebGL resources register themselves with the `ManagedWebGLRenderingContext`. If the context is informed of a context loss and restoration, the registered WebGL resources' `restore()` method is called. The `restore()` method implementation on each resource type will recreate the GPU side objects.
  * All classes that previously took a `WebGLRenderingContext` in the constructor now also allow a `ManagedWebGLRenderingContext`. This ensures existing applications do not break.
  * To use automatic context restoration:
    1. Create or fetch a canvas element from the DOM
    2. Instantiate a `ManagedWebGLRenderingContext`, passing the canvas to the constructor. This will set up a `WebGLRenderingContext` internally and manage context loss/restoration.
    3. Pass the `ManagedWebGLRenderingContext` to the constructors of classes that you previously passed a `WebGLRenderingContext` to (`AssetManager`, `GLTexture`, `Mesh`, `Shader`, `PolygonBatcher`, `SceneRenderer`, `ShapeRenderer`, `SkeletonRenderer`, `SkeletonDebugRenderer`).
* Improved performance by using `DYNAMIC_DRAW` for vertex buffer objects.

### Three.js backend
* Added support for multi-page atlases.

### Widget backend
* Fixed WebGL context loss (see WebGL backend changes). Enabled automatically.
* Binary skeleton files support:
  * Added `skel` field to `WidgetConfiguration`. You can specify location of the `.skel` file there.
  * Added `data-skel` attribute, if you want to specify binary skeleton location via HTML. See `README.md` for details.
* Added `atlasContent`, `atlasPagesContent`, `jsonContent` and `skelContent` fields to `WidgetConfiguration` allowing you to directly pass the contents of the `.atlas`, atlas page `.png` files, `.json` and the `.skel` file without having to do a request. See `README.md` and the example for details.
* The `animation` field in `WidgetConfiguration` has been made optional. First animation found in the skeleton will be used by default. See `README.md` for details.
* Added `preserveDrawingBuffer` and `antialias` fields to `WidgetConfiguration`, as well as `data-preserve-drawing-buffer` and `data-antialias` attributes, for customizing webgl configuration. See `README.md` for details.
