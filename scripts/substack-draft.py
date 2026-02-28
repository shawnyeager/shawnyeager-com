# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "click>=8.0",
#     "python-substack>=0.1.17",
#     "python-frontmatter>=1.0",
# ]
# ///
"""Create a Substack draft from a Hugo markdown file.

Usage:
    uv run scripts/substack-draft.py content/notes/my-post.md
    uv run scripts/substack-draft.py content/essays/my-essay.md --dry-run

Env vars (set in .env or export):
    SUBSTACK_PUBLICATION_URL  e.g. https://sideband.substack.com
    SUBSTACK_COOKIE           cookie string from browser devtools (preferred)
    SUBSTACK_EMAIL            } alternative to cookie
    SUBSTACK_PASSWORD         }
"""
import os
import sys
from pathlib import Path
from urllib.parse import urljoin

import click
import frontmatter
from substack import Api
from substack.post import Post

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent


def parse_post(post_path: Path) -> frontmatter.Post:
    post = frontmatter.load(str(post_path))
    title = post.get("title")
    if not title:
        click.echo("Error: frontmatter must include 'title'", err=True)
        sys.exit(1)
    return post


def resolve_hero(post_path: Path, post_meta: dict, hero_override: str | None) -> Path | None:
    if hero_override:
        return Path(hero_override)

    hero_image = post_meta.get("hero_image")
    if hero_image:
        for base in [REPO_ROOT / "assets", REPO_ROOT / "static", REPO_ROOT]:
            candidate = base / hero_image
            if candidate.exists():
                return candidate
        click.echo(f"Warning: hero_image '{hero_image}' not found", err=True)

    return None


def get_api() -> Api:
    publication_url = os.environ.get("SUBSTACK_PUBLICATION_URL")
    if not publication_url:
        click.echo("Error: SUBSTACK_PUBLICATION_URL is required", err=True)
        sys.exit(1)

    cookie = os.environ.get("SUBSTACK_COOKIE")
    email = os.environ.get("SUBSTACK_EMAIL")
    password = os.environ.get("SUBSTACK_PASSWORD")

    if cookie:
        api = Api(cookies_string=cookie, publication_url=publication_url)
    elif email and password:
        api = Api(email=email, password=password, publication_url=publication_url)
    else:
        click.echo(
            "Error: set SUBSTACK_COOKIE or SUBSTACK_EMAIL + SUBSTACK_PASSWORD",
            err=True,
        )
        sys.exit(1)

    # Force substack.com domain — the library auto-resolves custom domains
    # which can have SSL issues
    api.publication_url = urljoin(publication_url.rstrip("/") + "/", "api/v1")
    return api


def check_duplicate(api: Api, title: str) -> None:
    drafts = api.get_drafts(filter="draft", limit=25)
    for draft in drafts:
        if draft.get("draft_title") == title:
            draft_id = draft.get("id")
            click.echo(
                f"Error: draft already exists with title '{title}' (id: {draft_id})",
                err=True,
            )
            click.echo("Delete it on Substack or choose a different title.", err=True)
            sys.exit(1)


@click.command()
@click.argument("post", type=click.Path(exists=True))
@click.option("--hero", type=click.Path(exists=True), default=None, help="Override hero image path")
@click.option("--dry-run", is_flag=True, help="Parse and validate without creating a draft")
def main(post, hero, dry_run):
    """Create a Substack draft from a Hugo markdown file."""
    post_path = Path(post)
    parsed = parse_post(post_path)

    title = parsed["title"]
    subtitle = parsed.get("subtitle")
    is_draft = parsed.get("draft", False)
    body = parsed.content
    hero_path = resolve_hero(post_path, parsed.metadata, hero)

    if is_draft:
        click.echo(f"Error: '{post_path.name}' is marked as draft: true", err=True)
        sys.exit(1)

    click.echo(f"Title: {title}")
    click.echo(f"Subtitle: {subtitle or '(none)'}")
    click.echo(f"Hero: {hero_path or '(none)'}")
    click.echo(f"Body: {len(body)} chars")

    if dry_run:
        click.echo("Dry run — no draft created.")
        return

    api = get_api()
    user_id = api.get_user_id()

    check_duplicate(api, title)

    # Upload hero image
    hero_url = None
    if hero_path:
        click.echo(f"Uploading hero image: {hero_path}")
        image_data = api.get_image(str(hero_path))
        hero_url = image_data.get("url")

    # Build post — hero as first element in body, then markdown content
    substack_post = Post(title=title, subtitle=subtitle or "", user_id=user_id)
    if hero_url:
        substack_post.add({"type": "captionedImage", "src": hero_url})
    substack_post.from_markdown(body, api=api)

    # Create draft (with cover_image for social preview)
    click.echo("Creating draft...")
    draft_body = substack_post.get_draft()
    if hero_url:
        draft_body["cover_image"] = hero_url
    draft = api.post_draft(draft_body)
    draft_id = draft.get("id")
    if not draft_id:
        click.echo("Error: draft creation failed — no ID returned", err=True)
        sys.exit(1)

    publication_url = os.environ.get("SUBSTACK_PUBLICATION_URL", "")
    base = publication_url.rstrip("/")
    click.echo(f"Draft created: {base}/publish/post/{draft_id}")


if __name__ == "__main__":
    main()
