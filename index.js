var Command = require('./command.js');
var cmd = new Command();
// Correct category hierarchy
// One artilce should not belong to both parent category and sub category, 
// Unless the 'sortkeyprefix' of sub category is '*' 
// cmd.hierarchy(<parent category>, <sub category>);