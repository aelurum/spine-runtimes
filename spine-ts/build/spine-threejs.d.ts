declare module spine {
	class Animation {
		name: string;
		timelines: Array<Timeline>;
		duration: number;
		constructor(name: string, timelines: Array<Timeline>, duration: number);
		apply(skeleton: Skeleton, lastTime: number, time: number, loop: boolean, events: Array<Event>, alpha: number, setupPose: boolean, mixingOut: boolean): void;
		static binarySearch(values: ArrayLike<number>, target: number, step?: number): number;
		static linearSearch(values: ArrayLike<number>, target: number, step: number): number;
	}
	interface Timeline {
		apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, setupPose: boolean, mixingOut: boolean): void;
		getPropertyId(): number;
	}
	enum TimelineType {
		rotate = 0,
		translate = 1,
		scale = 2,
		shear = 3,
		attachment = 4,
		color = 5,
		deform = 6,
		event = 7,
		drawOrder = 8,
		ikConstraint = 9,
		transformConstraint = 10,
		pathConstraintPosition = 11,
		pathConstraintSpacing = 12,
		pathConstraintMix = 13
	}
	enum SlotTimelineType {
		attachment = 0,
		color = 1
	}
	enum BoneTimelineType {
		rotate = 0,
		translate = 1,
		scale = 2,
		shear = 3
	}
	enum PathConstraintTimelineType {
		pathConstraintPosition = 0,
		pathConstraintSpacing = 1,
		pathConstraintMix = 2
	}
	abstract class CurveTimeline implements Timeline {
		static LINEAR: number;
		static STEPPED: number;
		static BEZIER: number;
		static BEZIER_SIZE: number;
		private curves;
		abstract getPropertyId(): number;
		constructor(frameCount: number);
		getFrameCount(): number;
		setLinear(frameIndex: number): void;
		setStepped(frameIndex: number): void;
		getCurveType(frameIndex: number): number;
		setCurve(frameIndex: number, cx1: number, cy1: number, cx2: number, cy2: number): void;
		getCurvePercent(frameIndex: number, percent: number): number;
		abstract apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, setupPose: boolean, mixingOut: boolean): void;
	}
	class RotateTimeline extends CurveTimeline {
		static ENTRIES: number;
		static PREV_TIME: number;
		static PREV_ROTATION: number;
		static ROTATION: number;
		boneIndex: number;
		frames: ArrayLike<number>;
		constructor(frameCount: number);
		getPropertyId(): number;
		setFrame(frameIndex: number, time: number, degrees: number): void;
		apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, setupPose: boolean, mixingOut: boolean): void;
	}
	class TranslateTimeline extends CurveTimeline {
		static ENTRIES: number;
		static PREV_TIME: number;
		static PREV_X: number;
		static PREV_Y: number;
		static X: number;
		static Y: number;
		boneIndex: number;
		frames: ArrayLike<number>;
		constructor(frameCount: number);
		getPropertyId(): number;
		setFrame(frameIndex: number, time: number, x: number, y: number): void;
		apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, setupPose: boolean, mixingOut: boolean): void;
	}
	class ScaleTimeline extends TranslateTimeline {
		constructor(frameCount: number);
		getPropertyId(): number;
		apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, setupPose: boolean, mixingOut: boolean): void;
	}
	class ShearTimeline extends TranslateTimeline {
		constructor(frameCount: number);
		getPropertyId(): number;
		apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, setupPose: boolean, mixingOut: boolean): void;
	}
	class ColorTimeline extends CurveTimeline {
		static ENTRIES: number;
		static PREV_TIME: number;
		static PREV_R: number;
		static PREV_G: number;
		static PREV_B: number;
		static PREV_A: number;
		static R: number;
		static G: number;
		static B: number;
		static A: number;
		slotIndex: number;
		frames: ArrayLike<number>;
		constructor(frameCount: number);
		getPropertyId(): number;
		setFrame(frameIndex: number, time: number, r: number, g: number, b: number, a: number): void;
		apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, setupPose: boolean, mixingOut: boolean): void;
	}
	class AttachmentTimeline implements Timeline {
		slotIndex: number;
		frames: ArrayLike<number>;
		attachmentNames: Array<string>;
		constructor(frameCount: number);
		getPropertyId(): number;
		getFrameCount(): number;
		setFrame(frameIndex: number, time: number, attachmentName: string): void;
		apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, setupPose: boolean, mixingOut: boolean): void;
	}
	class DeformTimeline extends CurveTimeline {
		slotIndex: number;
		attachment: VertexAttachment;
		frames: ArrayLike<number>;
		frameVertices: Array<ArrayLike<number>>;
		constructor(frameCount: number);
		getPropertyId(): number;
		setFrame(frameIndex: number, time: number, vertices: ArrayLike<number>): void;
		apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, setupPose: boolean, mixingOut: boolean): void;
	}
	class EventTimeline implements Timeline {
		frames: ArrayLike<number>;
		events: Array<Event>;
		constructor(frameCount: number);
		getPropertyId(): number;
		getFrameCount(): number;
		setFrame(frameIndex: number, event: Event): void;
		apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, setupPose: boolean, mixingOut: boolean): void;
	}
	class DrawOrderTimeline implements Timeline {
		frames: ArrayLike<number>;
		drawOrders: Array<Array<number>>;
		constructor(frameCount: number);
		getPropertyId(): number;
		getFrameCount(): number;
		setFrame(frameIndex: number, time: number, drawOrder: Array<number>): void;
		apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, setupPose: boolean, mixingOut: boolean): void;
	}
	class IkConstraintTimeline extends CurveTimeline {
		static ENTRIES: number;
		static PREV_TIME: number;
		static PREV_MIX: number;
		static PREV_BEND_DIRECTION: number;
		static MIX: number;
		static BEND_DIRECTION: number;
		ikConstraintIndex: number;
		frames: ArrayLike<number>;
		constructor(frameCount: number);
		getPropertyId(): number;
		setFrame(frameIndex: number, time: number, mix: number, bendDirection: number): void;
		apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, setupPose: boolean, mixingOut: boolean): void;
	}
	class TransformConstraintTimeline extends CurveTimeline {
		static ENTRIES: number;
		static PREV_TIME: number;
		static PREV_ROTATE: number;
		static PREV_TRANSLATE: number;
		static PREV_SCALE: number;
		static PREV_SHEAR: number;
		static ROTATE: number;
		static TRANSLATE: number;
		static SCALE: number;
		static SHEAR: number;
		transformConstraintIndex: number;
		frames: ArrayLike<number>;
		constructor(frameCount: number);
		getPropertyId(): number;
		setFrame(frameIndex: number, time: number, rotateMix: number, translateMix: number, scaleMix: number, shearMix: number): void;
		apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, setupPose: boolean, mixingOut: boolean): void;
	}
	class PathConstraintPositionTimeline extends CurveTimeline {
		static ENTRIES: number;
		static PREV_TIME: number;
		static PREV_VALUE: number;
		static VALUE: number;
		pathConstraintIndex: number;
		frames: ArrayLike<number>;
		constructor(frameCount: number);
		getPropertyId(): number;
		setFrame(frameIndex: number, time: number, value: number): void;
		apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, setupPose: boolean, mixingOut: boolean): void;
	}
	class PathConstraintSpacingTimeline extends PathConstraintPositionTimeline {
		constructor(frameCount: number);
		getPropertyId(): number;
		apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, setupPose: boolean, mixingOut: boolean): void;
	}
	class PathConstraintMixTimeline extends CurveTimeline {
		static ENTRIES: number;
		static PREV_TIME: number;
		static PREV_ROTATE: number;
		static PREV_TRANSLATE: number;
		static ROTATE: number;
		static TRANSLATE: number;
		pathConstraintIndex: number;
		frames: ArrayLike<number>;
		constructor(frameCount: number);
		getPropertyId(): number;
		setFrame(frameIndex: number, time: number, rotateMix: number, translateMix: number): void;
		apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, setupPose: boolean, mixingOut: boolean): void;
	}
}
declare module spine {
	class AnimationState {
		static emptyAnimation: Animation;
		data: AnimationStateData;
		tracks: TrackEntry[];
		events: Event[];
		listeners: AnimationStateListener2[];
		queue: EventQueue;
		propertyIDs: IntSet;
		animationsChanged: boolean;
		timeScale: number;
		trackEntryPool: Pool<TrackEntry>;
		constructor(data: AnimationStateData);
		update(delta: number): void;
		updateMixingFrom(entry: TrackEntry, delta: number): void;
		apply(skeleton: Skeleton): boolean;
		applyMixingFrom(entry: TrackEntry, skeleton: Skeleton): number;
		applyRotateTimeline(timeline: Timeline, skeleton: Skeleton, time: number, alpha: number, setupPose: boolean, timelinesRotation: Array<number>, i: number, firstFrame: boolean): void;
		queueEvents(entry: TrackEntry, animationTime: number): void;
		clearTracks(): void;
		clearTrack(trackIndex: number): void;
		setCurrent(index: number, current: TrackEntry, interrupt: boolean): void;
		setAnimation(trackIndex: number, animationName: string, loop: boolean): TrackEntry;
		setAnimationWith(trackIndex: number, animation: Animation, loop: boolean): TrackEntry;
		addAnimation(trackIndex: number, animationName: string, loop: boolean, delay: number): TrackEntry;
		addAnimationWith(trackIndex: number, animation: Animation, loop: boolean, delay: number): TrackEntry;
		setEmptyAnimation(trackIndex: number, mixDuration: number): TrackEntry;
		addEmptyAnimation(trackIndex: number, mixDuration: number, delay: number): TrackEntry;
		setEmptyAnimations(mixDuration: number): void;
		expandToIndex(index: number): TrackEntry;
		trackEntry(trackIndex: number, animation: Animation, loop: boolean, last: TrackEntry): TrackEntry;
		disposeNext(entry: TrackEntry): void;
		_animationsChanged(): void;
		setTimelinesFirst(entry: TrackEntry): void;
		checkTimelinesFirst(entry: TrackEntry): void;
		checkTimelinesUsage(entry: TrackEntry, usageArray: Array<boolean>): void;
		getCurrent(trackIndex: number): TrackEntry;
		addListener(listener: AnimationStateListener2): void;
		removeListener(listener: AnimationStateListener2): void;
		clearListeners(): void;
		clearListenerNotifications(): void;
	}
	class TrackEntry {
		animation: Animation;
		next: TrackEntry;
		mixingFrom: TrackEntry;
		listener: AnimationStateListener2;
		trackIndex: number;
		loop: boolean;
		eventThreshold: number;
		attachmentThreshold: number;
		drawOrderThreshold: number;
		animationStart: number;
		animationEnd: number;
		animationLast: number;
		nextAnimationLast: number;
		delay: number;
		trackTime: number;
		trackLast: number;
		nextTrackLast: number;
		trackEnd: number;
		timeScale: number;
		alpha: number;
		mixTime: number;
		mixDuration: number;
		mixAlpha: number;
		timelinesFirst: boolean[];
		timelinesRotation: number[];
		reset(): void;
		getAnimationTime(): number;
		setAnimationLast(animationLast: number): void;
		isComplete(): boolean;
		resetRotationDirections(): void;
	}
	class EventQueue {
		objects: Array<any>;
		drainDisabled: boolean;
		animState: AnimationState;
		constructor(animState: AnimationState);
		start(entry: TrackEntry): void;
		interrupt(entry: TrackEntry): void;
		end(entry: TrackEntry): void;
		dispose(entry: TrackEntry): void;
		complete(entry: TrackEntry): void;
		event(entry: TrackEntry, event: Event): void;
		drain(): void;
		clear(): void;
	}
	enum EventType {
		start = 0,
		interrupt = 1,
		end = 2,
		dispose = 3,
		complete = 4,
		event = 5
	}
	interface AnimationStateListener2 {
		start(entry: TrackEntry): void;
		interrupt(entry: TrackEntry): void;
		end(entry: TrackEntry): void;
		dispose(entry: TrackEntry): void;
		complete(entry: TrackEntry): void;
		event(entry: TrackEntry, event: Event): void;
	}
	abstract class AnimationStateAdapter2 implements AnimationStateListener2 {
		start(entry: TrackEntry): void;
		interrupt(entry: TrackEntry): void;
		end(entry: TrackEntry): void;
		dispose(entry: TrackEntry): void;
		complete(entry: TrackEntry): void;
		event(entry: TrackEntry, event: Event): void;
	}
}
declare module spine {
	class AnimationStateData {
		skeletonData: SkeletonData;
		animationToMixTime: Map<number>;
		defaultMix: number;
		constructor(skeletonData: SkeletonData);
		setMix(fromName: string, toName: string, duration: number): void;
		setMixWith(from: Animation, to: Animation, duration: number): void;
		getMix(from: Animation, to: Animation): number;
	}
}
declare module spine {
	class AssetManager implements Disposable {
		private pathPrefix;
		private textureLoader;
		private assets;
		private errors;
		private toLoad;
		private loaded;
		constructor(textureLoader: (image: HTMLImageElement) => any, pathPrefix?: string);
		private static downloadText;
		private static downloadBinary;
		loadText(path: string, success?: (path: string, text: string) => void, error?: (path: string, error: string) => void): void;
		loadData(path: string, success?: (path: string, respData: Uint8Array) => void, error?: (path: string, error: string) => void): void;
		loadTexture(path: string, success?: (path: string, image: HTMLImageElement) => void, error?: (path: string, error: string) => void): void;
		loadTextureData(path: string, data: string, success?: (path: string, image: HTMLImageElement) => void, error?: (path: string, error: string) => void): void;
		loadTextureAtlas(path: string, success?: (path: string, atlas: TextureAtlas) => void, error?: (path: string, error: string) => void): void;
		get(path: string): any;
		remove(path: string): void;
		removeAll(): void;
		isLoadingComplete(): boolean;
		getToLoad(): number;
		getLoaded(): number;
		dispose(): void;
		hasErrors(): boolean;
		getErrors(): Map<string>;
	}
}
declare module spine {
	class AtlasAttachmentLoader implements AttachmentLoader {
		atlas: TextureAtlas;
		constructor(atlas: TextureAtlas);
		newRegionAttachment(skin: Skin, name: string, path: string): RegionAttachment;
		newMeshAttachment(skin: Skin, name: string, path: string): MeshAttachment;
		newBoundingBoxAttachment(skin: Skin, name: string): BoundingBoxAttachment;
		newPathAttachment(skin: Skin, name: string): PathAttachment;
	}
}
declare module spine {
	enum BlendMode {
		Normal = 0,
		Additive = 1,
		Multiply = 2,
		Screen = 3
	}
}
declare module spine {
	class Bone implements Updatable {
		data: BoneData;
		skeleton: Skeleton;
		parent: Bone;
		children: Bone[];
		x: number;
		y: number;
		rotation: number;
		scaleX: number;
		scaleY: number;
		shearX: number;
		shearY: number;
		ax: number;
		ay: number;
		arotation: number;
		ascaleX: number;
		ascaleY: number;
		ashearX: number;
		ashearY: number;
		appliedValid: boolean;
		a: number;
		b: number;
		worldX: number;
		c: number;
		d: number;
		worldY: number;
		sorted: boolean;
		constructor(data: BoneData, skeleton: Skeleton, parent: Bone);
		update(): void;
		updateWorldTransform(): void;
		updateWorldTransformWith(x: number, y: number, rotation: number, scaleX: number, scaleY: number, shearX: number, shearY: number): void;
		setToSetupPose(): void;
		getWorldRotationX(): number;
		getWorldRotationY(): number;
		getWorldScaleX(): number;
		getWorldScaleY(): number;
		worldToLocalRotationX(): number;
		worldToLocalRotationY(): number;
		rotateWorld(degrees: number): void;
		updateAppliedTransform(): void;
		worldToLocal(world: Vector2): Vector2;
		localToWorld(local: Vector2): Vector2;
	}
}
declare module spine {
	class BoneData {
		index: number;
		name: string;
		parent: BoneData;
		length: number;
		x: number;
		y: number;
		rotation: number;
		scaleX: number;
		scaleY: number;
		shearX: number;
		shearY: number;
		transformMode: TransformMode;
		constructor(index: number, name: string, parent: BoneData);
	}
	enum TransformMode {
		Normal = 0,
		OnlyTranslation = 1,
		NoRotationOrReflection = 2,
		NoScale = 3,
		NoScaleOrReflection = 4
	}
}
declare module spine {
	interface Constraint extends Updatable {
		getOrder(): number;
	}
}
declare module spine {
	class Event {
		data: EventData;
		intValue: number;
		floatValue: number;
		stringValue: string;
		time: number;
		constructor(time: number, data: EventData);
	}
}
declare module spine {
	class EventData {
		name: string;
		intValue: number;
		floatValue: number;
		stringValue: string;
		constructor(name: string);
	}
}
declare module spine {
	class IkConstraint implements Constraint {
		data: IkConstraintData;
		bones: Array<Bone>;
		target: Bone;
		mix: number;
		bendDirection: number;
		constructor(data: IkConstraintData, skeleton: Skeleton);
		getOrder(): number;
		apply(): void;
		update(): void;
		apply1(bone: Bone, targetX: number, targetY: number, alpha: number): void;
		apply2(parent: Bone, child: Bone, targetX: number, targetY: number, bendDir: number, alpha: number): void;
	}
}
declare module spine {
	class IkConstraintData {
		name: string;
		order: number;
		bones: BoneData[];
		target: BoneData;
		bendDirection: number;
		mix: number;
		constructor(name: string);
	}
}
declare module spine {
	class PathConstraint implements Constraint {
		static NONE: number;
		static BEFORE: number;
		static AFTER: number;
		data: PathConstraintData;
		bones: Array<Bone>;
		target: Slot;
		position: number;
		spacing: number;
		rotateMix: number;
		translateMix: number;
		spaces: number[];
		positions: number[];
		world: number[];
		curves: number[];
		lengths: number[];
		segments: number[];
		constructor(data: PathConstraintData, skeleton: Skeleton);
		apply(): void;
		update(): void;
		computeWorldPositions(path: PathAttachment, spacesCount: number, tangents: boolean, percentPosition: boolean, percentSpacing: boolean): number[];
		addBeforePosition(p: number, temp: Array<number>, i: number, out: Array<number>, o: number): void;
		addAfterPosition(p: number, temp: Array<number>, i: number, out: Array<number>, o: number): void;
		addCurvePosition(p: number, x1: number, y1: number, cx1: number, cy1: number, cx2: number, cy2: number, x2: number, y2: number, out: Array<number>, o: number, tangents: boolean): void;
		getOrder(): number;
	}
}
declare module spine {
	class PathConstraintData {
		name: string;
		order: number;
		bones: BoneData[];
		target: SlotData;
		positionMode: PositionMode;
		spacingMode: SpacingMode;
		rotateMode: RotateMode;
		offsetRotation: number;
		position: number;
		spacing: number;
		rotateMix: number;
		translateMix: number;
		constructor(name: string);
	}
	enum PositionMode {
		Fixed = 0,
		Percent = 1
	}
	enum SpacingMode {
		Length = 0,
		Fixed = 1,
		Percent = 2
	}
	enum RotateMode {
		Tangent = 0,
		Chain = 1,
		ChainScale = 2
	}
}
declare module spine {
	class SharedAssetManager implements Disposable {
		private pathPrefix;
		private clientAssets;
		private queuedAssets;
		private rawAssets;
		private errors;
		constructor(pathPrefix?: string);
		private queueAsset;
		loadText(clientId: string, path: string): void;
		loadJson(clientId: string, path: string): void;
		loadTexture(clientId: string, textureLoader: (image: HTMLImageElement) => any, path: string): void;
		get(clientId: string, path: string): any;
		private updateClientAssets;
		isLoadingComplete(clientId: string): boolean;
		dispose(): void;
		hasErrors(): boolean;
		getErrors(): Map<string>;
	}
}
declare module spine {
	class Skeleton {
		data: SkeletonData;
		bones: Array<Bone>;
		slots: Array<Slot>;
		drawOrder: Array<Slot>;
		ikConstraints: Array<IkConstraint>;
		transformConstraints: Array<TransformConstraint>;
		pathConstraints: Array<PathConstraint>;
		_updateCache: Updatable[];
		updateCacheReset: Updatable[];
		skin: Skin;
		color: Color;
		time: number;
		flipX: boolean;
		flipY: boolean;
		x: number;
		y: number;
		constructor(data: SkeletonData);
		updateCache(): void;
		sortIkConstraint(constraint: IkConstraint): void;
		sortPathConstraint(constraint: PathConstraint): void;
		sortTransformConstraint(constraint: TransformConstraint): void;
		sortPathConstraintAttachment(skin: Skin, slotIndex: number, slotBone: Bone): void;
		sortPathConstraintAttachmentWith(attachment: Attachment, slotBone: Bone): void;
		sortBone(bone: Bone): void;
		sortReset(bones: Array<Bone>): void;
		updateWorldTransform(): void;
		setToSetupPose(): void;
		setBonesToSetupPose(): void;
		setSlotsToSetupPose(): void;
		getRootBone(): Bone;
		findBone(boneName: string): Bone;
		findBoneIndex(boneName: string): number;
		findSlot(slotName: string): Slot;
		findSlotIndex(slotName: string): number;
		setSkinByName(skinName: string): void;
		setSkin(newSkin: Skin): void;
		getAttachmentByName(slotName: string, attachmentName: string): Attachment;
		getAttachment(slotIndex: number, attachmentName: string): Attachment;
		setAttachment(slotName: string, attachmentName: string): void;
		findIkConstraint(constraintName: string): IkConstraint;
		findTransformConstraint(constraintName: string): TransformConstraint;
		findPathConstraint(constraintName: string): PathConstraint;
		getBounds(offset: Vector2, size: Vector2): void;
		update(delta: number): void;
	}
}
declare module spine {
	class BinaryReader {
		offset: number;
		size: number;
		buffer: Uint8Array;
		floatBuf: ArrayBuffer;
		floatBufIn: Uint8Array;
		floatBufOut: Float32Array;
		doubleBuf: ArrayBuffer;
		doubleBufIn: Uint8Array;
		doubleBufOut: Float64Array;
		constructor(data: ArrayBuffer);
		readByte(): number;
		readSByte(): number;
		readBool(): boolean;
		readShort(): number;
		readInt(): number;
		readVarInt(optimizePositive?: boolean): number;
		readFloat(): number;
		readFloatArray(n: number, scale: number): Float32Array;
		readShortArray(): Array<number>;
		readString(): string;
		readColor(): Array<number>;
	}
	export class SkeletonBinary {
		attachmentLoader: AttachmentLoader;
		scale: number;
		private linkedMeshes;
		constructor(attachmentLoader: AttachmentLoader);
		readSkeletonData(buf: ArrayBuffer): SkeletonData;
		readAttachment(reader: BinaryReader, skin: Skin, slotIndex: number, placeholderName: string, skeletonData: SkeletonData, nonessential: boolean): Attachment;
		readVertices(reader: BinaryReader, attachment: VertexAttachment, verticesLength: number): void;
		readAnimation(reader: BinaryReader, name: string, skeletonData: SkeletonData): void;
		readCurve(reader: BinaryReader, timeline: CurveTimeline, frameIndex: number): void;
	}
	export {};
}
declare module spine {
	class SkeletonBounds {
		minX: number;
		minY: number;
		maxX: number;
		maxY: number;
		boundingBoxes: BoundingBoxAttachment[];
		polygons: ArrayLike<number>[];
		private polygonPool;
		update(skeleton: Skeleton, updateAabb: boolean): void;
		aabbCompute(): void;
		aabbContainsPoint(x: number, y: number): boolean;
		aabbIntersectsSegment(x1: number, y1: number, x2: number, y2: number): boolean;
		aabbIntersectsSkeleton(bounds: SkeletonBounds): boolean;
		containsPoint(x: number, y: number): BoundingBoxAttachment;
		containsPointPolygon(polygon: ArrayLike<number>, x: number, y: number): boolean;
		intersectsSegment(x1: number, y1: number, x2: number, y2: number): BoundingBoxAttachment;
		intersectsSegmentPolygon(polygon: ArrayLike<number>, x1: number, y1: number, x2: number, y2: number): boolean;
		getPolygon(boundingBox: BoundingBoxAttachment): ArrayLike<number>;
		getWidth(): number;
		getHeight(): number;
	}
}
declare module spine {
	class SkeletonData {
		name: string;
		bones: BoneData[];
		slots: SlotData[];
		skins: Skin[];
		defaultSkin: Skin;
		events: EventData[];
		animations: Animation[];
		ikConstraints: IkConstraintData[];
		transformConstraints: TransformConstraintData[];
		pathConstraints: PathConstraintData[];
		width: number;
		height: number;
		version: string;
		hash: string;
		fps: number;
		imagesPath: string;
		findBone(boneName: string): BoneData;
		findBoneIndex(boneName: string): number;
		findSlot(slotName: string): SlotData;
		findSlotIndex(slotName: string): number;
		findSkin(skinName: string): Skin;
		findEvent(eventDataName: string): EventData;
		findAnimation(animationName: string): Animation;
		findIkConstraint(constraintName: string): IkConstraintData;
		findTransformConstraint(constraintName: string): TransformConstraintData;
		findPathConstraint(constraintName: string): PathConstraintData;
		findPathConstraintIndex(pathConstraintName: string): number;
	}
}
declare module spine {
	class SkeletonJson {
		attachmentLoader: AttachmentLoader;
		scale: number;
		private linkedMeshes;
		constructor(attachmentLoader: AttachmentLoader);
		readSkeletonData(json: string | any): SkeletonData;
		readAttachment(map: any, skin: Skin, slotIndex: number, name: string): Attachment;
		readVertices(map: any, attachment: VertexAttachment, verticesLength: number): void;
		readAnimation(map: any, name: string, skeletonData: SkeletonData): void;
		readCurve(map: any, timeline: CurveTimeline, frameIndex: number): void;
		getValue(map: any, prop: string, defaultValue: any): any;
		static blendModeFromString(str: string): BlendMode;
		static positionModeFromString(str: string): PositionMode;
		static spacingModeFromString(str: string): SpacingMode;
		static rotateModeFromString(str: string): RotateMode;
		static transformModeFromString(str: string): TransformMode;
	}
}
declare module spine {
	class Skin {
		name: string;
		attachments: Map<Attachment>[];
		constructor(name: string);
		addAttachment(slotIndex: number, name: string, attachment: Attachment): void;
		getAttachment(slotIndex: number, name: string): Attachment;
		attachAll(skeleton: Skeleton, oldSkin: Skin): void;
	}
}
declare module spine {
	class Slot {
		data: SlotData;
		bone: Bone;
		color: Color;
		private attachment;
		private attachmentTime;
		attachmentVertices: number[];
		constructor(data: SlotData, bone: Bone);
		getAttachment(): Attachment;
		setAttachment(attachment: Attachment): void;
		setAttachmentTime(time: number): void;
		getAttachmentTime(): number;
		setToSetupPose(): void;
	}
}
declare module spine {
	class SlotData {
		index: number;
		name: string;
		boneData: BoneData;
		color: Color;
		attachmentName: string;
		blendMode: BlendMode;
		constructor(index: number, name: string, boneData: BoneData);
	}
}
declare module spine {
	abstract class Texture {
		protected _image: HTMLImageElement;
		constructor(image: HTMLImageElement);
		getImage(): HTMLImageElement;
		abstract setFilters(minFilter: TextureFilter, magFilter: TextureFilter): void;
		abstract setWraps(uWrap: TextureWrap, vWrap: TextureWrap): void;
		abstract dispose(): void;
		static filterFromString(text: string): TextureFilter;
		static wrapFromString(text: string): TextureWrap;
	}
	enum TextureFilter {
		Nearest = 9728,
		Linear = 9729,
		MipMap = 9987,
		MipMapNearestNearest = 9984,
		MipMapLinearNearest = 9985,
		MipMapNearestLinear = 9986,
		MipMapLinearLinear = 9987
	}
	enum TextureWrap {
		MirroredRepeat = 33648,
		ClampToEdge = 33071,
		Repeat = 10497
	}
	class TextureRegion {
		renderObject: any;
		u: number;
		v: number;
		u2: number;
		v2: number;
		width: number;
		height: number;
		rotate: boolean;
		offsetX: number;
		offsetY: number;
		originalWidth: number;
		originalHeight: number;
	}
	class FakeTexture extends spine.Texture {
		setFilters(minFilter: spine.TextureFilter, magFilter: spine.TextureFilter): void;
		setWraps(uWrap: spine.TextureWrap, vWrap: spine.TextureWrap): void;
		dispose(): void;
	}
}
declare module spine {
	class TextureAtlas implements Disposable {
		pages: TextureAtlasPage[];
		regions: TextureAtlasRegion[];
		constructor(atlasText: string, textureLoader: (path: string) => any);
		private load;
		findRegion(name: string): TextureAtlasRegion;
		dispose(): void;
	}
	class TextureAtlasPage {
		name: string;
		minFilter: TextureFilter;
		magFilter: TextureFilter;
		uWrap: TextureWrap;
		vWrap: TextureWrap;
		texture: Texture;
		width: number;
		height: number;
	}
	class TextureAtlasRegion extends TextureRegion {
		page: TextureAtlasPage;
		name: string;
		x: number;
		y: number;
		index: number;
		rotate: boolean;
		texture: Texture;
	}
}
declare module spine {
	class TransformConstraint implements Constraint {
		data: TransformConstraintData;
		bones: Array<Bone>;
		target: Bone;
		rotateMix: number;
		translateMix: number;
		scaleMix: number;
		shearMix: number;
		temp: Vector2;
		constructor(data: TransformConstraintData, skeleton: Skeleton);
		apply(): void;
		update(): void;
		getOrder(): number;
	}
}
declare module spine {
	class TransformConstraintData {
		name: string;
		order: number;
		bones: BoneData[];
		target: BoneData;
		rotateMix: number;
		translateMix: number;
		scaleMix: number;
		shearMix: number;
		offsetRotation: number;
		offsetX: number;
		offsetY: number;
		offsetScaleX: number;
		offsetScaleY: number;
		offsetShearY: number;
		constructor(name: string);
	}
}
declare module spine {
	interface Updatable {
		update(): void;
	}
}
declare module spine {
	interface Map<T> {
		[key: string]: T;
	}
	class IntSet {
		array: number[];
		add(value: number): boolean;
		contains(value: number): boolean;
		remove(value: number): void;
		clear(): void;
	}
	interface Disposable {
		dispose(): void;
	}
	interface Restorable {
		restore(): void;
	}
	class Color {
		r: number;
		g: number;
		b: number;
		a: number;
		static WHITE: Color;
		static RED: Color;
		static GREEN: Color;
		static BLUE: Color;
		static MAGENTA: Color;
		constructor(r?: number, g?: number, b?: number, a?: number);
		set(r: number, g: number, b: number, a: number): this;
		setFromColor(c: Color): this;
		setFromString(hex: string): this;
		add(r: number, g: number, b: number, a: number): this;
		clamp(): this;
	}
	class MathUtils {
		static PI: number;
		static PI2: number;
		static radiansToDegrees: number;
		static radDeg: number;
		static degreesToRadians: number;
		static degRad: number;
		static clamp(value: number, min: number, max: number): number;
		static cosDeg(degrees: number): number;
		static sinDeg(degrees: number): number;
		static signum(value: number): number;
		static toInt(x: number): number;
		static cbrt(x: number): number;
	}
	class Utils {
		static SUPPORTS_TYPED_ARRAYS: boolean;
		static arrayCopy<T>(source: ArrayLike<T>, sourceStart: number, dest: ArrayLike<T>, destStart: number, numElements: number): void;
		static setArraySize<T>(array: Array<T>, size: number, value?: any): Array<T>;
		static ensureArrayCapacity<T>(array: Array<T>, size: number, value?: any): Array<T>;
		static newArray<T>(size: number, defaultValue: T): Array<T>;
		static newFloatArray(size: number): ArrayLike<number>;
		static toFloatArray(array: Array<number>): number[] | Float32Array;
	}
	class DebugUtils {
		static logBones(skeleton: Skeleton): void;
	}
	class Pool<T> {
		private items;
		private instantiator;
		constructor(instantiator: () => T);
		obtain(): T;
		free(item: T): void;
		freeAll(items: ArrayLike<T>): void;
		clear(): void;
	}
	class Vector2 {
		x: number;
		y: number;
		constructor(x?: number, y?: number);
		set(x: number, y: number): Vector2;
		length(): number;
		normalize(): this;
	}
	class TimeKeeper {
		maxDelta: number;
		framesPerSecond: number;
		delta: number;
		totalTime: number;
		private lastTime;
		private frameCount;
		private frameTime;
		update(): void;
	}
	interface ArrayLike<T> {
		length: number;
		[n: number]: T;
	}
}
declare module spine {
	abstract class Attachment {
		name: string;
		constructor(name: string);
	}
	abstract class VertexAttachment extends Attachment {
		bones: Array<number>;
		vertices: ArrayLike<number>;
		worldVerticesLength: number;
		constructor(name: string);
		computeWorldVertices(slot: Slot, worldVertices: ArrayLike<number>): void;
		computeWorldVerticesWith(slot: Slot, start: number, count: number, worldVertices: ArrayLike<number>, offset: number): void;
		applyDeform(sourceAttachment: VertexAttachment): boolean;
	}
}
declare module spine {
	interface AttachmentLoader {
		newRegionAttachment(skin: Skin, name: string, path: string): RegionAttachment;
		newMeshAttachment(skin: Skin, name: string, path: string): MeshAttachment;
		newBoundingBoxAttachment(skin: Skin, name: string): BoundingBoxAttachment;
		newPathAttachment(skin: Skin, name: string): PathAttachment;
	}
}
declare module spine {
	enum AttachmentType {
		Region = 0,
		BoundingBox = 1,
		Mesh = 2,
		LinkedMesh = 3,
		Path = 4
	}
}
declare module spine {
	class BoundingBoxAttachment extends VertexAttachment {
		color: Color;
		constructor(name: string);
	}
}
declare module spine {
	class MeshAttachment extends VertexAttachment {
		region: TextureRegion;
		path: string;
		regionUVs: ArrayLike<number>;
		worldVertices: ArrayLike<number>;
		triangles: Array<number>;
		color: Color;
		hullLength: number;
		private parentMesh;
		inheritDeform: boolean;
		tempColor: Color;
		constructor(name: string);
		updateUVs(): void;
		updateWorldVertices(slot: Slot, premultipliedAlpha: boolean): ArrayLike<number>;
		applyDeform(sourceAttachment: VertexAttachment): boolean;
		getParentMesh(): MeshAttachment;
		setParentMesh(parentMesh: MeshAttachment): void;
	}
}
declare module spine {
	class PathAttachment extends VertexAttachment {
		lengths: Array<number>;
		closed: boolean;
		constantSpeed: boolean;
		color: Color;
		constructor(name: string);
	}
}
declare module spine {
	class RegionAttachment extends Attachment {
		static OX1: number;
		static OY1: number;
		static OX2: number;
		static OY2: number;
		static OX3: number;
		static OY3: number;
		static OX4: number;
		static OY4: number;
		static X1: number;
		static Y1: number;
		static C1R: number;
		static C1G: number;
		static C1B: number;
		static C1A: number;
		static U1: number;
		static V1: number;
		static X2: number;
		static Y2: number;
		static C2R: number;
		static C2G: number;
		static C2B: number;
		static C2A: number;
		static U2: number;
		static V2: number;
		static X3: number;
		static Y3: number;
		static C3R: number;
		static C3G: number;
		static C3B: number;
		static C3A: number;
		static U3: number;
		static V3: number;
		static X4: number;
		static Y4: number;
		static C4R: number;
		static C4G: number;
		static C4B: number;
		static C4A: number;
		static U4: number;
		static V4: number;
		x: number;
		y: number;
		scaleX: number;
		scaleY: number;
		rotation: number;
		width: number;
		height: number;
		color: Color;
		path: string;
		rendererObject: any;
		region: TextureRegion;
		offset: ArrayLike<number>;
		vertices: ArrayLike<number>;
		tempColor: Color;
		constructor(name: string);
		setRegion(region: TextureRegion): void;
		updateOffset(): void;
		updateWorldVertices(slot: Slot, premultipliedAlpha: boolean): ArrayLike<number>;
	}
}
declare module spine.threejs {
	class AssetManager extends spine.AssetManager {
		constructor(pathPrefix?: string);
	}
}
declare module spine.threejs {
	class MeshBatcher extends THREE.Mesh {
		private static VERTEX_SIZE;
		private vertexBuffer;
		private vertices;
		private verticesLength;
		private indices;
		private indicesLength;
		constructor(maxVertices?: number);
		clear(): void;
		begin(): void;
		canBatch(verticesLength: number, indicesLength: number): boolean;
		batch(vertices: ArrayLike<number>, indices: ArrayLike<number>, z?: number): void;
		end(): void;
	}
}
declare module spine.threejs {
	class SkeletonMeshMaterial extends THREE.ShaderMaterial {
		constructor();
	}
	class SkeletonMesh extends THREE.Mesh {
		skeleton: Skeleton;
		state: AnimationState;
		zOffset: number;
		premultipliedAlpha: boolean;
		private batches;
		private nextBatchIndex;
		static QUAD_TRIANGLES: number[];
		constructor(skeletonData: SkeletonData);
		update(deltaTime: number): void;
		private clearBatches;
		private nextBatch;
		private updateGeometry;
	}
}
declare module spine.threejs {
	class ThreeJsTexture extends Texture {
		texture: THREE.Texture;
		constructor(image: HTMLImageElement);
		setFilters(minFilter: TextureFilter, magFilter: TextureFilter): void;
		setWraps(uWrap: TextureWrap, vWrap: TextureWrap): void;
		dispose(): void;
		static toThreeJsTextureFilter(filter: TextureFilter): THREE.TextureFilter;
		static toThreeJsTextureWrap(wrap: TextureWrap): THREE.Wrapping;
	}
}
