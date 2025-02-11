/******************************************************************************
 * Spine Runtimes Software License v2.5
 *
 * Copyright (c) 2013-2016, Esoteric Software
 * All rights reserved.
 *
 * You are granted a perpetual, non-exclusive, non-sublicensable, and
 * non-transferable license to use, install, execute, and perform the Spine
 * Runtimes software and derivative works solely for personal or internal
 * use. Without the written permission of Esoteric Software (see Section 2 of
 * the Spine Software License Agreement), you may not (a) modify, translate,
 * adapt, or develop new applications using the Spine Runtimes or otherwise
 * create derivative works or improvements of the Spine Runtimes or (b) remove,
 * delete, alter, or obscure any trademarks or any copyright, trademark, patent,
 * or other intellectual property or proprietary rights notices on or in the
 * Software, including any copy thereof. Redistributions in binary or source
 * form must include this license and terms.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
 * EVENT SHALL ESOTERIC SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS INTERRUPTION, OR LOSS OF
 * USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/

module spine {
	class BinaryReader {
		offset: number; size: number;
		buffer: Uint8Array;
		floatBuf: ArrayBuffer; floatBufIn: Uint8Array; floatBufOut: Float32Array;
		doubleBuf: ArrayBuffer; doubleBufIn: Uint8Array; doubleBufOut: Float64Array;

		constructor(data: ArrayBuffer) {
			this.offset = 0;
			this.size = data.byteLength;
			this.buffer = new Uint8Array(data);
			this.floatBuf = new ArrayBuffer(4);
			this.floatBufIn = new Uint8Array(this.floatBuf);
			this.floatBufOut = new Float32Array(this.floatBuf);
			this.doubleBuf = new ArrayBuffer(8);
			this.doubleBufIn = new Uint8Array(this.doubleBuf);
			this.doubleBufOut = new Float64Array(this.doubleBuf);
		}
		readByte(): number {
			return this.buffer[this.offset++];
		}
		readSByte(): number {
			let byte = this.readByte();
			if (byte > 127) byte -= 256;
			return byte;
		}
		readBool(): boolean {
			return this.readByte() != 0;
		}
		readShort(): number {
			return (this.readByte() << 8) | this.readByte();
		}
		readInt(): number {
			return (this.readByte() << 24) | (this.readByte() << 16) | (this.readByte() << 8) | this.readByte();
		}
		readVarInt(optimizePositive: boolean = true): number {
			let b = this.readByte();
			let value = b & 0x7f;
			if (b & 0x80) {
				b = this.readByte();
				value |= (b & 0x7f) << 7;
				if (b & 0x80) {
					b = this.readByte();
					value |= (b & 0x7f) << 14;
					if (b & 0x80) {
						b = this.readByte();
						value |= (b & 0x7f) << 21;
						if (b & 0x80) {
							b = this.readByte();
							value |= (b & 0x7f) << 28;
						}
					}
				}
			}
			if (!optimizePositive) value = ((value >>> 1) ^ -(value & 1));
			return value;
		}
		readFloat(): number {
			this.floatBufIn[3] = this.readByte();
			this.floatBufIn[2] = this.readByte();
			this.floatBufIn[1] = this.readByte();
			this.floatBufIn[0] = this.readByte();
			return this.floatBufOut[0];
		}
		readFloatArray(n: number, scale: number): Float32Array {
			var array = new Float32Array(n);
			if (scale == 1) {
				for (var i = 0; i < n; i++) {
					array[i] = this.readFloat();
				}
			} else {
				for (var i = 0; i < n; i++) {
					array[i] = this.readFloat() * scale;
				}
			}
			return array;
		}
		readShortArray(): Array<number> {
			var n = this.readVarInt();
			var array = new Array(n);
			for (var i = 0; i < n; i++) {
				array[i] = this.readShort();
			}
			return array;
		}
		readString(): string {
			let charCount = this.readVarInt();
			switch (charCount) {
				case 0:
					return null;
				case 1:
					return "";
			}
			charCount--;
			let chars = "";
			let b = 0;
			for (var i = 0; i < charCount;) {
				b = this.readByte();
				switch (b >> 4) {
					case 12:
					case 13:
						chars += String.fromCharCode((b & 0x1F) << 6 | this.readByte() & 0x3F);
						i += 2;
						break;
					case 14:
						chars += String.fromCharCode((b & 0x0F) << 12 | (this.readByte() & 0x3F) << 6 | this.readByte() & 0x3F);
						i += 3;
						break;
					default:
						chars += String.fromCharCode(b);
						i++;
				}
			}
			return chars;
		}
		readColor(): Array<number> {
			let color = [
				this.readByte() / 255,
				this.readByte() / 255,
				this.readByte() / 255,
				this.readByte() / 255
			];
			if (
				color[0] == 1 &&
				color[1] == 1 &&
				color[2] == 1 &&
				color[3] == 1
			) color = null;
			return color;
		}
	}
	export class SkeletonBinary {
		attachmentLoader: AttachmentLoader;
		scale = 1;
		private linkedMeshes = new Array<LinkedMesh>();

		constructor(attachmentLoader: AttachmentLoader) {
			this.attachmentLoader = attachmentLoader;
		}

		readSkeletonData(buf: ArrayBuffer): SkeletonData {
			let scale = this.scale;
			let skeletonData = new SkeletonData();
			let reader = new BinaryReader(buf);

			// Skeleton.
			skeletonData.hash = reader.readString();
			skeletonData.version = reader.readString();
			skeletonData.width = reader.readFloat();
			skeletonData.height = reader.readFloat();
			let nonessential = reader.readBool();
			if (nonessential) {
				skeletonData.fps = reader.readFloat(); //spine ver > 3.4
				skeletonData.imagesPath = reader.readString();
			}

			// Bones.
			for (let i = 0, boneCount = reader.readVarInt(); i < boneCount; i++) {
				let boneName = reader.readString();

				let parent: BoneData = null;
				if (i > 0) {
					let parentIndex: number = reader.readVarInt();
					parent = skeletonData.bones[parentIndex];
					if (parent == null) throw new Error("Parent bone not found: " + parentIndex);
				}
				let data = new BoneData(i, boneName, parent);
				data.rotation = reader.readFloat();
				data.x = reader.readFloat() * scale;
				data.y = reader.readFloat() * scale;
				data.scaleX = reader.readFloat();
				data.scaleY = reader.readFloat();
				data.shearX = reader.readFloat();
				data.shearY = reader.readFloat();
				data.length = reader.readFloat() * scale;
				data.transformMode = reader.readVarInt();
				if (nonessential) reader.readColor(); // Skip bone color

				skeletonData.bones.push(data);
			}

			// Slots.
			for (let i = 0, slotCount = reader.readVarInt(); i < slotCount; i++) {
				let slotName: string = reader.readString();
				let boneIndex: number = reader.readVarInt();
				let boneData = skeletonData.bones[boneIndex];
				if (boneData == null) throw new Error("Slot bone not found: " + boneIndex);
				let data = new SlotData(i, slotName, boneData);

				let color: Array<number> = reader.readColor();
				if (color != null) data.color.set(color[0], color[1], color[2], color[3]);

				data.attachmentName = reader.readString();
				data.blendMode = reader.readVarInt();
				skeletonData.slots.push(data);
			}

			// IK constraints.
			for (let i = 0, ikCount = reader.readVarInt(); i < ikCount; i++) {
				let data = new IkConstraintData(reader.readString());
				data.order = reader.readVarInt();

				for (let j = 0, boneCount = reader.readVarInt(); j < boneCount; j++) {
					let boneIndex = reader.readVarInt();
					let bone = skeletonData.bones[boneIndex];
					if (bone == null) throw new Error("IK bone not found: " + boneIndex);
					data.bones.push(bone);
				}

				let targetIndex: number = reader.readVarInt();
				data.target = skeletonData.bones[targetIndex];
				if (data.target == null) throw new Error("IK target bone not found: " + targetIndex);

				data.mix = reader.readFloat();
				data.bendDirection = reader.readSByte();

				skeletonData.ikConstraints.push(data);
			}

			// Transform constraints.
			for (let i = 0, transformCount = reader.readVarInt(); i < transformCount; i++) {
				let data = new TransformConstraintData(reader.readString());
				data.order = reader.readVarInt(); //spine ver > 3.4

				for (let j = 0, boneCount = reader.readVarInt(); j < boneCount; j++) {
					let boneIndex = reader.readVarInt();
					let bone = skeletonData.bones[boneIndex];
					if (bone == null) throw new Error("Transform constraint bone not found: " + boneIndex);
					data.bones.push(bone);
				}

				let targetIndex: number = reader.readVarInt();
				data.target = skeletonData.bones[targetIndex];
				if (data.target == null) throw new Error("Transform constraint target bone not found: " + targetIndex);

				data.offsetRotation = reader.readFloat();
				data.offsetX = reader.readFloat() * this.scale;
				data.offsetY = reader.readFloat() * this.scale;
				data.offsetScaleX = reader.readFloat();
				data.offsetScaleY = reader.readFloat();
				data.offsetShearY = reader.readFloat();

				data.rotateMix = reader.readFloat();
				data.translateMix = reader.readFloat();
				data.scaleMix = reader.readFloat();
				data.shearMix = reader.readFloat();

				skeletonData.transformConstraints.push(data);
			}

			// Path constraints.
			for (let i = 0, pathCount = reader.readVarInt(); i < pathCount; i++) {
				let data = new PathConstraintData(reader.readString());
				data.order = reader.readVarInt(); //spine ver > 3.4

				for (let j = 0, boneCount = reader.readVarInt(); j < boneCount; j++) {
					let boneIndex = reader.readVarInt();
					let bone = skeletonData.bones[boneIndex];
					if (bone == null) throw new Error("Transform constraint bone not found: " + boneIndex);
					data.bones.push(bone);
				}

				let targetIndex = reader.readVarInt();
				data.target = skeletonData.slots[targetIndex];
				if (data.target == null) throw new Error("Path target slot not found: " + targetIndex);

				data.positionMode = reader.readVarInt();
				data.spacingMode = reader.readVarInt();
				data.rotateMode = reader.readVarInt();
				data.offsetRotation = reader.readFloat();
				data.position = reader.readFloat();
				if (data.positionMode == PositionMode.Fixed) data.position *= scale;
				data.spacing = reader.readFloat();
				if (data.spacingMode == SpacingMode.Length || data.spacingMode == SpacingMode.Fixed) data.spacing *= scale;
				data.rotateMix = reader.readFloat();
				data.translateMix = reader.readFloat();

				skeletonData.pathConstraints.push(data);
			}

			// Skins.
			let defaultSkin = new Skin('default');
			for (let i = 0, slotCount = reader.readVarInt(); i < slotCount; i++) {
				let slotIndex = reader.readVarInt();
				for (let j = 0, attachmentCount = reader.readVarInt(); j < attachmentCount; j++) {
					let placeholderName = reader.readString();
					let attachment = this.readAttachment(reader, defaultSkin, slotIndex, placeholderName, skeletonData, nonessential);
					if (attachment != null) defaultSkin.addAttachment(slotIndex, placeholderName, attachment);
				}
			}
			skeletonData.skins.push(defaultSkin);
			skeletonData.defaultSkin = defaultSkin;
			for (let i = 0, skinCount = reader.readVarInt(); i < skinCount; i++) {
				let skin = new Skin(reader.readString());
				for (let j = 0, slotCount = reader.readVarInt(); j < slotCount; j++) {
					let slotIndex = reader.readVarInt();
					for (let k = 0, attachmentCount = reader.readVarInt(); k < attachmentCount; k++) {
						let placeholderName = reader.readString();
						let attachment = this.readAttachment(reader, skin, slotIndex, placeholderName, skeletonData, nonessential);
						if (attachment != null) skin.addAttachment(slotIndex, placeholderName, attachment);
					}
				}
				skeletonData.skins.push(skin);
			}

			//Linked meshes.
			for (let i = 0, n = this.linkedMeshes.length; i < n; i++) {
				let linkedMesh = this.linkedMeshes[i];
				let skin = linkedMesh.skin == null ? skeletonData.defaultSkin : skeletonData.findSkin(linkedMesh.skin);
				if (skin == null) throw new Error("Skin not found: " + linkedMesh.skin);
				let parent = skin.getAttachment(linkedMesh.slotIndex, linkedMesh.parent);
				if (parent == null) throw new Error("Parent mesh not found: " + linkedMesh.parent);
				linkedMesh.mesh.setParentMesh(<MeshAttachment>parent);
				linkedMesh.mesh.updateUVs();
			}
			this.linkedMeshes.length = 0;

			// Events.
			for (let i = 0, eventCount = reader.readVarInt(); i < eventCount; i++) {
				let data = new EventData(reader.readString());
				data.intValue = reader.readVarInt(false);
				data.floatValue = reader.readFloat();
				data.stringValue = reader.readString();
				skeletonData.events.push(data);
			}

			// Animations.
			for (let i = 0, animationCount = reader.readVarInt(); i < animationCount; i++) {
				let animationName = reader.readString();
				this.readAnimation(reader, animationName, skeletonData);
			}

			return skeletonData;
		}

		readAttachment(reader: BinaryReader, skin: Skin, slotIndex: number, placeholderName: string, skeletonData: SkeletonData, nonessential: boolean): Attachment {
			let scale = this.scale;
			let name = reader.readString();
			if (!name) {
				name = placeholderName;
			}

			let type = reader.readByte();

			switch (type) {
				case AttachmentType.Region: {
					let path = reader.readString();
					if (!path) path = name;
					let region = this.attachmentLoader.newRegionAttachment(skin, name, path);
					if (region == null) return null;
					region.path = path;
					region.rotation = reader.readFloat();
					region.x = reader.readFloat() * scale;
					region.y = reader.readFloat() * scale;
					region.scaleX = reader.readFloat();
					region.scaleY = reader.readFloat();
					region.width = reader.readFloat() * scale;
					region.height = reader.readFloat() * scale;

					let color: Array<number> = reader.readColor();
					if (color != null) region.color.set(color[0], color[1], color[2], color[3]);

					region.updateOffset();
					return region;
				}
				case AttachmentType.BoundingBox: {
					let box = this.attachmentLoader.newBoundingBoxAttachment(skin, name);
					if (box == null) return null;
					let vertexCount = reader.readVarInt();
					this.readVertices(reader, box, vertexCount);
					if (nonessential) {
						let color: Array<number> = reader.readColor();
						if (color != null) box.color.set(color[0], color[1], color[2], color[3]);
					}
					return box;
				}
				case AttachmentType.Mesh: {
					let path = reader.readString();
					if (!path) path = name;
					let mesh = this.attachmentLoader.newMeshAttachment(skin, name, path);
					if (mesh == null) return null;
					mesh.path = path;

					let color = reader.readColor();
					if (color != null) mesh.color.set(color[0], color[1], color[2], color[3]);

					var uvCount = reader.readVarInt();
					mesh.regionUVs = reader.readFloatArray(uvCount << 1, 1);
					mesh.triangles = reader.readShortArray();

					this.readVertices(reader, mesh, uvCount);
					mesh.hullLength = reader.readVarInt() << 1;
					if (nonessential) {
						let edges = reader.readShortArray();
						let width = reader.readFloat() * scale;
						let height = reader.readFloat() * scale;
					}
					mesh.updateUVs();
					return mesh;
				}
				case AttachmentType.LinkedMesh: {
					let path = reader.readString();
					if (!path) path = name;
					let mesh = this.attachmentLoader.newMeshAttachment(skin, name, path);
					if (mesh == null) return null;
					mesh.path = path;

					let color = reader.readColor();
					if (color != null) mesh.color.set(color[0], color[1], color[2], color[3]);

					let skinName = reader.readString();
					let parent: string = reader.readString();
					let inheritDeform = reader.readBool();
					mesh.inheritDeform = inheritDeform;
					this.linkedMeshes.push(new LinkedMesh(mesh, skinName, slotIndex, parent));
					if (nonessential) {
						let width = reader.readFloat() * scale;
						let height = reader.readFloat() * scale;
					}
					return mesh;
				}
				case AttachmentType.Path: {
					let path = this.attachmentLoader.newPathAttachment(skin, name);
					if (path == null) return null;
					path.closed = reader.readBool();
					path.constantSpeed = reader.readBool();

					let vertexCount = reader.readVarInt();
					this.readVertices(reader, path, vertexCount);

					let lengths = new Array(vertexCount / 3);
					for (let i = 0; i < lengths.length; i++)
						lengths[i] = reader.readFloat() * scale;
					path.lengths = lengths;

					if (nonessential) {
						let color = reader.readColor();
						if (color != null) path.color.set(color[0], color[1], color[2], color[3]);
					}
					return path;
				}
				default:
					throw new Error("Unsupported AttachmentType: " + type);
			}
		}

		readVertices(reader: BinaryReader, attachment: VertexAttachment, verticesLength: number) {
			let scale = this.scale;
			let vertexCount = verticesLength << 1;
			attachment.worldVerticesLength = vertexCount;
			let weighted = reader.readBool();
			if (!weighted) {
				attachment.vertices = reader.readFloatArray(vertexCount, scale);
				return;
			}

			let weights = new Array<number>();
			let bones = new Array<number>();
			for (var i = 0; i < verticesLength; i++) {
				let boneCount = reader.readVarInt();
				bones.push(boneCount);
				for (let j = 0; j < boneCount; j++) {
					bones.push(reader.readVarInt());
					weights.push(reader.readFloat() * scale);
					weights.push(reader.readFloat() * scale);
					weights.push(reader.readFloat());
				}
			}
			attachment.bones = bones;
			attachment.vertices = Utils.toFloatArray(weights);
		}

		readAnimation(reader: BinaryReader, name: string, skeletonData: SkeletonData) {
			let scale = this.scale;
			let timelines = new Array<Timeline>();
			let duration = 0;

			// Slot timelines.
			for (let i = 0, slotCount = reader.readVarInt(); i < slotCount; i++) {
				let slotIndex = reader.readVarInt();
				for (let ii = 0, timelineCount = reader.readVarInt(); ii < timelineCount; ii++) {
					let timelineType = reader.readByte();
					let frameCount = reader.readVarInt();
					switch (timelineType) {
						case SlotTimelineType.attachment: {
							let timeline = new AttachmentTimeline(frameCount);
							timeline.slotIndex = slotIndex;

							for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
								timeline.setFrame(frameIndex, reader.readFloat(), reader.readString());
							}
							timelines.push(timeline);
							duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);

							break;
						}
						case SlotTimelineType.color: {
							let timeline = new ColorTimeline(frameCount);
							timeline.slotIndex = slotIndex;

							for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
								let time = reader.readFloat();
								let color = reader.readColor();
								if (!color) color = [1, 1, 1, 1];
								timeline.setFrame(frameIndex, time, color[0], color[1], color[2], color[3]);
								if (frameIndex < frameCount - 1) this.readCurve(reader, timeline, frameIndex);
							}
							timelines.push(timeline);
							duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * ColorTimeline.ENTRIES]);

							break;
						}
						default: {
							throw new Error("Invalid timeline type for a slot: " + timelineType + " (" + slotIndex + ")");
						}
					}
				}
			}

			// Bone timelines.
			for (let i = 0, boneCount = reader.readVarInt(); i < boneCount; i++) {
				let boneIndex = reader.readVarInt();
				for (let ii = 0, timelineCount = reader.readVarInt(); ii < timelineCount; ii++) {
					let timelineType = reader.readByte();
					let frameCount = reader.readVarInt();
					switch (timelineType) {
						case BoneTimelineType.rotate: {
							let timeline = new RotateTimeline(frameCount);
							timeline.boneIndex = boneIndex;

							for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
								timeline.setFrame(frameIndex, reader.readFloat(), reader.readFloat());
								if (frameIndex < frameCount - 1) this.readCurve(reader, timeline, frameIndex);
							}
							timelines.push(timeline);
							duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * RotateTimeline.ENTRIES]);

							break;
						}
						case BoneTimelineType.translate:
						case BoneTimelineType.scale:
						case BoneTimelineType.shear: {
							let timeline: TranslateTimeline = null;
							let timelineScale = 1;
							if (timelineType === BoneTimelineType.scale)
								timeline = new ScaleTimeline(frameCount);
							else if (timelineType === BoneTimelineType.shear)
								timeline = new ShearTimeline(frameCount);
							else {
								timeline = new TranslateTimeline(frameCount);
								timelineScale = scale;
							}
							timeline.boneIndex = boneIndex;

							for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
								let time = reader.readFloat();
								let x = reader.readFloat(), y = reader.readFloat();
								timeline.setFrame(frameIndex, time, x * timelineScale, y * timelineScale);
								if (frameIndex < frameCount - 1) this.readCurve(reader, timeline, frameIndex);
							}
							timelines.push(timeline);
							duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * TranslateTimeline.ENTRIES]);

							break;
						}
						default: {
							throw new Error("Invalid timeline type for a bone: " + timelineType + " (" + boneIndex + ")");
						}
					}
				}
			}

			// IK constraint timelines.
			for (let i = 0, count = reader.readVarInt(); i < count; i++) {
				let ikConstraintIndex = reader.readVarInt();
				let frameCount = reader.readVarInt();
				let timeline = new IkConstraintTimeline(frameCount);
				timeline.ikConstraintIndex = ikConstraintIndex;
				for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
					timeline.setFrame(frameIndex, reader.readFloat(), reader.readFloat(),
						reader.readSByte());
					if (frameIndex < frameCount - 1) this.readCurve(reader, timeline, frameIndex);
				}
				timelines.push(timeline);
				duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * IkConstraintTimeline.ENTRIES]);
			}

			// Transform constraint timelines.
			for (let i = 0, count = reader.readVarInt(); i < count; i++) {
				let transformConstraintIndex = reader.readVarInt();
				let frameCount = reader.readVarInt();
				let timeline = new TransformConstraintTimeline(frameCount);
				timeline.transformConstraintIndex = transformConstraintIndex;
				for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
					timeline.setFrame(frameIndex, reader.readFloat(), reader.readFloat(),
						reader.readFloat(), reader.readFloat(), reader.readFloat());
					if (frameIndex < frameCount - 1) this.readCurve(reader, timeline, frameIndex);
				}
				timelines.push(timeline);
				duration = Math.max(duration,
					timeline.frames[(timeline.getFrameCount() - 1) * TransformConstraintTimeline.ENTRIES]);
			}

			// Path constraint timelines.
			for (let i = 0, count = reader.readVarInt(); i < count; i++) {
				let index = reader.readVarInt();
				let data = skeletonData.pathConstraints[index];
				for (let ii = 0, nn = reader.readVarInt(); ii < nn; ii++) {
					let timelineType = reader.readByte();
					let frameCount = reader.readVarInt();
					switch (timelineType) {
						case PathConstraintTimelineType.pathConstraintPosition:
						case PathConstraintTimelineType.pathConstraintSpacing: {
							let timeline: PathConstraintPositionTimeline = null;
							let timelineScale = 1.0;
							if (timelineType === PathConstraintTimelineType.pathConstraintSpacing) {
								timeline = new PathConstraintSpacingTimeline(frameCount);
								if (data.spacingMode == SpacingMode.Length || data.spacingMode == SpacingMode.Fixed) timelineScale = scale;
							} else {
								timeline = new PathConstraintPositionTimeline(frameCount);
								if (data.positionMode == PositionMode.Fixed) timelineScale = scale;
							}
							timeline.pathConstraintIndex = index;
							for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
								timeline.setFrame(frameIndex, reader.readFloat(), reader.readFloat() * timelineScale);
								if (frameIndex < frameCount - 1) this.readCurve(reader, timeline, frameIndex);
							}
							timelines.push(timeline);
							duration = Math.max(duration,
								timeline.frames[(timeline.getFrameCount() - 1) * PathConstraintPositionTimeline.ENTRIES]);

							break;
						}
						case PathConstraintTimelineType.pathConstraintMix: {
							let timeline = new PathConstraintMixTimeline(frameCount);
							timeline.pathConstraintIndex = index;
							for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
								timeline.setFrame(frameIndex, reader.readFloat(), reader.readFloat(),
									reader.readFloat());
								if (frameIndex < frameCount - 1) this.readCurve(reader, timeline, frameIndex);
							}
							timelines.push(timeline);
							duration = Math.max(duration,
								timeline.frames[(timeline.getFrameCount() - 1) * PathConstraintMixTimeline.ENTRIES]);

							break;
						}
					}
				}
			}

			// Deform timelines.
			for (let i = 0, count = reader.readVarInt(); i < count; i++) {
				let skinIndex = reader.readVarInt();
				let skin = skeletonData.skins[skinIndex];
				if (skin == null) throw new Error("Skin not found: " + skinIndex);
				for (let ii = 0, nn = reader.readVarInt(); ii < nn; ii++) {
					let slotIndex = reader.readVarInt();
					for (let iii = 0, nnn = reader.readVarInt(); iii < nnn; iii++) {
						let attachmentName = reader.readString();
						let attachment = <VertexAttachment>skin.getAttachment(slotIndex, attachmentName);
						if (attachment == null) throw new Error("Deform attachment not found: " + attachmentName);
						let weighted = attachment.bones != null;
						let vertices = attachment.vertices;
						let deformLength = weighted ? vertices.length / 3 * 2 : vertices.length;

						let frameCount = reader.readVarInt();
						let timeline = new DeformTimeline(frameCount);
						timeline.slotIndex = slotIndex;
						timeline.attachment = attachment;

						for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
							let time = reader.readFloat();
							let end = reader.readVarInt();
							let deform: ArrayLike<number>;
							if (end == 0)
								deform = weighted ? Utils.newFloatArray(deformLength) : vertices;
							else {
								deform = Utils.newFloatArray(deformLength);
								let start = reader.readVarInt();
								end += start;
								if (scale == 1) {
									for (let v = start; v < end; v++)
										deform[v] = reader.readFloat();
								} else {
									for (let v = start; v < end; v++)
										deform[v] = reader.readFloat() * scale;
								}
								if (!weighted) {
									for (let v = 0, vn = deform.length; v < vn; v++)
										deform[v] += vertices[v];
								}
							}

							timeline.setFrame(frameIndex, time, deform);
							if (frameIndex < frameCount - 1) this.readCurve(reader, timeline, frameIndex);
						}
						timelines.push(timeline);
						duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
					}
				}
			}

			// Draw order timeline.
			let drawOrderCount = reader.readVarInt();
			if (drawOrderCount > 0) {
				let timeline = new DrawOrderTimeline(drawOrderCount);
				let slotCount = skeletonData.slots.length;
				for (let i = 0; i < drawOrderCount; i++) {
					let time = reader.readFloat();
					let offsetCount = reader.readVarInt();
					let drawOrder = Utils.newArray(slotCount, -1);
					let unchanged = new Array<number>(slotCount - offsetCount);
					let originalIndex = 0, unchangedIndex = 0;
					for (let ii = 0; ii < offsetCount; ii++) {
						let slotIndex = reader.readVarInt();
						// Collect unchanged items.
						while (originalIndex != slotIndex)
							unchanged[unchangedIndex++] = originalIndex++;
						// Set changed items.
						drawOrder[originalIndex + reader.readVarInt()] = originalIndex++;
					}
					// Collect remaining unchanged items.
					while (originalIndex < slotCount)
						unchanged[unchangedIndex++] = originalIndex++;
					// Fill in unchanged items.
					for (let ii = slotCount - 1; ii >= 0; ii--)
						if (drawOrder[ii] == -1) drawOrder[ii] = unchanged[--unchangedIndex];
					timeline.setFrame(i, time, drawOrder);
				}
				timelines.push(timeline);
				duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
			}

			// Event timeline.
			let eventCount = reader.readVarInt();
			if (eventCount > 0) {
				let timeline = new EventTimeline(eventCount);
				for (let i = 0; i < eventCount; i++) {
					let time = reader.readFloat();
					let eventIndex = reader.readVarInt();
					let eventData = skeletonData.events[eventIndex];
					if (eventData == null) throw new Error("Event not found: " + eventIndex);
					let event = new Event(time, eventData);
					event.intValue = reader.readVarInt(false);
					event.floatValue = reader.readFloat();
					event.stringValue = reader.readBool() ? reader.readString() : eventData.stringValue;
					timeline.setFrame(i, event);
				}
				timelines.push(timeline);
				duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
			}

			if (isNaN(duration)) {
				throw new Error("Error while parsing animation, duration is NaN");
			}

			skeletonData.animations.push(new Animation(name, timelines, duration));
		}

		readCurve(reader: BinaryReader, timeline: CurveTimeline, frameIndex: number) {
			let type = reader.readByte();
			switch (type) {
				case CurveTimeline.LINEAR: {
					timeline.setLinear(frameIndex);
					break;
				}
				case CurveTimeline.STEPPED: {
					timeline.setStepped(frameIndex);
					break;
				}
				case CurveTimeline.BEZIER: {
					timeline.setCurve(
						frameIndex,
						reader.readFloat(),
						reader.readFloat(),
						reader.readFloat(),
						reader.readFloat()
					);
					break;
				}
			}
		}
	}

	class LinkedMesh {
		parent: string; skin: string;
		slotIndex: number;
		mesh: MeshAttachment;

		constructor(mesh: MeshAttachment, skin: string, slotIndex: number, parent: string) {
			this.mesh = mesh;
			this.skin = skin;
			this.slotIndex = slotIndex;
			this.parent = parent;
		}
	}
}
