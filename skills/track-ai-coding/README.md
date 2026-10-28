# 每日 AI 洞察简报 Skill · Portable Edition

**Skill 名称：`track-ai-coding`**（展示名：AI 洞察日报 / AI 洞察晨报）

> 可分享的脱敏移植版，依据日常使用规范整理；**不是现有私人 Skill 的原始全量导出**，不包括线上站点源代码、数据库、真实定时任务和邮件发送配置。

## 它能做什么
1. 按北京时间追踪**今天真实发生**的 AI 市场与产品变化；补昨日漏报并标明近7日“补录”。
2. 深度核实原始来源、日期、发布状态、指标口径、对比基线和反证；重复新闻合并。
3. 输出“完整速览 + AI市场动态 + AI产品动态与运营”的中文新闻简报，事件下附原始可点击深链。
4. 重点关注 Coding Agent、Working Agent、Personal Agent、新兴产品与用户生命周期运营机制。

## 快速安装
将本目录复制到支持 [Agent Skills](https://agentskills.io/) 的 Agent 的 Skills 文件夹中，保持 `SKILL.md` 与 `references/`、`scripts/` 的相对目录结构。

- Codex（项目级）：`<repository>/.agents/skills/track-ai-coding/`
- Claude Code（项目级）：`<repository>/.claude/skills/track-ai-coding/`
- 其他 Agent：让它读取 `SKILL.md` 及必要的引用文件后执行。**仅提供链接不等于安装，更不等于模型永久训练。**

**示例提示词：**
> 使用 track-ai-coding，按北京时间制作今天的《AI洞察晨报》，优先最新原始事实，重点覆盖 Coding Agent 和 Working Agent。每条用2–4句新闻简稿，紧接原始来源链接，补录与未核验信息明确标注。

## 本目录
- `SKILL.md` — 唤起条件、检索工作流、事实核验和输出规范
- `references/config.example.json` — 无私人信息的配置样例
- `references/source-map.md` — 必查领域及原始信息类型
- `references/verification-gates.md` — 关键质量门禁与失败处理
- `references/editorial-template.md` — 新闻简稿格式与栏目排布
- `references/output-contract.md` — 供其他 Agent 使用的 JSON 交换格式
- `scripts/validate_report.py` — 结构化输出的确定性校验，不代表事实真实性已验证
- `examples/sample-report.json` — 合成示例，非真实新闻

## 验证
```bash
python scripts/validate_report.py examples/sample-report.json
```

注意：脚本验证字段与基础约束，不自动检查原始链接能否访问。**邮件订阅、网站部署、自动运行、用户反馈写库均不属于本移植版的可直接运行能力**，需要独立部署与授权。

## 发布与许可
公开只包含不涉及个人/企业机密的规范。未指定开源许可证；如需允许第三方复制修改与再分发，请由所有者选择合适的许可证。
