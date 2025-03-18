#!/usr/bin/env python3
import sys
import os
import re

def extract_release_notes(version):
    """
    Extract release notes for a specific version from CHANGELOG.md
    """
    if not os.path.exists("CHANGELOG.md"):
        return None
    
    with open("CHANGELOG.md", "r") as file:
        content = file.read()
    
    # Look for the section with this version
    version_pattern = fr"## \[?{re.escape(version)}\]?"
    next_version_pattern = r"## \[?"
    
    # Find the start of the section for this version
    match = re.search(version_pattern, content)
    if not match:
        return None
    
    start_pos = match.end()
    
    # Find the start of the next version section
    next_match = re.search(next_version_pattern, content[start_pos:])
    if next_match:
        end_pos = start_pos + next_match.start()
        notes = content[start_pos:end_pos].strip()
    else:
        # If no next version, take everything until the end
        notes = content[start_pos:].strip()
    
    return notes

def main():
    # Get version from command line argument
    if len(sys.argv) < 2:
        print("Usage: python get_changes.py <version>", file=sys.stderr)
        sys.exit(1)
    
    version = sys.argv[1]
    
    # Extract release notes
    release_notes = extract_release_notes(version)
    
    # If no release notes found, provide default text
    if not release_notes:
        event_name = os.environ.get("GITHUB_EVENT_NAME", "")
        if event_name == "push":
            tag_version = version
            release_notes = f"Release {tag_version}"
        else:
            release_notes = os.environ.get("INPUT_RELEASE_NOTES", f"Release {version}")
    
    # Format the output for GitHub Actions
    print(f"""notes<<EOF
{release_notes}
EOF""")

if __name__ == "__main__":
    main()
