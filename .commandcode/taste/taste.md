# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# Django
- When removing a package with model fields, update ALL migration files that reference it, not just the current model. Confidence: 0.80

# Blog Layout
- Display featured posts in a dedicated hero/featured section at the top of the home page. Confidence: 0.75
- Display latest posts in the bento grid section below the featured section. Confidence: 0.75
- Featured posts are for specific/special posts, not to replace the latest posts grid. Confidence: 0.75

# Admin Dashboard
- Use light theme instead of dark theme for admin dashboard. Confidence: 0.85

# UI/UX
- Prioritize user-friendly layouts and designs. Confidence: 0.70
- Use orange-based color palette: Primary `#F97316`, Accent `#FB923C`, Complement `#0EA5E9`, Dark `#1A1A2E`, Surface `#FFF7ED`. Confidence: 0.85

# Authentication
- Do not implement OAuth or login systems unless explicitly requested. Confidence: 0.80
- Do not add Admin buttons or links to the public navbar. Confidence: 0.75
