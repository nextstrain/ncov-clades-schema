#%%
import json

import matplotlib
import networkx as nx
import pandas as pd
import seaborn as sns

#%%
df = pd.read_csv('https://raw.githubusercontent.com/nextstrain/ncov/7796ad66ed51c12663bd7b5ecc3c1084bda41151/defaults/clade_hierarchy.tsv', sep='\t')
df.fillna(value='', inplace=True)
df
# %%
g = nx.DiGraph()
for row in df.itertuples():
    g.add_edge(row.parent, row.clade)
#%%
root = [n for n,d in g.in_degree() if d==0][0]
#%%
cmap = sns.color_palette('husl', n_colors=len(g.nodes()))
count = 0
for node in nx.dfs_preorder_nodes(g, root):
    g.nodes[node]['color'] = matplotlib.colors.rgb2hex(cmap[count])
    count += 1

#%%
mapping = {}
for row in df.itertuples():
    target = row.clade
    if row.WHO != '':
        target += f" ({row.WHO})"
    mapping[row.clade] = target
#%%
g = nx.relabel_nodes(g, mapping)
#%%
tree = nx.tree_data(g, root, ident="name")
#%%
json.dump(tree, open('src/clades.json', 'w'), indent=2)
