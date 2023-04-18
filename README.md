# ncov-clade-schema

https://ncov-clades-schema.vercel.app/

Visualizes current tree of SARS-CoV-2 clades. Allows to generate an SVG image of this tree.

<p align="center">
<a href="https://raw.githubusercontent.com/nextstrain/ncov-clades-schema/master/clades.svg" target="_blank" rel="noopener noreferrer">
  <img width="1000" alt="Tree of Nextstrain clades" src="clades.svg"/>
</a>
</p>

Comes originally from these sandboxes:

 - https://bl.ocks.org/trvrb/66b2c193117220200eb8e09190a43c85
 - https://codesandbox.io/s/nextstrain-clades-schema-43t2m
 - https://codesandbox.io/s/nextstrain-clades-schema-forked-cu6fy


## Development

Clone the repository and go to its directory.

### Develop locally

Have Node.js 12+ (latest LTS is recommended) and yarn 1.x installed. Run:

```bash
yarn install
yarn dev
```

Open browser at 

```
http://localhost:3000
```


### Develop in docker

Have Docker installed. Run

```bash
./docker/dev yarn install
./docker/dev yarn dev
```

Open browser at 

```
http://localhost:3000
```

### Updating with new clades

1. Add new clade to `src/clades.json` structure, in the right place
2. Run `https://github.com/nextstrain/ncov-clades-schema/blob/master/src/replace_colors.py` with the right parameters (old number of clades and new number of clades). Currently `--prev-row` should (probably) be 24. If a single clade is added, `--future-row` should be 25: `python src/replace_colors.py --prev-row 24 --future-row 25`
3. Set the colors of new clades to the ones suggested by the script (written to stdout)
4. Adjust the width of the svg as necessary in: `src/components/NextstrainCladesSchema.tsx`
5. Check results using e.g. `yarn dev` (after dev setup)
6. Commit, push
7. Save produced svg and update `clades.svg` in this repo (this is where the README and potentially also Nextclade gets the svg from, so this needs to be updated for changes to take effect), see https://github.com/nextstrain/ncov-clades-schema/commit/738d42762aec411c5da6e78d32b1c235601b08a5
