from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..models.base import get_db
from ..models.entities import KnowledgeArticle
from ..schemas.schemas import KnowledgeArticleResponse

router = APIRouter(prefix="/kb", tags=["Knowledge Base"])

@router.get("/", response_model=List[KnowledgeArticleResponse])
def get_articles(
    category: Optional[str] = None,
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(KnowledgeArticle)
    if category:
        q = q.filter(KnowledgeArticle.category == category)
    if query:
        search = f"%{query}%"
        q = q.filter(
            KnowledgeArticle.title.ilike(search) |
            KnowledgeArticle.content.ilike(search) |
            KnowledgeArticle.tags.ilike(search)
        )
    return q.all()

@router.get("/{article_id}", response_model=KnowledgeArticleResponse)
def get_article(article_id: str, db: Session = Depends(get_db)):
    art = db.query(KnowledgeArticle).filter(KnowledgeArticle.article_id == article_id).first()
    return art
