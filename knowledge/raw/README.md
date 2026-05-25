# Raw Knowledge Inputs

把允许再分发或自有版权的资料放在这里，推荐使用 Markdown。

建议每个文件开头写 metadata：

```md
---
title: Hugging Face Course Notes
source: https://github.com/huggingface/course
license: Apache-2.0
---
```

当前构建脚本会：

1. 读取 `knowledge/raw/*.md`
2. 按标题和段落切 chunk
3. 输出到 `public/knowledge/index.json`

后续可以在这个步骤里加入真实 embedding 生成。
