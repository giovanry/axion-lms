from datetime import date, datetime, timedelta
import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from sqlmodel import Session, select
from backend.app.core.config import settings
from backend.app.core.database import engine
from backend.app.models.schema import ModuleLesson, User


import copy
from backend.app.core.cache import memory_cache


def load_curriculum_manifest() -> List[Dict[str, Any]]:
    manifest_path = settings.curriculum_dir / "manifests" / "curriculum.json"
    if not manifest_path.exists():
        return []
    with open(manifest_path, "r", encoding="utf-8") as f:
        return json.load(f)


def sync_curriculum_to_db() -> None:
    manifest = load_curriculum_manifest()
    with Session(engine) as session:
        existing_ids = set(session.exec(select(ModuleLesson.id)).all())
        to_add = []
        for module in manifest:
            module_id = module.get("id", "mod_0")
            module_title = module.get("title", "Module")
            for order, lesson in enumerate(module.get("lessons", [])):
                lesson_id = lesson.get("id")
                if lesson_id not in existing_ids:
                    to_add.append(ModuleLesson(
                        id=lesson_id,
                        module_id=module_id,
                        module_title=module_title,
                        title=lesson.get("title", ""),
                        type=lesson.get("type", "THEORY"),
                        content_path=lesson.get("content_path", ""),
                        is_completed=False,
                        order_index=order,
                    ))
                    existing_ids.add(lesson_id)
        if to_add:
            session.add_all(to_add)
            session.commit()
    memory_cache.invalidate("curriculum_tree")


def get_curriculum_tree() -> List[Dict[str, Any]]:
    cached = memory_cache.get("curriculum_tree")
    if cached is not None:
        return cached

    manifest = load_curriculum_manifest()
    with Session(engine) as session:
        existing_ids = set(session.exec(select(ModuleLesson.id)).all())
        to_add = []
        for module in manifest:
            module_id = module.get("id", "mod_0")
            module_title = module.get("title", "Module")
            for order, lesson in enumerate(module.get("lessons", [])):
                lesson_id = lesson.get("id")
                if lesson_id not in existing_ids:
                    to_add.append(ModuleLesson(
                        id=lesson_id,
                        module_id=module_id,
                        module_title=module_title,
                        title=lesson.get("title", ""),
                        type=lesson.get("type", "THEORY"),
                        content_path=lesson.get("content_path", ""),
                        is_completed=False,
                        order_index=order,
                    ))
                    existing_ids.add(lesson_id)
        if to_add:
            session.add_all(to_add)
            session.commit()

        completed_ids = set(
            session.exec(select(ModuleLesson.id).where(ModuleLesson.is_completed == True)).all()
        )

    result_tree = copy.deepcopy(manifest)
    for mod in result_tree:
        for les in mod.get("lessons", []):
            les["is_completed"] = les["id"] in completed_ids

    memory_cache.set("curriculum_tree", result_tree, ttl_seconds=300.0)
    return result_tree


def get_lesson_detail(lesson_id: str) -> Optional[Dict[str, Any]]:
    manifest = load_curriculum_manifest()
    target_meta: Optional[Dict[str, Any]] = None
    for mod in manifest:
        for les in mod.get("lessons", []):
            if les.get("id") == lesson_id:
                target_meta = les.copy()
                target_meta["module_id"] = mod.get("id")
                target_meta["module_title"] = mod.get("title")
                target_meta["track_id"] = mod.get("track_id", "track_1")
                target_meta["track_title"] = mod.get("track_title", "Track 1: Sintaksis Python & Algoritma")
                break
        if target_meta:
            break

    if not target_meta:
        return None

    content_rel_path = target_meta.get("content_path", "")
    full_path = settings.curriculum_dir / content_rel_path
    markdown_content = ""
    if full_path.exists():
        with open(full_path, "r", encoding="utf-8") as f:
            markdown_content = f.read()

    with Session(engine) as session:
        db_lesson = session.exec(select(ModuleLesson).where(ModuleLesson.id == lesson_id)).first()
        target_meta["is_completed"] = db_lesson.is_completed if db_lesson else False

    target_meta["markdown_content"] = markdown_content
    return target_meta


def mark_lesson_complete(lesson_id: str) -> Dict[str, Any]:
    today = date.today()
    streak_updated = False

    with Session(engine) as session:
        lesson = session.exec(select(ModuleLesson).where(ModuleLesson.id == lesson_id)).first()
        if lesson:
            lesson.is_completed = True
            session.add(lesson)

        user = session.exec(select(User).where(User.id == 1)).first()
        if user:
            if user.last_active_date == today:
                pass
            elif user.last_active_date == today - timedelta(days=1):
                user.daily_streak += 1
                user.last_active_date = today
                streak_updated = True
            else:
                user.daily_streak = 1
                user.last_active_date = today
                streak_updated = True
            session.add(user)

        session.commit()
        streak_count = user.daily_streak if user else 1

    memory_cache.invalidate("curriculum_tree")

    return {
        "lesson_id": lesson_id,
        "is_completed": True,
        "daily_streak": streak_count,
        "streak_updated": streak_updated,
    }
