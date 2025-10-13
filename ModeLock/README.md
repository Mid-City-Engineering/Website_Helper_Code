## Widget Installation Order

⚠️ CRITICAL: Install widgets in this exact order:

1. **ModeLock Base Styles** (REQUIRED - Place at top of page)
   - Loads CSS variables, resets, universal components
   - Only install ONCE per page

2. **Section Widgets** (Install in any order below base)
   - Hero Section
   - Problem Section
   - Solution Section
   - Specs Section
   - CTA Section

### Testing Checklist
- [ ] Base styles widget is first
- [ ] All sections render correctly
- [ ] No duplicate style imports
- [ ] Browser console shows no 404s
