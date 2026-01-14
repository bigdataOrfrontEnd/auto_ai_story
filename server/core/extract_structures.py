import json
import re
from typing import Dict, Any

try:
    from json_repair import repair_json
except ImportError:
    repair_json = None


async def extract_structures(self, analysis_text: str) -> Dict[str, Any]:
    prompt = self._get_template("structure_extraction", analysis_text)

    response = self.client.chat.completions.create(
        model="qwen-plus",
        messages=[{"role": "user", "content": prompt}],
        stream=False
    )

    raw = response.choices[0].message.content.strip()

    # ① 尝试直接解析
    data = None
    try:
        data = json.loads(raw)
    except Exception:
        pass

    # ② JSON 修复兜底（强烈推荐）
    if data is None and repair_json:
        try:
            fixed = repair_json(raw)
            data = json.loads(fixed)
        except Exception:
            pass

    # ③ 再兜底：抽取第一个 JSON 块
    if data is None:
        match = re.search(r"\{[\s\S]*\}", raw)
        if match:
            try:
                data = json.loads(match.group(0))
            except Exception:
                pass

    if data is None:
        raise ValueError("结构化解析失败，模型未返回合法 JSON")

    # ④ 结构完整性兜底
    data.setdefault("characters", [])
    data.setdefault("scenes", [])
    data.setdefault("shots", [])

    # ⑤ 自动补 ID（非常重要）
    for i, c in enumerate(data["characters"]):
        c.setdefault("id", f"char_{i+1}")
        c.setdefault("name", "")
        c.setdefault("description", "")

    for i, s in enumerate(data["scenes"]):
        s.setdefault("id", f"scene_{i+1}")
        s.setdefault("location", "")
        s.setdefault("time", "")
        s.setdefault("description", "")

    # 默认 sceneId 指向第一个 scene
    default_scene_id = data["scenes"][0]["id"] if data["scenes"] else "scene_1"

    for i, sh in enumerate(data["shots"]):
        sh.setdefault("id", f"shot_{i+1}")
        sh.setdefault("sceneId", default_scene_id)
        sh.setdefault("shotType", "unknown")
        sh.setdefault("description", "")

    return data
