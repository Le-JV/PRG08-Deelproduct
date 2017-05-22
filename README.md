# PRG08-Deelproduct

## Balloon popper
Live version: https://omniscientjv.github.io/PRG08-Deelproduct/dist/

### Running the project

Checkout/download/fork the project. Run `npm install` in the root folder. After that run `node server.js`. The game is now playable at (your IP) *:8000.

Alternatively you can serve the contents of the `dist` folder using any webserver (serving using the file:// protocol does not work because of CORS).

The source code can be compiled using a Typescript transpiler. By default the `tsconfig.json` is configured to be ES5 compatible.

### UML
![UML](uml.png?raw=true "UML")

**Singleton**
See the Game.ts class.

**Interface & strategy pattern**
See the Collider.ts interface and BoxCollider for implementation.

**Static utility method**
Used in the cMath.ts class and Vector2.ts class.