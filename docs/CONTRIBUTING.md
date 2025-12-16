# Contributing Guide - DCISM Starship 2.0

## Getting Started

1. **Fork and clone the repository**
2. **Install dependencies**: `npm install`
3. **Read the documentation**:
   - `CLAUDE.md` - Developer guidance
   - `docs/ARCHITECTURE.md` - Architecture overview
   - `README.md` - Project overview

## Development Setup

### Running the Development Server
```bash
npm run dev    # Starts with nodemon for hot reload
```
The game will be available at `http://localhost:3000`

### Code Quality

Before committing, ensure code quality:
```bash
npm run lint:fix    # Fix ESLint issues
npm run format      # Format with Prettier
npm test            # Run tests
```

## Code Style

- **ESLint**: Enforces consistent JavaScript style (4-space indentation, single quotes)
- **Prettier**: Handles auto-formatting
- **Run before committing**: `npm run lint:fix && npm run format`

## Project Structure

Familiarize yourself with the refactored structure:
- **Server**: `server/index.js`, `services/`, `utils/`, `config/`
- **Client**: `client/scripts/` (ES6 modules), `client/styles/` (separated CSS)
- **Shared**: `shared/constants.js` for both client and server
- **Tests**: `tests/` directory with Jest framework

## Making Changes

### Adding a New Game Mechanic

1. **Server-side logic**: Add method to `GameEngine` or create new service
2. **Socket handler**: Add handler in `server/index.js`
3. **Client-side logic**: Add handler in appropriate game module
4. **UI updates**: Update relevant UI module if needed
5. **Tests**: Add tests in `tests/` directory

Example: Adding a new building type
```bash
# 1. Add to config/tiles.js
# 2. No other changes needed! Server/client auto-support it
```

### Adding a New UI Component

1. **Create component class**: `client/scripts/ui/NewComponent.js`
   ```javascript
   export class NewComponent {
       constructor() {
           // Initialize DOM elements
       }
       update(data) {
           // Update display
       }
   }
   ```

2. **Import in main.js**: `import { NewComponent } from './ui/NewComponent.js'`

3. **Initialize and coordinate**: Add to UIManager or main.js

### Adding Input Handling

1. **Create handler**: Extend `MouseHandler` or `KeyboardHandler`
2. **Add method**: `onCustomEvent()`
3. **Call from main.js**: `handler.init(onCustomEvent)`

### Server-Side Module

1. **Create file**: `server/services/NewService.js` or `server/utils/newUtility.js`
   ```javascript
   module.exports = class NewService {
       method() {
           // Implementation
       }
   };
   ```

2. **Import in server/index.js**: `const NewService = require('./services/NewService')`

3. **Use**: `const service = new NewService(); service.method();`

## Testing

Tests use **Jest** and are located in `tests/`:

### Writing Tests

```javascript
describe('Feature Name', () => {
    test('should do something', () => {
        expect(result).toBe(expected);
    });
});
```

### Running Tests
```bash
npm test                # Run once
npm run test:watch      # Watch mode
```

### Test Coverage
Aim for meaningful tests, especially for:
- Game rules validation
- Utility functions
- State management
- Server-side logic

## Git Workflow

1. **Create feature branch**: `git checkout -b feature/my-feature`
2. **Make changes** with focused commits
3. **Ensure code quality**: `npm run lint:fix && npm run format`
4. **Run tests**: `npm test`
5. **Create pull request** with clear description

## Common Tasks

### Modifying Game Balance
Edit `.env` file:
```env
COOLDOWN_MS=3000
STARTING_ENERGY=10
BASE_TILE_DEFENSE=100
```

### Adding a Production Building
1. Open `config/tiles.js`
2. Add entry to `TILE_TYPES`:
   ```javascript
   'my_generator': {
       name: "My Generator",
       type: 'prod',
       cost: 100,
       val: 10,
       symbol: '⚙️',
       upgrade: null
   }
   ```
3. Save - game automatically includes it!

### Adding a Military Building
Follow same steps as production, but with `type: 'mil'` and `val` representing defense bonus

### Fixing a Bug

1. **Create test** that reproduces the bug
2. **Fix the bug** in the appropriate module
3. **Verify test passes**: `npm test`
4. **Run all tests**: `npm test`

## Server Architecture Reminders

- **GameEngine**: Central state management
- **Utilities**: Reusable functions (geometry, validation)
- **Configuration**: All settings in `server/config/environment.js`
- **Socket handlers**: Game actions in `server/index.js`
- **Economy loop**: Passive income calculation

## Client Architecture Reminders

- **main.js**: Coordinates all systems
- **GameState**: Client-side state mirror
- **Renderer**: Canvas rendering
- **Handlers**: Input event management
- **UI modules**: Component rendering
- **SocketClient**: Network communication

## Performance Tips

- Minimize DOM updates in UI modules
- Cache frequently accessed DOM elements
- Use efficient selectors in CSS
- Profile with browser DevTools
- Check server logs for bottlenecks

## Documentation

- Update `CLAUDE.md` if changing development process
- Update `docs/ARCHITECTURE.md` if changing structure
- Add JSDoc comments to complex functions
- Keep README.md current with new features

## Getting Help

1. Check existing documentation
2. Look at similar implementations in codebase
3. Review tests for usage examples
4. Open an issue with clear description

## Pull Request Checklist

- [ ] Code follows project style (ESLint, Prettier)
- [ ] Tests pass: `npm test`
- [ ] New tests added for new functionality
- [ ] Documentation updated if needed
- [ ] No breaking changes to API
- [ ] Clear commit messages
- [ ] Branch is up to date with main

## Commit Message Convention

```
type: description

- Detailed explanation if needed
- List any related issues

Fixes #123
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`

## Code Review Process

All PRs will be reviewed for:
- Code quality and style
- Architecture and modularity
- Test coverage
- Documentation completeness
- Performance implications
- Security considerations

## Questions?

Refer to:
- `CLAUDE.md` for development guidance
- `docs/ARCHITECTURE.md` for architecture details
- `README.md` for project overview
- Code comments for implementation details

Welcome to the DCISM Starship 2.0 project! 🚀
