# 结构化交接给其他 Agent

当另一 Agent（例如 Opportunity Engine）需要分析输入时，先导出包含已核验事实的 JSON；其可继承来源和日期，但不能把新闻自动当作增长效果证据。

```json
{
  "report_date": "2026-10-28",
  "timezone": "Asia/Shanghai",
  "cutoff": "2026-10-28T08:00:00+08:00",
  "items": [
    {
      "id": "event-001",
      "section": "AI产品动态与运营",
      "event_date": "2026-10-27",
      "title": "示例标题（合成）",
      "summary": "合成新闻摘要，仅用于解释字段。",
      "source_url": "https://example.org/original",
      "source_type": "official",
      "verification": "unverified",
      "is_backfill": true,
      "focus_segment": "Coding Agent",
      "claim_limitations": ["此条为合成测试，尚未进行原文核验"]
    }
  ],
  "coverage_gaps": ["示例检索缺口"]
}
```

`verification` 取值 `verified` / `unverified` / `conflicting`，只能对已执行原始核验的证据标记 verified。
`section` 应为 AI市场动态 或 AI产品动态与运营。
`source_url` 应是真实采集时记录的原始深链；示例域名不得出现在真实报告中。
`event_date` 是原始事件日，`report_date` 是日报日期；若事件未知不得猜。
调用 `scripts/validate_report.py` 只会检查数据结构，不会浏览网页以判断真假。
