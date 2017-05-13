#TODO

- Where to put e.g. State Learner class? In ./lib? ./bin? Create a package on npm and then reference it as a dependency (node_modules)?
- "State Learner" seems like a bad name. This learns things that are more general than states. "Element Learner" maybe? "Token Learner"?
- State learner should be moved to its own independent project
- Several functions e.g. arrayMap.get, arrayMap.set solve something by using helper methods. But instead of having separate methods, they overload the original method. This seems messy. Convert to two separate methods: one public, one private helper.
