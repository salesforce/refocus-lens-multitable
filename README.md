# refocus-lens-multitable

## MultiTable

A fluid multi-table layout. Each table groups subjects together under a shared parent.

![Sample1](/2017-04-17_15-40-14.png)

![Sample2](/2017-04-17_15-40-25.png)

### Setup

1. Git clone this repo.

1. Install the Refocus Lens Developer Kit.

        git clone https://github.com/salesforce/refocus-ldk
        cd refocus-ldk
        npm install

1. Copy this lens into your `refocus-ldk/Lenses` directory.

        cp -r ../refocus-lens-multitable/MultiTable Lenses/MultiTable/

1. Configure the Refocus LDK.

        npm config set refocus-ldk:lens MultiTable

1. Compile the lens.

        npm run compile

Note: The bootstrap library included in this lens is built from bootstrap 4 alpha with flex enabled.


### Test

Run the Refocus LDK's `test` script to run all the tests under `refocus-ldk/Lenses/MultiTable/test`.

```
npm test
```

### Build

Run the Refocus LDK's `build` script to generate the lens library (`refocus-ldk/dist/MultiTable.zip`).

```
npm build
```

### Deploy

Use the Refocus UI or API (`/v1/lenses`) to deploy the lens.
