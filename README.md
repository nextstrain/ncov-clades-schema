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
