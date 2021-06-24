function generateDependencyTree(md, deps){
	if(!deps.includes(md.filename)) deps.push(md.filename);
	for(const m in md.children){
		const el = md.children[m];
		if(el.path.includes('node_modules') || el == module) continue; // skip
		if(!deps.includes(el.filename)) deps.push(el.filename)
		if(el.children) generateDependencyTree(el, deps);
	}

}

if(process.send){
	var depTree = [];
	generateDependencyTree(require.main, depTree);
	process.send({depTree});
}
