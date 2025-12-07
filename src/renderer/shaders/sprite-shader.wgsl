struct GlobalUniforms {
    viewProjection : mat4x4f,
    inverseViewProjection : mat4x4f,
    screenSize : vec2f,
    worldUnitPerPixel : f32
}
struct SpriteUniforms {
    modelMatrix : mat4x4f,
}
@group(0) @binding(0) var<uniform> global : GlobalUniforms;
@group(1) @binding(0) var<uniform> u : SpriteUniforms;
@group(1) @binding(1) var spriteTexture : texture_2d<f32>;
@group(1) @binding(2) var spriteSampler : sampler;

struct VertexIn {
    @location(0) pos : vec2f,
    @location(1) uv : vec2f,
}
struct VertexOut {
    @builtin(position) position : vec4f,
    @location(0) uv : vec2f,
}

@vertex
fn vs_main(in : VertexIn) -> VertexOut {
    var out : VertexOut;

    //Get world space position
    let world = u.modelMatrix * vec4f(in.pos, 0.0, 1.0);

    //Convert it to clip space
    let clip = global.viewProjection * world;

    out.position = clip;
    out.uv = in.uv;

    return out;
}

@fragment
fn fs_main(in : VertexOut) -> @location(0) vec4f {
    return textureSample(spriteTexture, spriteSampler, in.uv);
}
