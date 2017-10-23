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

#include <spine/VertexAttachment.h>

#include <spine/Slot.h>

namespace Spine
{
    VertexAttachment::VertexAttachment(std::string name) : Attachment(name), _id(getNextID()), _worldVerticesLength(0)
    {
        // Empty
    }
    
    void VertexAttachment::computeWorldVertices(Slot& slot, Vector<float>& worldVertices)
    {
        computeWorldVertices(slot, 0, _worldVerticesLength, worldVertices, 0);
    }
    
    void VertexAttachment::computeWorldVertices(Slot& slot, int start, int count, Vector<float>& worldVertices, int offset, int stride)
    {
        count = offset + (count >> 1) * stride;
        Skeleton skeleton = slot.bone.skeleton;
        var deformArray = slot.attachmentVertices;
        Vector<float> vertices = _vertices;
        Vector<int> bones = _bones;
        if (bones == NULL)
        {
            if (deformArray.Count > 0) vertices = deformArray.Items;
            Bone bone = slot.bone;
            float x = bone.worldX, y = bone.worldY;
            float a = bone.a, b = bone.b, c = bone.c, d = bone.d;
            for (int vv = start, w = offset; w < count; vv += 2, w += stride)
            {
                float vx = vertices[vv], vy = vertices[vv + 1];
                worldVertices[w] = vx * a + vy * b + x;
                worldVertices[w + 1] = vx * c + vy * d + y;
            }
            return;
        }
        
        int v = 0, skip = 0;
        for (int i = 0; i < start; i += 2)
        {
            int n = bones[v];
            v += n + 1;
            skip += n;
        }
        
        var skeletonBones = skeleton.bones.Items;
        if (deformArray.Count == 0)
        {
            for (int w = offset, b = skip * 3; w < count; w += stride)
            {
                float wx = 0, wy = 0;
                int n = bones[v++];
                n += v;
                for (; v < n; v++, b += 3)
                {
                    Bone bone = skeletonBones[bones[v]];
                    float vx = vertices[b], vy = vertices[b + 1], weight = vertices[b + 2];
                    wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
                    wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
                }
                worldVertices[w] = wx;
                worldVertices[w + 1] = wy;
            }
        }
        else
        {
            Vector<float> deform = deformArray.Items;
            for (int w = offset, b = skip * 3, f = skip << 1; w < count; w += stride)
            {
                float wx = 0, wy = 0;
                int n = bones[v++];
                n += v;
                for (; v < n; v++, b += 3, f += 2)
                {
                    Bone bone = skeletonBones[bones[v]];
                    float vx = vertices[b] + deform[f], vy = vertices[b + 1] + deform[f + 1], weight = vertices[b + 2];
                    wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
                    wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
                }
                worldVertices[w] = wx;
                worldVertices[w + 1] = wy;
            }
        }
    }
    
    bool VertexAttachment::applyDeform(VertexAttachment* sourceAttachment)
    {
        return this == sourceAttachment;
    }
    
    int VertexAttachment::getId()
    {
        return _id;
    }
    
    Vector<int> VertexAttachment::getBones()
    {
        return _bones;
    }
    
    void VertexAttachment::setBones(Vector<int> inValue)
    {
        _bones = inValue;
    }
    
    Vector<float> VertexAttachment::getVertices()
    {
        return _vertices;
    }
    
    void VertexAttachment::setVertices(Vector<float> inValue)
    {
        _vertices = inValue;
    }
    
    int VertexAttachment::getWorldVerticesLength()
    {
        return _worldVerticesLength;
    }
    
    void VertexAttachment::setWorldVerticesLength(int inValue)
    {
        _worldVerticesLength = inValue;
    }
    
    int VertexAttachment::getNextID()
    {
        static int nextID = 0;
        
        return (nextID++ & 65535) << 11;
    }
}
