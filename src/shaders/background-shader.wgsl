struct GlobalUniforms {
    viewProjection : mat4x4f,
    inverseViewProjection : mat4x4f,
    screenSize : vec2f,
    worldUnitPerPixel : f32
};
struct BackgroundUniforms {
    backgroundColor : vec4f,
    lineColor : vec4f,
    gridSize : vec2f,
    lineThickness : f32,
};
@group(0) @binding(0) var<uniform> global : GlobalUniforms;
@group(1) @binding(0) var<uniform> u : BackgroundUniforms;

struct VertexIn {
    @location(0) pos : vec2f,
    @location(1) uv : vec2f,
}
struct VertexOut {
    @builtin(position) position : vec4f,
    @location(0) clipPos : vec4f,
}

@vertex
fn vs_main(in : VertexIn) -> VertexOut {
    var out = VertexOut();
    out.position = vec4f(in.pos, 0.0, 1.0);
    out.clipPos = vec4f(in.pos, 0.0, 1.0);
    return out;
}

@fragment
fn fs_main(in : VertexOut) -> @location(0) vec4f {
    //Do magic perspective thingy
    var worldPos4f : vec4f = global.inverseViewProjection * in.clipPos;

    //Perspective divide
    var worldPos : vec2f = worldPos4f.xy / worldPos4f.w;

    let lineWorldThickness = u.lineThickness / global.worldUnitPerPixel;
    var gridSize = u.gridSize;

    let wx = worldPos.x - gridSize.x * floor(worldPos.x / gridSize.x);
    let wy = worldPos.y - gridSize.y * floor(worldPos.y / gridSize.y);

    let nearGridX = wx < lineWorldThickness || (gridSize.x - wx) < lineWorldThickness;
    let nearGridY = wy < lineWorldThickness || (gridSize.y - wy) < lineWorldThickness;
    let isLine = nearGridX || nearGridY;

    return select(u.backgroundColor, u.lineColor, isLine);
}
