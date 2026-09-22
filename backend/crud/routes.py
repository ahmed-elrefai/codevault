from fastapi import APIRouter, Depends, HTTPException, Request, Response
from datetime import datetime, timezone
import io
import os
from backend.settings import ROOT_DIR
from backend.databases.db import AbstractDatabase, get_db
from backend.databases.validators import (UserCreate, UserUpdate, UserResponse,
                                DocumentCreate, DocumentUpdate, DocumentResponse)
from backend.utils.security import hash_password 

from backend.auth.auth import get_current_user

router = APIRouter(prefix=os.getenv("ROOT_ENDPOINT", "/api/v1"))

@router.get("/users", response_model=list[UserResponse])
async def get_users(limit: int = 10, offset: int = 0, db: AbstractDatabase = Depends(get_db)):
    query = "SELECT * FROM users LIMIT $1 OFFSET $2"
    result = await db.fetch(query, limit, offset)
    return result if result else []

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: int, db: AbstractDatabase = Depends(get_db)):
    query = "SELECT * FROM users WHERE id = $1"
    result = await db.fetchrow(query, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return result


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user: UserUpdate, db: AbstractDatabase = Depends(get_db), current_user: UserResponse = Depends(get_current_user)):
    # AUTHORIZATION
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # UPDATE USER
    query = "UPDATE users SET name = $2, email = $3, password = $4 WHERE id = $1 RETURNING *"
    hashed_pwd = hash_password(user.password)
    try:
        result = await db.fetchrow(query, user_id, user.name, user.email, hashed_pwd)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error: {}".format(e))
    
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return result

@router.delete("/users/{user_id}")
async def delete_user(user_id: int, db: AbstractDatabase = Depends(get_db), current_user: UserResponse = Depends(get_current_user)):
    # AUTHORIZATION
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # DELETE USER
    query = "DELETE FROM users WHERE id = $1"
    try:
        await db.execute(query, user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error: {}".format(e))
    
    return {"message": "User deleted successfully"}


@router.post("/documents")
async def create_document(document: DocumentCreate, db: AbstractDatabase = Depends(get_db), current_user: UserResponse = Depends(get_current_user)):
    
    query = "INSERT INTO documents (title, content, owner_id, visibility, burn_after_read, expires_at) VALUES ($1, $2, $3, $4, $5, $6)"
    try:
        await db.execute(query, document.title, document.content, current_user.id, document.visibility, document.burn_after_read, document.expires_at)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error: {}".format(e))
    
    return {"message": "Document created successfully"}

@router.get("/documents", response_model=list[DocumentResponse])
async def get_documents(db: AbstractDatabase = Depends(get_db), current_user: UserResponse = Depends(get_current_user), limit: int = 10, offset: int = 0):
    query = "SELECT * FROM documents WHERE owner_id = $1 LIMIT $2 OFFSET $3"
    result = await db.fetch(query, current_user.id, limit, offset)
    return result

@router.get("/documents/{document_id}", response_model=DocumentResponse)
async def get_document_by_id(document_id: int, db: AbstractDatabase = Depends(get_db)):
    query = "SELECT * FROM documents WHERE id = $1"
    try:
        result = await db.fetchrow(query, document_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error: {}".format(e))
    
    if not result:
        raise HTTPException(status_code=404, detail="Document not found")
    return result

@router.put("/documents/{document_id}", response_model=DocumentResponse)
async def update_document(document_id: int, document: DocumentUpdate, db: AbstractDatabase = Depends(get_db), current_user: UserResponse = Depends(get_current_user)):
    # Verify ownership first
    check_query = "SELECT owner_id FROM documents WHERE id = $1"
    doc = await db.fetchrow(check_query, document_id)
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    doc_owner_id = doc['owner_id'] if isinstance(doc, dict) else doc.owner_id
    
    if doc_owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to update this document")

    # Update without changing owner, and set updated_at
    query = "UPDATE documents SET title = $2, content = $3, visibility = $4, burn_after_read = $5, expires_at = $6, updated_at = NOW() WHERE id = $1 RETURNING *"
    try:
        result = await db.fetchrow(query, document_id, document.title, document.content, document.visibility, document.burn_after_read, document.expires_at)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error: {}".format(e))
    
    if not result:
        raise HTTPException(status_code=404, detail="Document not found")
    return result

@router.delete("/documents/{document_id}")
async def delete_document(document_id: int, db: AbstractDatabase = Depends(get_db), current_user: UserResponse = Depends(get_current_user)):
    # Verify ownership first
    check_query = "SELECT owner_id FROM documents WHERE id = $1"
    doc = await db.fetchrow(check_query, document_id)
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    doc_owner_id = doc['owner_id'] if isinstance(doc, dict) else doc.owner_id
    
    if doc_owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to delete this document")

    query = "DELETE FROM documents WHERE id = $1"
    try:
        await db.execute(query, document_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error: {}".format(e))
    
    return {"message": "Document deleted successfully"}

from fastapi.responses import PlainTextResponse

async def fetch_and_validate_snippet(document_id: int, db: AbstractDatabase, is_og_image: bool = False, skip_increment: bool = False):
    query = "SELECT * FROM documents WHERE id = $1"
    try:
        result = await db.fetchrow(query, document_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error: {}".format(e))
    
    if not result:
        raise HTTPException(status_code=404, detail="Document not found")
        
    visibility = result["visibility"] if isinstance(result, dict) else getattr(result, "visibility", None)
    if visibility != "public":
        raise HTTPException(status_code=403, detail="This snippet is private")

    expires_at = result["expires_at"] if isinstance(result, dict) else getattr(result, "expires_at", None)
    if expires_at:
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at <= datetime.now(timezone.utc):
            raise HTTPException(status_code=410, detail="This snippet has expired")

    # If it's not just an OG image generation check, increment view count or burn
    if not is_og_image:
        burn_after_read = result["burn_after_read"] if isinstance(result, dict) else getattr(result, "burn_after_read", False)
        if burn_after_read:
            await db.execute("DELETE FROM documents WHERE id = $1", document_id)
        elif not skip_increment:
            await db.execute("UPDATE documents SET view_count = view_count + 1 WHERE id = $1", document_id)

    return result

@router.get("/sn/{document_id}")
async def get_snippet(document_id: int, request: Request, response: Response, db: AbstractDatabase = Depends(get_db)):
    cookie_name = f"viewed_sn_{document_id}"
    has_viewed = request.cookies.get(cookie_name)
    
    result = await fetch_and_validate_snippet(document_id, db, skip_increment=bool(has_viewed))
    
    if not has_viewed:
        response.set_cookie(key=cookie_name, value="1", max_age=86400, httponly=True)
        
    current_view_count = result["view_count"] if isinstance(result, dict) else getattr(result, "view_count", 0)
    if not has_viewed and not (result["burn_after_read"] if isinstance(result, dict) else getattr(result, "burn_after_read", False)):
        current_view_count += 1

    return {
        "snippet": result["content"] if isinstance(result, dict) else getattr(result, "content", None),
        "view_count": current_view_count,
        "expires_at": result["expires_at"] if isinstance(result, dict) else getattr(result, "expires_at", None),
        "burn_after_read": result["burn_after_read"] if isinstance(result, dict) else getattr(result, "burn_after_read", False)
    }

@router.get("/sn/{document_id}/raw")
async def get_snippet_raw(document_id: int, db: AbstractDatabase = Depends(get_db)):
    result = await fetch_and_validate_snippet(document_id, db)
    content = result["content"] if isinstance(result, dict) else getattr(result, "content", None)
    # Strip AI docs if present to give clean bash scripts etc
    lines = content.split('\n')
    if 'AI GENERATED DOCUMENTATION' in content:
        code_start = 0
        in_ai = False
        for i, line in enumerate(lines):
            l = line.strip()
            if l in ['/**', '<!--', '"""'] and i+1 < len(lines) and 'AI GENERATED' in lines[i+1]:
                in_ai = True
            if in_ai and l in ['*/', '-->', '"""']:
                code_start = i + 1
                break
        while code_start < len(lines) and lines[code_start].strip() == '':
            code_start += 1
        content = '\n'.join(lines[code_start:])

    return PlainTextResponse(content)

@router.get("/sn/{document_id}/og-image")
async def get_snippet_og_image(document_id: int, db: AbstractDatabase = Depends(get_db)):
    try:
        from PIL import Image, ImageDraw, ImageFont, ImageFilter
    except ImportError:
        raise HTTPException(status_code=500, detail="Pillow library not installed for image generation")
        
    result = await fetch_and_validate_snippet(document_id, db, is_og_image=True)
    title = result["title"] if isinstance(result, dict) else getattr(result, "title", "Code Snippet")
    
    # Create image
    width, height = 1200, 630
    img = Image.new('RGB', (width, height), color=(18, 18, 18))
    draw = ImageDraw.Draw(img)
    
    try:
        # Try to use a nice font if available, fallback to default
        font_large = ImageFont.truetype("arial.ttf", 80)
        font_small = ImageFont.truetype("arial.ttf", 40)
    except IOError:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
        
    # Draw simple background shapes for style
    draw.ellipse((-100, -100, 300, 300), fill=(255, 215, 0, 30))
    
    # Text
    draw.text((100, 200), "Codevlt Snippet", fill=(255, 215, 0), font=font_small)
    draw.text((100, 280), title[:25] + ("..." if len(title) > 25 else ""), fill=(255, 255, 255), font=font_large)
    
    # Add a pseudo code block (blurred effect)
    code_box = (650, 150, 1100, 480)
    draw.rectangle(code_box, fill=(10, 10, 10), outline=(50, 50, 50), width=2)
    for i in range(10):
        draw.line((680, 180 + i*30, 800 + (i*40 % 200), 180 + i*30), fill=(80, 150, 255) if i%3==0 else (100, 200, 100) if i%2==0 else (200, 200, 200), width=10)
    
    img = img.filter(ImageFilter.BoxBlur(1))
    
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return Response(content=buf.getvalue(), media_type="image/png")
