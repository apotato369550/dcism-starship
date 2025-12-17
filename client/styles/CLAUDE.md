# Client Styles

CSS organization using modular, component-focused architecture with CSS custom properties (variables).

## Architecture

Styles split into logical files to keep them maintainable and avoid conflicts.

**Import Order** (in `index.html`):
1. `variables.css` - Color palette and global custom properties
2. `base.css` - Body, fonts, global reset
3. `overlays.css` - Login, mode selection, game over screens
4. `ui-panel.css` - Left sidebar (command deck)
5. `shop.css` - Shop grid and unit items
6. `inspector.css` - Tile inspector panel
7. `canvas.css` - Game canvas container
8. `chat.css` - Chat box styles
9. `tooltips.css` - Tile info tooltips

## variables.css

**Purpose**: Define all colors, sizes, and reusable values using CSS custom properties.

**Color Palette** (vaporwave aesthetic):
```css
--neon-pink: #ff10fe
--neon-magenta: #ff00ff
--neon-cyan: #00ffff
--neon-blue: #00f0ff
--neon-purple: #b300ff
--neon-green: #00ff66
--dark-purple: #2b1d3d
```

**Sizes**:
```css
--base-font-size: 16px
--tile-size: 40px  /* from TILE_SIZE in Renderer */
```

**Fonts**:
```css
--font-display: 'Orbitron', monospace        /* Titles */
--font-ui: 'Rajdhani', monospace            /* UI elements */
--font-retro: 'Press Start 2P', monospace   /* Retro text */
```

**When to Add**:
- New color used in multiple places → add as variable
- New font → add here, then use across files
- Repeated size values → extract to variable

## base.css

**Purpose**: Global reset and foundational styles.

**Includes**:
- `body` reset: no margin, dark background, correct font
- `input`, `button` reset: remove browser defaults
- Global text color and transitions

**When to Modify**:
- Changing overall font/size → update here
- Dark mode toggle → change background/text colors in variables
- Global spacing unit → define and use throughout

## overlays.css

**Purpose**: Full-screen modal overlays for menus.

**Classes**:
- `.overlay` - Full screen container, centered flex layout
- `.hidden` - Display: none (toggled by JS)
- `.big-btn` - Large button with neon border glow effect

**Overlays**:
- `#modeOverlay` - Game mode selection
- `#botsOverlay` - Bot count selection
- `#loginOverlay` - Username entry
- `#gameOverOverlay` - Loss screen
- `#victoryOverlay` - Win screen

**When to Add**:
- New game phase (settings, tutorial, pause) → create new `#xxxOverlay` div
- Update styles: `.overlay` styles apply to all
- Add unique styling if needed

## ui-panel.css

**Purpose**: Left sidebar UI (command deck).

**Layout**:
- `#command-deck` - Main container, left side
- `.stat-display` - Energy/mps display
- `#cd-container` / `#cd-bar` - Cooldown progress bar
- `.audio-toggle` - SFX/Music toggle buttons
- `#inspector` - Tile inspector panel

**Key Classes**:
- `.hidden` - Toggle visibility on/off
- `.active` - Toggle button state (green when active)

**When to Modify**:
- Change stat display format → update `.stat-display` and `.stat-val`
- Add new sidebar element → add to `#command-deck`, style in this file
- Adjust width/positioning → modify container width

## shop.css

**Purpose**: Shop UI for unit selection.

**Layout**:
- `#shop-bar` - Bottom bar containing shop items
- `#shop-items-container` - Grid of unit items
- Shop items organized by type: "PRODUCTION" and "MILITARY"

**Key Classes**:
- `.shop-item` - Individual unit button
- `.shop-category-title` - Section headers
- `.selected` - Highlight when unit is selected for building

**Modal** (`#shop-modal`):
- `.modal` - Overlay for detailed unit info
- `.modal-content` - Centered content box
- `.modal-close` - X button
- `.modal-icon` - Large emoji
- `.modal-stat` - Cost/effect rows

**When to Modify**:
- Change shop layout (grid cols) → adjust grid-template-columns
- Reorder categories → modify shop rendering in ShopUI.js
- Add unit details → modify modal structure (cosmetic changes don't need CSS)

## inspector.css

**Purpose**: Tile detail panel (appears when tile selected).

**Layout**:
- `#inspector` - Container for tile info
- `#insp-title` - Tile name
- `#insp-info` - Defense/unit info
- `#btn-demolish` - Demolish button

**Button Styles**:
- `.action-btn` - Standard action button
- `.btn-destruct` - Red button for destructive actions

**When to Modify**:
- Add more tile info fields → add HTML elements, style here
- Change button colors → modify `.btn-destruct`

## canvas.css

**Purpose**: Game area and canvas styling.

**Layout**:
- `#game-container` - Canvas parent
- `#gameCanvas` - The actual canvas element
- `#tooltip` - Tile info tooltip

**Canvas Sizing**:
- Fills entire available space
- Responsive to window resize

**Tooltip**:
- `.hidden` - Toggle visibility
- Positioned absolutely, follows mouse

**When to Modify**:
- Canvas background/effects → modify `#gameCanvas` background
- Tooltip style/colors → update `.tooltip` styles

## chat.css

**Purpose**: Chat box UI.

**Layout**:
- `#chat-box` - Container, bottom right
- `#chat-msgs` - Message list
- Message divs with user color

**Styling**:
- Scrollable message area
- Input field for new messages
- User colors from server (inline styles)

**When to Modify**:
- Change chat position → modify `#chat-box` positioning
- Change message colors → still uses server colors
- Add timestamps → modify message rendering in ChatUI

## tooltips.css

**Purpose**: Hover tooltips for tiles.

**Classes**:
- `#tooltip` - Tooltip container
- `.hidden` - Toggle visibility

**Content**:
- Tile name (colored by owner)
- Defense value
- "OCCUPIED" label if owned

**When to Modify**:
- Change tooltip appearance → update tooltip styles
- Add more info → modify content in Renderer.updateTooltip()

---

## Common Patterns

### Centering Flex Layout
```css
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
```

### Neon Glow Effect
```css
text-shadow: 0 0 10px var(--neon-cyan);
box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
```

### Responsive Grid
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
gap: 10px;
```

---

## Design System

**Vaporwave Aesthetic**:
- Dark purple background (`--dark-purple`)
- Bright neon accents (pink, cyan, green)
- Glowing text and box-shadows
- Geometric, minimal layouts
- Monospace fonts (`Orbitron`, `Rajdhani`, `Press Start 2P`)

**Component Hierarchy**:
- Overlays: Full-screen, highest z-index
- Modals: Centered on overlays
- Panels: Sidebar/fixed position
- UI elements: Standard positioning
- Canvas: Lowest z-index (background)

---

## Maintenance

### After Adding New UI Element
- [ ] Create new CSS file or add to existing related file
- [ ] Use CSS custom properties for colors/sizes
- [ ] Add `.hidden` class support for toggling visibility
- [ ] Test responsive (resize window)
- [ ] Check color contrast (readability)
- [ ] Verify matches vaporwave aesthetic

### After Changing Colors
- [ ] Update variables.css with new variable
- [ ] Search for hardcoded colors, replace with variables
- [ ] Test in all UI sections
- [ ] Check both light and dark scenarios

### After Changing Fonts
- [ ] Update variables.css
- [ ] Apply to relevant sections
- [ ] Test readability at different sizes
- [ ] Check special characters render correctly

### Performance Notes
- CSS is lightweight (no animations, minimal effects)
- Canvas rendering handled by JavaScript (Renderer.js)
- No compiled/processed CSS needed
- Direct file loading in browser
