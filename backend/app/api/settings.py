"""
CodePulse User Preferences & Settings API
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import UserPreference
from app.schemas.schemas import UserPreferenceUpdate, UserPreferenceResponse

router = APIRouter(prefix="/settings", tags=["Settings"])

DEFAULT_PREFS = {
    "theme": "light",
    "editor_font_size": 14,
    "editor_tab_size": 4,
    "default_language": "python",
    "cc_warning_threshold": 10,
    "cc_critical_threshold": 20,
    "ai_explanations_enabled": False
}

@router.get("", response_model=UserPreferenceResponse)
def get_user_settings(db: Session = Depends(get_db)):
    pref = db.query(UserPreference).first()
    if not pref:
        return UserPreferenceResponse(**DEFAULT_PREFS)
    return UserPreferenceResponse(
        theme=pref.theme or "light",
        editor_font_size=pref.editor_font_size or 14,
        editor_tab_size=pref.editor_tab_size or 4,
        default_language=pref.default_language or "python",
        cc_warning_threshold=pref.cc_warning_threshold or 10,
        cc_critical_threshold=pref.cc_critical_threshold or 20,
        ai_explanations_enabled=pref.ai_explanations_enabled or False
    )

@router.put("", response_model=UserPreferenceResponse)
def update_user_settings(data: UserPreferenceUpdate, db: Session = Depends(get_db)):
    pref = db.query(UserPreference).first()
    if not pref:
        # Create default user preference
        pref = UserPreference(
            user_id="default_user",
            theme=data.theme or "light",
            editor_font_size=data.editor_font_size or 14,
            editor_tab_size=data.editor_tab_size or 4,
            default_language=data.default_language or "python",
            cc_warning_threshold=data.cc_warning_threshold or 10,
            cc_critical_threshold=data.cc_critical_threshold or 20,
            ai_explanations_enabled=data.ai_explanations_enabled or False
        )
        db.add(pref)
    else:
        if data.theme is not None:
            pref.theme = data.theme
        if data.editor_font_size is not None:
            pref.editor_font_size = data.editor_font_size
        if data.editor_tab_size is not None:
            pref.editor_tab_size = data.editor_tab_size
        if data.default_language is not None:
            pref.default_language = data.default_language
        if data.cc_warning_threshold is not None:
            pref.cc_warning_threshold = data.cc_warning_threshold
        if data.cc_critical_threshold is not None:
            pref.cc_critical_threshold = data.cc_critical_threshold
        if data.ai_explanations_enabled is not None:
            pref.ai_explanations_enabled = data.ai_explanations_enabled

    db.commit()
    db.refresh(pref)
    return UserPreferenceResponse(
        theme=pref.theme or "light",
        editor_font_size=pref.editor_font_size or 14,
        editor_tab_size=pref.editor_tab_size or 4,
        default_language=pref.default_language or "python",
        cc_warning_threshold=pref.cc_warning_threshold or 10,
        cc_critical_threshold=pref.cc_critical_threshold or 20,
        ai_explanations_enabled=pref.ai_explanations_enabled or False
    )
