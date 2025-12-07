//Deprecated
struct CheckerSettings {
    color1 : vec4f,
    color2 : vec4f,
    squareSize : f32,
    cameraPosition : vec2f,
    screenDimensions : vec2f,
}

@group(0) @binding(0) var<uniform> settings : CheckerSettings;

struct VSOut {
    @builtin(position) pos : vec4f,
    @location(0) screen_pos : vec2f,
};

@vertex
fn vs_main(@builtin(vertex_index) vid : u32) -> VSOut {
    var vert = VSOut();
    var positions = array<vec2f, 3 > (
    vec2f(-1.0, -1.0),
    vec2f(3.0, -1.0),
    vec2f(-1.0, 3.0),
    )[vid];

    vert.pos = vec4f(positions, 0.0, 1.0);
    vert.screen_pos = positions;
    return vert;
}

@fragment
fn fs_main(in : VSOut) -> @location(0) vec4f {
    let pixel = in.screen_pos;
    let aspectRatio = settings.screenDimensions.x / settings.screenDimensions.y;

    var worldScreenPos = pixel;
    worldScreenPos.x = worldScreenPos.x * 400.0 * aspectRatio;
    worldScreenPos.y = -worldScreenPos.y * 400.0;

    let worldPixel = worldScreenPos + settings.cameraPosition;

    let sx = floor(worldPixel.x / settings.squareSize);
    let sy = floor(worldPixel.y / settings.squareSize);
    let check = abs(sx + sy) % 2;

    return select(settings.color1, settings.color2, check == 1);
}
