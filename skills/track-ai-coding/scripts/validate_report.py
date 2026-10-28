#!/usr/bin/env python3
"""结构化日报检查：不验证源网页真实性。仅标准库。"""
import json
import sys
from datetime import date, datetime
from pathlib import Path
from urllib.parse import urlparse

SECTIONS = {"AI市场动态", "AI产品动态与运营"}
STATUS = {"verified", "unverified", "conflicting"}

def check(data):
    errors = []
    if not isinstance(data, dict):
        return ["根节点不是对象"]
    try:
        report_day = date.fromisoformat(data["report_date"])
        dt = datetime.fromisoformat(data["cutoff"])
        if dt.tzinfo is None:
            errors.append("cutoff 必须有时区偏移")
    except (KeyError, TypeError, ValueError):
        errors.append("report_date / cutoff 日期格式错误")
        report_day = None
    if not isinstance(data.get("timezone"), str) or not data["timezone"]:
        errors.append("timezone 缺失")
    items = data.get("items")
    if not isinstance(items, list):
        return errors + ["items 必须是列表"]
    seen = set()
    for i, x in enumerate(items):
        p = f"items[{i}]"
        if not isinstance(x, dict):
            errors.append(p + " 不是对象"); continue
        for k in ("id", "title", "summary", "source_url", "source_type", "focus_segment"):
            if not isinstance(x.get(k), str) or not x[k].strip():
                errors.append(f"{p}.{k} 缺失")
        sid = x.get("id")
        if isinstance(sid, str):
            if sid in seen: errors.append(p + ".id 重复")
            seen.add(sid)
        if x.get("section") not in SECTIONS:
            errors.append(p + ".section 无效")
        if x.get("verification") not in STATUS:
            errors.append(p + ".verification 无效")
        if type(x.get("is_backfill")) is not bool:
            errors.append(p + ".is_backfill 必须是布尔值")
        try:
            event_day = date.fromisoformat(x["event_date"])
            if report_day is not None and event_day > report_day:
                errors.append(p + ".event_date 晚于报告日，需核验时间口径")
        except (TypeError, KeyError, ValueError):
            errors.append(p + ".event_date 无效")
        link = x.get("source_url", "")
        if isinstance(link, str) and (urlparse(link).scheme not in {"https", "http"} or not urlparse(link).netloc):
            errors.append(p + ".source_url 不是 HTTP(S) 链接")
        if not isinstance(x.get("claim_limitations"), list):
            errors.append(p + ".claim_limitations 应为列表")
    if not isinstance(data.get("coverage_gaps"), list):
        errors.append("coverage_gaps 应为列表")
    return errors

if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("用法：python scripts/validate_report.py path/to/report.json")
    try:
        obj = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        sys.exit("无法读取 JSON: " + str(exc))
    problems = check(obj)
    if problems:
        print("FAIL:", *problems, sep="\n- ")
        sys.exit(1)
    print("PASS: 日期、来源字段与结构校验通过；未核验真实来源。")
