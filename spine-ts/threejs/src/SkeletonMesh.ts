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

module spine.threejs {
	export class SkeletonMeshMaterial extends THREE.ShaderMaterial {
		constructor() {
			let vertexShader = `
				attribute vec4 color;
				varying vec2 vUv;
				varying vec4 vColor;
				void main() {
					vUv = uv;
					vColor = color;
					gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);
				}
			`;
			let fragmentShader = `
				uniform sampler2D map;
				varying vec2 vUv;
				varying vec4 vColor;
				void main(void) {
					gl_FragColor = texture2D(map, vUv)*vColor;
				}
			`;

			let parameters: THREE.ShaderMaterialParameters = {
				uniforms: {
					map: { type: "t", value: null }
				},
				vertexShader: vertexShader,
				fragmentShader: fragmentShader,
				side: THREE.DoubleSide,
				transparent: true,
				alphaTest: 0.5
			};
			super(parameters);
		};
	}

	export class SkeletonMesh extends THREE.Mesh {
		skeleton: Skeleton;
		state: AnimationState;
		zOffset: number = 0.1;
		premultipliedAlpha: boolean = false;

		private batches = new Array<MeshBatcher>();
		private nextBatchIndex = 0;

		static QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];

		constructor(skeletonData: SkeletonData) {
			super();

			this.skeleton = new Skeleton(skeletonData);
			let animData = new AnimationStateData(skeletonData);
			this.state = new AnimationState(animData);
		}

		update(deltaTime: number) {
			let state = this.state;
			let skeleton = this.skeleton;

			state.update(deltaTime);
			state.apply(skeleton);
			skeleton.updateWorldTransform();

			this.updateGeometry();
		}

		private clearBatches() {
			for (var i = 0; i < this.batches.length; i++) {
				this.batches[i].clear();
				this.batches[i].visible = false;
			}
			this.nextBatchIndex = 0;
		}

		private nextBatch() {
			if (this.batches.length == this.nextBatchIndex) {
				let batch = new MeshBatcher();
				this.add(batch);
				this.batches.push(batch);
			}
			let batch = this.batches[this.nextBatchIndex++];
			batch.visible = true;
			return batch;
		}

		private updateGeometry() {
			this.clearBatches();

			let blendMode: BlendMode = null;

			let vertices: ArrayLike<number> = null;
			let triangles: Array<number> = null;
			let drawOrder = this.skeleton.drawOrder;
			let batch = this.nextBatch();
			batch.begin();
			let z = 0;
			let zOffset = this.zOffset;
			for (let i = 0, n = drawOrder.length; i < n; i++) {
				let slot = drawOrder[i];
				let attachment = slot.getAttachment();
				let texture: ThreeJsTexture = null;
				if (attachment instanceof RegionAttachment) {
					let region = <RegionAttachment>attachment;
					vertices = region.updateWorldVertices(slot, false);
					triangles = SkeletonMesh.QUAD_TRIANGLES;
					texture = <ThreeJsTexture>(<TextureAtlasRegion>region.region.renderObject).texture;
				} else if (attachment instanceof MeshAttachment) {
					let mesh = <MeshAttachment>attachment;
					vertices = mesh.updateWorldVertices(slot, false);
					triangles = mesh.triangles;
					texture = <ThreeJsTexture>(<TextureAtlasRegion>mesh.region.renderObject).texture;
				} else continue;

				if (texture != null) {
					// FIXME per slot blending would require multiple material support
					//let slotBlendMode = slot.data.blendMode;
					//if (slotBlendMode != blendMode) {
					//	blendMode = slotBlendMode;
					//	batcher.setBlendMode(getSourceGLBlendMode(this._gl, blendMode, premultipliedAlpha), getDestGLBlendMode(this._gl, blendMode));
					//}

					let batchMaterial = <SkeletonMeshMaterial>batch.material;
					if (batchMaterial.uniforms.map.value == null) {
						batchMaterial.uniforms.map.value = texture.texture;
					}
					if (batchMaterial.uniforms.map.value != texture.texture) {
						batch.end();
						batch = this.nextBatch();
						batch.begin();
						batchMaterial = <SkeletonMeshMaterial>batch.material;
						batchMaterial.uniforms.map.value = texture.texture;
					}
					batchMaterial.premultipliedAlpha = this.premultipliedAlpha;
					batchMaterial.needsUpdate = true;

					batch.batch(vertices, triangles, z);
					z += zOffset;
				}
			}
			batch.end();
		}
	}
}
