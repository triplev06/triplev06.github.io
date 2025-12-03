# My Portfolio Website

Hey! This is my personal portfolio site. I built it to show off my projects and hackathon wins.

## What's Cool About It

### The Fun Stuff

**Particle Animation**
- 80 particles floating around that react when you move your mouse
- They connect to each other when they get close
- Runs at 60fps without lagging

**Background Colors**
- The background slowly shifts between blue, purple, and orange
- Uses canvas animations for smooth transitions

**3D Card Effects**
- Hover over project cards and they tilt toward your mouse
- Looks kinda like those holographic trading cards
- Works on the project cards, achievements, and stats

**Custom Cursor**
- Trail of dots follows your mouse (desktop only)
- Each dot follows the one before it
- Disabled on mobile because it's annoying on touchscreens

**Typing Animation**
- My subtitle rotates through different titles
- Has the blinking cursor effect
- Cycles through: AI/ML Enthusiast → Full-Stack Developer → Hackathon Winner → Problem Solver

### Scroll Stuff

**Things Fade In As You Scroll**
- Cards and sections animate when they come into view
- Uses Intersection Observer for good performance
- Only animates once (doesn't repeat every time you scroll)

**Counting Numbers**
- The "10+ Projects" stat counts up from 0
- Triggers when you scroll to it
- Looks pretty satisfying

### The Sections

**Hero** - Big intro with my name and what I do

**About** - Quick bio + some stats (projects, awards, years coding)

**Experience** - Timeline of my jobs
- Web Designer at Sweeja Jewelry (current)
- Accenture Internship (summer 2022)

**Projects** - My best work:
- TheoHealth (AI health diary - won 1st and 3rd place)
- GothamAI (Batman-themed AI chatbot with voice)
- BLACKOUT (Power grid simulator - won 2nd)
- AutoPatt (Semiconductor tracker - won 1st)
- And a few more

**Skills** - All the languages and tools I know

**Achievements** - Hackathon wins and awards

**Contact** - Email, phone, LinkedIn

## Tech Stack

- HTML/CSS/JavaScript (no frameworks!)
- Google Fonts (Inter)
- Canvas API for particles
- That's it - kept it simple

## Running It Locally

Just open `index.html` in your browser. Or if you want a local server:

```bash
# Python
python -m http.server 8000

# Or use VS Code Live Server extension
```

## Deploying

**GitHub Pages:**
1. Push to GitHub
2. Settings → Pages → Select main branch
3. Done

**Vercel:**
```bash
npm i -g vercel
vercel
```

**Netlify:**
Just drag the folder onto netlify.com

## Customization

Want to use this for your own site?

**Update Your Info:**
- Edit `index.html` - change the name, bio, projects, etc.
- Edit `styles.css` - the colors are in the `:root` section at the top
- Edit `script.js` - change the typing phrases around line 310

**Change Colors:**
```css
:root {
    --primary-color: #3b82f6;  /* Main blue */
    --secondary-color: #8b5cf6; /* Purple */
    --accent-color: #f59e0b;    /* Orange */
}
```

## Performance

- Loads fast (no heavy libraries)
- 60fps animations
- Works on phones
- Tested on Chrome, Firefox, Safari, Edge

## File Structure

```
├── index.html       # Everything's here
├── styles.css       # All the styles
├── script.js        # Animations and interactions
├── vercel.json      # Vercel config
└── README.md        # You are here
```

## Credits

- Built by me (Vikranth Vegesina)
- Font: Inter by Rasmus Andersson
- Inspired by modern portfolios and Three.js effects

## License

Feel free to use this as a template, just don't copy my personal info :)

## Contact

- Email: vegesinav@gmail.com
- LinkedIn: [linkedin.com/in/vik-vegesina](https://www.linkedin.com/in/vik-vegesina)
- Phone: (614) 436-3462

---

Built in December 2024. No AI was harmed in the making of this website.
