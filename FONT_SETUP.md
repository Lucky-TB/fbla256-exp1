# Apercu Pro Font Setup

This app is configured to use Apercu Pro as the primary font family. To complete the setup, you need to add the font files to the project.

## Steps to Add Apercu Pro Fonts

1. **Obtain Apercu Pro font files** (you need to have a license to use this font):
   - ApercuPro-Regular.ttf
   - ApercuPro-Medium.ttf
   - ApercuPro-Bold.ttf

2. **Add font files to the project**:
   - Place all font files in the `assets/fonts/` directory
   - The files should be named exactly:
     - `ApercuPro-Regular.ttf`
     - `ApercuPro-Medium.ttf`
     - `ApercuPro-Bold.ttf`

3. **Enable font loading**:
   - Uncomment the font loading lines in `app/_layout.tsx`:
   ```typescript
   'ApercuPro-Regular': require('../assets/fonts/ApercuPro-Regular.ttf'),
   'ApercuPro-Medium': require('../assets/fonts/ApercuPro-Medium.ttf'),
   'ApercuPro-Bold': require('../assets/fonts/ApercuPro-Bold.ttf'),
   ```

4. **Verify the setup**:
   - The fonts are already configured in:
     - `app/_layout.tsx` - Font loading (currently commented out)
     - `tailwind.config.js` - Tailwind font family configuration
     - `global.css` - Global font family setting

## Font Usage

- **Regular weight**: Used by default for all text
- **Medium weight**: Use `font-medium` class or `fontFamily: 'ApercuPro-Medium'`
- **Bold weight**: Use `font-bold` class or `fontWeight: '700'` (automatically uses ApercuPro-Bold)

## Note

If you don't have access to Apercu Pro fonts, you can:
1. Use a similar alternative font (like Inter, Circular, or System fonts)
2. Update the font names in `app/_layout.tsx` and `tailwind.config.js` to match your font files
3. Or remove the font configuration to use system defaults
