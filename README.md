# 记录
project的数据存放在前端的infoDB中：
{
    "id": "proj_001",
    title,标题
    ratio，宽高比例
    description：项目描述，
    stage：项目阶段，
    lastModified：
    createdAt，
    config：扩展的一些配置
    scriptData: { "story": "", "characters": [], "scenes": [] }, // Stage 1 产出
    assets: { "characterImages": {}, "sceneImages": {} },       // Stage 2 产出
    shots: [ { "id": 1, "videoUrl": "", "status": "pending" } ], // Stage 3 产出
    exportConfig: { "format": "mp4", "resolution": "1080p" }      // Stage 4 产出
}

